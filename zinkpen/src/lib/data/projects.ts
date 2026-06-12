import "server-only";
import { getPrisma } from "@/lib/db/prisma";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import type { Project } from "@/types";

/** List projects for an org. Falls back to demo data without a database. */
export async function listProjects(orgId: string): Promise<Project[]> {
  const prisma = getPrisma();
  if (!prisma) return MOCK_PROJECTS;

  const rows = await prisma.project.findMany({
    where: { orgId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { documents: true } } },
  });
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
    color: p.color,
    documents: p._count.documents,
    updatedAt: p.updatedAt.toISOString(),
  }));
}

/** Create a project. In demo mode returns a synthesized (non-persisted) record
 *  so optimistic UI continues to work. */
export async function createProject(
  orgId: string,
  data: { name: string; description?: string; color?: string },
): Promise<Project> {
  const prisma = getPrisma();
  const color = data.color ?? "#5b63f0";

  if (!prisma) {
    return {
      id: `demo-${Date.now()}`,
      name: data.name,
      description: data.description,
      color,
      documents: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  const p = await prisma.project.create({
    data: { orgId, name: data.name, description: data.description, color },
  });
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
    color: p.color,
    documents: 0,
    updatedAt: p.updatedAt.toISOString(),
  };
}
