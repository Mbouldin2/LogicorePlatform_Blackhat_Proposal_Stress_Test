"use client";
import { useState } from "react";
import { Menu, Sparkles, Search, Bell } from "lucide-react";
import { Sidebar } from "./sidebar";
import { AIAssistant } from "./ai-assistant";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DashboardShell({
  user,
  usage,
  children,
}: {
  user: { name: string; email: string; plan: string };
  usage: { wordsUsed: number; wordsLimit: number; plan: string };
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="flex min-h-screen bg-[var(--color-canvas)]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} usage={usage} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--color-border)] zp-glass px-4">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>

          <div className="hidden flex-1 items-center gap-2 sm:flex">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
              <input
                placeholder="Search documents, prompts, projects…"
                className="zp-focus h-9 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
            <Button size="sm" variant="primary" onClick={() => setAssistantOpen(true)}>
              <Sparkles className="size-4" /> AI Assistant
            </Button>
            <button className="relative rounded-full p-2 hover:bg-[var(--color-muted)]" aria-label="Notifications">
              <Bell className="size-5 text-[var(--color-muted-foreground)]" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[var(--color-danger)]" />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-1 pl-1 pr-3">
              <span className="zp-gradient-brand inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold text-white">
                {initials}
              </span>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-semibold leading-tight">{user.name}</div>
                <div className="text-[10px] capitalize text-[var(--color-muted-foreground)]">{user.plan} plan</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>

      <AIAssistant open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
}

/** Reusable page header used across dashboard pages. */
export function PageHeader({
  title,
  description,
  badge,
  actions,
}: {
  title: string;
  description?: string;
  badge?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {badge && <Badge variant="gold">{badge}</Badge>}
        </div>
        {description && <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
