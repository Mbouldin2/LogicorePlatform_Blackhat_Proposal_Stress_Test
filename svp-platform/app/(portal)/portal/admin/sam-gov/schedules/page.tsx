"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Play,
  Clock,
  Mail,
  Search,
  Pencil,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useUserProfile } from "@/contexts/user-profile-context";

interface Schedule {
  id: string;
  name: string;
  query: string;
  filters: Record<string, string>;
  emailRecipients: string[];
  emailSubject?: string;
  schedule: "daily" | "weekly" | "biweekly" | "monthly";
  scheduleDay?: number;
  scheduleHour?: number;
  isActive: boolean;
  lastRunAt?: any;
  nextRunAt?: any;
  lastResultCount?: number;
  createdByName: string;
}

const SCHEDULE_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Every 2 Weeks",
  monthly: "Monthly",
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTs(ts: any): string {
  if (!ts) return "Never";
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "Unknown";
  }
}

type ScheduleFrequency = "daily" | "weekly" | "biweekly" | "monthly";

interface FormState {
  name: string;
  query: string;
  emailRecipients: string;
  emailSubject: string;
  schedule: ScheduleFrequency;
  scheduleDay: number;
  scheduleHour: number;
  isActive: boolean;
  naicsCode: string;
  pscCode: string;
  setAside: string;
  popState: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  query: "",
  emailRecipients: "",
  emailSubject: "",
  schedule: "weekly",
  scheduleDay: 1,
  scheduleHour: 8,
  isActive: true,
  naicsCode: "",
  pscCode: "",
  setAside: "",
  popState: "",
};

export default function SamSchedulesPage() {
  const { profile } = useUserProfile();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sam/schedules");
      const data = await res.json();
      setSchedules(data.items || []);
    } catch {
      toast.error("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  const openNew = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (s: Schedule) => {
    setEditId(s.id);
    setForm({
      name: s.name,
      query: s.query,
      emailRecipients: s.emailRecipients.join(", "),
      emailSubject: s.emailSubject || "",
      schedule: s.schedule,
      scheduleDay: s.scheduleDay ?? 1,
      scheduleHour: s.scheduleHour ?? 8,
      isActive: s.isActive,
      naicsCode: s.filters?.naicsCode || "",
      pscCode: s.filters?.pscCode || "",
      setAside: s.filters?.setAside || "",
      popState: s.filters?.popState || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.query || !form.emailRecipients) {
      toast.error("Name, query, and email recipients are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        query: form.query,
        emailRecipients: form.emailRecipients.split(",").map((e) => e.trim()).filter(Boolean),
        emailSubject: form.emailSubject || undefined,
        schedule: form.schedule,
        scheduleDay: form.scheduleDay,
        scheduleHour: form.scheduleHour,
        isActive: form.isActive,
        filters: {
          naicsCode: form.naicsCode || undefined,
          pscCode: form.pscCode || undefined,
          setAside: form.setAside || undefined,
          popState: form.popState || undefined,
        },
        createdByUserId: profile?.id || "",
        createdByName: `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim(),
      };

      if (editId) {
        await fetch("/api/sam/schedules", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...payload }),
        });
        toast.success("Schedule updated");
      } else {
        await fetch("/api/sam/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Schedule created");
      }
      setShowForm(false);
      fetchSchedules();
    } catch {
      toast.error("Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this schedule?")) return;
    try {
      await fetch(`/api/sam/schedules?id=${id}`, { method: "DELETE" });
      toast.success("Deleted");
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleToggle = async (s: Schedule) => {
    try {
      await fetch("/api/sam/schedules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.id, isActive: !s.isActive }),
      });
      setSchedules((prev) => prev.map((x) => x.id === s.id ? { ...x, isActive: !x.isActive } : x));
    } catch {
      toast.error("Failed to toggle");
    }
  };

  const handleRunNow = async (id: string) => {
    setRunning(id);
    try {
      const res = await fetch("/api/sam/schedules/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      const result = data.results?.[0];
      if (result?.sent) {
        toast.success(`Sent ${result.count} opportunities`);
      } else {
        toast.error(result?.error || "Run failed");
      }
      fetchSchedules();
    } catch {
      toast.error("Failed to run schedule");
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Search Schedules</h1>
          <p className="text-gray-500 text-sm mt-1">
            Auto-email SAM.gov search results on a schedule
          </p>
        </div>
        <Button onClick={openNew} className="bg-[#1e3a5f] hover:bg-[#152d4a]">
          <Plus className="h-4 w-4 mr-2" />New Schedule
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : schedules.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-400">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No schedules yet</p>
            <p className="text-sm mt-1">Create a schedule to auto-email search results</p>
            <Button className="mt-4" onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" />Create First Schedule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {schedules.map((s) => (
            <Card key={s.id} className={`transition-opacity ${!s.isActive ? "opacity-60" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#1e3a5f]">{s.name}</h3>
                      <Badge variant={s.isActive ? "default" : "secondary"} className="text-xs">
                        {s.isActive ? "Active" : "Paused"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {SCHEDULE_LABELS[s.schedule]}
                        {s.schedule === "weekly" && s.scheduleDay !== undefined
                          ? ` (${DAY_NAMES[s.scheduleDay]})`
                          : ""}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                      <span className="flex items-center gap-1">
                        <Search className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-medium">Query:</span> {s.query}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        {s.emailRecipients.length} recipient{s.emailRecipients.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-2">
                      <span>Last run: {formatTs(s.lastRunAt)}</span>
                      <span>Next run: {formatTs(s.nextRunAt)}</span>
                      {s.lastResultCount !== undefined && s.lastResultCount !== null && (
                        <span>{s.lastResultCount} results last sent</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {s.emailRecipients.map((email) => (
                        <span key={email} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          {email}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Switch checked={s.isActive} onCheckedChange={() => handleToggle(s)} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRunNow(s.id)}
                      disabled={running === s.id}
                    >
                      <Play className="h-3.5 w-3.5 mr-1" />
                      {running === s.id ? "Running..." : "Run Now"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(s)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(s.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => !o && setShowForm(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Schedule" : "New Search Schedule"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Schedule Name *</Label>
                <Input
                  className="mt-1"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Weekly IT Services Alert"
                />
              </div>
              <div className="col-span-2">
                <Label>Search Query *</Label>
                <Input
                  className="mt-1"
                  value={form.query}
                  onChange={(e) => setForm({ ...form, query: e.target.value })}
                  placeholder="e.g. IT Services"
                />
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">Optional Filters</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">NAICS Code</Label>
                  <Input className="mt-1 h-8 text-sm" value={form.naicsCode} onChange={(e) => setForm({ ...form, naicsCode: e.target.value })} placeholder="e.g. 541511" />
                </div>
                <div>
                  <Label className="text-xs">PSC Code</Label>
                  <Input className="mt-1 h-8 text-sm" value={form.pscCode} onChange={(e) => setForm({ ...form, pscCode: e.target.value })} placeholder="e.g. D301" />
                </div>
                <div>
                  <Label className="text-xs">Set-Aside</Label>
                  <Input className="mt-1 h-8 text-sm" value={form.setAside} onChange={(e) => setForm({ ...form, setAside: e.target.value })} placeholder="e.g. SBA, WOSB" />
                </div>
                <div>
                  <Label className="text-xs">State (POP)</Label>
                  <Input className="mt-1 h-8 text-sm" value={form.popState} onChange={(e) => setForm({ ...form, popState: e.target.value })} placeholder="e.g. VA, TX" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Frequency *</Label>
                <Select value={form.schedule} onValueChange={(v: any) => setForm({ ...form, schedule: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SCHEDULE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.schedule === "weekly" && (
                <div>
                  <Label>Day of Week</Label>
                  <Select value={String(form.scheduleDay)} onValueChange={(v) => setForm({ ...form, scheduleDay: Number(v) })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAY_NAMES.map((d, i) => (
                        <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label>Send Hour (UTC)</Label>
                <Select value={String(form.scheduleHour)} onValueChange={(v) => setForm({ ...form, scheduleHour: Number(v) })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={String(i)}>{String(i).padStart(2, "0")}:00 UTC</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Email Recipients * <span className="text-gray-400 font-normal">(comma-separated)</span></Label>
              <Input
                className="mt-1"
                value={form.emailRecipients}
                onChange={(e) => setForm({ ...form, emailRecipients: e.target.value })}
                placeholder="user@example.com, another@example.com"
              />
            </div>
            <div>
              <Label>Email Subject <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Input
                className="mt-1"
                value={form.emailSubject}
                onChange={(e) => setForm({ ...form, emailSubject: e.target.value })}
                placeholder={`SAM.gov Opportunities: ${form.query || "..."}`}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label>Active (start sending immediately)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving} className="bg-[#1e3a5f] hover:bg-[#152d4a]">
              {saving ? "Saving..." : editId ? "Update Schedule" : "Create Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
