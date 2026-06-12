import { DashboardShell } from "@/components/dashboard/shell";
import { getTenant } from "@/lib/data/tenant";
import { getUsageSnapshot } from "@/lib/data/usage";
import { PLANS } from "@/lib/constants";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Resolves (and lazily provisions) the tenant. In demo mode this is the demo
  // operator with no database access.
  const tenant = await getTenant();
  const usage = await getUsageSnapshot(tenant.orgId, tenant.plan);
  const planName = PLANS.find((p) => p.id === tenant.plan)?.name ?? tenant.plan;

  return (
    <DashboardShell
      user={{ name: tenant.name, email: tenant.email, plan: tenant.plan }}
      usage={{ wordsUsed: usage.wordsUsed, wordsLimit: usage.wordsLimit, plan: planName }}
    >
      {children}
    </DashboardShell>
  );
}
