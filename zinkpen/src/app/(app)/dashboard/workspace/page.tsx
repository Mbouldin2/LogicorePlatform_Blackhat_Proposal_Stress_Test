// Always render at request time — reflects live per-tenant data, never
// queries the database during the static build.
export const dynamic = "force-dynamic";

import { getTenant } from "@/lib/data/tenant";
import { listProjects } from "@/lib/data/projects";
import { listDocuments } from "@/lib/data/documents";
import { canCreateContent, canDeleteContent, canManageTeam } from "@/lib/auth/roles";
import { WorkspaceClient } from "./workspace-client";

export default async function WorkspacePage() {
  const tenant = await getTenant();
  const [projects, documents] = await Promise.all([
    listProjects(tenant.orgId),
    listDocuments(tenant.orgId),
  ]);
  return (
    <WorkspaceClient
      initialProjects={projects}
      initialDocuments={documents}
      canCreate={canCreateContent(tenant.role)}
      canDelete={canDeleteContent(tenant.role)}
      canManageTeam={canManageTeam(tenant.role)}
    />
  );
}
