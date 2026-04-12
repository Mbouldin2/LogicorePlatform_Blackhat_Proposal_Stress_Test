"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  Users,
  ListTodo,
  HelpCircle,
  Search,
  BookOpen,
  Loader2,
  Link2
} from "lucide-react";
import { NIST_CONTROLS, CONTROL_FAMILIES } from "@/lib/data/nist-controls";
import { NISTControl } from "@/lib/types/cmmc";

export default function ControlDetailPage() {
  const router = useRouter();
  const params = useParams();
  const familyCode = (params.family as string).toUpperCase();
  const controlId = params.controlId as string;
  
  const [control, setControl] = useState<NISTControl | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Find the specific control
    const foundControl = NIST_CONTROLS.find(c => c.id === controlId && c.family === familyCode);
    
    if (foundControl) {
      setControl(foundControl);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  }, [controlId, familyCode]);

  const familyName = CONTROL_FAMILIES[familyCode as keyof typeof CONTROL_FAMILIES] || familyCode;

  const getLevelBadge = (level: number) => {
    switch (level) {
      case 1:
        return <Badge className="bg-green-100 text-green-800">Level 1</Badge>;
      case 2:
        return <Badge className="bg-blue-100 text-blue-800">Level 2</Badge>;
      case 3:
        return <Badge className="bg-purple-100 text-purple-800">Level 3</Badge>;
      default:
        return <Badge variant="outline">Level {level}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-[#C8A951]" />
      </div>
    );
  }

  if (notFound || !control) {
    return (
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/portal/cmmc/analyzer/controls/${familyCode.toLowerCase()}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {familyCode} Controls
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#1e3a5f] mb-2">Control Not Found</h1>
            <p className="text-muted-foreground">
              The control "{controlId}" was not found in the {familyCode} family.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push(`/portal/cmmc/analyzer/controls/${familyCode.toLowerCase()}`)}
            className="mb-2 -ml-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {familyCode} Controls
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-sm font-semibold text-[#1e3a5f] bg-gray-100 px-2 py-1 rounded">
              {control.number}
            </span>
            {getLevelBadge(control.cmmcLevel)}
          </div>
          <h1 className="text-3xl font-bold text-[#1e3a5f]">{control.title}</h1>
          <p className="text-muted-foreground mt-1">{familyName} Family</p>
        </div>
      </div>

      {/* Control ID Badge */}
      <Card className="bg-[#1e3a5f] text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80 mb-1">Control Identifier</p>
              <p className="text-2xl font-mono font-semibold">{control.id}</p>
            </div>
            <Shield className="h-10 w-10 opacity-50" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="related">Related</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#C8A951]" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{control.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#C8A951]" />
                Discussion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{control.discussion}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#C8A951]" />
                Assessment Objective
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{control.assessmentObjective}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#C8A951]" />
                Potential Assessors
              </CardTitle>
              <CardDescription>
                Personnel who may assess this control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {control.potentialAssessors.map((assessor, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#C8A951]" />
                    <span className="text-gray-700">{assessor}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-[#C8A951]" />
                Test Methods
              </CardTitle>
              <CardDescription>
                Methods used to test this control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {control.testMethods.map((method, index) => (
                  <Badge key={index} variant="outline" className="capitalize">
                    {method}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Examine:</strong> Review documentation, configurations, and artifacts<br />
                  <strong>Interview:</strong> Discuss with personnel to understand implementation<br />
                  <strong>Test:</strong> Perform technical verification of control implementation
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Artifacts Tab */}
        <TabsContent value="artifacts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#C8A951]" />
                Common Artifacts
              </CardTitle>
              <CardDescription>
                Documents and evidence typically reviewed for this control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {control.commonArtifacts.map((artifact, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-5 w-5 rounded-full bg-[#C8A951] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{artifact}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interviews Tab */}
        <TabsContent value="interviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[#C8A951]" />
                Interview Questions
              </CardTitle>
              <CardDescription>
                Questions assessors may ask when evaluating this control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {control.interviewQuestions.map((question, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 leading-relaxed">{question}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Related Tab */}
        <TabsContent value="related" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-[#C8A951]" />
                Related Controls
              </CardTitle>
              <CardDescription>
                Other NIST 800-171 controls related to this requirement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {control.relatedControls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {control.relatedControls.map((relatedId, index) => {
                    const relatedControl = NIST_CONTROLS.find(c => c.id === relatedId);
                    return (
                      <div 
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          const relatedFamily = relatedId.split('.')[0];
                          router.push(`/portal/cmmc/analyzer/controls/${relatedFamily.toLowerCase()}/${relatedId}`);
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-semibold text-[#1e3a5f]">
                            {relatedId}
                          </span>
                          {relatedControl && (
                            <Badge variant="outline" className="text-xs">
                              L{relatedControl.cmmcLevel}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {relatedControl?.title || 'View Control'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 italic">No related controls specified</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-[#C8A951]" />
                Control Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">Control Family</p>
                  <p className="font-semibold text-[#1e3a5f]">{control.family}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">Control Number</p>
                  <p className="font-semibold text-[#1e3a5f]">{control.number}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">CMMC Level</p>
                  <p className="font-semibold text-[#1e3a5f]">Level {control.cmmcLevel}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">NIST Level</p>
                  <p className="font-semibold text-[#1e3a5f]">Level {control.level}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
