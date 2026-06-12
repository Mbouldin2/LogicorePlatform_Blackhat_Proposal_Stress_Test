// Always render at request time — reflects live per-tenant data, never
// queries the database during the static build.
export const dynamic = "force-dynamic";

import { getTenant } from "@/lib/data/tenant";
import { listBrandKits } from "@/lib/data/brand-kits";
import { canCreateContent, canDeleteContent } from "@/lib/auth/roles";
import { VisualsClient } from "./visuals-client";

export default async function VisualsPage() {
  const tenant = await getTenant();
  const kits = await listBrandKits(tenant.orgId);
  return (
    <VisualsClient
      canCreate={canCreateContent(tenant.role)}
      canDelete={canDeleteContent(tenant.role)}
      initialKits={kits}
    />
  );
}
