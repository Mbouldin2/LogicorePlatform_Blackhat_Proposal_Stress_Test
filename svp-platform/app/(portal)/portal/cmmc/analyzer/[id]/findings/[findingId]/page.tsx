"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  AlertTriangle,
  Save,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Finding } from "@/lib/types/cmmc";
import { NIST_CONTROLS } from "@/lib/data/nist-controls";

export default function EditFindingPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;
  const findingId = params.findingId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assessmentName, setAssessmentName] = useState("");

  // Form fields
  const [controlId, setControlId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"critical" | "high" | "medium" | "low">("medium");
  const [rootCause, setRootCause] = useState("");
  const [affectedAssets, setAffectedAssets] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, fRes] = await Promise.all([
          fetch(`/api/cmmc/assessments?id=${assessmentId}`),
          fetch(`/api/cmmc/findings?id=${findingId}`),
        ]);

        if (aRes.ok) {
          const d = await aRes.json();
          setAssessmentName(d.name || "Assessment");
        }

        if (fRes.ok) {
          const d: Finding & { id: string } = await fRes.json();
          setControlId(d.controlId ?? "");
          setTitle(d.title ?? "");
          setDescription(d.description ?? "");
          setSeverity((d.severity as typeof severity) ?? "medium");
          setRootCause(d.rootCause ?? "");
          setAffectedAssets((d.affectedAssets ?? []).join("\n"));
        } else {
          toast.error("Finding not found");
          router.push(`/portal/cmmc/analyzer/${assessmentId}`);
        }
      } catch (err) {
        console.error("Error loading finding:", err);
        toast.error("Failed to load finding");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assessmentId, findingId, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/cmmc/findings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          findingId,
          controlId: controlId.trim(),
          title: title.trim(),
          description: description.trim(),
          severity,
          rootCause: rootCause.trim(),
          affectedAssets: affectedAssets
            .split("\n")
            .map(s => s.trim())
            .filter(Boolean),
        }),
      });

      if (res.ok) {
        toast.success("Finding updated successfully");
        router.push(`/portal/cmmc/analyzer/${assessmentId}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update finding");
      }
    } catch (err) {
      console.error("Error updating finding:", err);
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this finding? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/cmmc/findings?id=${findingId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Finding deleted");
        router.push(`/portal/cmmc/analyzer/${assessmentId}`);
      } else {
        toast.error("Failed to delete finding");
      }
    } catch (err) {
      console.error("Error deleting finding:", err);
      toast.error("An error occurred while deleting");
    } finally {
      setDeleting(false);
    }
  };

  const severityBadge = (s: string) => {
    switch (s) {
      case "critical": return <Badge className="bg-red-600 text-white">Critical</Badge>;
      case "high":     return <Badge className="bg-red-500 text-white">High</Badge>;
      case "medium":   return <Badge className="bg-amber-500 text-white">Medium</Badge>;
      case "low":      return <Badge className="bg-blue-500 text-white">Low</Badge>;
      default:         return <Badge variant="outline">{s}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-[#C8A951]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/portal/cmmc/analyzer/${assessmentId}`)}
          className="mb-2 -ml-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assessment
        </Button>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">{controlId}</span>
              {severityBadge(severity)}
            </div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">Edit Finding</h1>
            <p className="text-muted-foreground text-sm">{assessmentName}</p>
          </div>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            size="sm"
          >
            {deleting
              ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              : <Trash2 className="h-4 w-4 mr-2" />
            }
            Delete Finding
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Finding Details
            </CardTitle>
            <CardDescription>
              Update the details of this security finding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Control ID */}
            <div className="space-y-2">
              <Label htmlFor="controlId" className="text-sm font-medium">
                Control ID
              </Label>
              <Input
                id="controlId"
                list="control-list"
                placeholder="e.g. AC.L2-3.1.1"
                value={controlId}
                onChange={e => setControlId(e.target.value)}
              />
              <datalist id="control-list">
                {NIST_CONTROLS.map(c => (
                  <option key={c.id} value={c.id}>{c.id} — {c.title}</option>
                ))}
              </datalist>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Finding Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Brief description of the finding…"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Severity</Label>
              <Select
                value={severity}
                onValueChange={v => setSeverity(v as typeof severity)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical"><span className="text-red-700 font-semibold">Critical</span></SelectItem>
                  <SelectItem value="high"><span className="text-red-500 font-semibold">High</span></SelectItem>
                  <SelectItem value="medium"><span className="text-amber-600 font-semibold">Medium</span></SelectItem>
                  <SelectItem value="low"><span className="text-blue-600 font-semibold">Low</span></SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the finding in detail…"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Root Cause */}
            <div className="space-y-2">
              <Label htmlFor="rootCause" className="text-sm font-medium">Root Cause</Label>
              <Textarea
                id="rootCause"
                placeholder="What is the underlying cause of this deficiency?"
                value={rootCause}
                onChange={e => setRootCause(e.target.value)}
                rows={3}
              />
            </div>

            {/* Affected Assets */}
            <div className="space-y-2">
              <Label htmlFor="affectedAssets" className="text-sm font-medium">
                Affected Assets
              </Label>
              <p className="text-xs text-muted-foreground">One per line</p>
              <Textarea
                id="affectedAssets"
                placeholder={`e.g.\nActive Directory\nVPN Gateway`}
                value={affectedAssets}
                onChange={e => setAffectedAssets(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/portal/cmmc/analyzer/${assessmentId}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#C8A951] hover:bg-[#b89a42] text-[#1e3a5f]"
          >
            {saving
              ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              : <Save className="h-4 w-4 mr-2" />
            }
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
