"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Search, Loader2, ExternalLink, ShieldCheck, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/shared/markdown";
import type { Citation } from "@/types";

const relColor: Record<Citation["reliability"], "success" | "warning" | "muted"> = {
  high: "success",
  medium: "warning",
  low: "muted",
};

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [brief, setBrief] = useState("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!query.trim()) {
      toast.error("Enter a research topic.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/research", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query, depth: "deep" }),
      });
      const data = await res.json();
      setBrief(data.brief ?? "");
      setCitations(data.citations ?? []);
      toast.success("Research brief ready");
    } catch {
      toast.error("Research failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Research Assistant"
        description="Source-backed briefs, citation support, and a fact-check workflow."
      />
      <div className="space-y-6 p-6">
        <Card>
          <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run()}
              placeholder="Research a topic, e.g. 'AI adoption in federal agencies 2026'"
              className="flex-1"
            />
            <Button onClick={run} disabled={loading} className="sm:w-44">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              {loading ? "Researching…" : "Generate brief"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="min-h-[40vh]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-4" /> Research brief
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!brief && !loading && (
                <p className="py-12 text-center text-sm text-[var(--color-muted-foreground)]">
                  Your source-backed brief will appear here.
                </p>
              )}
              {loading && (
                <div className="space-y-3">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="h-3 rounded bg-[var(--color-muted)]" style={{ width: `${95 - i * 7}%` }} />
                  ))}
                </div>
              )}
              {brief && <Markdown content={brief} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-4" /> Citations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {citations.length === 0 && (
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Sources will be listed here. Always verify before publishing.
                </p>
              )}
              {citations.map((c) => (
                <div key={c.id} className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium">{c.title}</span>
                    <Badge variant={relColor[c.reliability]}>{c.reliability}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">{c.snippet}</p>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-ink-600)] hover:underline"
                  >
                    {c.source} <ExternalLink className="size-3" />
                  </a>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
