import "server-only";
import type { AIMessage, AIProvider } from "@/types";
import { computeCostUsd } from "./pricing";
import { captureException } from "@/lib/logger";

/* =============================================================================
   Provider router — talks to OpenAI / Anthropic / Gemini over REST (no SDKs).
   Falls back to DEMO mode when no key is configured so the whole product works
   end-to-end without secrets. Each provider is isolated; adding a new one is a
   single function + a branch in `complete`.
   ============================================================================= */

export interface CompletionOptions {
  system?: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  /** Force a specific provider; otherwise the router auto-selects. */
  provider?: AIProvider;
  /** JSON mode — ask the model to return strict JSON. */
  json?: boolean;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  /** True when the numbers came from the provider; false when estimated. */
  estimated: boolean;
}

export interface CompletionResult {
  text: string;
  provider: AIProvider;
  model: string;
  usage: TokenUsage;
}

/** Rough token estimate (~4 chars/token) — used as a fail-open fallback when a
 *  provider doesn't return usage metadata, and for demo mode. */
export function estimateTokens(text: string): number {
  return Math.max(0, Math.ceil((text?.length ?? 0) / 4));
}

function estimateUsage(opts: CompletionOptions, output: string): TokenUsage {
  const inputText = (opts.system ?? "") + opts.messages.map((m) => m.content).join("\n");
  const inputTokens = estimateTokens(inputText);
  const outputTokens = estimateTokens(output);
  return { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens, estimated: true };
}

/** Metering metadata attached to every generation: provider, model, token
 *  usage, and the estimated cost in USD. */
export interface GenMeta {
  provider: AIProvider;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  estimated: boolean;
}

export function metaFromResult(res: CompletionResult): GenMeta {
  const u = res.usage;
  return {
    provider: res.provider,
    model: res.model,
    inputTokens: u.inputTokens,
    outputTokens: u.outputTokens,
    totalTokens: u.totalTokens,
    costUsd: computeCostUsd(u.inputTokens, u.outputTokens, res.model, res.provider),
    estimated: u.estimated,
  };
}

/** Metadata for demo-only helpers that synthesize content without calling a
 *  provider — tokens are estimated from text length and priced at a nominal
 *  demo rate so the cost surfaces stay alive. */
export function demoMeta(inputText: string, outputText: string): GenMeta {
  const inputTokens = estimateTokens(inputText);
  const outputTokens = estimateTokens(outputText);
  return {
    provider: "demo",
    model: "zinkpen-demo",
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    costUsd: computeCostUsd(inputTokens, outputTokens, "zinkpen-demo", "demo"),
    estimated: true,
  };
}

export function availableProviders(): AIProvider[] {
  const list: AIProvider[] = [];
  if (process.env.ANTHROPIC_API_KEY) list.push("anthropic");
  if (process.env.OPENAI_API_KEY) list.push("openai");
  if (process.env.GEMINI_API_KEY) list.push("gemini");
  return list;
}

/** Pick the first configured provider (Anthropic preferred for quality). */
export function selectProvider(preferred?: AIProvider): AIProvider {
  if (preferred && preferred !== "demo") {
    const have = availableProviders();
    if (have.includes(preferred)) return preferred;
  }
  return availableProviders()[0] ?? "demo";
}

export async function complete(opts: CompletionOptions): Promise<CompletionResult> {
  const provider = selectProvider(opts.provider);
  try {
    let result: CompletionResult;
    switch (provider) {
      case "anthropic":
        result = await anthropicComplete(opts);
        break;
      case "openai":
        result = await openaiComplete(opts);
        break;
      case "gemini":
        result = await geminiComplete(opts);
        break;
      default:
        result = demoComplete(opts);
    }
    // Fail-open: if the provider omitted usage, estimate it so metering/cost
    // never silently drops to zero.
    if (!result.usage || result.usage.totalTokens === 0) {
      result.usage = estimateUsage(opts, result.text);
    }
    return result;
  } catch (err) {
    // Never hard-fail a product surface on a provider hiccup — degrade to demo.
    void captureException(err, { scope: "ai.complete", provider });
    return demoComplete(opts);
  }
}

// ---------------------------------------------------------------------------
// Anthropic (Messages API)
// ---------------------------------------------------------------------------
async function anthropicComplete(opts: CompletionOptions): Promise<CompletionResult> {
  const model = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: opts.maxTokens ?? 2048,
      temperature: opts.temperature ?? 0.7,
      system: opts.system,
      messages: opts.messages.map((m) => ({
        role: m.role === "system" ? "user" : m.role,
        content: m.content,
      })),
    }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = (data.content ?? []).map((b: { text?: string }) => b.text ?? "").join("");
  const input = data.usage?.input_tokens ?? 0;
  const output = data.usage?.output_tokens ?? 0;
  return {
    text,
    provider: "anthropic",
    model,
    usage: { inputTokens: input, outputTokens: output, totalTokens: input + output, estimated: false },
  };
}

// ---------------------------------------------------------------------------
// OpenAI (Chat Completions API)
// ---------------------------------------------------------------------------
async function openaiComplete(opts: CompletionOptions): Promise<CompletionResult> {
  const model = process.env.OPENAI_MODEL || "gpt-4o";
  const messages = [
    ...(opts.system ? [{ role: "system", content: opts.system }] : []),
    ...opts.messages,
  ];
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 2048,
      messages,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`openai ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const input = data.usage?.prompt_tokens ?? 0;
  const output = data.usage?.completion_tokens ?? 0;
  const total = data.usage?.total_tokens ?? input + output;
  return {
    text: data.choices?.[0]?.message?.content ?? "",
    provider: "openai",
    model,
    usage: { inputTokens: input, outputTokens: output, totalTokens: total, estimated: false },
  };
}

// ---------------------------------------------------------------------------
// Google Gemini (generateContent API)
// ---------------------------------------------------------------------------
async function geminiComplete(opts: CompletionOptions): Promise<CompletionResult> {
  const model = process.env.GEMINI_MODEL || "gemini-1.5-pro";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const contents = opts.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents,
      ...(opts.system ? { systemInstruction: { parts: [{ text: opts.system }] } } : {}),
      generationConfig: {
        temperature: opts.temperature ?? 0.7,
        maxOutputTokens: opts.maxTokens ?? 2048,
        ...(opts.json ? { responseMimeType: "application/json" } : {}),
      },
    }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text =
    data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  const input = data.usageMetadata?.promptTokenCount ?? 0;
  const output = data.usageMetadata?.candidatesTokenCount ?? 0;
  const total = data.usageMetadata?.totalTokenCount ?? input + output;
  return {
    text,
    provider: "gemini",
    model,
    usage: { inputTokens: input, outputTokens: output, totalTokens: total, estimated: false },
  };
}

// ---------------------------------------------------------------------------
// Demo provider — realistic, deterministic output with zero configuration.
// ---------------------------------------------------------------------------
function demoComplete(opts: CompletionOptions): CompletionResult {
  // The high-level helpers in ./index own the rich demo content; this is only
  // hit for raw chat. Keep it graceful and on-brand.
  const last = [...opts.messages].reverse().find((m) => m.role === "user");
  const topic = last?.content?.slice(0, 120) ?? "your request";
  const text = [
    `Here's a draft based on "${topic.trim()}".`,
    "",
    "ZinkPen is currently running in demo mode (no AI provider key configured), so this is realistic sample output. Add an OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY to .env.local to generate live results.",
    "",
    "Key points I'd develop next:",
    "• Lead with the single most valuable outcome for the reader.",
    "• Support it with one concrete proof point or number.",
    "• Close with a clear, low-friction call to action.",
  ].join("\n");
  return { text, provider: "demo", model: "zinkpen-demo", usage: estimateUsage(opts, text) };
}
