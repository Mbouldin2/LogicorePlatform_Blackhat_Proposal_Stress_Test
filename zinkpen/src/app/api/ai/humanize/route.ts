import { NextResponse } from "next/server";
import { z } from "zod";
import { humanizeText } from "@/lib/ai";

export const runtime = "nodejs";

const schema = z.object({
  text: z.string().min(1),
  creativity: z.number().min(0).max(100).default(50),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const result = await humanizeText(parsed.data);
  return NextResponse.json(result);
}
