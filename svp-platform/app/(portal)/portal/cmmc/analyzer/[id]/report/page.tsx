"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Download,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Loader2,
  Printer,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { SystemAssessment, ControlAssessment, Finding, POAM } from "@/lib/types/cmmc";
import { NISTControl } from "@/lib/types/cmmc";
import { CONTROL_FAMILIES } from "@/lib/data/nist-controls";

interface ControlAssessmentWithDef extends ControlAssessment {
  controlDefinition?: NISTControl;
}

export default function ReportPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<SystemAssessment | null>(null);
  const [controlAssessments, setControlAssessments] = useState<ControlAssessmentWithDef[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [poams, setPoams] = useState<POAM[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, cRes, fRes, pRes] = await Promise.all([
          fetch(`/api/cmmc/assessments?id=${assessmentId}`),
          fetch(`/api/cmmc/controls?assessmentId=${assessmentId}`),
          fetch(`/api/cmmc/findings?assessmentId=${assessmentId}`),
          fetch(`/api/cmmc/poams?assessmentId=${assessmentId}`),
        ]);

        if (aRes.ok) setAssessment(await aRes.json());
        if (cRes.ok) {
          const d = await cRes.json();
          setControlAssessments(d.controlAssessments || []);
        }
        if (fRes.ok) {
          const d = await fRes.json();
          setFindings(d.findings || []);
        }
        if (pRes.ok) {
          const d = await pRes.json();
          setPoams(d.poams || []);
        }
      } catch (err) {
        console.error("Error loading report data:", err);
        toast.error("Failed to load report data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assessmentId]);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    toast.info("PDF export coming soon — use Print → Save as PDF for now.");
    handlePrint();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-[#C8A951]" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Assessment Not Found</h3>
            <Button onClick={() => router.push("/portal/cmmc/analyzer")}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Computed stats ──────────────────────────────────────────────────────────
  const applicable = controlAssessments.filter(c => c.isApplicable);
  const implemented = applicable.filter(c => c.status === "implemented");
  const partial = applicable.filter(c => c.status === "partially_implemented");
  const notImplemented = applicable.filter(c => c.status === "not_implemented");
  const notTested = applicable.filter(c => c.status === "not_tested");
  const complianceScore = applicable.length > 0
    ? Math.round((implemented.length / applicable.length) * 100)
    : 0;

  const criticalFindings = findings.filter(f => f.severity === "critical");
  const highFindings = findings.filter(f => f.severity === "high");
  const mediumFindings = findings.filter(f => f.severity === "medium");
  const lowFindings = findings.filter(f => f.severity === "low");

  const openPoams = poams.filter(p => p.status === "open" || p.status === "in_progress");
  const resolvedPoams = poams.filter(p => p.status === "resolved");

  // Controls by family
  const familyStats = Object.keys(CONTROL_FAMILIES).map(fam => {
    const famControls = controlAssessments.filter(c => c.controlId.startsWith(fam + "."));
    const famImplemented = famControls.filter(c => c.status === "implemented").length;
    const famApplicable = famControls.filter(c => c.isApplicable).length;
    return {
      family: fam,
      name: CONTROL_FAMILIES[fam as keyof typeof CONTROL_FAMILIES],
      total: famControls.length,
      applicable: famApplicable,
      implemented: famImplemented,
      score: famApplicable > 0 ? Math.round((famImplemented / famApplicable) * 100) : 0,
    };
  }).filter(f => f.total > 0);

  const scoreColor = complianceScore >= 80
    ? "text-green-600"
    : complianceScore >= 60
    ? "text-amber-600"
    : "text-red-600";

  const complianceLevel =
    complianceScore >= 90 ? "Level 3 Ready"
    : complianceScore >= 75 ? "Level 2 Ready"
    : complianceScore >= 50 ? "Level 1 Ready"
    : "Non-Compliant";

  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl print:p-4 print:space-y-4">
      {/* Header — hidden when printing */}
      <div className="print:hidden">
        <Button
          variant="ghost"
          onClick={() => router.push(`/portal/cmmc/analyzer/${assessmentId}`)}
          className="mb-2 -ml-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assessment
        </Button>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[#1e3a5f]">CMMC Assessment Report</h1>
            <p className="text-muted-foreground mt-1">{assessment.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              onClick={handleDownload}
              className="bg-[#C8A951] hover:bg-[#b89a42] text-[#1e3a5f]"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Report Cover */}
      <Card className="border-2 border-[#1e3a5f]">
        <CardContent className="p-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-8 w-8 text-[#C8A951]" />
                <span className="text-xl font-bold text-[#1e3a5f]">CMMC Assessment Report</span>
              </div>
              <h2 className="text-2xl font-bold">{assessment.name}</h2>
              <p className="text-muted-foreground">{assessment.organizationName}</p>
              <p className="text-sm text-muted-foreground">Report Date: {reportDate}</p>
              <p className="text-sm text-muted-foreground">
                Target Level: <span className="font-medium">CMMC Level {assessment.targetLevel}</span>
              </p>
            </div>
            <div className="text-center">
              <div className={`text-6xl font-bold ${scoreColor}`}>{complianceScore}%</div>
              <p className="text-sm text-muted-foreground mt-1">Compliance Score</p>
              <Badge
                className={`mt-2 ${
                  complianceScore >= 75
                    ? "bg-green-100 text-green-800"
                    : complianceScore >= 50
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {complianceLevel}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#C8A951]" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This report summarizes the CMMC (Cybersecurity Maturity Model Certification) assessment for{" "}
            <strong>{assessment.organizationName}</strong> targeting <strong>CMMC Level {assessment.targetLevel}</strong>.
            The assessment evaluated <strong>{applicable.length} applicable controls</strong> out of{" "}
            {controlAssessments.length} total controls assessed.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Implemented", value: implemented.length, color: "text-green-600", icon: CheckCircle },
              { label: "Partial", value: partial.length, color: "text-amber-600", icon: Clock },
              { label: "Not Implemented", value: notImplemented.length, color: "text-red-600", icon: XCircle },
              { label: "Not Tested", value: notTested.length, color: "text-gray-500", icon: Clock },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="text-center p-3 rounded-lg bg-gray-50">
                <Icon className={`h-6 w-6 mx-auto mb-1 ${color}`} />
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
          <Progress value={complianceScore} className="h-3" />
          <p className="text-xs text-muted-foreground text-right">{complianceScore}% of applicable controls implemented</p>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {[
              ["System Name", assessment.name],
              ["Organization", assessment.organizationName],
              ["System Owner", assessment.systemOwner],
              ["Owner Email", assessment.systemOwnerEmail],
              ["Security Officer", assessment.securityOfficer || "—"],
              ["System Type", assessment.systemType.replace("_", "-")],
              ["Cloud Provider", assessment.cloudProvider?.toUpperCase() || "—"],
              ["Handles CUI", assessment.handlesCUI ? "Yes" : "No"],
              ["Target CMMC Level", `Level ${assessment.targetLevel}`],
              ["Assessment Status", assessment.status.replace("_", " ")],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium capitalize">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Findings Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Findings Summary
          </CardTitle>
          <CardDescription>{findings.length} total findings identified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Critical", count: criticalFindings.length, color: "bg-red-600 text-white" },
              { label: "High", count: highFindings.length, color: "bg-red-500 text-white" },
              { label: "Medium", count: mediumFindings.length, color: "bg-amber-500 text-white" },
              { label: "Low", count: lowFindings.length, color: "bg-blue-500 text-white" },
            ].map(({ label, count, color }) => (
              <div key={label} className={`rounded-lg p-3 text-center ${color}`}>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs opacity-90">{label}</p>
              </div>
            ))}
          </div>

          {findings.length > 0 ? (
            <div className="space-y-2 mt-4">
              <h4 className="font-medium text-sm">Finding Details</h4>
              {findings.map(finding => (
                <div key={finding.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Badge
                    className={`flex-shrink-0 ${
                      finding.severity === "critical" ? "bg-red-600 text-white"
                      : finding.severity === "high" ? "bg-red-500 text-white"
                      : finding.severity === "medium" ? "bg-amber-500 text-white"
                      : "bg-blue-500 text-white"
                    }`}
                  >
                    {finding.severity}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{finding.title}</p>
                    <p className="text-xs text-muted-foreground">{finding.controlId} · {finding.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500" />
              <p>No findings identified</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controls by Family */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#C8A951]" />
            Controls by Family
          </CardTitle>
        </CardHeader>
        <CardContent>
          {familyStats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No control assessments recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {familyStats.map(f => (
                <div key={f.family} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {f.family} — {f.name}
                    </span>
                    <span className="text-muted-foreground">
                      {f.implemented}/{f.applicable} ({f.score}%)
                    </span>
                  </div>
                  <Progress value={f.score} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* POAMs Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#C8A951]" />
            Plans of Action &amp; Milestones (POAMs)
          </CardTitle>
          <CardDescription>
            {openPoams.length} open · {resolvedPoams.length} resolved · {poams.length} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {poams.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No POAMs created yet.</p>
          ) : (
            <div className="space-y-2">
              {poams.map(poam => (
                <div key={poam.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Badge
                    variant={poam.status === "resolved" ? "default" : "outline"}
                    className="flex-shrink-0 capitalize"
                  >
                    {poam.status.replace("_", " ")}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{poam.controlId}</p>
                    <p className="text-xs text-muted-foreground truncate">{poam.weaknessDescription}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(poam.scheduledCompletionDate).toLocaleDateString()} ·
                      Responsible: {poam.responsibleParty}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {notImplemented.length > 0 && (
            <div className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Address {notImplemented.length} unimplemented controls</p>
                <p className="text-red-700 text-xs mt-0.5">
                  Prioritize controls with associated critical or high findings first.
                </p>
              </div>
            </div>
          )}
          {partial.length > 0 && (
            <div className="flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Complete {partial.length} partially implemented controls</p>
                <p className="text-amber-700 text-xs mt-0.5">
                  Partial implementations may not satisfy CMMC assessment requirements.
                </p>
              </div>
            </div>
          )}
          {criticalFindings.length > 0 && (
            <div className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Remediate {criticalFindings.length} critical finding(s) immediately</p>
                <p className="text-red-700 text-xs mt-0.5">
                  Critical findings must be resolved before CMMC certification can be achieved.
                </p>
              </div>
            </div>
          )}
          {openPoams.length > 0 && (
            <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <Target className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Track {openPoams.length} open POAM(s) to completion</p>
                <p className="text-blue-700 text-xs mt-0.5">
                  Ensure all POAMs have realistic milestones and assigned responsible parties.
                </p>
              </div>
            </div>
          )}
          {complianceScore >= 90 && (
            <div className="flex gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Strong compliance posture — ready for formal assessment</p>
                <p className="text-green-700 text-xs mt-0.5">
                  Consider scheduling a C3PAO assessment to achieve CMMC certification.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <Separator />
      <p className="text-xs text-muted-foreground text-center pb-4">
        Generated by Strategic Value Plus CMMC Analyzer · {reportDate} · Confidential
      </p>
    </div>
  );
}
