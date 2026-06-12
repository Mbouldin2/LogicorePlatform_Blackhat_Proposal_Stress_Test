"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Fingerprint, Loader2, Copy, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/dashboard/widgets";
import { wasBlocked } from "@/lib/client/ai-fetch";
import type { HumanizeResult } from "@/types";
import { countWords } from "@/lib/utils";

export default function HumanizerPage() {
  const [text, setText] = useState("");
  const [creativity, setCreativity] = useState(55);
  const [result, setResult] = useState<HumanizeResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function humanize() {
    if (countWords(text) < 5) {
      toast.error("Paste at least a sentence or two to humanize.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/humanize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, creativity }),
      });
      if (await wasBlocked(res)) return;
      setResult(await res.json());
      toast.success("Humanized");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const creativityLabel = creativity < 33 ? "Conservative" : creativity < 66 ? "Balanced" : "Expressive";

  return (
    <>
      <PageHeader
        title="Humanizer Engine"
        description="Rewrite AI-generated text into natural human writing — with risk and humanization scoring."
      />
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        {/* Input */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Original text</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste AI-generated or robotic-sounding text here…"
              className="min-h-64 flex-1"
            />
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Creativity</Label>
                <Badge variant="default">{creativityLabel} · {creativity}</Badge>
              </div>
              <Slider value={creativity} onValueChange={setCreativity} />
              <p className="mt-1.5 text-xs text-[var(--color-muted-foreground)]">
                Higher creativity reads more naturally but may rephrase further from the original.
              </p>
            </div>
            <Button onClick={humanize} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Fingerprint className="size-4" />}
              {loading ? "Humanizing…" : "Humanize text"}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Humanized result</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            {!result && (
              <div className="flex flex-1 flex-col items-center justify-center text-center text-sm text-[var(--color-muted-foreground)]">
                <Fingerprint className="mb-2 size-8 text-[var(--color-ink-300)]" />
                Your scores and rewritten text will appear here.
              </div>
            )}
            {result && (
              <>
                <div className="grid grid-cols-3 gap-2 rounded-[var(--radius)] bg-[var(--color-canvas)] p-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="font-bold text-[var(--color-danger)]">{result.aiRiskBefore}%</span>
                      <ArrowRight className="size-3 text-[var(--color-muted-foreground)]" />
                      <span className="font-bold text-[var(--color-success)]">{result.aiRiskAfter}%</span>
                    </div>
                    <span className="text-xs text-[var(--color-muted-foreground)]">AI risk</span>
                  </div>
                  <ScoreRing value={result.humanizationScore} label="Humanized" tone="brand" size={72} />
                  <ScoreRing value={result.meaningPreserved} label="Meaning kept" tone="success" size={72} />
                </div>
                <div className="flex-1 overflow-auto rounded-[var(--radius)] border border-[var(--color-border)] p-4 text-sm leading-relaxed">
                  {result.text}
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(result.text);
                    toast.success("Copied");
                  }}
                >
                  <Copy className="size-4" /> Copy humanized text
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
