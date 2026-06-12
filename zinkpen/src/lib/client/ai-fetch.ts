import { toast } from "sonner";

/** Inspect an AI endpoint response for auth/quota gating. Returns `true` (and
 *  surfaces the right UI) when the request was blocked, so callers can bail out
 *  before parsing a normal result:
 *
 *    const res = await fetch(...);
 *    if (await wasBlocked(res)) return;
 */
export async function wasBlocked(res: Response): Promise<boolean> {
  if (res.ok) return false;

  if (res.status === 401) {
    toast.error("Please sign in to continue.", {
      action: { label: "Sign in", onClick: () => (window.location.href = "/login") },
    });
    return true;
  }

  if (res.status === 402) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    toast.error("Plan limit reached", {
      description: data.message ?? "You've reached your plan limit. Upgrade to keep creating.",
      duration: 8000,
      action: { label: "Upgrade", onClick: () => (window.location.href = "/dashboard/billing") },
    });
    return true;
  }

  if (res.status === 403) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    toast.error("Access restricted", {
      description: data.message ?? "You don't have permission to perform this action.",
    });
    return true;
  }

  return false;
}
