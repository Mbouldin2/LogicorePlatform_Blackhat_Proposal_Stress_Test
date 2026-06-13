/**
 * Config fail-fast smoke test — proves assertRuntimeConfig() refuses the unsafe
 * combination (Supabase auth enabled, no database) that would otherwise grant
 * every user shared demo-owner access. Run: npm run test:config
 */
import { assertRuntimeConfig } from "../src/lib/env";

let failures = 0;
function check(label: string, fn: () => void, shouldThrow: boolean) {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  const pass = threw === shouldThrow;
  if (!pass) failures++;
  console.log(`${pass ? "✅" : "❌"} ${label} — expected ${shouldThrow ? "throw" : "ok"}, got ${threw ? "throw" : "ok"}`);
}

const SUPA = { NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon" };
function setEnv(vals: Record<string, string | undefined>) {
  for (const k of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "DATABASE_URL"]) delete process.env[k];
  for (const [k, v] of Object.entries(vals)) if (v !== undefined) process.env[k] = v;
}

console.log("— assertRuntimeConfig —");
setEnv({}); // demo mode: nothing configured
check("demo mode (no auth, no db) is allowed", assertRuntimeConfig, false);

setEnv({ ...SUPA }); // auth on, db off -> dangerous
check("auth enabled WITHOUT database -> fail fast", assertRuntimeConfig, true);

setEnv({ ...SUPA, DATABASE_URL: "postgres://u:p@h:5432/db" }); // full prod
check("auth + database (production) is allowed", assertRuntimeConfig, false);

setEnv({ DATABASE_URL: "postgres://u:p@h:5432/db" }); // db only (e.g. demo+db)
check("database only (no auth) is allowed", assertRuntimeConfig, false);

setEnv({});
console.log("");
if (failures > 0) {
  console.error(`❌ ${failures} config check(s) failed.`);
  process.exit(1);
}
console.log("✅ All config checks passed — unsafe config is rejected at startup.");
