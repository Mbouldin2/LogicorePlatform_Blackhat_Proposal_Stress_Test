"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  FileText,
  Search,
  Tag,
  User,
  Calendar,
  ExternalLink,
  Pencil,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { useUserProfile } from "@/contexts/user-profile-context";

interface SavedOpportunity {
  id: string;
  noticeId: string;
  title: string;
  solicitationNumber?: string;
  type?: string;
  postedDate?: string;
  responseDeadLine?: string;
  department?: string;
  naicsCode?: string;
  uiLink?: string;
  tags: string[];
  notes?: string;
  assignedToUserId?: string;
  assignedToName?: string;
  status: "new" | "reviewing" | "pursuing" | "submitted" | "awarded" | "no_bid";
  savedByName: string;
  createdAt: any;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-gray-100 text-gray-700",
  reviewing: "bg-blue-100 text-blue-700",
  pursuing: "bg-yellow-100 text-yellow-700",
  submitted: "bg-purple-100 text-purple-700",
  awarded: "bg-green-100 text-green-700",
  no_bid: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  reviewing: "Reviewing",
  pursuing: "Pursuing",
  submitted: "Submitted",
  awarded: "Awarded",
  no_bid: "No Bid",
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function SolicitationsPage() {
  const { profile } = useUserProfile();
  const [items, setItems] = useState<SavedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editItem, setEditItem] = useState<SavedOpportunity | null>(null);
  const [editTags, setEditTags] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const isAdmin = profile?.role === "admin" || profile?.role === "superadmin";

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const url = isAdmin
        ? "/api/sam/saved"
        : `/api/sam/saved?assignedTo=${profile?.id}`;
      const res = await fetch(url);
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      toast.error("Failed to load solicitations");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, profile?.id]);

  useEffect(() => {
    if (profile?.id) fetchItems();
  }, [profile?.id, fetchItems]);

  const openEdit = (item: SavedOpportunity) => {
    setEditItem(item);
    setEditTags(item.tags.join(", "));
    setEditNotes(item.notes || "");
    setEditStatus(item.status);
  };

  const handleSave = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      await fetch("/api/sam/saved", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editItem.id,
          tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
          notes: editNotes,
          status: editStatus,
        }),
      });
      toast.success("Updated");
      setEditItem(null);
      fetchItems();
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this saved opportunity?")) return;
    try {
      await fetch(`/api/sam/saved?id=${id}`, { method: "DELETE" });
      toast.success("Removed");
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toast.error("Failed to remove");
    }
  };

  const filtered = items.filter((item) => {
    const matchSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.noticeId.toLowerCase().includes(search.toLowerCase()) ||
      item.department?.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">My Solicitations</h1>
        <p className="text-gray-500 text-sm mt-1">
          Saved federal contract opportunities assigned to you
        </p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
            className={`rounded-lg p-3 text-center border transition-all ${
              statusFilter === key ? "ring-2 ring-[#1e3a5f]" : ""
            } ${STATUS_COLORS[key]}`}
          >
            <div className="text-xl font-bold">{statusCounts[key] || 0}</div>
            <div className="text-xs">{label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by title, notice ID, agency, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No solicitations found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[item.status]}`}>
                        {STATUS_LABELS[item.status]}
                      </span>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {item.noticeId}
                      </Badge>
                      {item.type && (
                        <Badge variant="outline" className="text-xs">{item.type}</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-[#1e3a5f] text-base leading-tight mb-2">
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
                      {item.department && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />{item.department}
                        </span>
                      )}
                      {item.postedDate && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Calendar className="h-3 w-3" />Posted: {formatDate(item.postedDate)}
                        </span>
                      )}
                      {item.responseDeadLine && (
                        <span className={`flex items-center gap-1 ${
                          new Date(item.responseDeadLine) < new Date() ? "text-red-600" : "text-amber-600"
                        }`}>
                          <Calendar className="h-3 w-3" />Due: {formatDate(item.responseDeadLine)}
                        </span>
                      )}
                      {item.assignedToName && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <User className="h-3 w-3" />Assigned: {item.assignedToName}
                        </span>
                      )}
                    </div>
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <span key={tag} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                            <Tag className="h-2.5 w-2.5" />{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-xs text-gray-500 mt-2 italic">{item.notes}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(item.uiLink || `https://sam.gov/opp/${item.noticeId}/view`, "_blank")}
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />SAM.gov
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />Edit
                    </Button>
                    {isAdmin && (
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Solicitation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags <span className="text-gray-400 font-normal">(comma-separated)</span></Label>
              <Input
                className="mt-1"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="e.g. IT, NAICS 541511, Priority"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                className="mt-1"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={4}
                placeholder="Internal notes about this opportunity..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
