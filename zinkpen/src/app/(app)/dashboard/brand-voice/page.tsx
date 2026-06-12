// Always render at request time — reflects live per-tenant data, never
// queries the database during the static build.
export const dynamic = "force-dynamic";

import { getTenant } from "@/lib/data/tenant";
import { listBrandVoices } from "@/lib/data/brand-voices";
import { canCreateContent } from "@/lib/auth/roles";
import { BrandVoiceClient } from "./brand-voice-client";

export default async function BrandVoicePage() {
  const tenant = await getTenant();
  const voices = await listBrandVoices(tenant.orgId);
  return <BrandVoiceClient initialVoices={voices} canCreate={canCreateContent(tenant.role)} />;
}
