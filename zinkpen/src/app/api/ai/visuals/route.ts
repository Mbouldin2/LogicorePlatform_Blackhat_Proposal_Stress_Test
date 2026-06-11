import { NextResponse } from "next/server";
import { z } from "zod";
import { generateVisualPlan } from "@/lib/ai";

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
  const result = await generateVisualPlan(parsed.data);
  return NextResponse.json(result);
}
