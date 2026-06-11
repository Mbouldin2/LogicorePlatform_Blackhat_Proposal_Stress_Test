import { NextResponse } from "next/server";
import { z } from "zod";
import { research } from "@/lib/ai";

export const runtime = "nodejs";

const schema = z.object({
  query: z.string().min(1),
  depth: z.enum(["brief", "deep"]).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const result = await research(parsed.data);
  return NextResponse.json(result);
}
