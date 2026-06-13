// Always render at request time — reflects live per-tenant data, never
// queries the database during the static build.
export const dynamic = "force-dynamic";

import { getTenant } from "@/lib/data/tenant";
import { getUsageSnapshot, getUsageSeries, getFeatureUsage } from "@/lib/data/usage";
import { PLANS } from "@/lib/constants";
import { AnalyticsCharts } from "./analytics-charts";

export default async function AnalyticsPage() {
  const tenant = await getTenant();
  const [usage, series, featureUsage] = await Promise.all([
    getUsageSnapshot(tenant.orgId, tenant.plan),
    getUsageSeries(tenant.orgId),
    getFeatureUsage(tenant.orgId),
  ]);
  const planName = PLANS.find((p) => p.id === tenant.plan)?.name ?? tenant.plan;
  return <AnalyticsCharts usage={usage} series={series} featureUsage={featureUsage} planName={planName} />;
}
