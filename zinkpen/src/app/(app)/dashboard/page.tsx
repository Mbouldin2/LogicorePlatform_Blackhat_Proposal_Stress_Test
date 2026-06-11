import Link from "next/link";
import {
  PenLine,
  Fingerprint,
  ImageIcon,
  FileSignature,
  FileText,
  Sparkles,
  ArrowUpRight,
  Clock,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/shell";
import { StatCard } from "@/components/dashboard/widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_DOCS, MOCK_USAGE, MOCK_PROJECTS } from "@/lib/mock-data";
import { formatNumber, timeAgo } from "@/lib/utils";

const QUICK_ACTIONS = [
  { href: "/dashboard/studio", label: "Write an article", icon: PenLine, tone: "bg-[var(--color-ink-600)]" },
  { href: "/dashboard/humanizer", label: "Humanize text", icon: Fingerprint, tone: "bg-[var(--color-accent-600)]" },
  { href: "/dashboard/visuals", label: "Design a carousel", icon: ImageIcon, tone: "bg-[var(--color-gold-500)]" },
  { href: "/dashboard/proposals", label: "Draft a proposal", icon: FileSignature, tone: "bg-purple-600" },
];

export default function DashboardOverview() {
  const u = MOCK_USAGE;
  return (
    <>
      <PageHeader
        title="Good to see you, Operator"
        description="Here's what's happening across your ZinkPen workspace."
        actions={
          <Link href="/dashboard/studio">
            <Button>
              <Sparkles className="size-4" /> New document
            </Button>
          </Link>
        }
      />

      <div className="space-y-6 p-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="AI words this month" value={formatNumber(u.wordsUsed)} sub={`of ${formatNumber(u.wordsLimit)} included`} icon={PenLine} />
          <StatCard label="Visuals generated" value={`${u.imagesUsed}`} sub={`of ${u.imagesLimit} included`} icon={ImageIcon} tone="gold" />
          <StatCard label="Documents" value={`${u.documents}`} sub="across 4 projects" icon={FileText} tone="violet" />
          <StatCard label="Avg. AI risk score" value="7%" sub="down 12% vs last month" icon={TrendingUp} tone="success" />
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Quick start
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_ACTIONS.map((a) => (
              <Link key={a.href} href={a.href}>
                <Card className="group p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]">
                  <span className={`mb-3 inline-flex size-10 items-center justify-center rounded-[var(--radius-sm)] text-white ${a.tone}`}>
                    <a.icon className="size-5" />
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{a.label}</span>
                    <ArrowUpRight className="size-4 text-[var(--color-muted-foreground)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent documents */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Recent documents</CardTitle>
              <Link href="/dashboard/workspace" className="text-sm font-medium text-[var(--color-ink-600)] hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-1">
              {MOCK_DOCS.slice(0, 5).map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 transition-colors hover:bg-[var(--color-muted)]"
                >
                  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[var(--color-ink-50)] text-[var(--color-ink-600)]">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{d.title}</div>
                    <div className="text-xs text-[var(--color-muted-foreground)]">
                      {d.type} · {formatNumber(d.words)} words
                    </div>
                  </div>
                  <Badge
                    variant={d.status === "final" ? "success" : d.status === "in-review" ? "warning" : "muted"}
                  >
                    {d.status}
                  </Badge>
                  <span className="hidden items-center gap-1 text-xs text-[var(--color-muted-foreground)] sm:flex">
                    <Clock className="size-3" /> {timeAgo(d.updatedAt)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Projects</CardTitle>
              <Link href="/dashboard/workspace" className="text-sm font-medium text-[var(--color-ink-600)] hover:underline">
                Manage
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {MOCK_PROJECTS.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-[var(--radius-sm)] px-2 py-2 hover:bg-[var(--color-muted)]">
                  <span className="size-3 rounded-full" style={{ background: p.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-[var(--color-muted-foreground)]">{p.documents} documents</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
