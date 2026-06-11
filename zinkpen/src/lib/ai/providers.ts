import "server-only";
import type { AIMessage, AIProvider } from "@/types";

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

export interface CompletionResult {
  text: string;
  provider: AIProvider;
  model: string;
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
    switch (provider) {
      case "anthropic":
        return await anthropicComplete(opts);
      case "openai":
        return await openaiComplete(opts);
      case "gemini":
        return await geminiComplete(opts);
      default:
        return demoComplete(opts);
    }
  } catch (err) {
    // Never hard-fail a product surface on a provider hiccup — degrade to demo.
    console.error(`[ai] ${provider} failed, falling back to demo:`, err);
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
  return { text, provider: "anthropic", model };
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
  return { text: data.choices?.[0]?.message?.content ?? "", provider: "openai", model };
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
  return { text, provider: "gemini", model };
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
  return { text, provider: "demo", model: "zinkpen-demo" };
}
