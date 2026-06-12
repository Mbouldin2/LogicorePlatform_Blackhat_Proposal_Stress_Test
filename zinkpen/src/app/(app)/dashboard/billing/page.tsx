// Always render at request time — reflects live per-tenant data, never
// queries the database during the static build.
export const dynamic = "force-dynamic";

import { getTenant } from "@/lib/data/tenant";
import { getUsageSnapshot } from "@/lib/data/usage";
import { BillingClient } from "./billing-client";

export default async function BillingPage() {
  const tenant = await getTenant();
  const usage = await getUsageSnapshot(tenant.orgId, tenant.plan);
  return <BillingClient usage={usage} currentPlan={tenant.plan} />;
}
