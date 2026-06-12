"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Mic2, Plus, Upload, Sparkles, FileText, Check } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createBrandVoiceAction } from "@/lib/actions";
import type { BrandVoice } from "@/types";
import { countWords } from "@/lib/utils";

/** Lightweight heuristic that "learns" voice traits from a writing sample. */
function deriveTraits(sample: string): string[] {
  const w = countWords(sample);
  const avgLen = sample.length / Math.max(1, (sample.match(/[.!?]/g) ?? []).length);
  const traits: string[] = [];
  traits.push(avgLen > 120 ? "Formal" : "Conversational");
  traits.push(/\b\d+%|\$\d|\bdata\b|\bROI\b/i.test(sample) ? "Data-driven" : "Story-led");
  traits.push(w > 120 ? "Authoritative" : "Concise");
  traits.push(/\bwe believe|\bimagine|\bfuture\b/i.test(sample) ? "Visionary" : "Precise");
  return [...new Set(traits)];
}

export function BrandVoiceClient({
  initialVoices,
  canCreate,
}: {
  initialVoices: BrandVoice[];
  canCreate: boolean;
}) {
  const [voices, setVoices] = useState<BrandVoice[]>(initialVoices);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [sample, setSample] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  async function analyzeAndSave() {
    if (!name.trim() || countWords(sample) < 20) {
      toast.error("Add a name and at least ~20 words of sample writing.");
      return;
    }
    setAnalyzing(true);
    const traits = deriveTraits(sample);
    const result = await createBrandVoiceAction({
      name,
      description: desc || `Learned from a ${countWords(sample)}-word sample.`,
      traits,
      sampleText: sample,
    });
    setAnalyzing(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setVoices((prev) => [result.data, ...prev]);
    setCreating(false);
    setName("");
    setDesc("");
    setSample("");
    toast.success(`Voice profile "${result.data.name}" created`);
  }

  return (
    <>
      <PageHeader
        title="Brand Voice System"
        description="Upload documents, learn your style, and apply reusable voice profiles to any generation."
        actions={
          canCreate ? (
            <Button onClick={() => setCreating((v) => !v)}>
              <Plus className="size-4" /> New voice
            </Button>
          ) : (
            <Badge variant="muted">View-only access</Badge>
          )
        }
      />
      <div className="space-y-6 p-6">
        {creating && (
          <Card>
            <CardHeader>
              <CardTitle>Create a brand voice</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="vname">Voice name</Label>
                  <Input id="vname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Executive Authority" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vdesc">Description (optional)</Label>
                  <Input id="vdesc" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="When to use this voice" />
                </div>
                <div className="rounded-[var(--radius)] border border-dashed border-[var(--color-border)] p-4 text-center">
                  <Upload className="mx-auto size-6 text-[var(--color-muted-foreground)]" />
                  <p className="mt-2 text-sm font-medium">Upload sample documents</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">PDF, DOCX, TXT — or paste below</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vsample">Paste writing sample</Label>
                <Textarea
                  id="vsample"
                  value={sample}
                  onChange={(e) => setSample(e.target.value)}
                  placeholder="Paste a few paragraphs that represent this voice…"
                  className="min-h-44"
                />
                <Button onClick={analyzeAndSave} disabled={analyzing} className="w-full">
                  <Sparkles className="size-4" /> {analyzing ? "Learning voice…" : "Analyze & create voice"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {voices.map((v) => (
            <Card key={v.id} className="p-5">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[var(--color-ink-50)] text-[var(--color-ink-600)]">
                  <Mic2 className="size-4" />
                </span>
                <div>
                  <h3 className="font-semibold">{v.name}</h3>
                  <p className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
                    <FileText className="size-3" /> {v.sampleCount} sample{v.sampleCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">{v.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {v.traits.map((t) => (
                  <Badge key={t} variant="default">{t}</Badge>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => toast.success(`"${v.name}" is ready to use in the Studio`)}
              >
                <Check className="size-4" /> Apply in Studio
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
