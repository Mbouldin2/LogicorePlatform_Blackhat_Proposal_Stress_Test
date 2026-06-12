import "server-only";
import { getPrisma } from "@/lib/db/prisma";
import { PLANS, type PlanId } from "@/lib/constants";
import { MOCK_USAGE, MOCK_USAGE_SERIES, MOCK_FEATURE_USAGE } from "@/lib/mock-data";
import type { UsageSnapshot } from "@/types";

const FEATURE_LABELS: Record<string, string> = {
  studio: "Writing Studio",
  proposal: "Proposals",
  humanizer: "Humanizer",
  visuals: "Visuals",
  research: "Research",
  grammar: "Grammar",
  chat: "Assistant",
};

/** Record a metered usage event (words or images). Best-effort; never throws. */
export async function recordUsage(
  orgId: string,
  kind: "words" | "images",
  amount: number,
  feature: string,
): Promise<void> {
  const prisma = getPrisma();
  if (!prisma || amount <= 0) return;
  try {
    await prisma.usageRecord.create({ data: { orgId, kind, amount, feature } });
  } catch (err) {
    console.error("[usage] failed to record:", err);
  }
}

/** Current billing-cycle usage snapshot with plan limits applied. */
export async function getUsageSnapshot(orgId: string, plan: PlanId): Promise<UsageSnapshot> {
  const prisma = getPrisma();
  const planDef = PLANS.find((p) => p.id === plan) ?? PLANS[0];
  if (!prisma) {
    return { ...MOCK_USAGE, wordsLimit: planDef.words, imagesLimit: planDef.images, seatsLimit: planDef.seats };
  }

  const cycleStart = new Date();
  cycleStart.setDate(cycleStart.getDate() - 30);

  const [words, images, documents, seats] = await Promise.all([
    prisma.usageRecord.aggregate({ _sum: { amount: true }, where: { orgId, kind: "words", createdAt: { gte: cycleStart } } }),
    prisma.usageRecord.aggregate({ _sum: { amount: true }, where: { orgId, kind: "images", createdAt: { gte: cycleStart } } }),
    prisma.document.count({ where: { project: { orgId } } }),
    prisma.membership.count({ where: { orgId } }),
  ]);

  return {
    wordsUsed: words._sum.amount ?? 0,
    wordsLimit: planDef.words,
    imagesUsed: images._sum.amount ?? 0,
    imagesLimit: planDef.images,
    documents,
    seatsUsed: Math.max(1, seats),
    seatsLimit: planDef.seats,
  };
}

/** Daily words + images for the last 14 days (analytics charts). */
export async function getUsageSeries(orgId: string): Promise<{ day: string; words: number; images: number }[]> {
  const prisma = getPrisma();
  if (!prisma) return MOCK_USAGE_SERIES;

  const start = new Date();
  start.setDate(start.getDate() - 13);
  start.setHours(0, 0, 0, 0);

  const rows = await prisma.usageRecord.findMany({
    where: { orgId, createdAt: { gte: start } },
    select: { kind: true, amount: true, createdAt: true },
  });

  const buckets: Record<string, { words: number; images: number }> = {};
  const series: { day: string; words: number; images: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = { words: 0, images: 0 };
    series.push({ day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), words: 0, images: 0 });
  }
  rows.forEach((r) => {
    const key = r.createdAt.toISOString().slice(0, 10);
    if (buckets[key]) buckets[key][r.kind === "images" ? "images" : "words"] += r.amount;
  });
  Object.keys(buckets).forEach((key, i) => {
    series[i].words = buckets[key].words;
    series[i].images = buckets[key].images;
  });
  return series;
}

/** Generation counts grouped by feature (analytics pie). */
export async function getFeatureUsage(orgId: string): Promise<{ name: string; value: number }[]> {
  const prisma = getPrisma();
  if (!prisma) return MOCK_FEATURE_USAGE;

  const grouped = await prisma.generation.groupBy({
    by: ["feature"],
    where: { orgId },
    _count: { feature: true },
  });
  if (grouped.length === 0) return MOCK_FEATURE_USAGE;
  return grouped.map((g) => ({ name: FEATURE_LABELS[g.feature] ?? g.feature, value: g._count.feature }));
}
