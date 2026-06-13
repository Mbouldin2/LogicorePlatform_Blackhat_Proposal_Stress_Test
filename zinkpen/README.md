# ZinkPen — The AI Content Operating System

> **Where intelligence meets ink.**
> Write, humanize, perfect, and design every word your business ships — in one enterprise platform.

ZinkPen unifies the best capabilities of Writesonic, Jasper, Grammarly, Quillbot, and AI
humanizer tools into a single, scalable SaaS product built for thousands of users across
consulting, government contracting, finance, education, and technology.

---

## ✨ Features

| Module | What it does |
| --- | --- |
| **AI Writing Studio** | Long-form articles, technical writing, blogs, website & sales copy, email, social, press releases, executive briefs |
| **Humanizer Engine** | Rewrite AI text into natural human writing with adjustable creativity, AI-detection risk score, and humanization score |
| **Grammar & Style Engine** | Grammarly-grade corrections, readability, tone analysis, and grade-level scoring |
| **Brand Voice System** | Upload docs, learn your style, create reusable voice profiles, apply them anywhere |
| **Research Assistant** | Source-backed briefs, citation support, and a fact-check workflow |
| **Proposal & Business Suite** | Capability statements, GovCon/RFP responses, SBIR drafts, grants, white papers, business plans |
| **Workspace Management** | Projects, folders, saved prompts, team collaboration, version history |
| **Visual Content Generator** | Premium carousels, quote cards, infographics, thumbnails & ad creative — export-ready PNG / PDF / project |

Plus: modern left-nav dashboard, content editor, AI chat assistant, usage analytics, and
Stripe-powered subscription management across **Starter / Professional / Executive / Government** plans.

## 🧱 Tech Stack

- **Next.js (App Router)** + **TypeScript**
- **Tailwind CSS v4** — premium light-mode design system
- **PostgreSQL** via **Prisma** (`prisma/schema.prisma`)
- **Supabase Auth**
- **Stripe Billing**
- **OpenAI · Anthropic · Gemini** — multi-provider AI router (REST, no heavy SDKs)
- Mobile responsive, accessible, enterprise-grade UI

## 🚀 Getting Started

```bash
npm install
cp .env.example .env.local   # optional — see "Demo Mode" below
npm run dev                  # http://localhost:3000
```

### Demo Mode (zero configuration)

ZinkPen runs fully **without any API keys**. Auth, billing, and every AI feature degrade
gracefully to realistic simulated output so you can explore the entire product immediately.
Add keys to `.env.local` to go live — the app upgrades automatically, no code changes.

### Going Live

1. **AI** — set any of `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`. The router
   prefers Anthropic, then OpenAI, then Gemini, and falls back to demo on any error.
2. **Auth + DB** — set the `NEXT_PUBLIC_SUPABASE_*` vars and `DATABASE_URL`, then:
   ```bash
   npm run db:generate && npm run db:push
   ```
3. **Billing** — set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and the per-plan price IDs.

## 🗂️ Architecture

```
src/
├── app/
│   ├── (marketing)/         # Landing + pricing (award-winning hero)
│   ├── (auth)/              # Supabase login / signup
│   ├── (app)/dashboard/     # Authenticated workspace (left nav)
│   │   ├── studio/ humanizer/ grammar/ brand-voice/
│   │   ├── research/ proposals/ visuals/
│   │   └── workspace/ analytics/ billing/ settings/
│   └── api/                 # AI + Stripe route handlers (zod-validated)
├── components/
│   ├── ui/                  # Reusable design-system primitives
│   ├── dashboard/           # Shell, sidebar, AI assistant, widgets
│   ├── marketing/ visuals/ brand/ shared/ auth/
├── lib/
│   ├── ai/                  # Multi-provider router + feature logic
│   ├── supabase/ stripe/ visuals/
│   └── constants.ts utils.ts mock-data.ts
├── types/
└── prisma/schema.prisma     # Full PostgreSQL data model
```

### Design principles
- **Clean architecture** — UI, domain logic (`lib/ai`), and providers are decoupled.
- **Reusable APIs** — every AI surface is a thin, validated route over a shared library function.
- **Scalable components** — a single design-system primitive set powers all eight modules.
- **Graceful degradation** — no secret is ever required to render or demo a feature.

## 📦 Subscription Plans

| Plan | Price | Words / mo | Visuals | Seats |
| --- | --- | --- | --- | --- |
| Starter | $29 | 50K | 40 | 1 |
| Professional | $79 | 250K | 200 | 5 |
| Executive | $199 | 1M | 750 | 20 |
| Government | $499 | 5M | 3,000 | 100 |

---

© ZinkPen. *One platform. Every word your business ships.*
