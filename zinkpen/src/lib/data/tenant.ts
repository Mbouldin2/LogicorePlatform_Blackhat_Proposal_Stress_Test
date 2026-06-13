import "server-only";
import { getPrisma } from "@/lib/db/prisma";
import { DEMO_ORG_ID } from "@/lib/db/config";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { PlanId } from "@/lib/constants";
import type { Role } from "@/lib/auth/roles";

export interface Tenant {
  userId: string;
  email: string;
  name: string;
  orgId: string;
  plan: PlanId;
  /** The user's role within the resolved org. */
  role: Role;
  /** True when running without a database (demo data). */
  demo: boolean;
}

/** Thrown by `getTenant()` when auth is configured but the caller is not
 *  authenticated. Callers that can tolerate anonymous access should use
 *  `getOptionalTenant()` instead. */
export class UnauthorizedError extends Error {
  constructor() {
    super("UNAUTHENTICATED");
    this.name = "UnauthorizedError";
  }
}

/** Resolves the active tenant, or `null` when auth is configured but the request
 *  is unauthenticated. In demo mode (no Supabase) the demo operator is returned.
 *  In DB mode this lazily provisions the User, Organization, and owner Membership
 *  on first access so a freshly authenticated user always has a workspace. */
export async function getOptionalTenant(): Promise<Tenant | null> {
  // getCurrentUser returns the demo user when Supabase is unconfigured, and
  // user-or-null when it IS configured — so null here means "must sign in".
  const user = await getCurrentUser();
  if (!user) return null;

  const prisma = getPrisma();
  if (!prisma) {
    // Fail closed: if real auth is configured but the database is not, do NOT
    // hand a real user the shared demo-owner tenant. This is a misconfiguration.
    if (isSupabaseConfigured()) {
      throw new Error(
        "[zinkpen] Database not configured while authentication is enabled — refusing to grant demo-owner access. Set DATABASE_URL.",
      );
    }
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      orgId: DEMO_ORG_ID,
      plan: user.plan,
      role: user.role,
      demo: true,
    };
  }

  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email, name: user.name },
    create: { id: user.id, email: user.email, name: user.name },
  });

  let membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    include: { org: true },
    orderBy: { org: { createdAt: "asc" } },
  });

  if (!membership) {
    const org = await prisma.organization.create({
      data: {
        name: `${user.name.split(" ")[0] || "My"}'s Workspace`,
        plan: user.plan,
        members: { create: { userId: user.id, role: "owner" } },
      },
    });
    membership = await prisma.membership.findFirst({
      where: { userId: user.id, orgId: org.id },
      include: { org: true },
    });
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    orgId: membership!.orgId,
    plan: membership!.org.plan as PlanId,
    role: membership!.role as Role,
    demo: false,
  };
}

/** Strict tenant resolver — throws `UnauthorizedError` when unauthenticated.
 *  Use in contexts that are already behind the auth gate (pages, actions). */
export async function getTenant(): Promise<Tenant> {
  const tenant = await getOptionalTenant();
  if (!tenant) throw new UnauthorizedError();
  return tenant;
}
