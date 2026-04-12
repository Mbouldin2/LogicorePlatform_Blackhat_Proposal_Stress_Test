"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Save, Shield, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const steps = [
  { id: "basic", title: "Basic Information", description: "System name and organization" },
  { id: "system", title: "System Details", description: "System type and CUI handling" },
  { id: "contacts", title: "Key Contacts", description: "System owner and security officer" },
  { id: "review", title: "Review", description: "Review and create assessment" },
];

const cuiCategories = [
  "Defense Information (CDI/CTI)",
  "Export Controlled (ITAR/EAR)",
  "Critical Infrastructure",
  "Financial/Banking",
  "Healthcare/Privacy (HIPAA)",
  "Law Enforcement",
  "Immigration",
  "Proprietary Business Information",
];

export default function NewAssessmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    organizationName: "",
    systemOwner: "",
    systemOwnerEmail: "",
    securityOfficer: "",
    securityOfficerEmail: "",
    systemType: "",
    cloudProvider: "",
    handlesCUI: false,
    cuiCategories: [] as string[],
    networkDiagramAvailable: false,
    userCount: "",
    targetLevel: "2",
  });

  const updateFormData = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCUICategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      cuiCategories: prev.cuiCategories.includes(category)
        ? prev.cuiCategories.filter(c => c !== category)
        : [...prev.cuiCategories, category]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/cmmc/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userCount: parseInt(formData.userCount) || 0,
          targetLevel: parseInt(formData.targetLevel),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Assessment created successfully!");
        router.push(`/portal/cmmc/analyzer/${data.assessmentId}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create assessment");
      }
    } catch (error) {
      toast.error("An error occurred while creating the assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.name && formData.organizationName;
      case 1:
        return formData.systemType && (formData.handlesCUI ? formData.cuiCategories.length > 0 : true);
      case 2:
        return formData.systemOwner && formData.systemOwnerEmail;
      default:
        return true;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/portal/cmmc/analyzer")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-[#1e3a5f]">Create New Assessment</h1>
        <p className="text-muted-foreground mt-1">
          Set up a new CMMC / NIST 800-171 compliance assessment
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                index <= currentStep 
                  ? "bg-[#C8A951] text-[#1e3a5f]" 
                  : "bg-gray-200 text-gray-500"
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span className="font-semibold">{index + 1}</span>
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className={`text-sm font-medium ${
                  index <= currentStep ? "text-[#1e3a5f]" : "text-gray-500"
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  index < currentStep ? "bg-[#C8A951]" : "bg-gray-200"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Assessment Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Production System Assessment"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization Name *</Label>
                <Input
                  id="organization"
                  placeholder="e.g., Acme Corporation"
                  value={formData.organizationName}
                  onChange={(e) => updateFormData("organizationName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the system being assessed"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>System Type *</Label>
                <Select
                  value={formData.systemType}
                  onValueChange={(value) => updateFormData("systemType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select system type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on_premise">On-Premise Only</SelectItem>
                    <SelectItem value="cloud">Cloud Only</SelectItem>
                    <SelectItem value="hybrid">Hybrid (On-Premise + Cloud)</SelectItem>
                    <SelectItem value="contractor">Contractor/Third-Party Managed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.systemType === "cloud" || formData.systemType === "hybrid") && (
                <div className="space-y-2">
                  <Label>Cloud Provider</Label>
                  <Select
                    value={formData.cloudProvider}
                    onValueChange={(value) => updateFormData("cloudProvider", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cloud provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aws">AWS</SelectItem>
                      <SelectItem value="azure">Azure</SelectItem>
                      <SelectItem value="gcp">Google Cloud Platform</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Target CMMC Level</Label>
                <Select
                  value={formData.targetLevel}
                  onValueChange={(value) => updateFormData("targetLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1 - Basic Safeguarding</SelectItem>
                    <SelectItem value="2">Level 2 - DFARS Alignment</SelectItem>
                    <SelectItem value="3">Level 3 - Enhanced Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Approximate Number of Users</Label>
                <Input
                  type="number"
                  placeholder="e.g., 50"
                  value={formData.userCount}
                  onChange={(e) => updateFormData("userCount", e.target.value)}
                />
              </div>

              <div className="flex items-start space-x-3 pt-4">
                <Checkbox
                  id="handlesCUI"
                  checked={formData.handlesCUI}
                  onCheckedChange={(checked) => updateFormData("handlesCUI", checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="handlesCUI" className="font-medium">
                    System processes, stores, or transmits CUI
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Controlled Unclassified Information (CUI) requires NIST 800-171 compliance
                  </p>
                </div>
              </div>

              {formData.handlesCUI && (
                <div className="space-y-3 pl-6">
                  <Label>CUI Categories (select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {cuiCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={formData.cuiCategories.includes(category)}
                          onCheckedChange={() => toggleCUICategory(category)}
                        />
                        <Label htmlFor={category} className="text-sm font-normal">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3 pt-4">
                <Checkbox
                  id="networkDiagram"
                  checked={formData.networkDiagramAvailable}
                  onCheckedChange={(checked) => updateFormData("networkDiagramAvailable", checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="networkDiagram" className="font-medium">
                    Network diagram available
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Current network diagrams showing CUI boundaries exist
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemOwner">System Owner Name *</Label>
                <Input
                  id="systemOwner"
                  placeholder="e.g., John Smith"
                  value={formData.systemOwner}
                  onChange={(e) => updateFormData("systemOwner", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemOwnerEmail">System Owner Email *</Label>
                <Input
                  id="systemOwnerEmail"
                  type="email"
                  placeholder="e.g., owner@company.com"
                  value={formData.systemOwnerEmail}
                  onChange={(e) => updateFormData("systemOwnerEmail", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="securityOfficer">Security Officer Name</Label>
                <Input
                  id="securityOfficer"
                  placeholder="e.g., Jane Doe"
                  value={formData.securityOfficer}
                  onChange={(e) => updateFormData("securityOfficer", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="securityOfficerEmail">Security Officer Email</Label>
                <Input
                  id="securityOfficerEmail"
                  type="email"
                  placeholder="e.g., security@company.com"
                  value={formData.securityOfficerEmail}
                  onChange={(e) => updateFormData("securityOfficerEmail", e.target.value)}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Ready to Create Assessment</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      This will create a new assessment and initialize all {formData.targetLevel === "1" ? "17" : formData.targetLevel === "2" ? "110" : "110+"} controls for CMMC Level {formData.targetLevel}.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Assessment Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{formData.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Organization:</span>
                    <p className="font-medium">{formData.organizationName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">System Type:</span>
                    <p className="font-medium capitalize">{formData.systemType.replace("_", "-")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target Level:</span>
                    <p className="font-medium">CMMC Level {formData.targetLevel}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Handles CUI:</span>
                    <p className="font-medium">{formData.handlesCUI ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">System Owner:</span>
                    <p className="font-medium">{formData.systemOwner}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="bg-[#C8A951] hover:bg-[#b89a42] text-[#1e3a5f]"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#C8A951] hover:bg-[#b89a42] text-[#1e3a5f]"
          >
            {isSubmitting ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Assessment
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
