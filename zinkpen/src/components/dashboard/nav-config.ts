import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  PenLine,
  Fingerprint,
  SpellCheck,
  Mic2,
  Search,
  FileSignature,
  ImageIcon,
  FolderKanban,
  BarChart3,
  CreditCard,
  Settings,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  group: "Create" | "Refine" | "Business" | "Workspace" | "Account";
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, group: "Create" },
  { href: "/dashboard/studio", label: "AI Writing Studio", icon: PenLine, group: "Create" },
  { href: "/dashboard/visuals", label: "Visual Content", icon: ImageIcon, group: "Create", badge: "New" },
  { href: "/dashboard/humanizer", label: "Humanizer", icon: Fingerprint, group: "Refine" },
  { href: "/dashboard/grammar", label: "Grammar & Style", icon: SpellCheck, group: "Refine" },
  { href: "/dashboard/brand-voice", label: "Brand Voice", icon: Mic2, group: "Refine" },
  { href: "/dashboard/research", label: "Research", icon: Search, group: "Business" },
  { href: "/dashboard/proposals", label: "Proposals & GovCon", icon: FileSignature, group: "Business" },
  { href: "/dashboard/workspace", label: "Projects & Folders", icon: FolderKanban, group: "Workspace" },
  { href: "/dashboard/analytics", label: "Usage Analytics", icon: BarChart3, group: "Workspace" },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard, group: "Account" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, group: "Account" },
];

export const NAV_GROUPS: NavItem["group"][] = ["Create", "Refine", "Business", "Workspace", "Account"];
