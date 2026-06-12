import { NextResponse } from "next/server";
import { z } from "zod";
import { research } from "@/lib/ai";
import { recordGeneration } from "@/lib/data/generations";
import { guardGeneration } from "@/lib/api/guard";

export const runtime = "nodejs";

const schema = z.object({
  query: z.string().min(1),
  depth: z.enum(["brief", "deep"]).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const guard = await guardGeneration("words");
  if ("error" in guard) return guard.error;

  const { meta, ...result } = await research(parsed.data);
  await recordGeneration({ feature: "research", prompt: parsed.data.query, output: result.brief, usage: meta });
  return NextResponse.json(result);
}
