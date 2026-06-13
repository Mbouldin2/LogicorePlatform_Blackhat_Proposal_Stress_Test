import type { AIProvider } from "@/types";

/** Approximate public list prices in USD per 1,000,000 tokens. These drive the
 *  cost fields stored on each generation. Keep in sync with provider pricing;
 *  unknown models fall back to a conservative default so margins stay protected. */
export interface ModelPrice {
  inputPerM: number;
  outputPerM: number;
}

const MODEL_PRICES: Record<string, ModelPrice> = {
  // OpenAI
  "gpt-4o": { inputPerM: 2.5, outputPerM: 10 },
  "gpt-4o-mini": { inputPerM: 0.15, outputPerM: 0.6 },
  "gpt-4.1": { inputPerM: 2, outputPerM: 8 },
  // Anthropic
  "claude-opus-4-8": { inputPerM: 15, outputPerM: 75 },
  "claude-sonnet-4-6": { inputPerM: 3, outputPerM: 15 },
  "claude-haiku-4-5": { inputPerM: 0.8, outputPerM: 4 },
  // Google
  "gemini-1.5-pro": { inputPerM: 1.25, outputPerM: 5 },
  "gemini-1.5-flash": { inputPerM: 0.075, outputPerM: 0.3 },
};

/** Conservative default for unknown models — bias high to protect margins. */
const DEFAULT_PRICE: ModelPrice = { inputPerM: 3, outputPerM: 12 };
/** Demo has no real cost; surface a nominal mid-tier price so cost UI is alive. */
const DEMO_PRICE: ModelPrice = { inputPerM: 2.5, outputPerM: 10 };

export function priceForModel(model?: string, provider?: AIProvider): ModelPrice {
  if (provider === "demo") return DEMO_PRICE;
  if (model && MODEL_PRICES[model]) return MODEL_PRICES[model];
  if (model) {
    const key = Object.keys(MODEL_PRICES).find((k) => model.startsWith(k));
    if (key) return MODEL_PRICES[key];
  }
  return DEFAULT_PRICE;
}

/** Estimated request cost in USD from token counts. */
export function computeCostUsd(
  inputTokens: number,
  outputTokens: number,
  model?: string,
  provider?: AIProvider,
): number {
  const p = priceForModel(model, provider);
  const cost = (inputTokens / 1_000_000) * p.inputPerM + (outputTokens / 1_000_000) * p.outputPerM;
  return Number.isFinite(cost) ? Math.max(0, Number(cost.toFixed(6))) : 0;
}
