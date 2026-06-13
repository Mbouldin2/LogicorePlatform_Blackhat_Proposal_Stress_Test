import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  tone = "brand",
}: {
  value: number;
  className?: string;
  tone?: "brand" | "gold" | "success" | "danger";
}) {
  const bg =
    tone === "gold"
      ? "bg-[var(--color-gold-500)]"
      : tone === "success"
        ? "bg-[var(--color-success)]"
        : tone === "danger"
          ? "bg-[var(--color-danger)]"
          : "zp-gradient-brand";
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-[var(--color-muted)]", className)}>
      <div
        className={cn("h-full rounded-full transition-all", bg)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
