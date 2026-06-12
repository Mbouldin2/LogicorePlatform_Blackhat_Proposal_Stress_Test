import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { formatNumber } from "@/lib/utils";

export function UsageMini({
  wordsUsed,
  wordsLimit,
  plan,
}: {
  wordsUsed: number;
  wordsLimit: number;
  plan: string;
}) {
  const pct = wordsLimit > 0 ? Math.round((wordsUsed / wordsLimit) * 100) : 0;
  return (
    <Link href="/dashboard/billing" className="block rounded-[var(--radius)] bg-[var(--color-canvas)] p-3 transition-colors hover:bg-[var(--color-muted)]">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium">AI words</span>
        <span className="text-[var(--color-muted-foreground)]">{pct}%</span>
      </div>
      <Progress value={pct} tone={pct > 85 ? "danger" : "brand"} />
      <p className="mt-1.5 text-[11px] capitalize text-[var(--color-muted-foreground)]">
        {formatNumber(wordsUsed)} / {formatNumber(wordsLimit)} · {plan}
      </p>
    </Link>
  );
}
