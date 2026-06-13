/** Runtime configuration invariants that must hold in a real (non-demo)
 *  deployment. Throws on dangerous partial configurations so a misconfigured
 *  deploy fails fast instead of silently degrading security.
 *
 *  Kept dependency-free (reads process.env directly) so it can run at boot
 *  (instrumentation) and in standalone checks. */
export function assertRuntimeConfig(): void {
  const supabaseEnabled = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const databaseEnabled = Boolean(process.env.DATABASE_URL);

  // If real auth is enabled but there is no database, every authenticated user
  // would collapse onto the shared demo org as "owner" (see tenant resolver).
  // Refuse to run in that state.
  if (supabaseEnabled && !databaseEnabled) {
    throw new Error(
      "[zinkpen] Invalid configuration: NEXT_PUBLIC_SUPABASE_URL is set but DATABASE_URL is not. " +
        "Running real authentication without a database would grant all users shared demo-owner access. " +
        "Set DATABASE_URL (and DIRECT_URL), or unset the Supabase env vars to run in demo mode.",
    );
  }
}
