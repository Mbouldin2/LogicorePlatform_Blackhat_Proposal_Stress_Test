import type { Project, Doc, BrandVoice, UsageSnapshot } from "@/types";

/** Seed data that powers the dashboard in demo mode. In production these are
 *  served from Postgres via the Prisma models in /prisma/schema.prisma. */

export const MOCK_USAGE: UsageSnapshot = {
  wordsUsed: 138_420,
  wordsLimit: 250_000,
  imagesUsed: 76,
  imagesLimit: 200,
  documents: 42,
  seatsUsed: 3,
  seatsLimit: 5,
};

export const MOCK_PROJECTS: Project[] = [
  { id: "p1", name: "Q3 Demand Gen", description: "Top-of-funnel content engine", color: "#5b63f0", documents: 14, updatedAt: "2026-06-10T14:22:00Z" },
  { id: "p2", name: "GovCon Pipeline", description: "SBIR + capability statements", color: "#0F766E", documents: 9, updatedAt: "2026-06-11T09:05:00Z" },
  { id: "p3", name: "Executive Comms", description: "Board briefs & thought leadership", color: "#9333ea", documents: 11, updatedAt: "2026-06-09T18:40:00Z" },
  { id: "p4", name: "Brand Refresh", description: "Website + social relaunch", color: "#e3a833", documents: 8, updatedAt: "2026-06-08T11:15:00Z" },
];

export const MOCK_DOCS: Doc[] = [
  { id: "d1", projectId: "p1", title: "The 2026 Content Operations Playbook", type: "Long-form Article", words: 2140, updatedAt: "2026-06-11T08:12:00Z", status: "in-review", excerpt: "How modern teams turn content into a measurable system…" },
  { id: "d2", projectId: "p2", title: "SBIR Phase I — Technical Narrative", type: "SBIR Proposal", words: 3890, updatedAt: "2026-06-11T07:40:00Z", status: "draft", excerpt: "Innovation, technical objectives, and work plan for…" },
  { id: "d3", projectId: "p3", title: "Q2 Board Brief", type: "Executive Brief", words: 820, updatedAt: "2026-06-10T22:01:00Z", status: "final", excerpt: "Three decisions, two risks, one ask for the board…" },
  { id: "d4", projectId: "p1", title: "LinkedIn Carousel — Pricing Strategy", type: "Social / Visual", words: 320, updatedAt: "2026-06-10T16:30:00Z", status: "final", excerpt: "Five slides on value-based pricing for B2B…" },
  { id: "d5", projectId: "p2", title: "Capability Statement — Cyber Services", type: "Capability Statement", words: 540, updatedAt: "2026-06-10T13:20:00Z", status: "in-review", excerpt: "Core competencies, differentiators, NAICS, and past performance…" },
  { id: "d6", projectId: "p4", title: "Homepage Hero Rewrite", type: "Website Copy", words: 210, updatedAt: "2026-06-09T19:55:00Z", status: "draft", excerpt: "A sharper value proposition for the relaunch…" },
];

export const MOCK_VOICES: BrandVoice[] = [
  { id: "v1", name: "Executive Authority", description: "Confident, concise, board-room ready.", traits: ["Authoritative", "Concise", "Data-driven"], sampleCount: 6, createdAt: "2026-05-01T00:00:00Z" },
  { id: "v2", name: "GovCon Compliance", description: "Precise, requirement-traceable, formal.", traits: ["Formal", "Precise", "Compliant"], sampleCount: 12, createdAt: "2026-04-18T00:00:00Z" },
  { id: "v3", name: "Founder Voice", description: "Warm, direct, story-led.", traits: ["Warm", "Direct", "Story-led"], sampleCount: 4, createdAt: "2026-05-22T00:00:00Z" },
];

/** 14-day word usage series for the analytics charts. */
export const MOCK_USAGE_SERIES = [
  { day: "Jun 1", words: 6200, images: 3 },
  { day: "Jun 2", words: 8400, images: 5 },
  { day: "Jun 3", words: 7100, images: 2 },
  { day: "Jun 4", words: 11200, images: 8 },
  { day: "Jun 5", words: 9800, images: 6 },
  { day: "Jun 6", words: 4300, images: 1 },
  { day: "Jun 7", words: 3900, images: 0 },
  { day: "Jun 8", words: 12400, images: 9 },
  { day: "Jun 9", words: 14100, images: 11 },
  { day: "Jun 10", words: 13600, images: 12 },
  { day: "Jun 11", words: 10900, images: 7 },
];

export const MOCK_FEATURE_USAGE = [
  { name: "Writing Studio", value: 44 },
  { name: "Proposals", value: 22 },
  { name: "Humanizer", value: 14 },
  { name: "Visuals", value: 12 },
  { name: "Research", value: 8 },
];
