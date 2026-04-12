"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  ClipboardCheck, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  FileText,
  Target,
  Calendar,
  ChevronRight,
  Loader2
} from "lucide-react";
import { SystemAssessment, ControlAssessment, Finding, POAM } from "@/lib/types/cmmc";
import { NIST_CONTROLS, CONTROL_FAMILIES } from "@/lib/data/nist-controls";

interface DashboardStats {
  totalAssessments: number;
  activeAssessments: number;
  completedAssessments: number;
  totalControls: number;
  implementedControls: number;
  totalFindings: number;
  openFindings: number;
  totalPOAMs: number;
  openPOAMs: number;
  overallCompliance: number;
}

export default function CMMCDashboard() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<SystemAssessment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAssessments: 0,
    activeAssessments: 0,
    completedAssessments: 0,
    totalControls: 0,
    implementedControls: 0,
    totalFindings: 0,
    openFindings: 0,
    totalPOAMs: 0,
    openPOAMs: 0,
    overallCompliance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/cmmc/assessments");
      if (response.ok) {
        const data = await response.json();
        const assessmentsData = data.assessments || [];
        setAssessments(assessmentsData);
        
        // Calculate stats
        const active = assessmentsData.filter((a: SystemAssessment) => a.status === 'in_progress').length;
        const completed = assessmentsData.filter((a: SystemAssessment) => a.status === 'completed').length;
        
        setStats(prev => ({
          ...prev,
          totalAssessments: assessmentsData.length,
          activeAssessments: active,
          completedAssessments: completed,
        }));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a5f]">CMMC / NIST 800-171 Analyzer</h1>
          <p className="text-muted-foreground mt-1">
            Assess compliance with NIST SP 800-171 Rev 3 and CMMC requirements
          </p>
        </div>
        <Button
          onClick={() => router.push("/portal/cmmc/analyzer/new")}
          className="bg-[#C8A951] hover:bg-[#b89a42] text-[#1e3a5f]"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Assessment
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1e3a5f]">{stats.totalAssessments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeAssessments} active, {stats.completedAssessments} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Controls Implemented
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1e3a5f]">
              {stats.totalControls > 0 
                ? Math.round((stats.implementedControls / stats.totalControls) * 100) 
                : 0}%
            </div>
            <Progress 
              value={stats.totalControls > 0 ? (stats.implementedControls / stats.totalControls) * 100 : 0} 
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.openFindings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {stats.totalFindings} total findings
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
            <div className="text-3xl font-bold text-amber-600">{stats.openPOAMs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {stats.totalPOAMs} total POAMs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="assessments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="controls">Control Families</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="poams">POAMs</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-4">
          {assessments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Assessments Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your CMMC compliance journey by creating a new assessment
                </p>
                <Button
                  onClick={() => router.push("/portal/cmmc/analyzer/new")}
                  className="bg-[#C8A951] hover:bg-[#b89a42] text-[#1e3a5f]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assessment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {assessments.map((assessment) => (
                <Card 
                  key={assessment.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/portal/cmmc/analyzer/${assessment.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{assessment.name}</h3>
                          {getStatusBadge(assessment.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {assessment.organizationName || "No organization"} • {assessment.systemType}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Created {new Date(assessment.createdAt).toLocaleDateString()}
                          </span>
                          {assessment.targetLevel && (
                            <span className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              CMMC Level {assessment.targetLevel}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(CONTROL_FAMILIES).map(([family, name]) => {
              const familyControls = NIST_CONTROLS.filter(c => c.family === family);
              return (
                <Card 
                  key={family} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/portal/cmmc/analyzer/controls/${family.toLowerCase()}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{family} - {name}</CardTitle>
                      <Badge variant="outline">{familyControls.length} controls</Badge>
                    </div>
                    <CardDescription>
                      {familyControls[0]?.description?.substring(0, 100)}...
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">CMMC Level 1</span>
                        <span className="font-medium text-green-700">{familyControls.filter(c => c.cmmcLevel === 1).length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">CMMC Level 2</span>
                        <span className="font-medium text-blue-700">{familyControls.filter(c => c.cmmcLevel === 2).length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-700">CMMC Level 3</span>
                        <span className="font-medium text-purple-700">{familyControls.filter(c => c.cmmcLevel === 3).length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="findings" className="space-y-4">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Findings</h3>
              <p className="text-muted-foreground">
                Select an assessment to view its findings
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="poams" className="space-y-4">
          <Card>
            <CardContent className="p-12 text-center">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No POAMs</h3>
              <p className="text-muted-foreground">
                Select an assessment to view its POAMs
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
