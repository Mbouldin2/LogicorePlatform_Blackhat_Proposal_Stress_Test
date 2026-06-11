import { cn } from "@/lib/utils";

/** ZinkPen wordmark + monogram. The "Z" nib evokes a fountain-pen tip. */
export function Logo({
  className,
  showWord = true,
  size = 28,
}: {
  className?: string;
  showWord?: boolean;
  size?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className="zp-gradient-brand inline-flex items-center justify-center rounded-[10px] text-white shadow-[0_6px_16px_-6px_rgba(74,67,224,0.7)]"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill="none">
          <path d="M6 5h12L8 17h10" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="18" cy="19.5" r="1.6" fill="white" />
        </svg>
      </span>
      {showWord && (
        <span className="text-[1.05rem] font-bold tracking-tight text-[var(--color-foreground)]">
          Zink<span className="zp-text-gradient">Pen</span>
        </span>
      )}
    </span>
  );
}
