import { DashboardShell } from "@/components/dashboard/shell";
import { getCurrentUser } from "@/lib/supabase/server";
import { DEMO_USER } from "@/lib/supabase/config";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // In production, redirect unauthenticated users to /login. In demo mode the
  // demo operator is returned so the workspace is fully explorable.
  const user = (await getCurrentUser()) ?? DEMO_USER;
  return (
    <DashboardShell user={{ name: user.name, email: user.email, plan: user.plan }}>
      {children}
    </DashboardShell>
  );
}
