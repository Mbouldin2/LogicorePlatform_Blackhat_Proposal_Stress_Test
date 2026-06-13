/** Next.js instrumentation hook — runs once when the server boots. We use it to
 *  fail fast on dangerous misconfigurations before serving any request. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertRuntimeConfig } = await import("@/lib/env");
    assertRuntimeConfig();
  }
}
