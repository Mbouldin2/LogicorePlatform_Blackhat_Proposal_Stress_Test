/**
 * Role-matrix smoke test — proves the permission predicates deny lower roles
 * and allow higher ones. Run: npm run test:roles
 *
 * This validates the *decision logic* that the server guards (requireRole /
 * requireOrgRole / guardGeneration / apiRequireRole) and the page-level checks
 * all delegate to. If this matrix is correct, an unauthorized role cannot pass
 * the guards that gate restricted routes and actions.
 */
import {
  roleAtLeast,
  canManageBilling,
  canManageTeam,
  canCreateContent,
  canDeleteContent,
  evaluateRoleAccess,
  type Role,
} from "../src/lib/auth/roles";

let failures = 0;
function check(label: string, actual: boolean, expected: boolean) {
  const pass = actual === expected;
  if (!pass) failures++;
  console.log(`${pass ? "✅" : "❌"} ${label} — expected ${expected}, got ${actual}`);
}
function checkStatus(label: string, actual: number | string, expected: number | string) {
  const pass = actual === expected;
  if (!pass) failures++;
  console.log(`${pass ? "✅" : "❌"} ${label} — expected ${expected}, got ${actual}`);
}

const roles: Role[] = ["viewer", "editor", "admin", "owner"];

console.log("\n— canCreateContent (editor+) —");
check("viewer cannot create content", canCreateContent("viewer"), false);
check("editor can create content", canCreateContent("editor"), true);
check("admin can create content", canCreateContent("admin"), true);
check("owner can create content", canCreateContent("owner"), true);

console.log("\n— canDeleteContent (admin+) — CRUD delete gate —");
check("viewer cannot delete", canDeleteContent("viewer"), false);
check("editor cannot delete", canDeleteContent("editor"), false);
check("admin can delete", canDeleteContent("admin"), true);
check("owner can delete", canDeleteContent("owner"), true);

console.log("\n— canManageTeam (admin+) —");
check("viewer cannot manage team", canManageTeam("viewer"), false);
check("editor cannot manage team", canManageTeam("editor"), false);
check("admin can manage team", canManageTeam("admin"), true);
check("owner can manage team", canManageTeam("owner"), true);

console.log("\n— canManageBilling (admin+) —");
check("viewer cannot manage billing", canManageBilling("viewer"), false);
check("editor cannot manage billing", canManageBilling("editor"), false);
check("admin can manage billing", canManageBilling("admin"), true);
check("owner can manage billing", canManageBilling("owner"), true);

console.log("\n— roleAtLeast ordering —");
check("owner >= admin", roleAtLeast("owner", "admin"), true);
check("admin >= editor", roleAtLeast("admin", "editor"), true);
check("editor >= viewer", roleAtLeast("editor", "viewer"), true);
check("viewer NOT >= editor", roleAtLeast("viewer", "editor"), false);
check("editor NOT >= admin", roleAtLeast("editor", "admin"), false);

// Every role is at least itself.
roles.forEach((r) => check(`${r} >= ${r}`, roleAtLeast(r, r), true));

console.log("\n— evaluateRoleAccess (the 401/403 decision every guard uses) —");
checkStatus("no session -> 401", evalStatus(null, "viewer"), 401);
checkStatus("viewer vs admin route -> 403", evalStatus("viewer", "admin"), 403);
checkStatus("editor vs admin route -> 403", evalStatus("editor", "admin"), 403);
checkStatus("viewer vs editor action -> 403", evalStatus("viewer", "editor"), 403);
checkStatus("admin vs admin route -> ok", evalStatus("admin", "admin"), "ok");
checkStatus("owner vs admin route -> ok", evalStatus("owner", "admin"), "ok");
checkStatus("editor vs editor action -> ok", evalStatus("editor", "editor"), "ok");

function evalStatus(role: Role | null, min: Role): number | "ok" {
  const d = evaluateRoleAccess(role, min);
  return d.ok ? "ok" : d.status;
}

console.log("");
if (failures > 0) {
  console.error(`❌ ${failures} role check(s) failed.`);
  process.exit(1);
}
console.log("✅ All role checks passed — unauthorized roles are denied as expected.");
