"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  ClipboardCheck,
  FileText,
  Sparkles,
  Target,
  Calendar,
  Loader2,
  Edit,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { SystemAssessment, ControlAssessment, Finding, POAM } from "@/lib/types/cmmc";
import { NISTControl } from "@/lib/types/cmmc";

interface ControlAssessmentWithDef extends ControlAssessment {
  controlDefinition?: NISTControl;
}

export default function AssessmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<SystemAssessment | null>(null);
  const [controlAssessments, setControlAssessments] = useState<ControlAssessmentWithDef[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [poams, setPoams] = useState<POAM[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (assessmentId) {
      fetchAssessmentData();
    }
  }, [assessmentId]);

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      
      // Fetch assessment
      const assessmentRes = await fetch(`/api/cmmc/assessments?id=${assessmentId}`);
      if (assessmentRes.ok) {
        const data = await assessmentRes.json();
        setAssessment(data);
      }

      // Fetch controls
      const controlsRes = await fetch(`/api/cmmc/controls?assessmentId=${assessmentId}`);
      if (controlsRes.ok) {
        const data = await controlsRes.json();
        setControlAssessments(data.controlAssessments || []);
      }

      // Fetch findings
      const findingsRes = await fetch(`/api/cmmc/findings?assessmentId=${assessmentId}`);
      if (findingsRes.ok) {
        const data = await findingsRes.json();
        setFindings(data.findings || []);
      }

      // Fetch POAMs
      const poamsRes = await fetch(`/api/cmmc/poams?assessmentId=${assessmentId}`);
      if (poamsRes.ok) {
        const data = await poamsRes.json();
        setPoams(data.poams || []);
      }
    } catch (error) {
      console.error("Error fetching assessment data:", error);
      toast.error("Failed to load assessment data");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = controlAssessments.length;
    const applicable = controlAssessments.filter(c => c.isApplicable).length;
    const implemented = controlAssessments.filter(c => c.status === 'implemented').length;
    const partial = controlAssessments.filter(c => c.status === 'partially_implemented').length;
    const notImplemented = controlAssessments.filter(c => c.status === 'not_implemented').length;
    const notTested = controlAssessments.filter(c => c.status === 'not_tested').length;
    
    const complianceScore = applicable > 0 ? Math.round((implemented / applicable) * 100) : 0;

    return {
      total,
      applicable,
      implemented,
      partial,
      notImplemented,
      notTested,
      complianceScore,
      findings: findings.length,
      poams: poams.length,
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'implemented':
        return <Badge className="bg-green-100 text-green-800">Implemented</Badge>;
      case 'partially_implemented':
        return <Badge className="bg-amber-100 text-amber-800">Partial</Badge>;
      case 'not_implemented':
        return <Badge className="bg-red-100 text-red-800">Not Implemented</Badge>;
      case 'not_applicable':
        return <Badge variant="outline">Not Applicable</Badge>;
      default:
        return <Badge variant="outline">Not Tested</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-600 text-white">Critical</Badge>;
      case 'high':
        return <Badge className="bg-red-500 text-white">High</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500 text-white">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500 text-white">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const runPreAudit = async () => {
    try {
      const response = await fetch("/api/cmmc/ai?action=pre-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Pre-audit complete! Score: ${data.auditResult.overallScore}%`);
        // Refresh data
        fetchAssessmentData();
      } else {
        toast.error("Failed to run pre-audit");
      }
    } catch (error) {
      toast.error("An error occurred during pre-audit");
    }
  };

  const deleteAssessment = async () => {
    if (!confirm("Are you sure you want to delete this assessment? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/cmmc/assessments?id=${assessmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Assessment deleted successfully");
        router.push("/portal/cmmc/analyzer");
      } else {
        toast.error("Failed to delete assessment");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the assessment");
    }
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
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/portal/cmmc/analyzer")}
            className="mb-2 -ml-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-[#1e3a5f]">{assessment.name}</h1>
          <p className="text-muted-foreground mt-1">
            {assessment.organizationName} • {assessment.systemType} • CMMC Level {assessment.targetLevel}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={runPreAudit}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            AI Pre-Audit
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/portal/cmmc/analyzer/${assessmentId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={deleteAssessment}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stats.complianceScore >= 80 ? 'text-green-600' : stats.complianceScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
              {stats.complianceScore}%
            </div>
            <Progress value={stats.complianceScore} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Controls Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1e3a5f]">
              {stats.implemented}/{stats.applicable}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.partial} partial, {stats.notImplemented} not implemented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.findings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {findings.filter(f => f.severity === 'critical').length} critical, {findings.filter(f => f.severity === 'high').length} high
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open POAMs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {poams.filter(p => p.status === 'open' || p.status === 'in_progress').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              of {stats.poams} total POAMs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="controls">Controls ({stats.total})</TabsTrigger>
          <TabsTrigger value="findings">Findings ({stats.findings})</TabsTrigger>
          <TabsTrigger value="poams">POAMs ({stats.poams})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">System Owner</span>
                  <span className="font-medium">{assessment.systemOwner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner Email</span>
                  <span className="font-medium">{assessment.systemOwnerEmail}</span>
                </div>
                {assessment.securityOfficer && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Security Officer</span>
                    <span className="font-medium">{assessment.securityOfficer}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">System Type</span>
                  <span className="font-medium capitalize">{assessment.systemType.replace('_', '-')}</span>
                </div>
                {assessment.cloudProvider && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cloud Provider</span>
                    <span className="font-medium uppercase">{assessment.cloudProvider}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Handles CUI</span>
                  <span className="font-medium">{assessment.handlesCUI ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target CMMC Level</span>
                  <span className="font-medium">Level {assessment.targetLevel}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/portal/cmmc/analyzer/${assessmentId}/controls`)}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Review Controls
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/portal/cmmc/analyzer/${assessmentId}/questionnaire`)}
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Complete Questionnaire
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("findings")}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  View Findings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/portal/cmmc/analyzer/${assessmentId}/report`)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Control Assessment</CardTitle>
                  <CardDescription>
                    Review and assess {stats.total} controls
                  </CardDescription>
                </div>
                <Button
                  onClick={() => router.push(`/portal/cmmc/analyzer/${assessmentId}/controls`)}
                  className="bg-[#C8A951] hover:bg-[#b89a42] text-[#1e3a5f]"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Manage Controls
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {controlAssessments.slice(0, 10).map((control) => (
                  <div 
                    key={control.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{control.controlId}</span>
                        {getStatusBadge(control.status)}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {control.controlDefinition?.title || 'Unknown Control'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/portal/cmmc/analyzer/${assessmentId}/controls/${control.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {controlAssessments.length > 10 && (
                  <p className="text-center text-sm text-muted-foreground py-2">
                    And {controlAssessments.length - 10} more controls...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="findings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Security Findings</CardTitle>
                  <CardDescription>
                    Identified control deficiencies and gaps
                  </CardDescription>
                </div>
                <Button
                  onClick={() => router.push(`/portal/cmmc/analyzer/${assessmentId}/findings/new`)}
                  variant="outline"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Add Finding
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {findings.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-muted-foreground">No findings identified yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {findings.map((finding) => (
                    <div 
                      key={finding.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(finding.severity)}
                          <span className="font-medium text-sm">{finding.controlId}</span>
                        </div>
                        <p className="text-sm font-medium">{finding.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {finding.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/portal/cmmc/analyzer/${assessmentId}/findings/${finding.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="poams" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Plans of Action & Milestones (POAMs)</CardTitle>
                  <CardDescription>
                    Track remediation efforts for findings
                  </CardDescription>
                </div>
                <Button
                  onClick={() => router.push(`/portal/cmmc/analyzer/${assessmentId}/poams/new`)}
                  variant="outline"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Create POAM
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {poams.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No POAMs created yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {poams.map((poam) => (
                    <div 
                      key={poam.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant={poam.status === 'resolved' ? 'default' : 'outline'}>
                            {poam.status}
                          </Badge>
                          <span className="font-medium text-sm">{poam.controlId}</span>
                        </div>
                        <p className="text-sm font-medium truncate">{poam.weaknessDescription}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(poam.scheduledCompletionDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/portal/cmmc/analyzer/${assessmentId}/poams/${poam.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
