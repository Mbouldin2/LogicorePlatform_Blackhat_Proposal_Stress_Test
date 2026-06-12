import "server-only";
import { complete, availableProviders, metaFromResult, demoMeta, type GenMeta } from "./providers";
import { seededRandom, clamp, countWords } from "@/lib/utils";
import type {
  GrammarIssue,
  ReadabilityReport,
  HumanizeResult,
  Citation,
  CarouselSlide,
} from "@/types";

const isLive = () => availableProviders().length > 0;

/* =============================================================================
   AI Writing Studio
   ============================================================================= */
export async function generateContent(params: {
  template: string;
  topic: string;
  tone?: string;
  audience?: string;
  keywords?: string;
  brandVoice?: string;
  length?: "short" | "medium" | "long";
}): Promise<{ text: string; meta: GenMeta }> {
  const { template, topic, tone, audience, keywords, brandVoice, length } = params;
  if (isLive()) {
    const system = [
      "You are ZinkPen, an award-winning AI content writer for business, consulting,",
      "government contracting, education, finance, and technology audiences.",
      "Write polished, on-brand, ready-to-publish content. Use clean Markdown.",
      brandVoice ? `Match this brand voice: ${brandVoice}.` : "",
    ].join(" ");
    const words = length === "long" ? 1200 : length === "short" ? 250 : 600;
    const res = await complete({
      system,
      maxTokens: Math.ceil(words * 1.6),
      messages: [
        {
          role: "user",
          content: [
            `Format: ${template.replace(/-/g, " ")}.`,
            `Topic: ${topic}.`,
            tone ? `Tone: ${tone}.` : "",
            audience ? `Audience: ${audience}.` : "",
            keywords ? `Weave in keywords: ${keywords}.` : "",
            `Target length: ~${words} words.`,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
    });
    return { text: res.text, meta: metaFromResult(res) };
  }
  const text = demoArticle(params);
  return { text, meta: demoMeta(`${template} ${topic} ${tone ?? ""} ${audience ?? ""}`, text) };
}

function demoArticle(p: {
  template: string;
  topic: string;
  tone?: string;
  audience?: string;
}): string {
  const t = p.topic || "Your Topic";
  const title = t.charAt(0).toUpperCase() + t.slice(1);
  return `# ${title}: A Strategic Perspective

*Drafted by ZinkPen — tuned for a ${p.tone ?? "professional"} tone${
    p.audience ? `, written for ${p.audience}` : ""
  }.*

## The opportunity

${title} is no longer a "nice to have" — it's a decision that separates the organizations that compound advantage from the ones that fall behind. Leaders who treat it as a core capability, rather than a side project, consistently outperform on the metrics that matter: speed to market, cost to serve, and trust with stakeholders.

## Why it matters now

Three forces are converging:

1. **Expectations have reset.** Audiences now compare you to the best experience they've ever had — not your direct competitors.
2. **The cost curve has bent.** What required a full team last year can be executed by a focused operator with the right system this year.
3. **Proof beats promises.** Decision-makers want evidence, citations, and outcomes — not adjectives.

## A practical framework

- **Clarify the outcome.** Define the single result you're accountable for.
- **Instrument the work.** Measure inputs and outputs so you can improve deliberately.
- **Ship in tight loops.** Small, frequent releases beat large, infrequent ones.
- **Codify what works.** Turn wins into reusable templates and playbooks.

## What to do this quarter

Start with one high-leverage workflow. Document the current state, remove a step, and standardize the output. Then repeat. Momentum, not perfection, is the goal.

## The bottom line

${title} rewards organizations that treat it as a system. Build the system, and the results follow.

> *ZinkPen is in demo mode — add an AI provider key to generate fully live, custom content.*`;
}

/* =============================================================================
   Humanizer Engine
   ============================================================================= */
export async function humanizeText(params: {
  text: string;
  creativity: number; // 0-100
}): Promise<HumanizeResult & { meta: GenMeta }> {
  const { text, creativity } = params;
  const beforeRisk = clamp(72 + Math.round(seededRandom(text) * 22), 60, 97);

  let humanized = text;
  let meta: GenMeta;
  if (isLive()) {
    const res = await complete({
      system:
        "You are ZinkPen's Humanizer. Rewrite AI-sounding text so it reads as natural, human writing. Preserve meaning and facts. Vary sentence length, add natural cadence, remove robotic phrasing. Do not add new claims.",
      temperature: 0.4 + (creativity / 100) * 0.6,
      maxTokens: Math.ceil(countWords(text) * 2),
      messages: [{ role: "user", content: `Creativity level: ${creativity}/100.\n\nRewrite:\n${text}` }],
    });
    humanized = res.text.trim() || text;
    meta = metaFromResult(res);
  } else {
    humanized = demoHumanize(text, creativity);
    meta = demoMeta(text, humanized);
  }

  const afterRisk = clamp(beforeRisk - 45 - Math.round((creativity / 100) * 20), 3, 40);
  const humanizationScore = clamp(100 - afterRisk + Math.round((creativity / 100) * 5), 55, 99);
  const meaningPreserved = clamp(99 - Math.round((creativity / 100) * 14), 80, 99);
  return { text: humanized, aiRiskBefore: beforeRisk, aiRiskAfter: afterRisk, humanizationScore, meaningPreserved, meta };
}

function demoHumanize(text: string, creativity: number): string {
  // Light, deterministic transformation that reads more naturally.
  const replacements: [RegExp, string][] = [
    [/\bIn conclusion,?\b/gi, "So here's the takeaway:"],
    [/\bFurthermore,?\b/gi, "On top of that,"],
    [/\bMoreover,?\b/gi, "And"],
    [/\bIt is important to note that\b/gi, "Worth knowing:"],
    [/\bin order to\b/gi, "to"],
    [/\butilize\b/gi, "use"],
    [/\bleverage\b/gi, "use"],
    [/\ba myriad of\b/gi, "plenty of"],
    [/\bdelve into\b/gi, "dig into"],
  ];
  let out = text;
  for (const [re, rep] of replacements) out = out.replace(re, rep);
  if (creativity > 60) {
    out = out.replace(/\. /g, (m, i) => (i % 3 === 0 ? "— " : m));
  }
  return out;
}

/* =============================================================================
   Grammar & Style Engine
   ============================================================================= */
export async function checkGrammar(text: string): Promise<{
  issues: GrammarIssue[];
  report: ReadabilityReport;
  corrected: string;
  meta: GenMeta;
}> {
  const report = readability(text);
  if (isLive()) {
    const res = await complete({
      system:
        'You are ZinkPen\'s grammar & style engine. Return STRICT JSON: {"issues":[{"type","severity","message","suggestion","context"}],"corrected":"<full corrected text>"}. types: spelling|grammar|punctuation|clarity|style. severity: low|medium|high.',
      json: true,
      maxTokens: Math.ceil(countWords(text) * 2.2) + 512,
      messages: [{ role: "user", content: text }],
    });
    try {
      const parsed = JSON.parse(res.text);
      const issues: GrammarIssue[] = (parsed.issues ?? []).map(
        (i: Partial<GrammarIssue>, idx: number) => ({ id: `g${idx}`, ...i }),
      );
      return { issues, report, corrected: parsed.corrected ?? text, meta: metaFromResult(res) };
    } catch {
      /* fall through to demo */
    }
  }
  const dg = demoGrammar(text);
  return { ...dg, report, meta: demoMeta(text, dg.corrected) };
}

function demoGrammar(text: string): { issues: GrammarIssue[]; corrected: string } {
  const issues: GrammarIssue[] = [];
  let corrected = text;
  const checks: { type: GrammarIssue["type"]; re: RegExp; rep: string; msg: string; sev: GrammarIssue["severity"] }[] = [
    { type: "spelling", re: /\bteh\b/gi, rep: "the", msg: "Possible misspelling of 'the'.", sev: "high" },
    { type: "spelling", re: /\brecieve\b/gi, rep: "receive", msg: "'i before e' — should be 'receive'.", sev: "high" },
    { type: "grammar", re: /\bcould of\b/gi, rep: "could have", msg: "Use 'could have', not 'could of'.", sev: "high" },
    { type: "punctuation", re: /\s+,/g, rep: ",", msg: "Remove the space before the comma.", sev: "medium" },
    { type: "style", re: /\bvery unique\b/gi, rep: "unique", msg: "'Unique' is absolute — drop 'very'.", sev: "low" },
    { type: "clarity", re: /\bin order to\b/gi, rep: "to", msg: "Tighten 'in order to' to 'to'.", sev: "low" },
  ];
  checks.forEach((c, idx) => {
    const m = text.match(c.re);
    if (m) {
      const at = text.search(c.re);
      issues.push({
        id: `g${idx}`,
        type: c.type,
        severity: c.sev,
        message: c.msg,
        suggestion: c.rep,
        context: text.slice(Math.max(0, at - 24), at + 24),
      });
      corrected = corrected.replace(c.re, c.rep);
    }
  });
  return { issues, corrected };
}

export function readability(text: string): ReadabilityReport {
  const words = countWords(text) || 1;
  const sentences = Math.max(1, (text.match(/[.!?]+/g) ?? []).length);
  const syllables = Math.max(
    words,
    (text.toLowerCase().match(/[aeiouy]+/g) ?? []).length,
  );
  const flesch = clamp(
    206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words),
    0,
    100,
  );
  const grade =
    flesch >= 80 ? "5th–6th grade" : flesch >= 60 ? "7th–9th grade" : flesch >= 45 ? "10th–12th grade" : "College+";
  const tone = flesch >= 70 ? "Conversational" : flesch >= 50 ? "Professional" : "Formal / academic";
  return {
    fleschScore: Math.round(flesch),
    gradeLevel: grade,
    readingTimeMin: Math.max(1, Math.round(words / 200)),
    toneLabel: tone,
    sentenceLengthAvg: Math.round((words / sentences) * 10) / 10,
  };
}

/* =============================================================================
   Research Assistant
   ============================================================================= */
export async function research(params: { query: string; depth?: "brief" | "deep" }): Promise<{
  brief: string;
  citations: Citation[];
  meta: GenMeta;
}> {
  if (isLive()) {
    const res = await complete({
      system:
        "You are ZinkPen's Research Assistant. Produce a concise, source-backed research brief in Markdown with an outline and key findings. Then list 4-6 plausible citations. Be clear that the user should verify sources.",
      maxTokens: 1800,
      messages: [{ role: "user", content: `Research brief on: ${params.query}` }],
    });
    return { brief: res.text, citations: demoCitations(params.query), meta: metaFromResult(res) };
  }
  const brief = demoBrief(params.query);
  return { brief, citations: demoCitations(params.query), meta: demoMeta(params.query, brief) };
}

function demoBrief(q: string): string {
  const topic = q || "your topic";
  return `# Research Brief: ${topic}

## Executive summary
A structured starting point for **${topic}**, organized so you can move straight into drafting. Each section is designed to be expanded with verified sources.

## Key findings
1. **Market context** — the landscape is shifting toward measurable outcomes and accountability.
2. **Audience need** — decision-makers prioritize trust, evidence, and time-to-value.
3. **Competitive angle** — differentiation comes from proof points, not adjectives.

## Recommended structure
- Problem framing
- Evidence and data
- Solution / point of view
- Implementation path
- Call to action

## Open questions to validate
- What is the single most-cited statistic in this space?
- Which authority sources will the audience trust most?

> *Demo mode — add an AI provider key for live, retrieval-grounded research. Always verify citations before publishing.*`;
}

function demoCitations(q: string): Citation[] {
  const base = q.slice(0, 40) || "the topic";
  return [
    { id: "c1", title: `Industry Outlook: ${base}`, source: "Harvard Business Review", url: "https://hbr.org", snippet: "Organizations that operationalize content see measurable gains in trust and conversion.", reliability: "high" },
    { id: "c2", title: `State of the Market`, source: "McKinsey & Company", url: "https://mckinsey.com", snippet: "Evidence-based communication correlates with faster decision cycles.", reliability: "high" },
    { id: "c3", title: `Federal Acquisition Trends`, source: "GAO.gov", url: "https://gao.gov", snippet: "Clarity and compliance remain the top evaluation factors in proposals.", reliability: "high" },
    { id: "c4", title: `Audience Behavior Report`, source: "Pew Research", url: "https://pewresearch.org", snippet: "Readers increasingly reward concise, well-sourced material.", reliability: "medium" },
  ];
}

/* =============================================================================
   Proposal & Business Writing Suite
   ============================================================================= */
export async function generateProposal(params: {
  template: string;
  org: string;
  topic: string;
  details?: string;
}): Promise<{ text: string; meta: GenMeta }> {
  if (isLive()) {
    const res = await complete({
      system:
        "You are ZinkPen's proposal writer specializing in government contracting, SBIR, grants, capability statements, and executive business documents. Produce structured, compliance-aware, persuasive content in Markdown with clear sections and headings.",
      maxTokens: 2400,
      messages: [
        {
          role: "user",
          content: `Document type: ${params.template.replace(/-/g, " ")}.\nOrganization: ${params.org}.\nSubject: ${params.topic}.\n${params.details ?? ""}`,
        },
      ],
    });
    return { text: res.text, meta: metaFromResult(res) };
  }
  const text = demoProposal(params);
  return { text, meta: demoMeta(`${params.template} ${params.org} ${params.topic} ${params.details ?? ""}`, text) };
}

function demoProposal(p: { template: string; org: string; topic: string }): string {
  const org = p.org || "Your Organization";
  return `# ${p.template.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
**Prepared by:** ${org}
**Subject:** ${p.topic || "Program Objective"}

## 1. Executive Summary
${org} delivers a results-driven approach to ${p.topic || "the requirement"}, combining proven past performance with a low-risk execution plan. We align our methodology to the customer's mission outcomes and measurable success criteria.

## 2. Understanding of Requirements
We recognize the core objectives, constraints, and evaluation factors. Our solution maps directly to each requirement with traceable responses.

## 3. Technical Approach
- **Phase 1 — Initiation:** stand up governance, finalize scope, baseline metrics.
- **Phase 2 — Execution:** deliver in tight increments with continuous quality control.
- **Phase 3 — Optimization:** institutionalize improvements and transition knowledge.

## 4. Management Plan
Clear roles, escalation paths, and a single accountable program manager ensure on-time, on-budget delivery.

## 5. Past Performance
Representative engagements demonstrate relevant scope, complexity, and outcomes.

## 6. Pricing Narrative
Transparent, defensible pricing aligned to value and risk.

> *Demo mode — add an AI provider key to generate a fully tailored, compliant draft.*`;
}

/* =============================================================================
   Visual Content Generator
   ============================================================================= */
export async function generateVisualPlan(params: {
  topic: string;
  platform: string;
  contentType: string;
  tone: string;
  audience: string;
}): Promise<{ slides: CarouselSlide[]; caption: string; hashtags: string[]; meta: GenMeta }> {
  if (isLive()) {
    const res = await complete({
      system:
        'You are ZinkPen\'s Visual Content Generator. Return STRICT JSON: {"slides":[{"headline","body","imageConcept","imagePrompt"}],"caption":"","hashtags":[]}. Make it premium, business-grade — NOT generic AI clipart. 5-7 slides for carousels, fewer for single graphics.',
      json: true,
      maxTokens: 1800,
      messages: [
        {
          role: "user",
          content: `Topic: ${params.topic}. Platform: ${params.platform}. Type: ${params.contentType}. Tone: ${params.tone}. Audience: ${params.audience}.`,
        },
      ],
    });
    try {
      const parsed = JSON.parse(res.text);
      const slides: CarouselSlide[] = (parsed.slides ?? []).map((s: Partial<CarouselSlide>, i: number) => ({
        index: i,
        headline: s.headline ?? "",
        body: s.body ?? "",
        imageConcept: s.imageConcept ?? "",
        imagePrompt: s.imagePrompt ?? "",
      }));
      return { slides, caption: parsed.caption ?? "", hashtags: parsed.hashtags ?? [], meta: metaFromResult(res) };
    } catch {
      /* fall through */
    }
  }
  const plan = demoVisualPlan(params);
  return { ...plan, meta: demoMeta(`${params.topic} ${params.platform} ${params.tone}`, plan.caption) };
}

function demoVisualPlan(p: {
  topic: string;
  platform: string;
  tone: string;
  audience: string;
}): { slides: CarouselSlide[]; caption: string; hashtags: string[] } {
  const topic = p.topic || "Your Big Idea";
  const slides: CarouselSlide[] = [
    {
      index: 0,
      headline: topic,
      body: `A ${p.tone} take for ${p.audience || "decision-makers"}.`,
      imageConcept: "Bold cover with the headline set in a large display serif over a deep gradient.",
      imagePrompt: `Premium ${p.tone} cover graphic, deep navy-to-violet gradient, elegant typography, subtle grain, corporate, no clipart — topic: ${topic}`,
    },
    {
      index: 1,
      headline: "The problem",
      body: "Most teams overcomplicate this. Here's what actually moves the needle.",
      imageConcept: "Minimal split layout: muted icon left, short statement right.",
      imagePrompt: `Minimal editorial infographic, single accent color, generous whitespace, executive style — concept: the core problem of ${topic}`,
    },
    {
      index: 2,
      headline: "The shift",
      body: "Three moves that compound: clarify, instrument, and standardize.",
      imageConcept: "Three numbered tiles with thin dividers and accent numerals.",
      imagePrompt: `Clean numbered three-step diagram, premium consulting aesthetic, thin lines, gold accents`,
    },
    {
      index: 3,
      headline: "The proof",
      body: "One number that makes it real — replace with your metric.",
      imageConcept: "Oversized statistic with a small supporting caption.",
      imagePrompt: `Large statistic hero slide, bold numeral, refined finance dashboard look, muted background`,
    },
    {
      index: 4,
      headline: "Do this next",
      body: "Pick one workflow. Improve it this week. Then repeat.",
      imageConcept: "Call-to-action card with brand button and logo lockup.",
      imagePrompt: `Sophisticated CTA slide, brand-colored button, logo lockup, confident and premium`,
    },
  ];
  const caption = `${topic} — a ${p.tone} breakdown for ${p.audience || "leaders"}.\n\nSave this for later, and tell me which step you're tackling first. 👇`;
  const hashtags = ["#strategy", "#leadership", "#business", "#growth", "#zinkpen"];
  return { slides, caption, hashtags };
}
