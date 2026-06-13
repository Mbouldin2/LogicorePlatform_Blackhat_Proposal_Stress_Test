import { NextResponse } from "next/server";
import { z } from "zod";
import { checkGrammar } from "@/lib/ai";
import { recordGeneration } from "@/lib/data/generations";
import { guardGeneration } from "@/lib/api/guard";

export const runtime = "nodejs";

const schema = z.object({ text: z.string().min(1) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const guard = await guardGeneration("words");
  if ("error" in guard) return guard.error;

  const { meta, ...result } = await checkGrammar(parsed.data.text);
  await recordGeneration({ feature: "grammar", prompt: parsed.data.text, output: result.corrected, usage: meta });
  return NextResponse.json(result);
}
