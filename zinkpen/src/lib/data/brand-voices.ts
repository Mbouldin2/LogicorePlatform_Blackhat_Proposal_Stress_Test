import "server-only";
import { getPrisma } from "@/lib/db/prisma";
import { MOCK_VOICES } from "@/lib/mock-data";
import type { BrandVoice } from "@/types";

/** List brand-voice profiles for an org. Demo fallback included. */
export async function listBrandVoices(orgId: string): Promise<BrandVoice[]> {
  const prisma = getPrisma();
  if (!prisma) return MOCK_VOICES;

  const rows = await prisma.brandVoice.findMany({ where: { orgId }, orderBy: { createdAt: "desc" } });
  return rows.map((v) => ({
    id: v.id,
    name: v.name,
    description: v.description ?? "",
    traits: v.traits,
    sampleCount: v.sampleText ? 1 : 0,
    createdAt: v.createdAt.toISOString(),
  }));
}

/** Create a brand-voice profile. Demo mode returns a synthesized record. */
export async function createBrandVoice(
  orgId: string,
  data: { name: string; description?: string; traits: string[]; sampleText: string },
): Promise<BrandVoice> {
  const prisma = getPrisma();

  if (!prisma) {
    return {
      id: `demo-${Date.now()}`,
      name: data.name,
      description: data.description ?? "",
      traits: data.traits,
      sampleCount: 1,
      createdAt: new Date().toISOString(),
    };
  }

  const v = await prisma.brandVoice.create({
    data: {
      orgId,
      name: data.name,
      description: data.description,
      traits: data.traits,
      sampleText: data.sampleText,
    },
  });
  return {
    id: v.id,
    name: v.name,
    description: v.description ?? "",
    traits: v.traits,
    sampleCount: 1,
    createdAt: v.createdAt.toISOString(),
  };
}

/** Update a brand voice (org-scoped). Returns false when not found / other org. */
export async function updateBrandVoice(
  orgId: string,
  id: string,
  data: { name?: string; description?: string; traits?: string[] },
): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) return true;
  const res = await prisma.brandVoice.updateMany({ where: { id, orgId }, data });
  return res.count > 0;
}

/** Delete a brand voice (org-scoped). */
export async function deleteBrandVoice(orgId: string, id: string): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) return true;
  const res = await prisma.brandVoice.deleteMany({ where: { id, orgId } });
  return res.count > 0;
}
