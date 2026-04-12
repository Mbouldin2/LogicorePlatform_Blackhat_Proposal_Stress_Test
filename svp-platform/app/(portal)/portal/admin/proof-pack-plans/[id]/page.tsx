"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Save,
  MoreHorizontal,
  Phone,
  Mail,
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  User,
  MessageSquare,
  Check,
  X,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ProofPackPlanDoc,
  ProofPackTask,
  FollowUpEntry,
  ProofPackStatus,
  TaskStatus,
  TaskPriority,
} from "@/lib/types/proofPackPlan";
import {
  formatStatusLabel,
  getStatusBadgeVariant,
  getTaskStatusColor,
  getPriorityColor,
  PROOF_PACK_STATUSES,
  TASK_STATUSES,
  TASK_PRIORITIES,
} from "@/lib/types/proofPackPlan";

// Deliverable types for Proof Pack
const DELIVERABLE_TYPES = [
  "Gap Analysis",
  "Readiness Audit",
  "Implementation Roadmap",
  "Training Plan",
  "Documentation Review",
  "Process Assessment",
  "Compliance Check",
  "Supplier Evaluation",
  "Risk Assessment",
  "Quality Review",
];

export default function ProofPackPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;

  const [plan, setPlan] = useState<Partial<ProofPackPlanDoc> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Task management state
  const [tasks, setTasks] = useState<ProofPackTask[]>([]);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ProofPackTask | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  // Follow-up state
  const [followUps, setFollowUps] = useState<FollowUpEntry[]>([]);
  const [newFollowUp, setNewFollowUp] = useState({ type: "note" as const, content: "" });
  const [isAddingFollowUp, setIsAddingFollowUp] = useState(false);

  // Form state for editing plan
  const [editedPlan, setEditedPlan] = useState<Partial<ProofPackPlanDoc>>({});

  // Fetch plan details
  useEffect(() => {
    const fetchPlan = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/proof-pack-plans/${planId}`);
        if (response.ok) {
          const result = await response.json();
          setPlan(result.data);
          setEditedPlan(result.data);
          setTasks(result.data.tasks || []);
          setFollowUps(result.data.followUps || []);
        } else {
          console.error("Failed to fetch plan");
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  const handleSavePlan = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/proof-pack-plans/${planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editedPlan.status,
          priority: editedPlan.priority,
          assignedTo: editedPlan.assignedTo,
          assignedToName: editedPlan.assignedToName,
          tags: editedPlan.tags,
          estimatedValue: editedPlan.estimatedValue,
          nextFollowUpDate: editedPlan.nextFollowUpDate,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPlan(result.data);
      }
    } catch (error) {
      console.error("Error saving plan:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateTask = async (taskData: Partial<ProofPackTask>) => {
    try {
      const response = await fetch(`/api/admin/proof-pack-plans/${planId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const result = await response.json();
        setTasks((prev) => [...prev, result.data]);
        setIsTaskDialogOpen(false);
        setEditingTask(null);
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<ProofPackTask>) => {
    try {
      const response = await fetch(`/api/admin/proof-pack-plans/${planId}/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const result = await response.json();
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? result.data : t))
        );
        setIsTaskDialogOpen(false);
        setEditingTask(null);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setIsDeletingTask(true);
    try {
      const response = await fetch(`/api/admin/proof-pack-plans/${planId}/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleAddFollowUp = async () => {
    if (!newFollowUp.content.trim()) return;

    setIsAddingFollowUp(true);
    try {
      const response = await fetch(`/api/admin/proof-pack-plans/${planId}/follow-ups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newFollowUp.type,
          content: newFollowUp.content,
          newStatus: editedPlan.status !== plan?.status ? editedPlan.status : undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setFollowUps((prev) => [result.data, ...prev]);
        setNewFollowUp({ type: "note", content: "" });
        // Update plan status if changed
        if (editedPlan.status !== plan?.status) {
          setPlan((prev) => (prev ? { ...prev, status: editedPlan.status } : null));
        }
      }
    } catch (error) {
      console.error("Error adding follow-up:", error);
    } finally {
      setIsAddingFollowUp(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const formatDate = (date: Date | string | { toDate: () => Date } | null | undefined) => {
    if (!date) return "-";
    const d = typeof date === "object" && "toDate" in date ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Plan Not Found</h2>
            <p className="text-muted-foreground mt-2">
              The Proof Pack Plan you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button className="mt-4" onClick={() => router.push("/portal/admin/proof-pack-plans")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/portal/admin/proof-pack-plans")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {plan.contact?.firstName} {plan.contact?.lastName}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Building2 className="h-4 w-4" />
              {plan.contact?.company || "No company"}
              <span className="mx-2">•</span>
              <Badge variant={getStatusBadgeVariant(plan.status as ProofPackStatus)}>
                {formatStatusLabel(plan.status || "new")}
              </Badge>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSavePlan} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {getInitials(plan.contact?.firstName, plan.contact?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {plan.contact?.firstName} {plan.contact?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{plan.contact?.title}</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${plan.contact?.email}`} className="text-primary hover:underline">
                      {plan.contact?.email}
                    </a>
                  </div>
                  {plan.contact?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${plan.contact?.phone}`} className="text-primary hover:underline">
                        {plan.contact?.phone}
                      </a>
                    </div>
                  )}
                  {plan.contact?.linkedInUrl && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={plan.contact?.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
                {plan.address && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p>{plan.address?.street}</p>
                        <p>
                          {plan.address?.city}, {plan.address?.state} {plan.address?.zipCode}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Plan Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Plan Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Plan Type</Label>
                    <p className="font-medium">{plan.plan?.planType || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Industry</Label>
                    <p className="font-medium">{plan.plan?.industry || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Company Size</Label>
                    <p className="font-medium">{plan.plan?.companySize || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Budget Range</Label>
                    <p className="font-medium">{plan.plan?.budgetRange || "-"}</p>
                  </div>
                </div>
                <Separator />
                {plan.plan?.requirements && plan.plan.requirements.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Requirements</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {plan.plan.requirements.map((req, i) => (
                        <Badge key={i} variant="secondary">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {plan.plan?.challenges && (
                  <div>
                    <Label className="text-muted-foreground">Challenges</Label>
                    <p className="text-sm mt-1">{plan.plan.challenges}</p>
                  </div>
                )}
                {plan.plan?.goals && (
                  <div>
                    <Label className="text-muted-foreground">Goals</Label>
                    <p className="text-sm mt-1">{plan.plan.goals}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status & Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Status & Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editedPlan.status || "new"}
                    onValueChange={(v) =>
                      setEditedPlan((prev) => ({ ...prev, status: v as ProofPackStatus }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROOF_PACK_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {formatStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={editedPlan.priority || "medium"}
                    onValueChange={(v) =>
                      setEditedPlan((prev) => ({ ...prev, priority: v as "low" | "medium" | "high" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assigned To</Label>
                  <Input
                    placeholder="Team member name"
                    value={editedPlan.assignedToName || ""}
                    onChange={(e) =>
                      setEditedPlan((prev) => ({ ...prev, assignedToName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Value</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={editedPlan.estimatedValue || ""}
                    onChange={(e) =>
                      setEditedPlan((prev) => ({
                        ...prev,
                        estimatedValue: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Next Follow-up</Label>
                  <Input
                    type="date"
                    value={
                      editedPlan.nextFollowUpDate
                        ? new Date(editedPlan.nextFollowUpDate.toDate()).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setEditedPlan((prev) => ({
                        ...prev,
                        nextFollowUpDate: e.target.value ? Timestamp.fromDate(new Date(e.target.value)) : undefined,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Task Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Task Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      {plan.taskCount?.completed || 0} of {plan.taskCount?.total || 0} tasks completed
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {plan.taskCount?.total
                        ? Math.round(((plan.taskCount?.completed || 0) / plan.taskCount?.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${
                          plan.taskCount?.total
                            ? ((plan.taskCount?.completed || 0) / plan.taskCount?.total) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span>{plan.taskCount?.pending || 0} Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>{plan.taskCount?.inProgress || 0} In Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>{plan.taskCount?.completed || 0} Completed</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Deliverable Tasks</CardTitle>
                <CardDescription>Track and manage Proof Pack deliverables</CardDescription>
              </div>
              <Button
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No tasks yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add tasks to track deliverables for this Proof Pack project
                  </p>
                  <Button
                    onClick={() => {
                      setEditingTask(null);
                      setIsTaskDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{task.title}</h4>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  getTaskStatusColor(task.status as TaskStatus).replace("bg-", "border-")
                                )}
                              >
                                {formatStatusLabel(task.status)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {task.priority}
                              </Badge>
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              {task.deliverableType && (
                                <Badge variant="secondary" className="text-xs">
                                  {task.deliverableType}
                                </Badge>
                              )}
                              {task.assignedToName && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {task.assignedToName}
                                </span>
                              )}
                              {task.dueDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Due {formatDate(task.dueDate)}
                                </span>
                              )}
                              {task.estimatedHours !== undefined && task.estimatedHours > 0 && (
                                <span>{task.estimatedHours}h estimated</span>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingTask(task);
                                  setIsTaskDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateTask(task.id, {
                                    status: task.status === "completed" ? "pending" : "completed",
                                  })
                                }
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                {task.status === "completed" ? "Mark Incomplete" : "Mark Complete"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteTask(task.id)}
                                disabled={isDeletingTask}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {task.notes && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <span className="font-medium">Notes:</span> {task.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow-ups Tab */}
        <TabsContent value="followups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Follow-up History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Follow-up */}
              <div className="p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium mb-3">Add Follow-up Entry</h4>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Select
                      value={newFollowUp.type}
                      onValueChange={(v) =>
                        setNewFollowUp((prev) => ({ ...prev, type: v as typeof prev.type }))
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                        <SelectItem value="status_change">Status Change</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder="Enter follow-up notes..."
                    value={newFollowUp.content}
                    onChange={(e) =>
                      setNewFollowUp((prev) => ({ ...prev, content: e.target.value }))
                    }
                    rows={3}
                  />
                  <Button
                    onClick={handleAddFollowUp}
                    disabled={!newFollowUp.content.trim() || isAddingFollowUp}
                  >
                    {isAddingFollowUp ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add Entry
                  </Button>
                </div>
              </div>

              {/* Follow-up Timeline */}
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {followUps.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No follow-up entries yet</p>
                    </div>
                  ) : (
                    followUps.map((entry, index) => (
                      <div key={entry.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              entry.type === "email"
                                ? "bg-blue-100 text-blue-600"
                                : entry.type === "call"
                                ? "bg-green-100 text-green-600"
                                : entry.type === "meeting"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-gray-100 text-gray-600"
                            )}
                          >
                            {entry.type === "email" && <Mail className="h-4 w-4" />}
                            {entry.type === "call" && <Phone className="h-4 w-4" />}
                            {entry.type === "meeting" && <Calendar className="h-4 w-4" />}
                            {entry.type === "note" && <MessageSquare className="h-4 w-4" />}
                            {entry.type === "status_change" && <CheckCircle2 className="h-4 w-4" />}
                          </div>
                          {index < followUps.length - 1 && (
                            <div className="w-0.5 flex-1 bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium capitalize">{entry.type.replace("_", " ")}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(entry.date)}
                            </span>
                          </div>
                          <p className="text-sm">{entry.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            by {entry.createdByName}
                          </p>
                          {entry.newStatus && (
                            <Badge variant="outline" className="mt-2">
                              Status changed to: {formatStatusLabel(entry.newStatus)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API & Source Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">API Endpoint</Label>
                  <p className="font-medium text-sm break-all">{plan.apiEndpoint}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Received At</Label>
                  <p className="font-medium">{formatDate(plan.receivedAt)}</p>
                </div>
                {plan.sourceIp && (
                  <div>
                    <Label className="text-muted-foreground">Source IP</Label>
                    <p className="font-medium">{plan.sourceIp}</p>
                  </div>
                )}
              </div>
              <Separator />
              <div>
                <Label className="text-muted-foreground">User Agent</Label>
                <p className="text-sm text-muted-foreground break-all">{plan.userAgent || "-"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add internal notes about this lead..."
                rows={5}
                value={editedPlan.notes || ""}
                onChange={(e) => setEditedPlan((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Dialog */}
      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={editingTask}
        onSubmit={editingTask ? (data) => handleUpdateTask(editingTask.id, data) : handleCreateTask}
        onCancel={() => {
          setIsTaskDialogOpen(false);
          setEditingTask(null);
        }}
      />
    </div>
  );
}

// Task Dialog Component
interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  assignedToName: string;
  deliverableType: string;
  estimatedHours: number;
  dueDate: string;
  notes: string;
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ProofPackTask | null;
  onSubmit: (data: Partial<ProofPackTask>) => void;
  onCancel: () => void;
}

function TaskDialog({ open, onOpenChange, task, onSubmit, onCancel }: TaskDialogProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    assignedTo: "",
    assignedToName: "",
    deliverableType: "",
    estimatedHours: 0,
    dueDate: "",
    notes: "",
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo || "",
        assignedToName: task.assignedToName || "",
        deliverableType: task.deliverableType || "",
        estimatedHours: task.estimatedHours || 0,
        dueDate: task.dueDate ? task.dueDate.toDate().toISOString().split("T")[0] : "",
        notes: task.notes || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        assignedTo: "",
        assignedToName: "",
        deliverableType: "",
        estimatedHours: 0,
        dueDate: "",
        notes: "",
      });
    }
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: Partial<ProofPackTask> = {
      ...formData,
      dueDate: formData.dueDate ? Timestamp.fromDate(new Date(formData.dueDate)) : undefined,
    };
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the task details" : "Create a new deliverable task"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Task title"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Task description"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Deliverable Type</Label>
              <Select
                value={formData.deliverableType}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, deliverableType: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERABLE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, status: v as TaskStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {formatStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, priority: v as TaskPriority }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Assigned To</Label>
            <Input
              value={formData.assignedToName}
              onChange={(e) => setFormData((prev) => ({ ...prev, assignedToName: e.target.value }))}
              placeholder="Team member name"
            />
          </div>
          <div className="space-y-2">
            <Label>Estimated Hours</Label>
            <Input
              type="number"
              min="0"
              step="0.5"
              value={formData.estimatedHours || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))
              }
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes"
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">{task ? "Save Changes" : "Create Task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
