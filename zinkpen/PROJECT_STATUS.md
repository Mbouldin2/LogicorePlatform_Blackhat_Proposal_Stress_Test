# ZinkPen — Project Status

**The AI Content Operating System** · _"Where intelligence meets ink."_

| | |
| --- | --- |
| **Repository** | `Mbouldin2/LogicorePlatform_Blackhat_Proposal_Stress_Test` |
| **App directory** | `zinkpen/` |
| **Branch** | `claude/zinkpen-saas-build-mdrzvk` (→ PR #1) |
| **Build status** | ✅ `npm run build` + `npm run typecheck` pass · 29 routes compiled · APIs smoke-tested |
| **Runtime mode** | **Demo mode** — fully functional with zero secrets; upgrades to live (Postgres/auth/billing) automatically when env is present |
| **Persistence** | ✅ Prisma data layer wired with demo fallback (documents, projects, brand voices, generations, usage, subscriptions) |
| **Access control** | ✅ Auth-gated dashboard + plan-based usage limits + **role-based access control** (owner/admin/editor/viewer) + Stripe customer portal |
| **CRUD** | ✅ Create/update/delete for Projects, Documents, and Brand Voices — org-scoped, role-gated, with delete confirmation |
| **Last updated** | 2026-06-12 (CRUD update/delete milestone) |

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
- [x] 7 AI API routes + 1 brand-voices route + 2 Stripe routes (all zod-validated)
- [x] Multi-provider AI router with demo fallback (`src/lib/ai/`)
- [x] Stripe checkout + webhook scaffolding
- [x] Prisma Postgres schema (12 models)
- [x] Supabase server/client/middleware helpers
- [x] Canvas-based visual export engine (`src/lib/visuals/render.ts`)
- [x] Hand-rolled UI primitive library (no Radix dependency)
- [x] README + `.env.example`

### Data & Persistence ✅ (this milestone)
- [x] **Prisma runtime** — singleton client (`src/lib/db/prisma.ts`) that returns `null` when `DATABASE_URL` is absent; `@prisma/client` + `postinstall: prisma generate`
- [x] **Demo-fallback data layer** (`src/lib/data/`) — every read/write checks the DB and falls back to in-memory demo data, so demo mode is never broken
- [x] **Tenant resolver** (`src/lib/data/tenant.ts`) — lazily provisions User + Organization + owner Membership on first authenticated access
- [x] **Documents & Projects** — `listProjects`/`createProject`, `listDocuments`/`createDocument` (auto-creates a home project, writes an initial `DocumentVersion`)
- [x] **Brand voices** — `listBrandVoices`/`createBrandVoice`; surfaced via `/api/brand-voices` and the brand-voice page
- [x] **Generations** — every AI route records a `Generation` (feature/prompt/output/provider) best-effort, non-blocking
- [x] **Usage events & metering** — `recordUsage` writes word/image events; `getUsageSnapshot`/`getUsageSeries`/`getFeatureUsage` aggregate live data with plan limits applied (sidebar meter, overview, analytics, billing all DB-backed)
- [x] **Subscriptions/plans** — checkout attaches `orgId`/`plan` metadata; webhook syncs `Organization.plan` + Stripe IDs on lifecycle events (`setOrgPlan`)
- [x] **Server actions** (`src/lib/actions.ts`) — `createProjectAction`, `createBrandVoiceAction`, `saveDocumentAction` (zod-validated, `revalidatePath`); wired into Workspace, Brand Voice, and the Studio "Save" button
- [x] **Seed script** (`prisma/seed.ts`, `npm run db:seed`) — demo org, projects, documents, brand voices, and 14 days of generations/usage
- [x] Data-backed dashboard pages set `dynamic = "force-dynamic"` so they never query Postgres during the static build

### Access Control & Metering ✅ (this milestone)
- [x] **Auth gating** — `/dashboard/*` requires authentication when Supabase is configured. Enforced in two layers: middleware (`src/middleware.ts`) redirects unauthenticated `/dashboard` → `/login` and signed-in users away from `/login`/`/signup`; the app layout re-checks via `getOptionalTenant()` and redirects. **Demo mode (no Supabase) stays fully open.**
- [x] **Tenant split** — `getOptionalTenant()` (returns `null` when configured + unauthenticated) and strict `getTenant()` (throws `UnauthorizedError`)
- [x] **Usage-limit enforcement** — `guardGeneration(kind)` (`src/lib/api/guard.ts`) runs before every `/api/ai/*` handler: 401 when unauthenticated, **402 `limit_reached`** with `{ message, used, limit, plan, upgradeUrl }` when over quota. Text endpoints meter `words`; visuals meter `images`. Enforcement is **active only when a database is metering usage**; demo mode is never blocked, and the check **fails open** on any metering error
- [x] **Quota checker** (`src/lib/data/quota.ts`) — compares cycle usage to the plan limit
- [x] **Client gating UX** (`src/lib/client/ai-fetch.ts`) — `wasBlocked(res)` surfaces a "Sign in" toast (401) or an "Upgrade" toast linking to billing (402); wired into all six AI pages + the AI assistant
- [x] **Usage UI states** — sidebar meter and billing meters show **remaining usage**, a **Limit reached** badge, and an upgrade prompt; progress turns gold near the cap and red at 100%
- [x] **Stripe customer portal** — `POST /api/stripe/portal` opens a billing-portal session (manage card, invoices, cancel); "Manage payment" button wired; degrades to a clear demo message

### Role-Based Access Control ✅ (this milestone)
- [x] **Role model** (`src/lib/auth/roles.ts`) — `owner > admin > editor > viewer` with pure predicates: `roleAtLeast`, `canCreateContent` (editor+), `canManageTeam`/`canManageBilling`/`canManageOrg` (admin+), and `evaluateRoleAccess` (the single 401/403 decision)
- [x] **Tenant carries `role`** — resolved from `Membership.role` (DB) or the demo owner (demo mode)
- [x] **Reusable server guards** (`src/lib/auth/guard.ts`) — `requireRole(min)` and `requireOrgRole(orgId, min)` (the latter verifies membership in a specific org, defending against `orgId` tampering); `apiRequireRole(min)` returns a ready 401/403 `NextResponse`
- [x] **Admin-only routes** — `/api/stripe/checkout` and `/api/stripe/portal` require **admin**; the **billing page** renders a server-side `AccessDenied` for non-admins (not just hidden nav)
- [x] **Content creation gated to editor+** — `guardGeneration` rejects viewers (403) on every `/api/ai/*` endpoint; `createProjectAction` / `saveDocumentAction` / `createBrandVoiceAction` require editor
- [x] **Org/team actions gated to admin+** — `inviteMemberAction` requires admin (invite *persistence* is still pending — see Remaining)
- [x] **Server-side enforcement, not just hiding** — every restricted action checks the role in the route/action; client UI additionally disables create/invite controls for insufficient roles (`canCreate` / `canManageTeam` props) and shows "View-only access" / "Admin only" badges
- [x] **403 UX** — `wasBlocked()` surfaces an "Access restricted" toast on 403; `AccessDenied` page component for restricted routes
- [x] **Proof** — `npm run test:roles` asserts the full permission matrix **and** the 401/403 decision (viewer/editor denied billing & team; viewer denied content; no-session → 401; insufficient role → 403). Demo owner retains full access (HTTP smoke)

### CRUD Update/Delete ✅ (this milestone)
- [x] **Data layer** — `updateProject`/`deleteProject`, `updateDocument`/`deleteDocument`, `updateBrandVoice`/`deleteBrandVoice`. All **org-scoped**: writes use `updateMany`/`deleteMany` on `{ id, orgId }`, and documents (no scalar `orgId`) verify ownership via `findFirst({ project: { orgId } })` before mutating. Cross-org rows return "not found". No-op success in demo mode
- [x] **Server actions** — `updateProjectAction` / `updateDocumentAction` / `updateBrandVoiceAction` (editor+) and `deleteProjectAction` / `deleteDocumentAction` / `deleteBrandVoiceAction` (admin+), all zod-validated with `revalidatePath`; return a clear "not found / no access" error
- [x] **Role gating** — viewer = read-only; editor = create + update; admin/owner = create + update + delete (`canDeleteContent` predicate, covered by `test:roles`)
- [x] **Delete confirmation** — reusable `ConfirmDialog` (dependency-free modal) guards every destructive action; project delete warns that its documents cascade
- [x] **UI (no redesign)** — Projects: inline edit (reuses the create form) + Delete; Documents: inline row edit (title + status) + Delete; Brand Voices: inline card edit (name + description) + Delete. Edit controls shown to editor+, Delete controls to admin+; optimistic state updates; toast on error; **empty states** for projects, documents, and voices

---

## 3. Remaining Features 🚧

### High priority (go-live)
- [x] ~~**Persistence**~~ — documents, projects, brand voices, generations, usage now wired to Postgres via `src/lib/data/` (demo fallback preserved)
- [x] ~~**Stripe ↔ DB sync**~~ — webhook persists plan + Stripe IDs (`setOrgPlan`); checkout carries `orgId`/`plan` metadata
- [x] ~~**Usage metering (recording)**~~ — `UsageRecord` rows written on every AI call; snapshots aggregate live
- [x] ~~**Real auth gating**~~ — middleware + layout gate `/dashboard/*` when Supabase is configured (demo stays open)
- [x] ~~**Usage limit enforcement**~~ — `guardGeneration` returns 402 over quota; client shows upgrade UI
- [x] ~~**Stripe customer portal**~~ — `POST /api/stripe/portal` + wired "Manage payment" button
- [x] ~~**Per-seat / role enforcement**~~ — full RBAC (owner/admin/editor/viewer) enforced server-side on routes & actions
- [x] ~~**CRUD update/delete**~~ — projects, documents, brand voices (org-scoped, role-gated, confirm dialog)
- [ ] **Folders & saved prompts CRUD** — models exist; not yet wired (read or write)
- [ ] **Team invite persistence** — `inviteMemberAction` enforces the admin gate but needs an `Invitation` model + email delivery + membership creation
- [ ] **brand-kit persistence** — `BrandKit` model exists; Visual Generator brand kit is still client-only state
- [ ] **Token-accurate metering** — usage is metered by output word count; switch to provider token usage for billing-grade accuracy
- [ ] **Role management UI** — change a member's role (model + `requireRole("admin")` ready; no UI yet)

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

PostgreSQL via Prisma. **Wired into runtime** through `src/lib/data/` (with demo fallback). 12 models.

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
| `Generation` | AI output ledger | `feature`, `prompt`, `output`, `provider`, `model`, `words`; indexed `[orgId, createdAt]` |
| `UsageRecord` | Metering ledger | `kind` (words/images), `amount`, `feature`; indexed `[orgId, createdAt]` |

Setup: `npm run db:generate && npm run db:push && npm run db:seed`

**Wired models:** Organization, User, Membership, Project, Document, DocumentVersion (on create), BrandVoice, Generation, UsageRecord.
**Not yet wired:** Folder, SavedPrompt, BrandKit (defined; UI still uses mock/local state).

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

Rendering: marketing/auth and the non-data dashboard pages are static (`○`); the
five data-backed pages (overview, workspace, analytics, billing, brand-voice) and all
API routes are dynamic (`ƒ`). Middleware runs as Proxy.

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
| `/api/brand-voices` | GET | — | `{ voices[] }` (tenant-scoped; demo fallback) |
| `/api/stripe/checkout` | POST | `{ plan }` | `{ url }` or `{ demo, message }` |
| `/api/stripe/portal` | POST | — | `{ url }` or `{ demo, message }` |
| `/api/stripe/webhook` | POST | Stripe event (raw) | `{ received }` |

Every `/api/ai/*` endpoint is **auth-, role-, and quota-guarded** (`guardGeneration`):
`401` unauthenticated, `403` for viewers (content needs editor+), `402 limit_reached`
when over plan quota, otherwise it runs, persists a `Generation`, and meters
`UsageRecord`(s). The Stripe **checkout** and **portal** routes require **admin**
(`apiRequireRole("admin")` → 403 otherwise). Guarding/metering are no-ops in demo mode
(owner, never blocked).

**Role helpers:** `requireRole(min)`, `requireOrgRole(orgId, min)`, `apiRequireRole(min)`,
`canManageBilling/Team/Org`, `canCreateContent`, `evaluateRoleAccess`. Tested via
`npm run test:roles`.

**Server actions** (`src/lib/actions.ts`): create/update/delete for projects,
documents, and brand voices (+ `inviteMemberAction`) — zod-validated, role-gated
(editor+ for create/update, admin+ for delete), `revalidatePath`, returning
`{ ok, data | error }`.

**AI router** (`src/lib/ai/providers.ts`): prefers Anthropic → OpenAI → Gemini based on configured keys; any error falls back to demo. Feature logic + demo generators live in `src/lib/ai/index.ts`.

---

## 7. Deployment Requirements

### Build / run
```bash
npm install
npm run build      # production build (passes)
npm run typecheck  # tsc --noEmit (passes)
npm run test:roles # role-matrix + 401/403 decision smoke test (passes)
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
2. `npm run db:generate && npm run db:push` (then `npm run db:seed` for demo data)
3. Add at least one AI provider key
4. Create Stripe products/prices → set price IDs; register webhook → `/api/stripe/webhook`
5. Set `NEXT_PUBLIC_APP_URL` to the production domain
6. Deploy (Vercel); add all env vars to the project. `prisma generate` runs automatically via `postinstall`.
7. The data layer auto-activates the moment `DATABASE_URL` is present — no code changes needed.

> Note: `@prisma/client` is a runtime dependency and a `postinstall: prisma generate`
> hook keeps the generated client in sync on every install/deploy.
>
> **Access control activates with env:** auth gating turns on when
> `NEXT_PUBLIC_SUPABASE_*` is set; usage-limit enforcement turns on when
> `DATABASE_URL` is set (real metering). With neither, the app stays in open demo
> mode. The billing portal needs `STRIPE_SECRET_KEY` and an org with a Stripe customer.

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
