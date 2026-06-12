// Always render at request time — reflects live per-tenant data, never
// queries the database during the static build.
export const dynamic = "force-dynamic";

import { getTenant } from "@/lib/data/tenant";
import { getUsageSnapshot } from "@/lib/data/usage";
import { canManageBilling } from "@/lib/auth/roles";
import { AccessDenied } from "@/components/dashboard/access-denied";
import { BillingClient } from "./billing-client";

export default async function BillingPage() {
  const tenant = await getTenant();
  // Billing is admin-only — enforce server-side, not just by hiding the nav.
  if (!canManageBilling(tenant.role)) {
    return (
      <AccessDenied
        title="Billing is admin-only"
        requiredRole="admin"
        message="Only workspace owners and admins can view and manage billing. Ask an admin to upgrade your plan or change your role."
      />
    );
  }
  const usage = await getUsageSnapshot(tenant.orgId, tenant.plan);
  return <BillingClient usage={usage} currentPlan={tenant.plan} />;
}
