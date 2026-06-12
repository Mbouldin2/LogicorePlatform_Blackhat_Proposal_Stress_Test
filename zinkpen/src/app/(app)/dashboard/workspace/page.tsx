// Always render at request time — reflects live per-tenant data, never
// queries the database during the static build.
export const dynamic = "force-dynamic";

import { getTenant } from "@/lib/data/tenant";
import { listProjects } from "@/lib/data/projects";
import { listDocuments } from "@/lib/data/documents";
import { WorkspaceClient } from "./workspace-client";

export default async function WorkspacePage() {
  const { orgId } = await getTenant();
  const [projects, documents] = await Promise.all([listProjects(orgId), listDocuments(orgId)]);
  return <WorkspaceClient initialProjects={projects} initialDocuments={documents} />;
}
