"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

/** Lightweight styled range slider (no external deps). */
export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
}: {
  value: number;
  onValueChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onValueChange(Number(e.target.value))}
      className={cn("zp-range h-2 w-full cursor-pointer appearance-none rounded-full", className)}
      style={{
        background: `linear-gradient(to right, var(--color-ink-600) 0%, var(--color-accent-600) ${pct}%, var(--color-muted) ${pct}%, var(--color-muted) 100%)`,
      }}
    />
  );
}
