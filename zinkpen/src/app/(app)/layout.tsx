import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { getOptionalTenant } from "@/lib/data/tenant";
import { getUsageSnapshot } from "@/lib/data/usage";
import { PLANS } from "@/lib/constants";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Auth gate: when Supabase is configured, an unauthenticated request resolves
  // to a null tenant and is sent to /login. In demo mode (no auth configured)
  // the demo operator is returned and the workspace stays open.
  const tenant = await getOptionalTenant();
  if (!tenant) redirect("/login");

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
