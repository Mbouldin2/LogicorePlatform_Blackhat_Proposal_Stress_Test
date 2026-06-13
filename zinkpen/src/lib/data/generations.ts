import "server-only";
import { getPrisma } from "@/lib/db/prisma";
import { countWords } from "@/lib/utils";
import { recordUsage } from "./usage";
import { getOptionalTenant } from "./tenant";
import { captureException } from "@/lib/logger";

export type Feature = "studio" | "humanizer" | "grammar" | "research" | "proposal" | "visuals" | "chat";

export interface GenUsage {
  provider?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  costUsd?: number;
}

/** Records a generation event with token usage + cost, and its metered word/
 *  image usage (which still drives quota). Best-effort and fully non-blocking:
 *  any failure (or demo mode) is swallowed so an AI response is never lost
 *  because persistence hiccuped. Resolves the tenant internally. */
export async function recordGeneration(params: {
  feature: Feature;
  prompt: string;
  output: string;
  images?: number;
  usage?: GenUsage;
}): Promise<void> {
  try {
    const prisma = getPrisma();
    const words = countWords(params.output);
    const tenant = await getOptionalTenant();
    if (!tenant) return;
    const { orgId, userId } = tenant;
    const u = params.usage ?? {};

    if (prisma) {
      await prisma.generation.create({
        data: {
          orgId,
          authorId: userId,
          feature: params.feature,
          prompt: params.prompt.slice(0, 4000),
          output: params.output.slice(0, 20000),
          provider: u.provider ?? "demo",
          model: u.model,
          words,
          inputTokens: Math.max(0, Math.round(u.inputTokens ?? 0)),
          outputTokens: Math.max(0, Math.round(u.outputTokens ?? 0)),
          totalTokens: Math.max(0, Math.round(u.totalTokens ?? 0)),
          costUsd: u.costUsd ?? 0,
        },
      });
    }
    // Word/image quota metering is unchanged.
    if (words > 0) await recordUsage(orgId, "words", words, params.feature);
    if (params.images && params.images > 0) await recordUsage(orgId, "images", params.images, params.feature);
  } catch (err) {
    void captureException(err, { scope: "generations.recordGeneration", feature: params.feature });
  }
}

/** Recent generations for an org (history surfaces). Empty in demo mode. */
export async function listGenerations(orgId: string, take = 20) {
  const prisma = getPrisma();
  if (!prisma) return [];
  return prisma.generation.findMany({ where: { orgId }, orderBy: { createdAt: "desc" }, take });
}
