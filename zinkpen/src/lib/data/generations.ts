import "server-only";
import { getPrisma } from "@/lib/db/prisma";
import { countWords } from "@/lib/utils";
import { recordUsage } from "./usage";
import { getOptionalTenant } from "./tenant";

export type Feature = "studio" | "humanizer" | "grammar" | "research" | "proposal" | "visuals" | "chat";

/** Records a generation event and its metered usage. Best-effort and fully
 *  non-blocking: any failure (or demo mode) is swallowed so an AI response is
 *  never lost because persistence hiccuped. Resolves the tenant internally so
 *  API routes can call it with a single line. */
export async function recordGeneration(params: {
  feature: Feature;
  prompt: string;
  output: string;
  provider?: string;
  model?: string;
  images?: number;
}): Promise<void> {
  try {
    const prisma = getPrisma();
    const words = countWords(params.output);
    const tenant = await getOptionalTenant();
    if (!tenant) return;
    const { orgId, userId } = tenant;

    if (prisma) {
      await prisma.generation.create({
        data: {
          orgId,
          authorId: userId,
          feature: params.feature,
          prompt: params.prompt.slice(0, 4000),
          output: params.output.slice(0, 20000),
          provider: params.provider ?? "demo",
          model: params.model,
          words,
        },
      });
    }
    if (words > 0) await recordUsage(orgId, "words", words, params.feature);
    if (params.images && params.images > 0) await recordUsage(orgId, "images", params.images, params.feature);
  } catch (err) {
    console.error("[generation] failed to record:", err);
  }
}

/** Recent generations for an org (history surfaces). Empty in demo mode. */
export async function listGenerations(orgId: string, take = 20) {
  const prisma = getPrisma();
  if (!prisma) return [];
  return prisma.generation.findMany({ where: { orgId }, orderBy: { createdAt: "desc" }, take });
}
