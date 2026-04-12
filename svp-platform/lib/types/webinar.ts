/**
 * Webinar Creator Types
 * 
 * Types for the webinar landing page and confirmation page creator system
 */

import { Timestamp } from "firebase/firestore";

/** Risk highlight item for hero section */
export interface WebinarRiskHighlight {
  id: string;
  icon: string;
  title: string;
  description: string;
}

/** Benefit item */
export interface WebinarBenefit {
  id: string;
  icon: string;
  title: string;
  description: string;
}

/** Timeline phase */
export interface WebinarTimelinePhase {
  id: string;
  label: string;
  period: string;
  status: "ACTIVE NOW" | "UPCOMING" | "PLANNED" | "FULL ENFORCEMENT";
  title: string;
  description: string;
  isUrgent: boolean;
}

/** Process step */
export interface WebinarProcessStep {
  id: string;
  number: string;
  icon: string;
  title: string;
  description: string;
}

/** FAQ item */
export interface WebinarFAQ {
  id: string;
  question: string;
  answer: string;
}

/** Testimonial item */
export interface WebinarTestimonial {
  id: string;
  title: string;
  quote: string;
  rating: number;
}

/** Deliverable item for confirmation page */
export interface WebinarDeliverable {
  id: string;
  icon: string;
  title: string;
  description: string;
}

/** Trust indicator for confirmation page */
export interface WebinarTrustIndicator {
  id: string;
  icon: string;
  text: string;
}

/** Registration form field */
export interface WebinarFormField {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "select" | "textarea" | "checkbox";
  placeholder?: string;
  required: boolean;
  options?: string[];
  ghlFieldMapping: string;
}

/** Landing page hero section */
export interface WebinarLandingHero {
  primaryLogo?: string;
  secondaryLogo?: string;
  collaborationText?: string;
  /** Use light logos for dark backgrounds, dark logos for light backgrounds */
  logoContrast?: "light" | "dark";
  urgencyBadgeEnabled?: boolean;
  urgencyBadge?: string;
  headline: string;
  subheadline?: string;
  riskHighlights: WebinarRiskHighlight[];
  primaryCtaText: string;
  secondaryCtaText?: string;
  backgroundImage?: string;
}

/** Urgency banner item */
export interface WebinarUrgencyBannerItem {
  id: string;
  text: string;
}

/** Landing page urgency banner */
export interface WebinarUrgencyBanner {
  enabled: boolean;
  headline: string;
  description: string;
  /** Array of bullet point items */
  items?: WebinarUrgencyBannerItem[];
  /** Footer text below the items */
  footerText?: string;
  ctaText: string;
}

/** Landing page timeline section */
export interface WebinarTimeline {
  enabled: boolean;
  title: string;
  description: string;
  phases: WebinarTimelinePhase[];
}

/** Landing page process steps section */
export interface WebinarProcessSteps {
  enabled: boolean;
  title: string;
  description: string;
  steps: WebinarProcessStep[];
}

/** Landing page FAQs section */
export interface WebinarFAQs {
  enabled: boolean;
  items: WebinarFAQ[];
}

/** Landing page testimonials section */
export interface WebinarTestimonials {
  enabled: boolean;
  items: WebinarTestimonial[];
}

/** Landing page benefits section */
export interface WebinarBenefitsSection {
  title?: string;
  description?: string;
  items: WebinarBenefit[];
}

/** Landing page configuration */
export interface WebinarLandingPage {
  hero: WebinarLandingHero;
  urgencyBanner?: WebinarUrgencyBanner;
  benefits: WebinarBenefit[];
  benefitsSection?: WebinarBenefitsSection;
  timeline?: WebinarTimeline;
  processSteps?: WebinarProcessSteps;
  faqs?: WebinarFAQs;
  testimonials?: WebinarTestimonials;
}

/** Confirmation page hero section */
export interface WebinarConfirmationHero {
  badgeEnabled?: boolean;
  badgeText: string;
  logo?: string;
  headline: string;
  programTitle: string;
  tagline?: string;
}

/** Confirmation page investment card */
export interface WebinarInvestmentCard {
  urgencyText: string;
  investmentLabel: string;
  price: string;
  savingsText?: string;
  paymentDetails?: string;
  ctaText: string;
  ctaLink: string;
}

/** Confirmation page final CTA */
export interface WebinarFinalCTA {
  headline: string;
  subheadline?: string;
  description?: string;
  ctaText: string;
  trustIndicators: WebinarTrustIndicator[];
}

/** Confirmation page configuration */
export interface WebinarConfirmationPage {
  hero: WebinarConfirmationHero;
  deliverables: WebinarDeliverable[];
  benefits: string[];
  investmentCard: WebinarInvestmentCard;
  finalCta: WebinarFinalCTA;
}

/** Registration form configuration */
export interface WebinarRegistrationForm {
  enabled: boolean;
  title: string;
  description?: string;
  fields: WebinarFormField[];
}

/** GoHighLevel tags configuration */
export interface WebinarGHLTags {
  primary: string;
  additional: string[];
  description?: string;
}

/** GoHighLevel integration configuration */
export interface WebinarGHLIntegration {
  enabled: boolean;
  registrationForm?: WebinarRegistrationForm;
  tags: WebinarGHLTags;
  apiKey?: string;
  locationId?: string;
  webhookMode?: boolean;
  webhookUrl?: string;
}

/** Landing page SEO settings */
export interface WebinarLandingPageSEO {
  metaTitle: string;
  metaDescription: string;
  keywords?: string;
  ogImage?: string;
}

/** Confirmation page SEO settings */
export interface WebinarConfirmationPageSEO {
  metaTitle: string;
  metaDescription: string;
}

/** Webinar SEO configuration */
export interface WebinarSEO {
  landingPage: WebinarLandingPageSEO;
  confirmationPage: WebinarConfirmationPageSEO;
}

/** Webinar status */
export type WebinarStatus = "draft" | "scheduled" | "published" | "archived";

/** Main Webinar document interface */
export interface WebinarDoc {
  id: string;
  slug: string;
  status: WebinarStatus;
  publishedAt?: Timestamp;
  scheduledPublishAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  
  // Basic Info
  title: string;
  shortDescription: string;
  eventDate?: Timestamp;
  duration: string;
  participantLimit?: number;
  price?: string;
  paymentLink?: string;
  
  // Page configurations
  landingPage: WebinarLandingPage;
  confirmationPage: WebinarConfirmationPage;
  
  // Integrations
  ghlIntegration: WebinarGHLIntegration;
  
  // SEO
  seo: WebinarSEO;
}

/** Create webinar request */
export interface CreateWebinarRequest {
  title: string;
  shortDescription: string;
  slug?: string;
}

/** Update webinar request */
export interface UpdateWebinarRequest extends Partial<Omit<WebinarDoc, "id" | "createdAt" | "createdBy">> {}

/** Webinar list item (for admin list view) */
export interface WebinarListItem {
  id: string;
  title: string;
  slug: string;
  status: WebinarStatus;
  publishedAt?: Date;
  scheduledPublishAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** Default empty webinar for wizard initialization */
export const getDefaultWebinar = (createdBy: string): Omit<WebinarDoc, "id" | "createdAt" | "updatedAt"> => ({
  slug: "",
  status: "draft",
  createdBy,
  title: "",
  shortDescription: "",
  duration: "",
  landingPage: {
    hero: {
      headline: "",
      riskHighlights: [],
      primaryCtaText: "Register Now",
    },
    benefits: [],
  },
  confirmationPage: {
    hero: {
      badgeText: "",
      headline: "",
      programTitle: "",
    },
    deliverables: [],
    benefits: [],
    investmentCard: {
      urgencyText: "",
      investmentLabel: "",
      price: "",
      ctaText: "Secure Your Seat",
      ctaLink: "",
    },
    finalCta: {
      headline: "",
      ctaText: "Get Started",
      trustIndicators: [],
    },
  },
  ghlIntegration: {
    enabled: false,
    tags: {
      primary: "",
      additional: [],
    },
  },
  seo: {
    landingPage: {
      metaTitle: "",
      metaDescription: "",
    },
    confirmationPage: {
      metaTitle: "",
      metaDescription: "",
    },
  },
});

/** Available Lucide icons for selection */
export const AVAILABLE_ICONS = [
  "Shield",
  "CheckCircle",
  "AlertTriangle",
  "Clock",
  "FileCheck",
  "Users",
  "Award",
  "ArrowRight",
  "Calendar",
  "Target",
  "Zap",
  "Lock",
  "Star",
  "Building2",
  "Briefcase",
  "FileText",
  "Heart",
  "TrendingUp",
  "DollarSign",
  "Globe",
  "Phone",
  "Mail",
  "MapPin",
  "Settings",
  "Lightbulb",
  "Rocket",
  "Flag",
  "Trophy",
  "ThumbsUp",
  "Eye",
] as const;

export type AvailableIcon = typeof AVAILABLE_ICONS[number];

/** GHL field mapping options */
export const GHL_FIELD_MAPPINGS = [
  { value: "firstName", label: "First Name" },
  { value: "lastName", label: "Last Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "companyName", label: "Company" },
  { value: "address1", label: "Address" },
  { value: "city", label: "City" },
  { value: "state", label: "State" },
  { value: "postalCode", label: "Zip Code" },
  { value: "country", label: "Country" },
  { value: "website", label: "Website" },
  { value: "customField", label: "Custom Field" },
] as const;
