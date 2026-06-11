import Link from "next/link";
import {
  PenLine,
  Sparkles,
  SpellCheck,
  Fingerprint,
  Mic2,
  Search,
  FileSignature,
  LayoutGrid,
  Image as ImageIcon,
  ArrowRight,
  Check,
  Shield,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BRAND, PLANS, EXPORT_PRESETS } from "@/lib/constants";

const MODULES = [
  { icon: PenLine, title: "AI Writing Studio", desc: "Long-form articles, technical docs, blogs, web & sales copy, emails, social, press releases, and executive briefs.", color: "var(--color-ink-600)" },
  { icon: Fingerprint, title: "Humanizer Engine", desc: "Rewrite AI text into natural human writing with adjustable creativity, an AI-detection risk score, and a humanization score.", color: "var(--color-accent-600)" },
  { icon: SpellCheck, title: "Grammar & Style", desc: "Grammarly-grade corrections, clarity suggestions, readability, tone analysis, and grade-level scoring.", color: "#0F766E" },
  { icon: Mic2, title: "Brand Voice System", desc: "Upload documents, learn your style, and apply reusable voice profiles to everything you generate.", color: "#B45309" },
  { icon: Search, title: "Research Assistant", desc: "Source-backed content, citation support, fact-check workflow, and instant research briefs.", color: "#2563EB" },
  { icon: FileSignature, title: "Proposal Suite", desc: "Capability statements, GovCon responses, SBIR drafts, grants, white papers, and business plans.", color: "#7C3AED" },
  { icon: LayoutGrid, title: "Workspace Management", desc: "Projects, folders, saved prompts, team collaboration, and full version history.", color: "#0891B2" },
  { icon: ImageIcon, title: "Visual Content Generator", desc: "Carousels, quote cards, infographics, thumbnails, and ad creative — export-ready, never generic.", color: "var(--color-gold-500)" },
];

const TAGLINES = [
  "Where intelligence meets ink.",
  "One platform. Every word your business ships.",
  "Write like a human. Scale like a machine.",
];

export default function LandingPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden zp-gradient-soft">
        <div className="absolute inset-0 zp-grid-bg opacity-60" />
        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="gold" className="mx-auto">
              <Star className="size-3 fill-current" /> {BRAND.award}
            </Badge>
            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
              The AI Content <span className="zp-text-gradient">Operating System</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-[var(--color-muted-foreground)]">
              ZinkPen unifies the best of Writesonic, Jasper, Grammarly, Quillbot, and AI humanizers into one
              enterprise platform — so your team can write, humanize, perfect, and design every word in one place.
            </p>
            <p className="mt-4 text-base font-semibold zp-text-gradient">{BRAND.tagline}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start writing free <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Explore the dashboard
                </Button>
              </Link>
            </div>
            <p className="mt-4 flex items-center justify-center gap-4 text-xs text-[var(--color-muted-foreground)]">
              <span className="inline-flex items-center gap-1"><Check className="size-3.5 text-[var(--color-success)]" /> No card required</span>
              <span className="inline-flex items-center gap-1"><Shield className="size-3.5 text-[var(--color-success)]" /> Enterprise-grade security</span>
              <span className="inline-flex items-center gap-1"><Sparkles className="size-3.5 text-[var(--color-success)]" /> OpenAI · Anthropic · Gemini</span>
            </p>
          </div>

          {/* Hero product mock */}
          <Card className="mx-auto mt-14 max-w-5xl overflow-hidden p-0">
            <div className="flex items-center gap-1.5 border-b border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2.5">
              <span className="size-3 rounded-full bg-red-400" />
              <span className="size-3 rounded-full bg-amber-400" />
              <span className="size-3 rounded-full bg-emerald-400" />
              <span className="ml-3 text-xs text-[var(--color-muted-foreground)]">app.zinkpen.ai / studio</span>
            </div>
            <div className="grid gap-0 md:grid-cols-[200px_1fr]">
              <div className="hidden flex-col gap-1 border-r border-[var(--color-border)] bg-[var(--color-canvas)] p-3 md:flex">
                {["Writing Studio", "Humanizer", "Grammar", "Brand Voice", "Research", "Proposals", "Visuals"].map((s, i) => (
                  <div
                    key={s}
                    className={`rounded-md px-3 py-2 text-xs font-medium ${i === 0 ? "bg-[var(--color-ink-50)] text-[var(--color-ink-700)]" : "text-[var(--color-muted-foreground)]"}`}
                  >
                    {s}
                  </div>
                ))}
              </div>
              <div className="p-6 text-left">
                <div className="mb-3 flex items-center gap-2">
                  <Badge>Long-form Article</Badge>
                  <Badge variant="success"><Check className="size-3" /> Readability 72</Badge>
                  <Badge variant="muted">Tone: Executive</Badge>
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-3/4 rounded bg-[var(--color-muted)]" />
                  <div className="h-3 w-full rounded bg-[var(--color-muted)]" />
                  <div className="h-3 w-[92%] rounded bg-[var(--color-muted)]" />
                  <div className="h-3 w-[85%] rounded bg-[var(--color-muted)]" />
                  <div className="my-3 h-px w-full bg-[var(--color-border)]" />
                  <div className="flex flex-wrap gap-2">
                    {["AI risk 6%", "Humanized 96%", "Grade 9", "1,240 words"].map((t) => (
                      <span key={t} className="rounded-full bg-[var(--color-ink-50)] px-3 py-1 text-xs font-medium text-[var(--color-ink-700)]">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-6 text-sm font-semibold text-[var(--color-muted-foreground)]">
          <span>Trusted across</span>
          {["Consulting", "Government Contracting", "Finance", "Education", "Technology", "Executive Teams"].map((t) => (
            <span key={t} className="text-[var(--color-foreground)]">{t}</span>
          ))}
        </div>
      </section>

      {/* MODULES */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="default">Eight engines, one workspace</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Everything your content team needs</h2>
          <p className="mt-3 text-[var(--color-muted-foreground)]">
            Stop paying for five tools that don&apos;t talk to each other. ZinkPen is the operating system that connects them.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <Card key={m.title} className="group p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]">
              <div
                className="mb-4 inline-flex size-11 items-center justify-center rounded-[var(--radius-sm)] text-white"
                style={{ background: m.color }}
              >
                <m.icon className="size-5" />
              </div>
              <h3 className="font-semibold tracking-tight">{m.title}</h3>
              <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)]">{m.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* HUMANIZER SHOWCASE */}
      <section id="humanizer" className="bg-[var(--color-surface)] py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <Badge variant="default"><Fingerprint className="size-3" /> Humanizer Engine</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Sound human. <span className="zp-text-gradient">Pass the eye test.</span>
            </h2>
            <p className="mt-3 text-[var(--color-muted-foreground)]">
              Turn flat AI drafts into writing people actually trust. Dial in creativity, preserve meaning, and watch
              your AI-detection risk drop in real time.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Adjustable creativity levels",
                "AI detection risk score",
                "Humanization score",
                "Meaning-preservation guarantee",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
                    <Check className="size-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <Card className="p-6">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "AI risk before", value: "88%", tone: "text-red-600" },
                { label: "AI risk after", value: "6%", tone: "text-emerald-600" },
                { label: "Humanized", value: "96%", tone: "zp-text-gradient" },
              ].map((s) => (
                <div key={s.label} className="rounded-[var(--radius)] bg-[var(--color-canvas)] p-4">
                  <div className={`text-2xl font-bold ${s.tone}`}>{s.value}</div>
                  <div className="mt-1 text-xs text-[var(--color-muted-foreground)]">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-[var(--radius)] border border-[var(--color-border)] p-4 text-sm leading-relaxed">
              <p className="text-[var(--color-muted-foreground)] line-through">
                In conclusion, it is important to note that we must leverage synergies to utilize our resources.
              </p>
              <p className="mt-3 font-medium">
                So here&apos;s the takeaway: we should use what we already have, and use it well.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* VISUAL STUDIO SHOWCASE */}
      <section id="visuals" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="gold"><ImageIcon className="size-3" /> Visual Content Generator</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Premium social graphics, not AI clipart</h2>
          <p className="mt-3 text-[var(--color-muted-foreground)]">
            Carousels, quote cards, infographics, thumbnails, and ad creative — designed for business, consulting,
            GovCon, finance, education, and tech. Export-ready for every platform.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { t: "Carousel outline + slide copy", d: "AI writes every slide with image concepts and prompts." },
            { t: "Brand kit & font pairing", d: "Apply your colors, logo, and curated typography." },
            { t: "Auto-resize by platform", d: "One idea, every size — generated instantly." },
          ].map((c) => (
            <Card key={c.t} className="p-5">
              <h3 className="font-semibold">{c.t}</h3>
              <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)]">{c.d}</p>
            </Card>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {EXPORT_PRESETS.map((p) => (
            <span key={p.id} className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium">
              {p.label} · {p.w}×{p.h}
            </span>
          ))}
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="bg-[var(--color-surface)] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Plans that scale with you</h2>
            <p className="mt-3 text-[var(--color-muted-foreground)]">From solo founders to federal agencies.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {PLANS.map((p) => (
              <Card key={p.id} className={`flex flex-col p-5 ${p.highlight ? "ring-2 ring-[var(--color-ink-500)]" : ""}`}>
                {p.badge && <Badge variant={p.highlight ? "default" : "muted"} className="mb-2 w-fit">{p.badge}</Badge>}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <div className="mt-1 text-3xl font-bold">
                  ${p.price}<span className="text-sm font-normal text-[var(--color-muted-foreground)]">/mo</span>
                </div>
                <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">{p.blurb}</p>
                <Link href="/pricing" className="mt-4">
                  <Button variant={p.highlight ? "primary" : "outline"} className="w-full">{p.cta}</Button>
                </Link>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/pricing" className="text-sm font-medium text-[var(--color-ink-600)] hover:underline">
              Compare all features →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <Card className="zp-gradient-brand overflow-hidden p-10 text-center text-white sm:p-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Your whole content stack. One login.</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Join the teams shipping better content faster with {BRAND.name}. {TAGLINES[1]}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" variant="gold">Start free <ArrowRight className="size-4" /></Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                View demo
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </>
  );
}
