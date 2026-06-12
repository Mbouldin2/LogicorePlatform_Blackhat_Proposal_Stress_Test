import { NextResponse } from "next/server";
import { z } from "zod";
import { generateVisualPlan } from "@/lib/ai";
import { recordGeneration } from "@/lib/data/generations";
import { guardGeneration } from "@/lib/api/guard";

export const runtime = "nodejs";

const schema = z.object({
  topic: z.string().min(1),
  platform: z.string(),
  contentType: z.string(),
  tone: z.string(),
  audience: z.string().default("decision-makers"),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const guard = await guardGeneration("images");
  if ("error" in guard) return guard.error;

  const result = await generateVisualPlan(parsed.data);
  const text = [result.caption, ...result.slides.map((s) => `${s.headline} ${s.body}`)].join(" ");
  await recordGeneration({ feature: "visuals", prompt: parsed.data.topic, output: text, images: result.slides.length });
  return NextResponse.json(result);
}
