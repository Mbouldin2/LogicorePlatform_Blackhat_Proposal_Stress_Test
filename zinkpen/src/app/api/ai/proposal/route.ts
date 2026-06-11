import { NextResponse } from "next/server";
import { z } from "zod";
import { generateProposal } from "@/lib/ai";

export const runtime = "nodejs";

const schema = z.object({
  template: z.string(),
  org: z.string().min(1),
  topic: z.string().min(1),
  details: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const text = await generateProposal(parsed.data);
  return NextResponse.json({ text });
}
