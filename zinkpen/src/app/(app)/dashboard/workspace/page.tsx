"use client";
import { useState } from "react";
import { toast } from "sonner";
import { FolderKanban, FileText, Plus, Users, Bookmark, History, Clock } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MOCK_PROJECTS, MOCK_DOCS } from "@/lib/mock-data";
import { formatNumber, timeAgo } from "@/lib/utils";

const SAVED_PROMPTS = [
  { id: "sp1", title: "Thought-leadership hook", body: "Write a contrarian opening line about {topic} for a {audience}…" },
  { id: "sp2", title: "Capability statement intro", body: "Draft a 3-sentence company overview for {org} targeting {agency}…" },
  { id: "sp3", title: "Cold email opener", body: "Write a personalized first line referencing {trigger}…" },
];

const TEAM = [
  { name: "Demo Operator", email: "demo@zinkpen.ai", role: "Owner", initials: "DO" },
  { name: "Priya Nair", email: "priya@company.com", role: "Editor", initials: "PN" },
  { name: "Marcus Hale", email: "marcus@company.com", role: "Viewer", initials: "MH" },
];

const VERSIONS = [
  { label: "Final — sent to client", time: "2026-06-11T08:12:00Z", author: "Demo Operator" },
  { label: "Humanizer pass applied", time: "2026-06-10T20:40:00Z", author: "Priya Nair" },
  { label: "Grammar corrections", time: "2026-06-10T16:05:00Z", author: "Demo Operator" },
  { label: "First draft generated", time: "2026-06-10T09:30:00Z", author: "Demo Operator" },
];

export default function WorkspacePage() {
  const [tab, setTab] = useState("projects");
  return (
    <>
      <PageHeader
        title="Workspace"
        description="Projects, folders, documents, saved prompts, team, and version history."
        actions={<Button onClick={() => toast.success("New project created")}><Plus className="size-4" /> New project</Button>}
      />
      <div className="p-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="prompts">Saved Prompts</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="history">Version History</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_PROJECTS.map((p) => (
                <Card key={p.id} className="p-5 transition-all hover:shadow-[var(--shadow-pop)]">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-lg text-white" style={{ background: p.color }}>
                      <FolderKanban className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold">{p.name}</h3>
                      <p className="text-xs text-[var(--color-muted-foreground)]">{p.documents} documents</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">{p.description}</p>
                  <p className="mt-3 flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]"><Clock className="size-3" /> Updated {timeAgo(p.updatedAt)}</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-5">
            <Card>
              <CardContent className="divide-y divide-[var(--color-border)] p-0">
                {MOCK_DOCS.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--color-muted)]">
                    <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[var(--color-ink-50)] text-[var(--color-ink-600)]"><FileText className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{d.title}</div>
                      <div className="text-xs text-[var(--color-muted-foreground)]">{d.type} · {formatNumber(d.words)} words · {timeAgo(d.updatedAt)}</div>
                    </div>
                    <Badge variant={d.status === "final" ? "success" : d.status === "in-review" ? "warning" : "muted"}>{d.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prompts" className="mt-5">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {SAVED_PROMPTS.map((s) => (
                <Card key={s.id} className="p-5">
                  <div className="flex items-center gap-2"><Bookmark className="size-4 text-[var(--color-ink-600)]" /><h3 className="font-semibold">{s.title}</h3></div>
                  <p className="mt-2 font-mono text-xs leading-relaxed text-[var(--color-muted-foreground)]">{s.body}</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => toast.success("Prompt loaded into Studio")}>Use prompt</Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team" className="mt-5">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Users className="size-4" /> Team members</CardTitle>
                <Button size="sm" variant="outline" onClick={() => toast.success("Invite sent")}><Plus className="size-4" /> Invite</Button>
              </CardHeader>
              <CardContent className="divide-y divide-[var(--color-border)] p-0">
                {TEAM.map((m) => (
                  <div key={m.email} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="zp-gradient-brand inline-flex size-9 items-center justify-center rounded-full text-xs font-semibold text-white">{m.initials}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{m.name}</div>
                      <div className="text-xs text-[var(--color-muted-foreground)]">{m.email}</div>
                    </div>
                    <Badge variant={m.role === "Owner" ? "default" : "muted"}>{m.role}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-5">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><History className="size-4" /> "Q2 Board Brief" — version history</CardTitle></CardHeader>
              <CardContent className="space-y-0">
                {VERSIONS.map((v, i) => (
                  <div key={i} className="flex gap-3 pb-5 last:pb-0">
                    <div className="flex flex-col items-center">
                      <span className={`size-3 rounded-full ${i === 0 ? "zp-gradient-brand" : "bg-[var(--color-border)]"}`} />
                      {i < VERSIONS.length - 1 && <span className="w-px flex-1 bg-[var(--color-border)]" />}
                    </div>
                    <div className="-mt-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{v.label}</span>
                        {i === 0 && <Badge variant="success">current</Badge>}
                      </div>
                      <p className="text-xs text-[var(--color-muted-foreground)]">{v.author} · {timeAgo(v.time)}</p>
                    </div>
                    {i !== 0 && <Button variant="ghost" size="sm" onClick={() => toast.success("Restored version")}>Restore</Button>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
