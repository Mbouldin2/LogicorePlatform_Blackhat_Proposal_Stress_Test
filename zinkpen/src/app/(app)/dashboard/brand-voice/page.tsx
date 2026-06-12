// Always render at request time — reflects live per-tenant data, never
// queries the database during the static build.
export const dynamic = "force-dynamic";

import { getTenant } from "@/lib/data/tenant";
import { listBrandVoices } from "@/lib/data/brand-voices";
import { BrandVoiceClient } from "./brand-voice-client";

export default async function BrandVoicePage() {
  const { orgId } = await getTenant();
  const voices = await listBrandVoices(orgId);
  return <BrandVoiceClient initialVoices={voices} />;
}
