"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { toast } from "sonner";
import { NIST_CONTROLS } from "@/lib/data/nist-controls";

export default function NewFindingPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [saving, setSaving] = useState(false);
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
        const res = await fetch(`/api/cmmc/assessments?id=${assessmentId}`);
        if (res.ok) {
          const d = await res.json();
          setAssessmentName(d.name || "Assessment");
        }
      } catch (err) {
        console.error("Error loading assessment:", err);
      }
    };
    load();
  }, [assessmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!controlId.trim()) {
      toast.error("Control ID is required");
      return;
    }
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/cmmc/findings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          controlId: controlId.trim(),
          controlAssessmentId: "",
          title: title.trim(),
          description: description.trim(),
          severity,
          rootCause: rootCause.trim(),
          affectedAssets: affectedAssets
            .split("\n")
            .map(s => s.trim())
            .filter(Boolean),
          identifiedBy: "Assessor",
        }),
      });

      if (res.ok) {
        toast.success("Finding created successfully");
        router.push(`/portal/cmmc/analyzer/${assessmentId}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create finding");
      }
    } catch (err) {
      console.error("Error creating finding:", err);
      toast.error("An error occurred while creating the finding");
    } finally {
      setSaving(false);
    }
  };

  const severityColors: Record<string, string> = {
    critical: "text-red-700 font-semibold",
    high: "text-red-500 font-semibold",
    medium: "text-amber-600 font-semibold",
    low: "text-blue-600 font-semibold",
  };

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
        <h1 className="text-3xl font-bold text-[#1e3a5f]">Add Finding</h1>
        <p className="text-muted-foreground mt-1">{assessmentName}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Finding Details
            </CardTitle>
            <CardDescription>
              Document a control deficiency or security gap identified during assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Control ID */}
            <div className="space-y-2">
              <Label htmlFor="controlId" className="text-sm font-medium">
                Control ID <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                The NIST control this finding is associated with (e.g. AC.L2-3.1.1)
              </p>
              <Input
                id="controlId"
                list="control-list"
                placeholder="e.g. AC.L2-3.1.1"
                value={controlId}
                onChange={e => setControlId(e.target.value)}
                required
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
              <Label className="text-sm font-medium">
                Severity <span className="text-red-500">*</span>
              </Label>
              <Select
                value={severity}
                onValueChange={v => setSeverity(v as typeof severity)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">
                    <span className={severityColors.critical}>Critical</span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className={severityColors.high}>High</span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className={severityColors.medium}>Medium</span>
                  </SelectItem>
                  <SelectItem value="low">
                    <span className={severityColors.low}>Low</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <p className="text-xs text-muted-foreground">
                Detailed description of the deficiency observed
              </p>
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
              <Label htmlFor="rootCause" className="text-sm font-medium">
                Root Cause
              </Label>
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
              <p className="text-xs text-muted-foreground">
                List affected systems, applications, or components (one per line)
              </p>
              <Textarea
                id="affectedAssets"
                placeholder={`e.g.\nActive Directory\nVPN Gateway\nFile Server FS-01`}
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
            Create Finding
          </Button>
        </div>
      </form>
    </div>
  );
}
