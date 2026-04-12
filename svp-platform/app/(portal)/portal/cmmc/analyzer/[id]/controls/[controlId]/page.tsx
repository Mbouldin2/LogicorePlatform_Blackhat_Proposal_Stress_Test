"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  FileText,
  Users,
  Loader2,
  Save,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { ControlAssessment, ControlStatus } from "@/lib/types/cmmc";
import { NISTControl } from "@/lib/types/cmmc";

interface ControlAssessmentWithDef extends ControlAssessment {
  controlDefinition?: NISTControl;
}

const STATUS_OPTIONS: { value: ControlStatus; label: string; color: string }[] = [
  { value: "implemented", label: "Implemented", color: "text-green-600" },
  { value: "partially_implemented", label: "Partially Implemented", color: "text-amber-600" },
  { value: "not_implemented", label: "Not Implemented", color: "text-red-600" },
  { value: "not_applicable", label: "Not Applicable", color: "text-gray-500" },
  { value: "not_tested", label: "Not Tested", color: "text-gray-400" },
];

export default function ControlAssessmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;
  const controlDocId = params.controlId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [control, setControl] = useState<ControlAssessmentWithDef | null>(null);
  const [showDiscussion, setShowDiscussion] = useState(false);

  // Editable fields
  const [isApplicable, setIsApplicable] = useState(true);
  const [notApplicableReason, setNotApplicableReason] = useState("");
  const [status, setStatus] = useState<ControlStatus>("not_tested");
  const [implementationDescription, setImplementationDescription] = useState("");
  const [assessorNotes, setAssessorNotes] = useState("");
  const [artifactsReviewed, setArtifactsReviewed] = useState("");
  const [hasFinding, setHasFinding] = useState(false);
  const [findingSeverity, setFindingSeverity] = useState<"critical" | "high" | "medium" | "low">("medium");

  // Track original state to detect changes
  const [originalHasFinding, setOriginalHasFinding] = useState(false);
  const [existingFindingId, setExistingFindingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch by Firestore doc ID directly
        const res = await fetch(
          `/api/cmmc/controls/detail?assessmentId=${assessmentId}&docId=${controlDocId}`
        );
        if (res.ok) {
          const data = await res.json();
          setControl(data);
          setIsApplicable(data.isApplicable ?? true);
          setNotApplicableReason(data.notApplicableReason ?? "");
          setStatus(data.status ?? "not_tested");
          setImplementationDescription(data.implementationDescription ?? "");
          setAssessorNotes(data.assessorNotes ?? "");
          setArtifactsReviewed((data.artifactsReviewed ?? []).join("\n"));
          setHasFinding(data.hasFinding ?? false);
          setOriginalHasFinding(data.hasFinding ?? false);
          setExistingFindingId(data.findingId ?? null);
        } else {
          toast.error("Control assessment not found");
        }
      } catch (err) {
        console.error("Error loading control:", err);
        toast.error("Failed to load control assessment");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assessmentId, controlDocId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // ── 1. Handle Finding creation / deletion ──────────────────────────────
      let newFindingId = existingFindingId;

      if (hasFinding && !originalHasFinding) {
        // Toggle ON → create a Finding document
        const fRes = await fetch("/api/cmmc/findings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assessmentId,
            controlId: control?.controlId,
            controlAssessmentId: controlDocId,
            title: `Finding: ${control?.controlDefinition?.title ?? control?.controlId}`,
            description:
              implementationDescription ||
              `Control ${control?.controlId} has been flagged as a deficiency requiring remediation.`,
            severity: findingSeverity,
            identifiedBy: "Assessor",
          }),
        });
        if (fRes.ok) {
          const fData = await fRes.json();
          newFindingId = fData.findingId;
          setExistingFindingId(fData.findingId);
          setOriginalHasFinding(true);
        } else {
          toast.error("Failed to create finding");
          setSaving(false);
          return;
        }
      } else if (!hasFinding && originalHasFinding && existingFindingId) {
        // Toggle OFF → delete the existing Finding document
        const dRes = await fetch(`/api/cmmc/findings?id=${existingFindingId}`, {
          method: "DELETE",
        });
        if (dRes.ok) {
          newFindingId = null;
          setExistingFindingId(null);
          setOriginalHasFinding(false);
        } else {
          toast.error("Failed to remove finding");
          setSaving(false);
          return;
        }
      }

      // ── 2. Save the control assessment ────────────────────────────────────
      const res = await fetch("/api/cmmc/controls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          controlAssessmentId: controlDocId,
          isApplicable,
          notApplicableReason: isApplicable ? undefined : notApplicableReason,
          status,
          implementationDescription,
          assessorNotes,
          artifactsReviewed: artifactsReviewed
            .split("\n")
            .map(s => s.trim())
            .filter(Boolean),
          hasFinding,
          findingId: newFindingId ?? undefined,
        }),
      });

      if (res.ok) {
        toast.success("Control assessment saved");
      } else {
        toast.error("Failed to save control assessment");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (s: ControlStatus) => {
    switch (s) {
      case "implemented":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Implemented</Badge>;
      case "partially_implemented":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100"><Clock className="h-3 w-3 mr-1" />Partial</Badge>;
      case "not_implemented":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Not Implemented</Badge>;
      case "not_applicable":
        return <Badge variant="outline">Not Applicable</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Not Tested</Badge>;
    }
  };

  const getLevelBadge = (level?: number) => {
    switch (level) {
      case 1: return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Level 1</Badge>;
      case 2: return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Level 2</Badge>;
      case 3: return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Level 3</Badge>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-[#C8A951]" />
      </div>
    );
  }

  if (!control) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Control Assessment Not Found</h3>
            <Button onClick={() => router.push(`/portal/cmmc/analyzer/${assessmentId}/controls`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Controls
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const def = control.controlDefinition;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/portal/cmmc/analyzer/${assessmentId}/controls`)}
          className="mb-2 -ml-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Controls
        </Button>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-semibold text-[#1e3a5f]">{control.controlId}</span>
              {getLevelBadge(def?.cmmcLevel)}
              {getStatusBadge(status)}
            </div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">
              {def?.title || control.controlId}
            </h1>
          </div>
          <Button
            onClick={handleSave}
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
      </div>

      {/* Control Definition */}
      {def && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-[#C8A951]" />
              Control Requirement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">{def.description}</p>

            {/* Collapsible discussion */}
            <button
              onClick={() => setShowDiscussion(d => !d)}
              className="flex items-center gap-1 text-xs text-[#1e3a5f] font-medium hover:underline"
            >
              {showDiscussion ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showDiscussion ? "Hide" : "Show"} Discussion
            </button>
            {showDiscussion && (
              <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-[#C8A951] pl-3">
                {def.discussion}
              </p>
            )}

            {/* Assessment objective */}
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-800 mb-1">Assessment Objective</p>
              <p className="text-sm text-blue-700">{def.assessmentObjective}</p>
            </div>

            {/* Quick reference chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> Common Artifacts
                </p>
                <ul className="space-y-0.5">
                  {def.commonArtifacts.map(a => (
                    <li key={a} className="text-xs text-muted-foreground">• {a}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" /> Potential Assessors
                </p>
                <ul className="space-y-0.5">
                  {def.potentialAssessors.map(a => (
                    <li key={a} className="text-xs text-muted-foreground">• {a}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Interview Questions
                </p>
                <ul className="space-y-0.5">
                  {def.interviewQuestions.map(q => (
                    <li key={q} className="text-xs text-muted-foreground">• {q}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Related controls */}
            {def.relatedControls.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-muted-foreground mr-1">Related:</span>
                {def.relatedControls.map(r => (
                  <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assessment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assessment Details</CardTitle>
          <CardDescription>Record the implementation status and evidence for this control</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Applicability */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Applicable to this system?</Label>
              <p className="text-xs text-muted-foreground">
                Mark as not applicable if this control does not apply to your environment
              </p>
            </div>
            <Switch
              checked={isApplicable}
              onCheckedChange={setIsApplicable}
            />
          </div>

          {!isApplicable && (
            <div className="space-y-2">
              <Label htmlFor="na-reason" className="text-sm font-medium">
                Reason Not Applicable
              </Label>
              <Textarea
                id="na-reason"
                placeholder="Explain why this control is not applicable…"
                value={notApplicableReason}
                onChange={e => setNotApplicableReason(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Implementation Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Implementation Status</Label>
            <Select
              value={status}
              onValueChange={v => setStatus(v as ControlStatus)}
              disabled={!isApplicable}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status…" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className={opt.color}>{opt.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Implementation Description */}
          <div className="space-y-2">
            <Label htmlFor="impl-desc" className="text-sm font-medium">
              Implementation Description
            </Label>
            <p className="text-xs text-muted-foreground">
              Describe how this control is implemented in your environment
            </p>
            <Textarea
              id="impl-desc"
              placeholder="Describe the implementation…"
              value={implementationDescription}
              onChange={e => setImplementationDescription(e.target.value)}
              rows={4}
              disabled={!isApplicable}
            />
          </div>

          {/* Artifacts Reviewed */}
          <div className="space-y-2">
            <Label htmlFor="artifacts" className="text-sm font-medium">
              Artifacts Reviewed
            </Label>
            <p className="text-xs text-muted-foreground">
              List artifacts reviewed as evidence (one per line)
            </p>
            <Textarea
              id="artifacts"
              placeholder={`e.g.\nAccess Control Policy v2.1\nActive Directory Group Policy Screenshot\nUser Access Review Records`}
              value={artifactsReviewed}
              onChange={e => setArtifactsReviewed(e.target.value)}
              rows={4}
              disabled={!isApplicable}
            />
          </div>

          {/* Assessor Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Assessor Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Additional notes, observations, or recommendations…"
              value={assessorNotes}
              onChange={e => setAssessorNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Finding flag */}
          <div className="space-y-3 p-3 border rounded-lg bg-red-50 border-red-100">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-red-800">Flag as Finding</Label>
                <p className="text-xs text-red-700">
                  Mark this control as having a deficiency that requires a POAM
                </p>
              </div>
              <Switch
                checked={hasFinding}
                onCheckedChange={setHasFinding}
              />
            </div>
            {hasFinding && (
              <div className="space-y-1">
                <Label className="text-xs font-medium text-red-800">Finding Severity</Label>
                <Select
                  value={findingSeverity}
                  onValueChange={v => setFindingSeverity(v as typeof findingSeverity)}
                >
                  <SelectTrigger className="bg-white border-red-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical"><span className="text-red-700 font-medium">Critical</span></SelectItem>
                    <SelectItem value="high"><span className="text-red-500 font-medium">High</span></SelectItem>
                    <SelectItem value="medium"><span className="text-amber-600 font-medium">Medium</span></SelectItem>
                    <SelectItem value="low"><span className="text-blue-600 font-medium">Low</span></SelectItem>
                  </SelectContent>
                </Select>
                {existingFindingId && originalHasFinding && (
                  <p className="text-xs text-red-600 mt-1">
                    ✓ Finding already recorded — toggle off and save to remove it.
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions (if present) */}
      {(control.aiSuggestedResponse || (control.aiRecommendations && control.aiRecommendations.length > 0)) && (
        <Card className="border-[#C8A951] border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-[#C8A951]">✦</span> AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {control.aiSuggestedResponse && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Suggested Response</p>
                <p className="text-sm text-muted-foreground">{control.aiSuggestedResponse}</p>
              </div>
            )}
            {control.aiRecommendations && control.aiRecommendations.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Recommendations</p>
                <ul className="space-y-1">
                  {control.aiRecommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bottom save */}
      <div className="flex justify-end pb-6">
        <Button
          onClick={handleSave}
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
    </div>
  );
}
