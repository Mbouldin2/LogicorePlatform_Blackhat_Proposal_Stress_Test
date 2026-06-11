import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "brand" | "gold" | "success" | "violet";
}) {
  const bg =
    tone === "gold"
      ? "bg-amber-100 text-amber-700"
      : tone === "success"
        ? "bg-emerald-100 text-emerald-700"
        : tone === "violet"
          ? "bg-purple-100 text-purple-700"
          : "bg-[var(--color-ink-50)] text-[var(--color-ink-700)]";
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--color-muted-foreground)]">{label}</span>
        {Icon && (
          <span className={cn("inline-flex size-8 items-center justify-center rounded-lg", bg)}>
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-[var(--color-muted-foreground)]">{sub}</div>}
    </Card>
  );
}

/** Circular score gauge used by Humanizer/Grammar/AI-risk surfaces. */
export function ScoreRing({
  value,
  label,
  tone = "brand",
  size = 96,
}: {
  value: number;
  label: string;
  tone?: "brand" | "success" | "danger" | "gold";
  size?: number;
}) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const stroke =
    tone === "success"
      ? "var(--color-success)"
      : tone === "danger"
        ? "var(--color-danger)"
        : tone === "gold"
          ? "var(--color-gold-500)"
          : "var(--color-ink-600)";
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-muted)" strokeWidth={8} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">{Math.round(value)}</div>
      </div>
      <span className="mt-1.5 text-xs font-medium text-[var(--color-muted-foreground)]">{label}</span>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
      <span className="mb-3 inline-flex size-12 items-center justify-center rounded-full bg-[var(--color-ink-50)] text-[var(--color-ink-600)]">
        <Icon className="size-6" />
      </span>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[var(--color-muted-foreground)]">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
