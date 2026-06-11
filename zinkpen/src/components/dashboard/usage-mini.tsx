import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { MOCK_USAGE } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";

export function UsageMini() {
  const u = MOCK_USAGE;
  const pct = Math.round((u.wordsUsed / u.wordsLimit) * 100);
  return (
    <Link href="/dashboard/billing" className="block rounded-[var(--radius)] bg-[var(--color-canvas)] p-3 transition-colors hover:bg-[var(--color-muted)]">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium">AI words</span>
        <span className="text-[var(--color-muted-foreground)]">{pct}%</span>
      </div>
      <Progress value={pct} tone={pct > 85 ? "danger" : "brand"} />
      <p className="mt-1.5 text-[11px] text-[var(--color-muted-foreground)]">
        {formatNumber(u.wordsUsed)} / {formatNumber(u.wordsLimit)} · Professional
      </p>
    </Link>
  );
}
