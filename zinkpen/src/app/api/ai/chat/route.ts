import { NextResponse } from "next/server";
import { z } from "zod";
import { complete, metaFromResult } from "@/lib/ai/providers";
import { recordGeneration } from "@/lib/data/generations";
import { guardGeneration } from "@/lib/api/guard";

export const runtime = "nodejs";

const schema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    }),
  ),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const guard = await guardGeneration("words");
  if ("error" in guard) return guard.error;

  const result = await complete({
    system:
      "You are the ZinkPen in-app assistant. Be concise, helpful, and write publication-ready content. Use Markdown. You can draft, rewrite, brainstorm, and refine for business, GovCon, finance, education, and tech audiences.",
    messages: parsed.data.messages,
    maxTokens: 1200,
  });
  const lastUser = [...parsed.data.messages].reverse().find((m) => m.role === "user");
  await recordGeneration({
    feature: "chat",
    prompt: lastUser?.content ?? "",
    output: result.text,
    usage: metaFromResult(result),
  });
  return NextResponse.json({ text: result.text, provider: result.provider });
}
