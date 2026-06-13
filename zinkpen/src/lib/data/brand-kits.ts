import "server-only";
import { getPrisma } from "@/lib/db/prisma";
import type { BrandKit } from "@/types";

/** List brand kits for an org. Empty in demo mode (kits live in client state). */
export async function listBrandKits(orgId: string): Promise<BrandKit[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  const rows = await prisma.brandKit.findMany({ where: { orgId }, orderBy: { createdAt: "desc" } });
  return rows.map(toBrandKit);
}

/** Create a brand kit. Demo mode returns a synthesized (non-persisted) record. */
export async function createBrandKit(
  orgId: string,
  data: { name: string; colors: string[]; fontHeading: string; fontBody: string; logoUrl?: string | null },
): Promise<BrandKit> {
  const prisma = getPrisma();
  if (!prisma) {
    return {
      id: `demo-${Date.now()}`,
      name: data.name,
      colors: data.colors,
      fontHeading: data.fontHeading,
      fontBody: data.fontBody,
      logoUrl: data.logoUrl ?? null,
      createdAt: new Date().toISOString(),
    };
  }
  const kit = await prisma.brandKit.create({
    data: {
      orgId,
      name: data.name,
      colors: data.colors,
      fontHeading: data.fontHeading,
      fontBody: data.fontBody,
      logoUrl: data.logoUrl ?? null,
    },
  });
  return toBrandKit(kit);
}

/** Update a brand kit (org-scoped). Returns false when not found / other org. */
export async function updateBrandKit(
  orgId: string,
  id: string,
  data: { name?: string; colors?: string[]; fontHeading?: string; fontBody?: string; logoUrl?: string | null },
): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) return true;
  const res = await prisma.brandKit.updateMany({ where: { id, orgId }, data });
  return res.count > 0;
}

/** Delete a brand kit (org-scoped). */
export async function deleteBrandKit(orgId: string, id: string): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) return true;
  const res = await prisma.brandKit.deleteMany({ where: { id, orgId } });
  return res.count > 0;
}

function toBrandKit(k: {
  id: string;
  name: string;
  colors: string[];
  fontHeading: string;
  fontBody: string;
  logoUrl: string | null;
  createdAt: Date;
}): BrandKit {
  return {
    id: k.id,
    name: k.name,
    colors: k.colors,
    fontHeading: k.fontHeading,
    fontBody: k.fontBody,
    logoUrl: k.logoUrl,
    createdAt: k.createdAt.toISOString(),
  };
}
