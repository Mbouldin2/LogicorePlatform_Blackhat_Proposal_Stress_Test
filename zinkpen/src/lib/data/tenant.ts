import "server-only";
import { getPrisma } from "@/lib/db/prisma";
import { DEMO_ORG_ID } from "@/lib/db/config";
import { getCurrentUser } from "@/lib/supabase/server";
import { DEMO_USER } from "@/lib/supabase/config";
import type { PlanId } from "@/lib/constants";

export interface Tenant {
  userId: string;
  email: string;
  name: string;
  orgId: string;
  plan: PlanId;
  /** True when running without a database (demo data). */
  demo: boolean;
}

/** Resolves the active tenant (user + organization). In DB mode this lazily
 *  provisions the User, Organization, and owner Membership on first access so a
 *  freshly authenticated user always has a workspace. In demo mode it returns
 *  stable demo identifiers and never touches Postgres. */
export async function getTenant(): Promise<Tenant> {
  const user = (await getCurrentUser()) ?? DEMO_USER;
  const prisma = getPrisma();

  if (!prisma) {
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      orgId: DEMO_ORG_ID,
      plan: user.plan,
      demo: true,
    };
  }

  // Ensure the user exists.
  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email, name: user.name },
    create: { id: user.id, email: user.email, name: user.name },
  });

  // Find an org the user belongs to, or create one and add them as owner.
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
    demo: false,
  };
}
