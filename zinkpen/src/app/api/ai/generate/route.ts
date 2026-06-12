import { NextResponse } from "next/server";
import { z } from "zod";
import { generateContent } from "@/lib/ai";
import { recordGeneration } from "@/lib/data/generations";
import { guardGeneration } from "@/lib/api/guard";

export const runtime = "nodejs";

const schema = z.object({
  template: z.string(),
  topic: z.string().min(1),
  tone: z.string().optional(),
  audience: z.string().optional(),
  keywords: z.string().optional(),
  brandVoice: z.string().optional(),
  length: z.enum(["short", "medium", "long"]).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const guard = await guardGeneration("words");
  if ("error" in guard) return guard.error;

  const text = await generateContent(parsed.data);
  await recordGeneration({ feature: "studio", prompt: parsed.data.topic, output: text });
  return NextResponse.json({ text });
}
