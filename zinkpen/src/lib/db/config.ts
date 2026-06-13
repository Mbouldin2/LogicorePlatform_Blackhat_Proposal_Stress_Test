/** Whether a PostgreSQL database is configured. When false, the entire data
 *  layer transparently falls back to in-memory demo data so the product is
 *  fully explorable with zero infrastructure. */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Stable identifiers used by the demo (no-database) tenant. */
export const DEMO_ORG_ID = "demo-org";
