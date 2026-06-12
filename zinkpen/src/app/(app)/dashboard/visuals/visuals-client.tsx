"use client";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ImageIcon, Loader2, Sparkles, Upload, Download, Copy, Shuffle,
  FileJson, Printer, Hash, Wand2, Palette, Save, Trash2, Bookmark,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SlidePreview } from "@/components/visuals/slide-preview";
import {
  SOCIAL_PLATFORMS, VISUAL_CONTENT_TYPES, TONES, EXPORT_PRESETS,
  PALETTE_PRESETS, FONT_PAIRINGS,
} from "@/lib/constants";
import { renderSlideToDataUrl, downloadDataUrl, type RenderStyle } from "@/lib/visuals/render";
import { wasBlocked } from "@/lib/client/ai-fetch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { saveBrandKitAction, deleteBrandKitAction } from "@/lib/actions";
import type { CarouselSlide, BrandKit } from "@/types";
import { cn } from "@/lib/utils";

export function VisualsClient({
  canCreate,
  canDelete,
  initialKits,
}: {
  canCreate: boolean;
  canDelete: boolean;
  initialKits: BrandKit[];
}) {
  // config
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("linkedin");
  const [contentType, setContentType] = useState("carousel");
  const [tone, setTone] = useState("executive");
  const [audience, setAudience] = useState("");
  const [palette, setPalette] = useState<string[]>(PALETTE_PRESETS[0].colors);
  const [fontId, setFontId] = useState(FONT_PAIRINGS[1].id);
  const [logo, setLogo] = useState<string | null>(null);
  const [brandName, setBrandName] = useState("ZinkPen");
  const fileRef = useRef<HTMLInputElement>(null);

  // results
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  // export
  const [presetId, setPresetId] = useState<string>(EXPORT_PRESETS[2].id); // LinkedIn carousel default
  const preset = EXPORT_PRESETS.find((p) => p.id === presetId)!;
  const font = FONT_PAIRINGS.find((f) => f.id === fontId)!;

  // brand kits (persisted; demo keeps them in local state)
  const [savedKits, setSavedKits] = useState<BrandKit[]>(initialKits);
  const [kitBusy, setKitBusy] = useState(false);
  const [pendingKit, setPendingKit] = useState<{ id: string; label: string } | null>(null);
  const [kitDeleting, setKitDeleting] = useState(false);

  const style: RenderStyle = useMemo(
    () => ({ palette, fontHeading: font.heading, fontBody: font.body, tone, logoDataUrl: logo, brandName }),
    [palette, font, tone, logo, brandName],
  );

  function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  }

  function randomizePalette() {
    const pick = PALETTE_PRESETS[Math.floor(Math.random() * PALETTE_PRESETS.length)];
    setPalette(pick.colors);
    toast.success(`Palette: ${pick.name}`);
  }

  // --- Brand kit persistence ---
  async function saveKit() {
    const name = window.prompt("Name this brand kit:", brandName || "My Brand Kit");
    if (!name) return;
    setKitBusy(true);
    const res = await saveBrandKitAction({
      name,
      colors: palette,
      fontHeading: font.heading,
      fontBody: font.body,
      logoUrl: logo,
    });
    setKitBusy(false);
    if (!res.ok) return toast.error(res.error);
    setSavedKits((prev) => [res.data, ...prev]);
    toast.success(`Brand kit "${res.data.name}" saved`);
  }

  function applyKit(kit: BrandKit) {
    setPalette(kit.colors);
    if (kit.logoUrl !== undefined) setLogo(kit.logoUrl ?? null);
    const match = FONT_PAIRINGS.find((f) => f.heading === kit.fontHeading && f.body === kit.fontBody);
    if (match) setFontId(match.id);
    toast.success(`Applied "${kit.name}"`);
  }

  async function confirmDeleteKit() {
    if (!pendingKit) return;
    setKitDeleting(true);
    const res = await deleteBrandKitAction({ id: pendingKit.id });
    setKitDeleting(false);
    if (!res.ok) {
      toast.error(res.error);
      setPendingKit(null);
      return;
    }
    setSavedKits((prev) => prev.filter((k) => k.id !== pendingKit.id));
    toast.success("Brand kit deleted");
    setPendingKit(null);
  }

  async function generate() {
    if (!topic.trim()) {
      toast.error("Enter a topic to generate visuals.");
      return;
    }
    setLoading(true);
    setSlides([]);
    try {
      const res = await fetch("/api/ai/visuals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic, platform, contentType, tone, audience: audience || "decision-makers" }),
      });
      if (await wasBlocked(res)) return;
      const data = await res.json();
      setSlides(data.slides ?? []);
      setCaption(data.caption ?? "");
      setHashtags(data.hashtags ?? []);
      setActive(0);
      toast.success("Visual concept generated");
    } catch {
      toast.error("Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  function updateActiveSlide(patch: Partial<CarouselSlide>) {
    setSlides((prev) => prev.map((s, i) => (i === active ? { ...s, ...patch } : s)));
  }

  function exportActivePng() {
    if (!slides[active]) return;
    const url = renderSlideToDataUrl(slides[active], style, preset.w, preset.h, active, slides.length);
    downloadDataUrl(url, `zinkpen-${preset.id}-slide-${active + 1}.png`);
    toast.success(`Exported ${preset.w}×${preset.h} PNG`);
  }

  function exportAllPng() {
    slides.forEach((s, i) => {
      const url = renderSlideToDataUrl(s, style, preset.w, preset.h, i, slides.length);
      setTimeout(() => downloadDataUrl(url, `zinkpen-${preset.id}-slide-${i + 1}.png`), i * 250);
    });
    toast.success(`Exporting ${slides.length} slides as PNG`);
  }

  function exportProject() {
    const project = { topic, platform, contentType, tone, audience, palette, font: fontId, brandName, slides, caption, hashtags };
    const url = `data:application/json,${encodeURIComponent(JSON.stringify(project, null, 2))}`;
    downloadDataUrl(url, `zinkpen-project-${Date.now()}.json`);
    toast.success("Editable project saved (.json)");
  }

  function exportPdf() {
    const win = window.open("", "_blank");
    if (!win) return;
    const pages = slides
      .map(
        (s, i) =>
          `<div style="page-break-after:always;width:100%;aspect-ratio:${preset.w}/${preset.h};background:linear-gradient(135deg,${palette[0]},${palette[1]});color:#fff;padding:7%;box-sizing:border-box;font-family:${font.body}">
            <div style="height:6px;width:14%;background:${palette[2]};border-radius:4px"></div>
            <h2 style="font-family:${font.heading};font-size:42px;margin:16px 0">${escapeHtml(s.headline)}</h2>
            <p style="font-size:22px;opacity:.92">${escapeHtml(s.body)}</p>
            <p style="opacity:.7;margin-top:24px">${i + 1} / ${slides.length}</p>
          </div>`,
      )
      .join("");
    win.document.write(`<title>ZinkPen Export</title><body style="margin:0">${pages}</body>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }

  function saveToWorkspace() {
    toast.success("Saved to your workspace › Brand Refresh");
  }

  return (
    <>
      <PageHeader
        title="Visual Content Generator"
        description="Carousels, quote cards, infographics, thumbnails, and ad creative — premium, export-ready, on-brand."
        badge="New"
      />
      <div className="grid gap-6 p-6 xl:grid-cols-[380px_1fr]">
        {/* CONFIG */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Brief</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="vtopic">Topic</Label>
                <Textarea id="vtopic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Why value-based pricing wins in B2B consulting" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Platform</Label>
                  <Select value={platform} onValueChange={(v) => { setPlatform(v); const p = EXPORT_PRESETS.find((e) => e.platform === v); if (p) setPresetId(p.id); }}
                    options={SOCIAL_PLATFORMS.map((p) => ({ value: p.id, label: p.label }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Content type</Label>
                  <Select value={contentType} onValueChange={setContentType} options={VISUAL_CONTENT_TYPES.map((c) => ({ value: c.id, label: c.label }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone} options={TONES.map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vaud">Audience</Label>
                  <Input id="vaud" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="founders, CFOs…" />
                </div>
              </div>
              <Button onClick={generate} disabled={loading} className="w-full">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {loading ? "Designing…" : "Generate visuals"}
              </Button>
            </CardContent>
          </Card>

          {/* Brand kit */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Palette className="size-4" /> Brand kit</CardTitle>
              <Button variant="ghost" size="sm" onClick={randomizePalette}><Shuffle className="size-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-1.5 block">Color palette</Label>
                <div className="flex gap-2">
                  {palette.map((c, i) => (
                    <label key={i} className="relative flex-1 cursor-pointer">
                      <span className="block h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)]" style={{ background: c }} />
                      <input
                        type="color"
                        value={c}
                        onChange={(e) => setPalette((p) => p.map((x, xi) => (xi === i ? e.target.value : x)))}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                    </label>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PALETTE_PRESETS.map((p) => (
                    <button key={p.id} onClick={() => setPalette(p.colors)} className="flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)]">
                      <span className="flex">{p.colors.slice(0, 3).map((c, i) => <span key={i} className="size-2.5 rounded-full" style={{ background: c, marginLeft: i ? -3 : 0 }} />)}</span>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Font pairing</Label>
                <Select value={fontId} onValueChange={setFontId} options={FONT_PAIRINGS.map((f) => ({ value: f.id, label: `${f.heading} / ${f.body} — ${f.vibe}` }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="brand">Brand name</Label>
                  <Input id="brand" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Logo</Label>
                  <input ref={fileRef} type="file" accept="image/*" onChange={onLogo} className="hidden" />
                  <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
                    <Upload className="size-4" /> {logo ? "Replace" : "Upload"}
                  </Button>
                </div>
              </div>

              {/* Saved brand kits (persisted) */}
              <div className="space-y-2 border-t border-[var(--color-border)] pt-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5"><Bookmark className="size-3.5" /> Saved kits</Label>
                  {canCreate && (
                    <Button variant="ghost" size="sm" onClick={saveKit} disabled={kitBusy}>
                      {kitBusy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save current
                    </Button>
                  )}
                </div>
                {savedKits.length === 0 ? (
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    No saved kits yet. Save your colors, fonts, and logo to reuse them across posts.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {savedKits.map((k) => (
                      <span key={k.id} className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-1 pl-2 pr-1.5 text-xs">
                        <button onClick={() => applyKit(k)} className="inline-flex items-center gap-1.5 hover:opacity-80" title={`Apply ${k.name}`}>
                          <span className="flex">{k.colors.slice(0, 3).map((c, i) => <span key={i} className="size-3 rounded-full" style={{ background: c, marginLeft: i ? -3 : 0 }} />)}</span>
                          <span className="max-w-[90px] truncate font-medium">{k.name}</span>
                        </button>
                        {canDelete && (
                          <button onClick={() => setPendingKit({ id: k.id, label: k.name })} aria-label={`Delete ${k.name}`} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-danger)]">
                            <Trash2 className="size-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PREVIEW + RESULTS */}
        <div className="space-y-4">
          {slides.length === 0 && !loading && (
            <Card className="flex min-h-[50vh] flex-col items-center justify-center text-center">
              <span className="mb-3 inline-flex size-12 items-center justify-center rounded-full bg-[var(--color-ink-50)] text-[var(--color-ink-600)]"><Wand2 className="size-6" /></span>
              <h3 className="font-semibold">Design premium social assets</h3>
              <p className="mt-1 max-w-md text-sm text-[var(--color-muted-foreground)]">
                Fill in the brief, choose your brand kit, and ZinkPen generates a full carousel with slide copy,
                image concepts, captions, and export-ready files.
              </p>
            </Card>
          )}

          {loading && <Card className="flex min-h-[50vh] items-center justify-center"><Loader2 className="size-6 animate-spin text-[var(--color-ink-500)]" /></Card>}

          {slides.length > 0 && (
            <>
              {/* Export bar */}
              <Card>
                <CardContent className="flex flex-wrap items-center gap-2 pt-5">
                  <div className="mr-auto flex items-center gap-2">
                    <Label className="text-xs">Export size</Label>
                    <Select value={presetId} onValueChange={setPresetId} options={EXPORT_PRESETS.map((p) => ({ value: p.id, label: `${p.label} · ${p.w}×${p.h}` }))} className="w-64" />
                  </div>
                  <Button size="sm" variant="primary" onClick={exportActivePng}><Download className="size-4" /> PNG</Button>
                  <Button size="sm" variant="outline" onClick={exportAllPng}>All PNG</Button>
                  <Button size="sm" variant="outline" onClick={exportPdf}><Printer className="size-4" /> PDF</Button>
                  <Button size="sm" variant="outline" onClick={exportProject}><FileJson className="size-4" /> Project</Button>
                  <Button size="sm" variant="gold" onClick={saveToWorkspace}>Save</Button>
                </CardContent>
              </Card>

              <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                {/* Canvas */}
                <Card>
                  <CardContent className="pt-5">
                    <div className="mx-auto max-w-md">
                      <SlidePreview slide={slides[active]} style={style} w={preset.w} h={preset.h} index={active} total={slides.length} />
                    </div>
                    {/* Thumbnails */}
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                      {slides.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setActive(i)}
                          className={cn(
                            "relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 text-[8px] font-semibold text-white",
                            active === i ? "border-[var(--color-ink-500)]" : "border-transparent",
                          )}
                          style={{ background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})` }}
                        >
                          <span className="absolute inset-0 flex items-center justify-center p-1 text-center leading-tight">{i + 1}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Slide editor */}
                <Card>
                  <CardHeader><CardTitle>Slide {active + 1} copy</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Headline</Label>
                      <Input value={slides[active].headline} onChange={(e) => updateActiveSlide({ headline: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Body</Label>
                      <Textarea value={slides[active].body} onChange={(e) => updateActiveSlide({ body: e.target.value })} className="min-h-20" />
                    </div>
                    <div className="rounded-[var(--radius-sm)] bg-[var(--color-canvas)] p-3">
                      <p className="text-xs font-semibold text-[var(--color-muted-foreground)]">IMAGE CONCEPT</p>
                      <p className="mt-1 text-sm">{slides[active].imageConcept}</p>
                    </div>
                    <div className="rounded-[var(--radius-sm)] bg-[var(--color-canvas)] p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[var(--color-muted-foreground)]">AI IMAGE PROMPT</p>
                        <button onClick={() => { navigator.clipboard.writeText(slides[active].imagePrompt); toast.success("Prompt copied"); }} aria-label="Copy prompt">
                          <Copy className="size-3.5 text-[var(--color-muted-foreground)]" />
                        </button>
                      </div>
                      <p className="mt-1 font-mono text-xs leading-relaxed">{slides[active].imagePrompt}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Caption + hashtags */}
              <Card>
                <CardHeader><CardTitle>Caption & hashtags</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} className="min-h-24" />
                  <div className="flex flex-wrap items-center gap-1.5">
                    {hashtags.map((h) => (
                      <Badge key={h} variant="default"><Hash className="size-3" />{h.replace(/^#/, "")}</Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(`${caption}\n\n${hashtags.join(" ")}`); toast.success("Caption + hashtags copied"); }}>
                    <Copy className="size-4" /> Copy caption
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pendingKit !== null}
        title="Delete brand kit?"
        description={`"${pendingKit?.label}" will be permanently deleted. This can't be undone.`}
        loading={kitDeleting}
        onConfirm={confirmDeleteKit}
        onCancel={() => setPendingKit(null)}
      />
    </>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
