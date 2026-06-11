import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "./config";

/** Server-side Supabase client bound to the request cookie store.
 *  Returns null in demo mode (no env) so callers fall back to the demo session. */
export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(items: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            items.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component — safe to ignore; middleware refreshes.
          }
        },
      },
    },
  );
}

/** Resolve the current user, or the demo user when auth isn't configured. */
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    const { DEMO_USER } = await import("./config");
    return DEMO_USER;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? "",
    name: (user.user_metadata?.name as string) ?? user.email ?? "User",
    plan: (user.user_metadata?.plan as "starter" | "professional" | "executive" | "government") ?? "starter",
    role: "owner" as const,
  };
}
