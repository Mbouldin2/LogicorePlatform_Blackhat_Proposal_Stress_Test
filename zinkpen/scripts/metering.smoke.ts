/**
 * Token-cost smoke test — proves the per-request cost math that recordGeneration
 * persists and the billing summary aggregates. Run: npm run test:metering
 */
import { computeCostUsd, priceForModel } from "../src/lib/ai/pricing";

let failures = 0;
function approx(label: string, actual: number, expected: number, tol = 1e-6) {
  const pass = Math.abs(actual - expected) <= tol;
  if (!pass) failures++;
  console.log(`${pass ? "✅" : "❌"} ${label} — expected ~${expected}, got ${actual}`);
}

console.log("— priceForModel —");
approx("gpt-4o input price", priceForModel("gpt-4o").inputPerM, 2.5);
approx("gpt-4o output price", priceForModel("gpt-4o").outputPerM, 10);
approx("prefix match gpt-4o-2024-08-06", priceForModel("gpt-4o-2024-08-06").inputPerM, 2.5);
approx("unknown model -> default input", priceForModel("totally-unknown").inputPerM, 3);

console.log("\n— computeCostUsd (USD per 1M tokens) —");
approx("1M input @ gpt-4o = $2.50", computeCostUsd(1_000_000, 0, "gpt-4o"), 2.5);
approx("1M output @ gpt-4o = $10.00", computeCostUsd(0, 1_000_000, "gpt-4o"), 10);
approx("1M+1M @ gpt-4o = $12.50", computeCostUsd(1_000_000, 1_000_000, "gpt-4o"), 12.5);
approx("unknown model uses $3/$12 default", computeCostUsd(1_000_000, 1_000_000, "mystery"), 15);
approx("demo provider priced at demo rate", computeCostUsd(1_000_000, 0, "zinkpen-demo", "demo"), 2.5);

console.log("\n— fail-open —");
approx("zero tokens -> $0", computeCostUsd(0, 0, "gpt-4o"), 0);
approx("NaN tokens -> $0 (no crash)", computeCostUsd(Number.NaN, Number.NaN, "gpt-4o"), 0);

console.log("");
if (failures > 0) {
  console.error(`❌ ${failures} metering check(s) failed.`);
  process.exit(1);
}
console.log("✅ All metering checks passed — token costs compute correctly.");
