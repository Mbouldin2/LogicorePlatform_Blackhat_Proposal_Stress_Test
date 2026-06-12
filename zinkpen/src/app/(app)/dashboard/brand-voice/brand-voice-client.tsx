"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Mic2, Plus, Upload, Sparkles, FileText, Check, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/widgets";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createBrandVoiceAction, updateBrandVoiceAction, deleteBrandVoiceAction } from "@/lib/actions";
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
  canDelete,
}: {
  initialVoices: BrandVoice[];
  canCreate: boolean;
  canDelete: boolean;
}) {
  const [voices, setVoices] = useState<BrandVoice[]>(initialVoices);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [sample, setSample] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  // Inline edit
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editBusy, setEditBusy] = useState(false);

  // Delete confirm
  const [pending, setPending] = useState<{ id: string; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    if (!result.ok) return toast.error(result.error);
    setVoices((prev) => [result.data, ...prev]);
    setCreating(false);
    setName("");
    setDesc("");
    setSample("");
    toast.success(`Voice profile "${result.data.name}" created`);
  }

  function startEdit(v: BrandVoice) {
    setEditId(v.id);
    setEditName(v.name);
    setEditDesc(v.description);
  }

  async function saveEdit() {
    if (!editId || !editName.trim()) {
      toast.error("Voice name is required.");
      return;
    }
    setEditBusy(true);
    const res = await updateBrandVoiceAction({ id: editId, name: editName, description: editDesc || undefined });
    setEditBusy(false);
    if (!res.ok) return toast.error(res.error);
    setVoices((prev) => prev.map((v) => (v.id === editId ? { ...v, name: editName, description: editDesc } : v)));
    setEditId(null);
    toast.success("Voice profile updated");
  }

  async function confirmDelete() {
    if (!pending) return;
    setDeleting(true);
    const res = await deleteBrandVoiceAction({ id: pending.id });
    setDeleting(false);
    if (!res.ok) {
      toast.error(res.error);
      setPending(null);
      return;
    }
    setVoices((prev) => prev.filter((v) => v.id !== pending.id));
    toast.success("Voice profile deleted");
    setPending(null);
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
        {creating && canCreate && (
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

        {voices.length === 0 ? (
          <EmptyState
            icon={Mic2}
            title="No brand voices yet"
            description="Create a voice profile from a writing sample to keep every generation on-brand."
            action={canCreate ? <Button onClick={() => setCreating(true)}><Plus className="size-4" /> New voice</Button> : undefined}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {voices.map((v) => (
              <Card key={v.id} className="flex flex-col p-5">
                {editId === v.id ? (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor={`en-${v.id}`}>Name</Label>
                      <Input id={`en-${v.id}`} value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`ed-${v.id}`}>Description</Label>
                      <Input id={`ed-${v.id}`} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit} disabled={editBusy}>
                        {editBusy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditId(null)}><X className="size-4" /> Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[var(--color-ink-50)] text-[var(--color-ink-600)]">
                        <Mic2 className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{v.name}</h3>
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
                    <div className="mt-4 flex flex-1 items-end gap-1.5">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.success(`"${v.name}" is ready to use in the Studio`)}>
                        <Check className="size-4" /> Apply
                      </Button>
                      {canCreate && (
                        <Button variant="ghost" size="icon" onClick={() => startEdit(v)} aria-label="Edit"><Pencil className="size-3.5" /></Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="icon" className="text-[var(--color-danger)] hover:bg-red-50" onClick={() => setPending({ id: v.id, label: v.name })} aria-label="Delete"><Trash2 className="size-3.5" /></Button>
                      )}
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pending !== null}
        title="Delete brand voice?"
        description={`"${pending?.label}" will be permanently deleted. This can't be undone.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
