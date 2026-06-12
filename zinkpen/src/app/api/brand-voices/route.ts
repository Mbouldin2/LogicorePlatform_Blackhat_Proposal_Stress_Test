import { NextResponse } from "next/server";
import { getTenant } from "@/lib/data/tenant";
import { listBrandVoices } from "@/lib/data/brand-voices";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { orgId } = await getTenant();
    const voices = await listBrandVoices(orgId);
    return NextResponse.json({ voices });
  } catch (err) {
    console.error("[brand-voices] GET failed:", err);
    return NextResponse.json({ voices: [] });
  }
}
