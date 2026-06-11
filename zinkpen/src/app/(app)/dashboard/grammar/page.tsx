"use client";
import { useState } from "react";
import { toast } from "sonner";
import { SpellCheck, Loader2, Check, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { GrammarIssue, ReadabilityReport } from "@/types";
import { countWords } from "@/lib/utils";

const SAMPLE =
  "Our team could of done better, but we recieve alot of feedback that was very unique . In order to improve, teh process must change.";

const sevColor: Record<GrammarIssue["severity"], "danger" | "warning" | "muted"> = {
  high: "danger",
  medium: "warning",
  low: "muted",
};

export default function GrammarPage() {
  const [text, setText] = useState(SAMPLE);
  const [issues, setIssues] = useState<GrammarIssue[]>([]);
  const [report, setReport] = useState<ReadabilityReport | null>(null);
  const [corrected, setCorrected] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (countWords(text) < 3) {
      toast.error("Add a bit more text to analyze.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/grammar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setIssues(data.issues ?? []);
      setReport(data.report ?? null);
      setCorrected(data.corrected ?? text);
      toast.success(`${data.issues?.length ?? 0} suggestions found`);
    } catch {
      toast.error("Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Grammar & Style Engine"
        description="Spelling, punctuation, clarity, readability, tone, and grade-level scoring."
      />
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Your text</CardTitle>
              <Button onClick={analyze} disabled={loading} size="sm">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <SpellCheck className="size-4" />}
                Check writing
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-48" />
            </CardContent>
          </Card>

          {corrected && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Corrected</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setText(corrected);
                    toast.success("Applied all corrections");
                  }}
                >
                  <Check className="size-4" /> Apply all
                </Button>
              </CardHeader>
              <CardContent>
                <p className="rounded-[var(--radius)] bg-[var(--color-canvas)] p-4 text-sm leading-relaxed">{corrected}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Suggestions ({issues.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {issues.length === 0 && (
                <p className="py-6 text-center text-sm text-[var(--color-muted-foreground)]">
                  No suggestions yet — run a check to see issues.
                </p>
              )}
              {issues.map((i) => (
                <div key={i.id} className="flex items-start gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-[var(--color-warning)]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={sevColor[i.severity]}>{i.type}</Badge>
                      <span className="text-sm font-medium">{i.message}</span>
                    </div>
                    {i.context && <p className="mt-1 truncate text-xs text-[var(--color-muted-foreground)]">…{i.context}…</p>}
                    <p className="mt-1 text-sm">
                      Suggest: <span className="font-medium text-[var(--color-success)]">{i.suggestion}</span>
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Readability sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Readability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!report && <p className="text-sm text-[var(--color-muted-foreground)]">Run a check to score readability.</p>}
              {report && (
                <>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>Flesch reading ease</span>
                      <span className="font-bold">{report.fleschScore}</span>
                    </div>
                    <Progress value={report.fleschScore} tone={report.fleschScore >= 60 ? "success" : "gold"} />
                  </div>
                  <Metric label="Grade level" value={report.gradeLevel} />
                  <Metric label="Tone" value={report.toneLabel} />
                  <Metric label="Reading time" value={`${report.readingTimeMin} min`} />
                  <Metric label="Avg. sentence length" value={`${report.sentenceLengthAvg} words`} />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-sm first:border-0 first:pt-0">
      <span className="text-[var(--color-muted-foreground)]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
