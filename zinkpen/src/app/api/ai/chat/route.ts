import { NextResponse } from "next/server";
import { z } from "zod";
import { complete } from "@/lib/ai/providers";

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

  const result = await complete({
    system:
      "You are the ZinkPen in-app assistant. Be concise, helpful, and write publication-ready content. Use Markdown. You can draft, rewrite, brainstorm, and refine for business, GovCon, finance, education, and tech audiences.",
    messages: parsed.data.messages,
    maxTokens: 1200,
  });
  return NextResponse.json({ text: result.text, provider: result.provider });
}
