import type { PlanId } from "@/lib/constants";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: PlanId;
  role: "owner" | "admin" | "editor" | "viewer";
}

export interface UsageSnapshot {
  wordsUsed: number;
  wordsLimit: number;
  imagesUsed: number;
  imagesLimit: number;
  documents: number;
  seatsUsed: number;
  seatsLimit: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  documents: number;
  updatedAt: string;
}

export interface Doc {
  id: string;
  projectId: string;
  title: string;
  type: string;
  words: number;
  updatedAt: string;
  status: "draft" | "in-review" | "final";
  excerpt: string;
}

export interface BrandVoice {
  id: string;
  name: string;
  description: string;
  traits: string[];
  sampleCount: number;
  createdAt: string;
}

export interface BrandKit {
  id: string;
  name: string;
  colors: string[];
  fontHeading: string;
  fontBody: string;
  logoUrl?: string | null;
  createdAt: string;
}

export interface GrammarIssue {
  id: string;
  type: "spelling" | "grammar" | "punctuation" | "clarity" | "style";
  severity: "low" | "medium" | "high";
  message: string;
  suggestion: string;
  context: string;
}

export interface ReadabilityReport {
  fleschScore: number;
  gradeLevel: string;
  readingTimeMin: number;
  toneLabel: string;
  sentenceLengthAvg: number;
}

export interface HumanizeResult {
  text: string;
  aiRiskBefore: number; // 0-100
  aiRiskAfter: number;
  humanizationScore: number; // 0-100
  meaningPreserved: number; // 0-100
}

export interface Citation {
  id: string;
  title: string;
  source: string;
  url: string;
  snippet: string;
  reliability: "high" | "medium" | "low";
}

export interface CarouselSlide {
  index: number;
  headline: string;
  body: string;
  imageConcept: string;
  imagePrompt: string;
}

export interface VisualProject {
  topic: string;
  platform: string;
  contentType: string;
  tone: string;
  audience: string;
  caption: string;
  hashtags: string[];
  slides: CarouselSlide[];
  palette: string[];
}

export type AIProvider = "openai" | "anthropic" | "gemini" | "demo";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
