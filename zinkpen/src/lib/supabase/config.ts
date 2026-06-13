/** Whether Supabase auth is configured. When false, the app runs in demo mode
 *  with a simulated session so every surface is explorable without setup. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export const DEMO_USER = {
  id: "demo-user",
  email: "demo@zinkpen.ai",
  name: "Demo Operator",
  plan: "professional" as const,
  role: "owner" as const,
};
