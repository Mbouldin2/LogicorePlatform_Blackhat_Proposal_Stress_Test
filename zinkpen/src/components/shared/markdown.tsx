import * as React from "react";
import { cn } from "@/lib/utils";

/** Minimal, dependency-free Markdown renderer tuned for AI output.
 *  Supports headings, bold, italics, lists, blockquotes, and paragraphs. */
export function Markdown({ content, className }: { content: string; className?: string }) {
  const blocks = parse(content);
  return (
    <div className={cn("zp-prose space-y-3 text-[0.95rem] leading-relaxed text-[var(--color-foreground)]", className)}>
      {blocks}
    </div>
  );
}

function inline(text: string, key: React.Key): React.ReactNode {
  // bold **x**, italics *x*, code `x`
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter(Boolean);
  return (
    <React.Fragment key={key}>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**"))
          return <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>;
        if (p.startsWith("*") && p.endsWith("*")) return <em key={i}>{p.slice(1, -1)}</em>;
        if (p.startsWith("`") && p.endsWith("`"))
          return (
            <code key={i} className="rounded bg-[var(--color-muted)] px-1 py-0.5 font-mono text-[0.85em]">
              {p.slice(1, -1)}
            </code>
          );
        return <span key={i}>{p}</span>;
      })}
    </React.Fragment>
  );
}

function parse(md: string): React.ReactNode[] {
  const lines = md.replace(/\r/g, "").split("\n");
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  let ordered = false;
  const flush = () => {
    if (!list.length) return;
    const items = list.map((li, i) => <li key={i}>{inline(li, i)}</li>);
    out.push(
      ordered ? (
        <ol key={out.length} className="ml-5 list-decimal space-y-1">{items}</ol>
      ) : (
        <ul key={out.length} className="ml-5 list-disc space-y-1">{items}</ul>
      ),
    );
    list = [];
  };

  lines.forEach((raw) => {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      return;
    }
    if (/^#{1,6}\s/.test(line)) {
      flush();
      const level = line.match(/^#+/)![0].length;
      const text = line.replace(/^#+\s/, "");
      const sizes = ["text-2xl", "text-xl", "text-lg", "text-base", "text-sm", "text-sm"];
      out.push(
        React.createElement(
          `h${Math.min(level, 6)}`,
          { key: out.length, className: cn("font-semibold tracking-tight mt-4", sizes[level - 1]) },
          inline(text, 0),
        ),
      );
    } else if (/^>\s?/.test(line)) {
      flush();
      out.push(
        <blockquote
          key={out.length}
          className="border-l-2 border-[var(--color-ink-400)] pl-3 text-[var(--color-muted-foreground)] italic"
        >
          {inline(line.replace(/^>\s?/, ""), 0)}
        </blockquote>,
      );
    } else if (/^\d+\.\s/.test(line)) {
      ordered = true;
      list.push(line.replace(/^\d+\.\s/, ""));
    } else if (/^[-*]\s/.test(line)) {
      ordered = false;
      list.push(line.replace(/^[-*]\s/, ""));
    } else {
      flush();
      out.push(<p key={out.length}>{inline(line, 0)}</p>);
    }
  });
  flush();
  return out;
}
