"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, Copy, Download, Eye, Pencil, Wand2, Save } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/shared/markdown";
import { WRITING_TEMPLATES, TONES } from "@/lib/constants";
import { MOCK_VOICES } from "@/lib/mock-data";
import { saveDocumentAction } from "@/lib/actions";
import { wasBlocked } from "@/lib/client/ai-fetch";
import type { BrandVoice } from "@/types";
import { countWords, readingTime } from "@/lib/utils";

export default function StudioPage() {
  const [template, setTemplate] = useState(WRITING_TEMPLATES[0].id);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<string>("professional");
  const [audience, setAudience] = useState("");
  const [keywords, setKeywords] = useState("");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [voice, setVoice] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"preview" | "edit">("preview");
  const [voices, setVoices] = useState<BrandVoice[]>(MOCK_VOICES);

  // Load brand-voice profiles from the workspace (DB-backed; demo fallback).
  useEffect(() => {
    fetch("/api/brand-voices")
      .then((r) => r.json())
      .then((d) => Array.isArray(d.voices) && d.voices.length > 0 && setVoices(d.voices))
      .catch(() => {});
  }, []);

  const words = countWords(output);

  async function save() {
    if (!output.trim()) return;
    setSaving(true);
    const title = (topic.trim() || output.replace(/^#+\s*/, "").split("\n")[0] || "Untitled draft").slice(0, 120);
    const type = WRITING_TEMPLATES.find((t) => t.id === template)?.name ?? "Document";
    const result = await saveDocumentAction({ title, type, content: output, status: "draft" });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Saved to your workspace");
  }

  async function generate() {
    if (!topic.trim()) {
      toast.error("Add a topic to generate from.");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ template, topic, tone, audience, keywords, length, brandVoice: voice || undefined }),
      });
      if (await wasBlocked(res)) return;
      const data = await res.json();
      setOutput(data.text ?? "");
      setView("preview");
      toast.success("Draft generated");
    } catch {
      toast.error("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  }

  function download() {
    const blob = new Blob([output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic.slice(0, 40) || "zinkpen-draft"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        title="AI Writing Studio"
        description="Generate long-form articles, copy, emails, social, and executive content."
      />
      <div className="grid gap-6 p-6 lg:grid-cols-[360px_1fr]">
        {/* Config */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Template</Label>
                <Select
                  value={template}
                  onValueChange={setTemplate}
                  options={WRITING_TEMPLATES.map((t) => ({ value: t.id, label: t.name }))}
                />
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {WRITING_TEMPLATES.find((t) => t.id === template)?.desc}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="topic">Topic / prompt</Label>
                <Textarea id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. How mid-market firms should adopt AI governance in 2026" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone} options={TONES.map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Length</Label>
                  <Select
                    value={length}
                    onValueChange={(v) => setLength(v as typeof length)}
                    options={[
                      { value: "short", label: "Short" },
                      { value: "medium", label: "Medium" },
                      { value: "long", label: "Long" },
                    ]}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="audience">Audience</Label>
                <Input id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. CFOs at mid-market firms" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="keywords">Keywords (optional)</Label>
                <Input id="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="ai governance, compliance, roi" />
              </div>
              <div className="space-y-1.5">
                <Label>Brand voice</Label>
                <Select
                  value={voice}
                  onValueChange={setVoice}
                  placeholder="None"
                  options={[{ value: "", label: "No voice profile" }, ...voices.map((v) => ({ value: v.description, label: v.name }))]}
                />
              </div>
              <Button onClick={generate} disabled={loading} className="w-full">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {loading ? "Generating…" : "Generate draft"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Editor */}
        <Card className="flex min-h-[60vh] flex-col">
          <CardHeader className="flex-row items-center justify-between border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <CardTitle>Editor</CardTitle>
              {output && (
                <>
                  <Badge variant="muted">{words} words</Badge>
                  <Badge variant="muted">{readingTime(words)} min read</Badge>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant={view === "preview" ? "secondary" : "ghost"} size="sm" onClick={() => setView("preview")}>
                <Eye className="size-4" /> Preview
              </Button>
              <Button variant={view === "edit" ? "secondary" : "ghost"} size="sm" onClick={() => setView("edit")}>
                <Pencil className="size-4" /> Edit
              </Button>
              <Button variant="ghost" size="icon" onClick={copy} disabled={!output} aria-label="Copy">
                <Copy className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={download} disabled={!output} aria-label="Download">
                <Download className="size-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={save} disabled={!output || saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pt-5">
            {!output && !loading && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="mb-3 inline-flex size-12 items-center justify-center rounded-full bg-[var(--color-ink-50)] text-[var(--color-ink-600)]">
                  <Wand2 className="size-6" />
                </span>
                <h3 className="font-semibold">Your draft will appear here</h3>
                <p className="mt-1 max-w-sm text-sm text-[var(--color-muted-foreground)]">
                  Configure the panel on the left and hit Generate. You can edit, preview, copy, and export.
                </p>
              </div>
            )}
            {loading && (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-3 rounded bg-[var(--color-muted)]" style={{ width: `${90 - i * 8}%` }} />
                ))}
              </div>
            )}
            {output && view === "preview" && <Markdown content={output} />}
            {output && view === "edit" && (
              <Textarea value={output} onChange={(e) => setOutput(e.target.value)} className="min-h-[55vh] font-mono text-sm" />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
