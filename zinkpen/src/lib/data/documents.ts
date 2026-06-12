import "server-only";
import { getPrisma } from "@/lib/db/prisma";
import { MOCK_DOCS } from "@/lib/mock-data";
import { countWords } from "@/lib/utils";
import type { Doc } from "@/types";

type DbStatus = "draft" | "in_review" | "final";
const toAppStatus = (s: DbStatus): Doc["status"] => (s === "in_review" ? "in-review" : s);
const toDbStatus = (s: Doc["status"]): DbStatus => (s === "in-review" ? "in_review" : s);

function excerpt(content: string): string {
  const text = content.replace(/[#*>`_-]/g, "").replace(/\s+/g, " ").trim();
  return text.slice(0, 120);
}

/** List documents for an org (optionally a project). Demo fallback included. */
export async function listDocuments(orgId: string, projectId?: string): Promise<Doc[]> {
  const prisma = getPrisma();
  if (!prisma) return projectId ? MOCK_DOCS.filter((d) => d.projectId === projectId) : MOCK_DOCS;

  const rows = await prisma.document.findMany({
    where: { project: { orgId }, ...(projectId ? { projectId } : {}) },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  return rows.map((d) => ({
    id: d.id,
    projectId: d.projectId,
    title: d.title,
    type: d.type,
    words: d.words,
    updatedAt: d.updatedAt.toISOString(),
    status: toAppStatus(d.status as DbStatus),
    excerpt: excerpt(d.content),
  }));
}

/** Persist a generated document. In demo mode returns a synthesized record. */
export async function createDocument(
  orgId: string,
  authorId: string,
  data: { title: string; type: string; content: string; projectId?: string; status?: Doc["status"] },
): Promise<Doc> {
  const prisma = getPrisma();
  const words = countWords(data.content);
  const status = data.status ?? "draft";

  if (!prisma) {
    return {
      id: `demo-${Date.now()}`,
      projectId: data.projectId ?? "p1",
      title: data.title,
      type: data.type,
      words,
      updatedAt: new Date().toISOString(),
      status,
      excerpt: excerpt(data.content),
    };
  }

  // Resolve a destination project: the given one, else the org's most recent,
  // else create a default "Untitled" project so a document always has a home.
  let projectId = data.projectId;
  if (!projectId) {
    const recent = await prisma.project.findFirst({ where: { orgId }, orderBy: { updatedAt: "desc" } });
    projectId = recent?.id ?? (await prisma.project.create({ data: { orgId, name: "Untitled Project" } })).id;
  }

  const d = await prisma.document.create({
    data: {
      title: data.title,
      type: data.type,
      content: data.content,
      words,
      status: toDbStatus(status),
      projectId,
      authorId,
      versions: { create: { content: data.content, label: "Initial draft" } },
    },
  });
  return {
    id: d.id,
    projectId: d.projectId,
    title: d.title,
    type: d.type,
    words: d.words,
    updatedAt: d.updatedAt.toISOString(),
    status,
    excerpt: excerpt(d.content),
  };
}
