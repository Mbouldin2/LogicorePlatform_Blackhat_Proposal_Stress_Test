"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Plus,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Trash2,
  Edit,
  Eye,
  MoreVertical,
  Video,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WebinarDoc, WebinarListItem } from "@/lib/types/webinar";
import { getDefaultWebinar } from "@/lib/types/webinar";
import { WizardStepper, WIZARD_STEPS } from "./components/WizardStepper";
import { BasicInfoStep } from "./components/BasicInfoStep";
import { LandingPageStep } from "./components/LandingPageStep";
import { ConfirmationPageStep } from "./components/ConfirmationPageStep";
import { GHLIntegrationStep } from "./components/GHLIntegrationStep";
import { PreviewPublishStep } from "./components/PreviewPublishStep";

export default function WebinarCreatorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [webinars, setWebinars] = useState<WebinarListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [webinar, setWebinar] = useState<Partial<WebinarDoc>>({});
  const [webinarId, setWebinarId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    fetchWebinars();
  }, []);

  useEffect(() => {
    if (editId) {
      loadWebinar(editId);
    }
  }, [editId]);

  const fetchWebinars = async () => {
    try {
      const response = await fetch("/api/admin/webinars");
      const result = await response.json();
      if (result.data) {
        setWebinars(result.data);
      }
    } catch (error) {
      console.error("Error fetching webinars:", error);
      toast.error("Failed to load webinars");
    } finally {
      setLoading(false);
    }
  };

  const loadWebinar = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/webinars/${id}`);
      const result = await response.json();
      if (result.data) {
        setWebinar(result.data);
        setWebinarId(id);
        setShowWizard(true);
      } else {
        toast.error("Webinar not found");
      }
    } catch (error) {
      console.error("Error loading webinar:", error);
      toast.error("Failed to load webinar");
    } finally {
      setLoading(false);
    }
  };

  const createNewWebinar = async () => {
    if (!newTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/admin/webinars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          shortDescription: newDescription,
        }),
      });

      const result = await response.json();

      if (response.ok && result.data) {
        setWebinar(result.data);
        setWebinarId(result.data.id);
        setShowNewDialog(false);
        setShowWizard(true);
        setNewTitle("");
        setNewDescription("");
        toast.success("Webinar created!");
        fetchWebinars();
      } else {
        toast.error(result.error || "Failed to create webinar");
      }
    } catch (error) {
      console.error("Error creating webinar:", error);
      toast.error("Failed to create webinar");
    } finally {
      setCreating(false);
    }
  };

  const saveWebinar = async () => {
    if (!webinarId) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/webinars/${webinarId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webinar),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Webinar saved!");
        fetchWebinars();
      } else {
        toast.error(result.error || "Failed to save webinar");
      }
    } catch (error) {
      console.error("Error saving webinar:", error);
      toast.error("Failed to save webinar");
    } finally {
      setIsSaving(false);
    }
  };

  const publishWebinar = async (scheduledAt?: string) => {
    if (!webinarId) return;

    setIsPublishing(true);
    try {
      const response = await fetch(`/api/admin/webinars/${webinarId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduledAt ? { scheduledAt } : {}),
      });

      const result = await response.json();

      if (response.ok && result.data?.success) {
        const newStatus = scheduledAt ? "scheduled" : "published";
        setWebinar((prev) => ({ ...prev, status: newStatus }));
        toast.success(scheduledAt ? "Webinar scheduled!" : "Webinar published!");
        fetchWebinars();
      } else {
        toast.error(result.error || "Failed to publish webinar");
      }
    } catch (error) {
      console.error("Error publishing webinar:", error);
      toast.error("Failed to publish webinar");
    } finally {
      setIsPublishing(false);
    }
  };

  const deleteWebinar = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webinar?")) return;

    try {
      const response = await fetch(`/api/admin/webinars/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Webinar deleted");
        fetchWebinars();
      } else {
        toast.error("Failed to delete webinar");
      }
    } catch (error) {
      console.error("Error deleting webinar:", error);
      toast.error("Failed to delete webinar");
    }
  };

  const updateWebinar = (updates: Partial<WebinarDoc>) => {
    setWebinar((prev) => ({ ...prev, ...updates }));
  };

  const goToStep = (step: number) => {
    if (step < 1 || step > WIZARD_STEPS.length) return;
    
    // Mark current step as completed when moving forward
    if (step > currentStep && !completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }
    
    setCurrentStep(step);
  };

  const closeWizard = () => {
    setShowWizard(false);
    setWebinar({});
    setWebinarId(null);
    setCurrentStep(1);
    setCompletedSteps([]);
    router.push("/portal/admin/webinar-creator");
  };

  if (loading && !showWizard) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showWizard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={closeWizard}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {webinar.title || "New Webinar"}
              </h1>
              <p className="text-muted-foreground">
                Step {currentStep} of {WIZARD_STEPS.length}
              </p>
            </div>
          </div>
          <Badge variant={webinar.status === "published" ? "default" : "outline"}>
            {webinar.status || "draft"}
          </Badge>
        </div>

        <Card>
          <CardContent className="pt-6">
            <WizardStepper
              steps={WIZARD_STEPS}
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={goToStep}
            />
          </CardContent>
        </Card>

        <ScrollArea className="h-[calc(100vh-320px)]">
          {currentStep === 1 && (
            <BasicInfoStep webinar={webinar} onChange={updateWebinar} />
          )}
          {currentStep === 2 && (
            <LandingPageStep webinar={webinar} onChange={updateWebinar} />
          )}
          {currentStep === 3 && (
            <ConfirmationPageStep webinar={webinar} onChange={updateWebinar} />
          )}
          {currentStep === 4 && (
            <GHLIntegrationStep webinar={webinar} onChange={updateWebinar} />
          )}
          {currentStep === 5 && (
            <PreviewPublishStep
              webinar={webinar}
              onChange={updateWebinar}
              onSave={saveWebinar}
              onPublish={publishWebinar}
              isSaving={isSaving}
              isPublishing={isPublishing}
            />
          )}
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => goToStep(currentStep - 1)}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={saveWebinar} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Save Draft
            </Button>

            {currentStep < WIZARD_STEPS.length ? (
              <Button onClick={() => goToStep(currentStep + 1)}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={() => publishWebinar()} disabled={isPublishing}>
                {isPublishing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Publish
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            Webinar Creator
          </h1>
          <p className="text-muted-foreground">
            Create and manage webinar landing pages
          </p>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Webinar
        </Button>
      </div>

      {webinars.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No webinars yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first webinar landing page
            </p>
            <Button onClick={() => setShowNewDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Webinar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {webinars.map((item) => (
            <Card key={item.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{item.title}</h3>
                      <Badge
                        variant={
                          item.status === "published"
                            ? "default"
                            : item.status === "scheduled"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      /webinars/{item.slug}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created: {new Date(item.createdAt).toLocaleDateString()}
                      {item.publishedAt && (
                        <> • Published: {new Date(item.publishedAt).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        router.push(`/portal/admin/webinar-creator?id=${item.id}`);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {item.status === "published" && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`/webinars/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteWebinar(item.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Webinar</DialogTitle>
            <DialogDescription>
              Enter a title to get started with your new webinar landing page
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Webinar Title *</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., CMMC Cybersecurity Training"
                onKeyDown={(e) => e.key === "Enter" && createNewWebinar()}
              />
            </div>
            <div className="space-y-2">
              <Label>Short Description</Label>
              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Brief description for SEO..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createNewWebinar} disabled={creating || !newTitle.trim()}>
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Webinar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
