"use client";
import { useState } from "react";
import { toast } from "sonner";
import { FileSignature, Loader2, Copy, Download } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/shared/markdown";
import { wasBlocked } from "@/lib/client/ai-fetch";
import { PROPOSAL_TEMPLATES } from "@/lib/constants";
import { cn, countWords } from "@/lib/utils";

export default function ProposalsPage() {
  const [template, setTemplate] = useState(PROPOSAL_TEMPLATES[0].id);
  const [org, setOrg] = useState("");
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!org.trim() || !topic.trim()) {
      toast.error("Add your organization and the subject.");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const res = await fetch("/api/ai/proposal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ template, org, topic, details }),
      });
      if (await wasBlocked(res)) return;
      const data = await res.json();
      setOutput(data.text ?? "");
      toast.success("Draft ready");
    } catch {
      toast.error("Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  function download() {
    const blob = new Blob([output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template}-${org.slice(0, 20) || "draft"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        title="Proposal & Business Writing Suite"
        description="Capability statements, GovCon responses, SBIR drafts, grants, white papers, and business plans."
        badge="GovCon-ready"
      />
      <div className="grid gap-6 p-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document type</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              {PROPOSAL_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={cn(
                    "rounded-[var(--radius-sm)] border p-3 text-left transition-colors",
                    template === t.id
                      ? "border-[var(--color-ink-500)] bg-[var(--color-ink-50)]"
                      : "border-[var(--color-border)] hover:bg-[var(--color-muted)]",
                  )}
                >
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-[var(--color-muted-foreground)]">{t.desc}</div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="org">Organization</Label>
                <Input id="org" value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Acme Federal Solutions, LLC" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="topic">Subject / opportunity</Label>
                <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Cybersecurity managed services for DoD" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="details">Key details (optional)</Label>
                <Textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="NAICS codes, differentiators, past performance, evaluation factors…" />
              </div>
              <div className="sm:col-span-2">
                <Button onClick={generate} disabled={loading} className="w-full sm:w-auto">
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <FileSignature className="size-4" />}
                  {loading ? "Drafting…" : "Generate draft"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="min-h-[40vh]">
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>Draft</CardTitle>
                {output && <Badge variant="muted">{countWords(output)} words</Badge>}
              </div>
              {output && (
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }} aria-label="Copy">
                    <Copy className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={download} aria-label="Download">
                    <Download className="size-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!output && !loading && (
                <p className="py-12 text-center text-sm text-[var(--color-muted-foreground)]">
                  Select a document type, add details, and generate a compliant draft.
                </p>
              )}
              {loading && (
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-3 rounded bg-[var(--color-muted)]" style={{ width: `${95 - i * 6}%` }} />
                  ))}
                </div>
              )}
              {output && <Markdown content={output} />}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
