/* =============================================================================
   ZinkPen — shared product constants (plans, platforms, tones, brand)
   ============================================================================= */

export const BRAND = {
  name: "ZinkPen",
  tagline: "Where intelligence meets ink.",
  subTagline:
    "The AI Content Operating System — write, humanize, perfect, and design every word your business ships.",
  award: "Winner — 2026 SaaS Innovation Award for AI Content Platforms",
} as const;

export type PlanId = "starter" | "professional" | "executive" | "government";

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // monthly, USD
  blurb: string;
  highlight?: boolean;
  badge?: string;
  words: number; // monthly AI words
  images: number; // monthly visual generations
  seats: number;
  features: string[];
  cta: string;
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    blurb: "For solo creators and founders finding their voice.",
    words: 50_000,
    images: 40,
    seats: 1,
    cta: "Start free trial",
    features: [
      "AI Writing Studio (all templates)",
      "Grammar & Style Engine",
      "Humanizer Engine — Standard",
      "1 Brand Voice profile",
      "40 visual generations / mo",
      "Community support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 79,
    blurb: "For marketers and agencies producing at scale.",
    highlight: true,
    badge: "Most popular",
    words: 250_000,
    images: 200,
    seats: 5,
    cta: "Start free trial",
    features: [
      "Everything in Starter",
      "Unlimited Brand Voice profiles",
      "Research Assistant with citations",
      "Humanizer Engine — Advanced + risk score",
      "Visual Content Generator (all formats)",
      "Version history & team folders (5 seats)",
      "Priority support",
    ],
  },
  {
    id: "executive",
    name: "Executive",
    price: 199,
    blurb: "For leadership teams and high-stakes communication.",
    badge: "Best for teams",
    words: 1_000_000,
    images: 750,
    seats: 20,
    cta: "Start free trial",
    features: [
      "Everything in Professional",
      "Executive brief & white paper suites",
      "Proposal & Business Writing Suite",
      "Brand Kit + custom font pairing",
      "Advanced usage analytics",
      "SSO-ready, 20 seats",
      "Dedicated success manager",
    ],
  },
  {
    id: "government",
    name: "Government",
    price: 499,
    blurb: "For agencies and GovCon teams with compliance demands.",
    badge: "Compliance-grade",
    words: 5_000_000,
    images: 3000,
    seats: 100,
    cta: "Contact sales",
    features: [
      "Everything in Executive",
      "SBIR / grant / RFP response engine",
      "Capability statement generator",
      "Citation & fact-check audit trail",
      "FedRAMP-aligned data handling",
      "On-prem / private model routing",
      "100 seats + custom volume",
    ],
  },
];

export const SOCIAL_PLATFORMS = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "x", label: "X (Twitter)" },
  { id: "tiktok", label: "TikTok" },
  { id: "pinterest", label: "Pinterest" },
] as const;

export const VISUAL_CONTENT_TYPES = [
  { id: "carousel", label: "Carousel" },
  { id: "quote-card", label: "Quote Card" },
  { id: "infographic", label: "Infographic" },
  { id: "social-post", label: "Social Post Graphic" },
  { id: "thumbnail", label: "Thumbnail" },
  { id: "ad-creative", label: "Ad Creative" },
] as const;

export const TONES = [
  "professional",
  "bold",
  "luxury",
  "viral",
  "educational",
  "executive",
  "playful",
] as const;

/** Export presets — exact dimensions required per platform/asset. */
export const EXPORT_PRESETS = [
  { id: "ig-square", label: "Instagram carousel", w: 1080, h: 1080, platform: "instagram" },
  { id: "ig-story", label: "Instagram story / reel cover", w: 1080, h: 1920, platform: "instagram" },
  { id: "li-carousel", label: "LinkedIn carousel", w: 1080, h: 1350, platform: "linkedin" },
  { id: "fb-post", label: "Facebook post", w: 1200, h: 630, platform: "facebook" },
  { id: "yt-thumb", label: "YouTube thumbnail", w: 1280, h: 720, platform: "youtube" },
  { id: "x-post", label: "X / Twitter post", w: 1600, h: 900, platform: "x" },
] as const;

/** Curated, premium palettes for the brand-kit color generator. */
export const PALETTE_PRESETS = [
  { id: "executive-navy", name: "Executive Navy", colors: ["#0B1F3A", "#1E3A8A", "#3B82F6", "#E2E8F0"] },
  { id: "govcon-steel", name: "GovCon Steel", colors: ["#1F2933", "#3E4C59", "#9AA5B1", "#CBD2D9"] },
  { id: "consulting-emerald", name: "Consulting Emerald", colors: ["#06281F", "#0F766E", "#2DD4BF", "#F0FDFA"] },
  { id: "finance-gold", name: "Finance Gold", colors: ["#1A1410", "#3F2D14", "#C99B3F", "#F7EFD9"] },
  { id: "tech-violet", name: "Tech Violet", colors: ["#1C1A49", "#4A43E0", "#A855F7", "#F3EEFF"] },
  { id: "education-coral", name: "Education Coral", colors: ["#3A1212", "#B91C1C", "#FB7185", "#FFF1F2"] },
];

export const FONT_PAIRINGS = [
  { id: "inter-source", heading: "Inter", body: "Source Serif", vibe: "Modern & trustworthy" },
  { id: "fraunces-inter", heading: "Fraunces", body: "Inter", vibe: "Editorial & premium" },
  { id: "space-ibm", heading: "Space Grotesk", body: "IBM Plex Sans", vibe: "Technical & sharp" },
  { id: "playfair-lato", heading: "Playfair Display", body: "Lato", vibe: "Luxury & elegant" },
  { id: "archivo-inter", heading: "Archivo", body: "Inter", vibe: "Bold & corporate" },
];

/** Industry use-cases ZinkPen is tuned for (drives default styling). */
export const FOCUS_INDUSTRIES = [
  "Business & Consulting",
  "Executive Leadership",
  "Government Contracting",
  "Education",
  "Finance",
  "Technology",
];

/** AI Writing Studio template catalog. */
export const WRITING_TEMPLATES = [
  { id: "long-form-article", name: "Long-form Article", group: "Content", icon: "FileText", desc: "SEO-ready articles up to 3,000 words." },
  { id: "technical-writing", name: "Technical Writing", group: "Content", icon: "Code2", desc: "Docs, specs, and developer guides." },
  { id: "blog-post", name: "Blog Post", group: "Content", icon: "PenLine", desc: "Engaging posts with hooks and CTAs." },
  { id: "website-copy", name: "Website Copy", group: "Marketing", icon: "LayoutTemplate", desc: "Landing pages and hero sections." },
  { id: "sales-copy", name: "Sales Copy", group: "Marketing", icon: "TrendingUp", desc: "High-converting offers and pages." },
  { id: "email-campaign", name: "Email Campaign", group: "Marketing", icon: "Mail", desc: "Sequences, newsletters, drip flows." },
  { id: "social-media", name: "Social Media", group: "Marketing", icon: "Share2", desc: "Threads, captions, and hooks." },
  { id: "press-release", name: "Press Release", group: "Communications", icon: "Megaphone", desc: "AP-style announcements." },
  { id: "executive-brief", name: "Executive Brief", group: "Business", icon: "Briefcase", desc: "Board-ready summaries." },
];

export const PROPOSAL_TEMPLATES = [
  { id: "capability-statement", name: "Capability Statement", desc: "One-page GovCon capabilities sheet." },
  { id: "gov-proposal", name: "Government Proposal Response", desc: "Section-by-section RFP/RFQ response." },
  { id: "sbir", name: "SBIR Proposal Draft", desc: "Phase I/II technical narrative." },
  { id: "grant", name: "Grant Application", desc: "Needs, methods, and budget narrative." },
  { id: "executive-summary", name: "Executive Summary", desc: "Compelling 1-page summary." },
  { id: "white-paper", name: "White Paper", desc: "Authoritative thought-leadership." },
  { id: "business-plan", name: "Business Plan", desc: "Full plan with financial narrative." },
];
