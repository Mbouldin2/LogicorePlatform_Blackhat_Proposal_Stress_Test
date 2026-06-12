# ZinkPen — Project Status

**The AI Content Operating System** · _"Where intelligence meets ink."_

| | |
| --- | --- |
| **Repository** | `Mbouldin2/LogicorePlatform_Blackhat_Proposal_Stress_Test` |
| **App directory** | `zinkpen/` |
| **Branch** | `claude/zinkpen-saas-build-mdrzvk` (→ PR #1) |
| **Build status** | ✅ `npm run build` passes · 27 routes compiled · APIs smoke-tested |
| **Runtime mode** | **Demo mode** — fully functional with zero secrets; upgrades to live automatically when keys are present |
| **Last updated** | 2026-06-12 |

---

## 1. Stack

- **Next.js 16.2.9** (App Router, Turbopack) + **React 19.2**
- **TypeScript 5** (strict)
- **Tailwind CSS v4** — premium **light-mode-only** design system (`src/app/globals.css`)
- **Supabase Auth** (`@supabase/ssr`)
- **Stripe** billing
- **PostgreSQL** via **Prisma** (`prisma/schema.prisma`)
- **AI:** OpenAI · Anthropic · Gemini via a REST router (no heavy SDKs)
- Charts: **recharts** · Icons: **lucide-react** · Toasts: **sonner** · Validation: **zod**

### Architecture principle — graceful degradation
Every external integration is guarded by an env check (`availableProviders()`,
`isSupabaseConfigured()`, `isStripeConfigured()`). With no secrets, auth bypasses to a demo
user, AI returns rich deterministic sample output, and Stripe returns a friendly demo
response. **Do not break this** — it is what makes the whole product explorable instantly.

---

## 2. Completed Features ✅

### Marketing & Auth
- [x] Landing page — award hero, tagline, 8-module grid, humanizer & visual showcases, pricing teaser, CTA (`src/app/(marketing)/page.tsx`)
- [x] Pricing page — 4 plans + FAQ (`src/app/(marketing)/pricing/page.tsx`)
- [x] Marketing navbar + footer (responsive, mobile menu)
- [x] Login / Signup — Supabase-backed with demo fallback (`src/app/(auth)/`)
- [x] Split-screen auth layout with testimonial panel

### Dashboard shell
- [x] Left navigation sidebar (grouped: Create / Refine / Business / Workspace / Account) with active state, mobile drawer, live usage meter
- [x] Top bar — search, AI Assistant trigger, notifications, user chip
- [x] Slide-over **AI chat assistant** (streaming-ready, starter prompts) → `/api/ai/chat`
- [x] Reusable `PageHeader`, `StatCard`, `ScoreRing`, `EmptyState` widgets

### The 8 product modules
1. [x] **AI Writing Studio** — 9 templates, tone/length/audience/keywords, brand-voice selector, live editor with preview/edit toggle, word count, reading time, copy + Markdown export
2. [x] **Humanizer Engine** — creativity slider, AI-risk before/after, humanization & meaning-preservation score rings
3. [x] **Grammar & Style Engine** — issue list (spelling/grammar/punctuation/clarity/style), corrected text + "apply all", Flesch / grade-level / tone / reading-time readability panel
4. [x] **Brand Voice System** — create profiles from pasted/uploaded samples, heuristic trait extraction, apply-in-studio
5. [x] **Research Assistant** — source-backed brief (Markdown) + citation cards with reliability badges
6. [x] **Proposal & Business Suite** — 7 doc types (capability statement, GovCon response, SBIR, grant, exec summary, white paper, business plan), export
7. [x] **Workspace Management** — tabs for Projects, Documents, Saved Prompts, Team, Version History
8. [x] **Visual Content Generator** — brief inputs, brand kit (palette generator + custom swatches, font pairing, logo upload, brand name), live slide canvas preview, slide-by-slide editable copy + image concepts + AI image prompts, captions + hashtags, **real PNG / PDF / editable-JSON export at all 6 platform dimensions**, auto-resize by platform

### Account & analytics
- [x] **Usage Analytics** — area chart (14-day words), feature-usage pie, daily-visuals bar, stat cards
- [x] **Billing** — usage meters, current plan, payment method, plan switching → Stripe checkout
- [x] **Settings** — profile, AI model routing preference, notifications (switches), security actions

### Backend / infra
- [x] 7 AI API routes + 2 Stripe routes (all zod-validated)
- [x] Multi-provider AI router with demo fallback (`src/lib/ai/`)
- [x] Stripe checkout + webhook scaffolding
- [x] Prisma Postgres schema (11 models)
- [x] Supabase server/client/middleware helpers
- [x] Canvas-based visual export engine (`src/lib/visuals/render.ts`)
- [x] Hand-rolled UI primitive library (no Radix dependency)
- [x] README + `.env.example`

---

## 3. Remaining Features 🚧

### High priority (go-live)
- [ ] **Persistence** — replace `src/lib/mock-data.ts` reads with Prisma queries; wire documents, projects, brand voices, brand kits to Postgres (schema already exists, **not yet imported anywhere**)
- [ ] **Server actions / CRUD** — create/update/delete for projects, folders, documents, saved prompts
- [ ] **Real auth gating** — enforce redirect to `/login` for unauthenticated users in `(app)/layout.tsx` (currently falls back to demo user)
- [ ] **Stripe ↔ DB sync** — persist plan changes in the webhook handler (`Organization.plan`, stripe IDs); customer portal session
- [ ] **Usage metering** — write `UsageRecord` rows on each AI call; enforce plan limits

### Medium priority
- [ ] Document auto-save + real version history (currently mock timeline)
- [ ] Team invites / RBAC enforcement (roles exist in schema, UI is mock)
- [ ] Brand-voice: real document parsing (PDF/DOCX → text) instead of paste-only
- [ ] AI response **streaming** to the editor and assistant
- [ ] Real PDF export via a library (current PDF uses browser print) and ZIP for "all PNG"
- [ ] AI image generation for visual concepts (prompts are produced; images are not yet rendered by a model)

### Low priority / polish
- [ ] Rename `src/middleware.ts` → `src/proxy.ts` (Next 16 deprecation warning; still works)
- [ ] Resolve 2 moderate `npm audit` advisories
- [ ] Unit/integration tests (none yet)
- [ ] SEO: sitemap, robots, OG images
- [ ] Accessibility audit pass (keyboard nav, ARIA on custom primitives)
- [ ] Empty/loading/error states for DB-backed lists

---

## 4. Database Schema (`prisma/schema.prisma`)

PostgreSQL via Prisma. **Defined but not yet wired into runtime.**

**Enums:** `PlanId` (starter|professional|executive|government) · `MemberRole` (owner|admin|editor|viewer) · `DocStatus` (draft|in_review|final)

| Model | Purpose | Key fields / relations |
| --- | --- | --- |
| `Organization` | Tenant / billing root | `plan`, `stripeCustomerId`, `stripeSubscriptionId` → members, projects, brandVoices, brandKits, usage |
| `User` | Mirrors Supabase `auth.users.id` | `email`, `name`, `avatarUrl` → memberships, documents |
| `Membership` | User↔Org join | `role`; unique `[userId, orgId]` |
| `Project` | Top-level workspace | `name`, `color` → documents, folders |
| `Folder` | Sub-grouping | → project, documents |
| `Document` | A piece of content | `title`, `type`, `content`, `words`, `status` → project, folder, author, versions |
| `DocumentVersion` | Version history | `content`, `label`, `createdAt` |
| `BrandVoice` | Reusable voice profile | `traits[]`, `sampleText` |
| `BrandKit` | Visual brand assets | `colors[]`, `fontHeading`, `fontBody`, `logoUrl` |
| `SavedPrompt` | Reusable prompt | `title`, `body` |
| `UsageRecord` | Metering ledger | `kind` (words/images), `amount`, `feature`; indexed `[orgId, createdAt]` |

Setup: `npm run db:generate && npm run db:push`

---

## 5. Routes (App Router)

### Public — `(marketing)`
| Route | Page |
| --- | --- |
| `/` | Landing |
| `/pricing` | Plans + FAQ |

### Auth — `(auth)`
| Route | Page |
| --- | --- |
| `/login` | Sign in |
| `/signup` | Create account |

### Authenticated — `(app)`
| Route | Module |
| --- | --- |
| `/dashboard` | Overview (stats, quick actions, recent docs, projects) |
| `/dashboard/studio` | AI Writing Studio |
| `/dashboard/humanizer` | Humanizer Engine |
| `/dashboard/grammar` | Grammar & Style |
| `/dashboard/brand-voice` | Brand Voice System |
| `/dashboard/research` | Research Assistant |
| `/dashboard/proposals` | Proposal & Business Suite |
| `/dashboard/visuals` | Visual Content Generator |
| `/dashboard/workspace` | Projects / Folders / Prompts / Team / History |
| `/dashboard/analytics` | Usage Analytics |
| `/dashboard/billing` | Billing & Subscription |
| `/dashboard/settings` | Settings |

Rendering: marketing/auth/dashboard pages are static (`○`); API routes are dynamic (`ƒ`). Middleware runs as Proxy.

---

## 6. API Endpoints

All under `src/app/api/`. JSON in/out, zod-validated, `runtime = "nodejs"`.

| Endpoint | Method | Body | Returns |
| --- | --- | --- | --- |
| `/api/ai/chat` | POST | `{ messages[] }` | `{ text, provider }` |
| `/api/ai/generate` | POST | `{ template, topic, tone?, audience?, keywords?, brandVoice?, length? }` | `{ text }` |
| `/api/ai/humanize` | POST | `{ text, creativity }` | `{ text, aiRiskBefore, aiRiskAfter, humanizationScore, meaningPreserved }` |
| `/api/ai/grammar` | POST | `{ text }` | `{ issues[], report, corrected }` |
| `/api/ai/research` | POST | `{ query, depth? }` | `{ brief, citations[] }` |
| `/api/ai/proposal` | POST | `{ template, org, topic, details? }` | `{ text }` |
| `/api/ai/visuals` | POST | `{ topic, platform, contentType, tone, audience }` | `{ slides[], caption, hashtags[] }` |
| `/api/stripe/checkout` | POST | `{ plan }` | `{ url }` or `{ demo, message }` |
| `/api/stripe/webhook` | POST | Stripe event (raw) | `{ received }` |

**AI router** (`src/lib/ai/providers.ts`): prefers Anthropic → OpenAI → Gemini based on configured keys; any error falls back to demo. Feature logic + demo generators live in `src/lib/ai/index.ts`.

---

## 7. Deployment Requirements

### Build / run
```bash
npm install
npm run build      # production build (passes)
npm start          # serve
npm run dev        # local dev
```
Node 20+ (built/tested on Node 22). Recommended host: **Vercel**.

### Environment variables (`.env.example`)
All optional for demo; required per integration to go live.

**AI** (any subset enables live generation)
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`
- `OPENAI_MODEL`, `ANTHROPIC_MODEL`, `GEMINI_MODEL` (optional overrides)

**Supabase / Postgres**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`, `DIRECT_URL`

**Stripe**
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PROFESSIONAL`, `STRIPE_PRICE_EXECUTIVE`, `STRIPE_PRICE_GOVERNMENT`

**App**
- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME`

### Go-live checklist
1. Provision Supabase project → set `NEXT_PUBLIC_SUPABASE_*` + `DATABASE_URL`/`DIRECT_URL`
2. `npm run db:generate && npm run db:push`
3. Add at least one AI provider key
4. Create Stripe products/prices → set price IDs; register webhook → `/api/stripe/webhook`
5. Set `NEXT_PUBLIC_APP_URL` to the production domain
6. Deploy (Vercel); add all env vars to the project
7. Replace mock-data reads with Prisma queries (see §3) before real users

### Known notes
- Next downgrade-safe at **16.2.9** (16.0.7 had a flagged CVE — do not revert)
- `middleware.ts` works but is deprecated in Next 16 in favor of `proxy.ts`
- recharts logs a harmless zero-size SSR warning during static generation
- 2 moderate `npm audit` advisories outstanding

---

## 8. Subscription Plans

| Plan | Price/mo | Words | Visuals | Seats |
| --- | --- | --- | --- | --- |
| Starter | $29 | 50,000 | 40 | 1 |
| Professional ⭐ | $79 | 250,000 | 200 | 5 |
| Executive | $199 | 1,000,000 | 750 | 20 |
| Government | $499 | 5,000,000 | 3,000 | 100 |

---

## 9. Visual Export Presets

| Preset | Dimensions | Platform |
| --- | --- | --- |
| Instagram carousel | 1080×1080 | Instagram |
| Instagram story / reel cover | 1080×1920 | Instagram |
| LinkedIn carousel | 1080×1350 | LinkedIn |
| Facebook post | 1200×630 | Facebook |
| YouTube thumbnail | 1280×720 | YouTube |
| X / Twitter post | 1600×900 | X |
