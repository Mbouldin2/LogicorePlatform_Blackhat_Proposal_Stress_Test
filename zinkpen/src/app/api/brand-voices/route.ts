import { NextResponse } from "next/server";
import { getTenant } from "@/lib/data/tenant";
import { listBrandVoices } from "@/lib/data/brand-voices";
import { captureException } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { orgId } = await getTenant();
    const voices = await listBrandVoices(orgId);
    return NextResponse.json({ voices });
  } catch (err) {
    void captureException(err, { scope: "api.brand-voices.GET" });
    return NextResponse.json({ voices: [] });
  }
}
