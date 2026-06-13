import "server-only";
import { getOptionalTenant, type Tenant } from "@/lib/data/tenant";
import { getPrisma } from "@/lib/db/prisma";
import { roleAtLeast, evaluateRoleAccess, type Role } from "./roles";

export type RoleGuard =
  | { ok: true; tenant: Tenant }
  | { ok: false; status: 401 | 403; message: string };

function denyMessage(min: Role, status: 401 | 403): string {
  return status === 401 ? "Please sign in to continue." : `This action requires the ${min} role or higher.`;
}

/** Require an authenticated user whose role in their current org is at least
 *  `min`. Returns a neutral result usable by both API routes and server actions.
 *  In demo mode the demo operator is an `owner`, so everything is permitted. */
export async function requireRole(min: Role): Promise<RoleGuard> {
  const tenant = await getOptionalTenant();
  const decision = evaluateRoleAccess(tenant?.role ?? null, min);
  if (!decision.ok) return { ok: false, status: decision.status, message: denyMessage(min, decision.status) };
  return { ok: true, tenant: tenant! };
}

/** Require the user to hold at least `min` role **within a specific org**.
 *  Defends against a caller passing an `orgId` they don't belong to (e.g. a
 *  tampered request). Falls back to the simple role check in demo mode. */
export async function requireOrgRole(orgId: string, min: Role): Promise<RoleGuard> {
  const tenant = await getOptionalTenant();
  if (!tenant) return { ok: false, status: 401, message: "Please sign in to continue." };

  const prisma = getPrisma();
  // When the target org differs from the resolved tenant org, verify membership.
  if (prisma && orgId !== tenant.orgId) {
    const membership = await prisma.membership.findFirst({ where: { userId: tenant.userId, orgId } });
    if (!membership) {
      return { ok: false, status: 403, message: "You are not a member of this workspace." };
    }
    if (!roleAtLeast(membership.role as Role, min)) {
      return { ok: false, status: 403, message: `This action requires the ${min} role or higher.` };
    }
    return { ok: true, tenant };
  }

  if (!roleAtLeast(tenant.role, min)) {
    return { ok: false, status: 403, message: `This action requires the ${min} role or higher.` };
  }
  return { ok: true, tenant };
}
