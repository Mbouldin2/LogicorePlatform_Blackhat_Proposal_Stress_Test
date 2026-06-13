/** Role model + pure permission predicates. No I/O — safe to import anywhere
 *  (server, client, or a standalone test). Mirrors the Prisma `MemberRole` enum. */
export type Role = "owner" | "admin" | "editor" | "viewer";

export const ROLE_RANK: Record<Role, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
  owner: 4,
};

/** True when `role` is at least as privileged as `min`. */
export function roleAtLeast(role: Role, min: Role): boolean {
  return (ROLE_RANK[role] ?? 0) >= (ROLE_RANK[min] ?? 0);
}

/** Manage subscription, payment method, and plan changes. */
export function canManageBilling(role: Role): boolean {
  return roleAtLeast(role, "admin");
}

/** Invite/remove members and change roles. */
export function canManageTeam(role: Role): boolean {
  return roleAtLeast(role, "admin");
}

/** Generate/save content, create + update projects, brand voices, etc. */
export function canCreateContent(role: Role): boolean {
  return roleAtLeast(role, "editor");
}

/** Delete content (projects, documents, brand voices) — admin+. */
export function canDeleteContent(role: Role): boolean {
  return roleAtLeast(role, "admin");
}

/** Admin-level org settings. */
export function canManageOrg(role: Role): boolean {
  return roleAtLeast(role, "admin");
}

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

/** The single source of truth for access decisions. `null` role = no session.
 *  Every server guard (requireRole / requireOrgRole / apiRequireRole) delegates
 *  to this so the 401 vs 403 outcome is consistent and unit-testable. */
export type AccessDecision = { ok: true } | { ok: false; status: 401 | 403; reason: "unauthenticated" | "forbidden" };

export function evaluateRoleAccess(role: Role | null, min: Role): AccessDecision {
  if (!role) return { ok: false, status: 401, reason: "unauthenticated" };
  if (!roleAtLeast(role, min)) return { ok: false, status: 403, reason: "forbidden" };
  return { ok: true };
}
