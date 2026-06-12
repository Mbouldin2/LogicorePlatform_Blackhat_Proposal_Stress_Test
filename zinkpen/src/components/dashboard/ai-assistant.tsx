"use client";
import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/shared/markdown";
import { wasBlocked } from "@/lib/client/ai-fetch";
import type { AIMessage } from "@/types";

const STARTERS = [
  "Write a LinkedIn post about our new service",
  "Draft a capability statement intro",
  "Make this paragraph sound more human",
  "Outline a white paper on AI governance",
];

export function AIAssistant({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm your ZinkPen assistant. Ask me to write, rewrite, brainstorm, or refine anything — I can pull from your brand voice and projects.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next: AIMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m.role !== "system") }),
      });
      if (await wasBlocked(res)) return;
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.text ?? "Sorry, I hit a snag." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error — please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-50 bg-black/20 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-[60] flex w-full max-w-md flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-pop)] transition-transform",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-4">
          <div className="flex items-center gap-2">
            <span className="zp-gradient-brand inline-flex size-7 items-center justify-center rounded-lg text-white">
              <Sparkles className="size-4" />
            </span>
            <span className="font-semibold">AI Assistant</span>
          </div>
          <button onClick={onClose} aria-label="Close assistant">
            <X className="size-5" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-[var(--radius)] px-3.5 py-2.5 text-sm",
                  m.role === "user"
                    ? "zp-gradient-brand text-white"
                    : "border border-[var(--color-border)] bg-[var(--color-canvas)]",
                )}
              >
                {m.role === "assistant" ? <Markdown content={m.content} /> : m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
              <Loader2 className="size-4 animate-spin" /> Thinking…
            </div>
          )}
          {messages.length === 1 && (
            <div className="space-y-2 pt-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-left text-sm transition-colors hover:border-[var(--color-ink-300)]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-[var(--color-border)] p-3"
        >
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask ZinkPen anything…"
              className="zp-focus max-h-32 min-h-10 flex-1 resize-none rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              <Send className="size-4" />
            </Button>
          </div>
        </form>
      </aside>
    </>
  );
}
