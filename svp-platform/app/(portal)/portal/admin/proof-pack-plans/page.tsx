"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  FolderKanban, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  Building2, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ArrowRight,
  Trash2,
  Edit,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProofPackPlanDoc, ProofPackStatus } from "@/lib/types/proofPackPlan";
import { formatStatusLabel, getStatusBadgeVariant, getPriorityColor } from "@/lib/types/proofPackPlan";

// Status options for filtering
const STATUS_OPTIONS: { value: ProofPackStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

// Priority options for filtering
const PRIORITY_OPTIONS = [
  { value: "all", label: "All Priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function ProofPackPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Partial<ProofPackPlanDoc>[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<Partial<ProofPackPlanDoc>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProofPackStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Partial<ProofPackPlanDoc> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/admin/proof-pack-plans");
        if (response.ok) {
          const result = await response.json();
          setPlans(result.data || []);
          setFilteredPlans(result.data || []);
        } else {
          console.error("Failed to fetch plans");
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Filter plans
  useEffect(() => {
    let filtered = [...plans];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (plan) =>
          plan.contact?.firstName?.toLowerCase().includes(query) ||
          plan.contact?.lastName?.toLowerCase().includes(query) ||
          plan.contact?.email?.toLowerCase().includes(query) ||
          plan.contact?.company?.toLowerCase().includes(query) ||
          plan.plan?.planType?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((plan) => plan.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((plan) => plan.priority === priorityFilter);
    }

    setFilteredPlans(filtered);
  }, [plans, searchQuery, statusFilter, priorityFilter]);

  const handleDelete = async () => {
    if (!selectedPlan?.id) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/proof-pack-plans/${selectedPlan.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPlans((prev) => prev.filter((p) => p.id !== selectedPlan.id));
        setDeleteDialogOpen(false);
        setSelectedPlan(null);
      } else {
        console.error("Failed to delete plan");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusIcon = (status: ProofPackStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "new":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FolderKanban className="h-8 w-8 text-primary" />
            Proof Pack Plans
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage leads and track Proof Pack deliverable projects
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ProofPackStatus | "all")}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{plans.length}</div>
            <div className="text-sm text-muted-foreground">Total Plans</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {plans.filter((p) => p.status === "new").length}
            </div>
            <div className="text-sm text-muted-foreground">New Leads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {plans.filter((p) => p.status === "in_progress").length}
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {plans.filter((p) => p.status === "completed").length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Plans ({filteredPlans.length})</CardTitle>
          <CardDescription>
            Click on a plan to view details and manage tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No plans found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Proof Pack Plans will appear here when leads are submitted via API"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Plan Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan) => (
                    <TableRow
                      key={plan.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/portal/admin/proof-pack-plans/${plan.id}`)}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {plan.contact?.firstName} {plan.contact?.lastName}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {plan.contact?.company || "No company"}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {plan.contact?.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{plan.plan?.planType || "-"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(plan.status as ProofPackStatus)}
                          <Badge variant={getStatusBadgeVariant(plan.status as ProofPackStatus)}>
                            {formatStatusLabel(plan.status || "new")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {plan.taskCount ? (
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1">
                              {plan.taskCount.completed > 0 && (
                                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-[8px] text-white">
                                  {plan.taskCount.completed}
                                </div>
                              )}
                              {plan.taskCount.inProgress > 0 && (
                                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] text-white">
                                  {plan.taskCount.inProgress}
                                </div>
                              )}
                              {plan.taskCount.pending > 0 && (
                                <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center text-[8px] text-white">
                                  {plan.taskCount.pending}
                                </div>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {plan.taskCount.completed}/{plan.taskCount.total}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No tasks</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              getPriorityColor(plan.priority || "medium")
                            )}
                          />
                          <span className="capitalize">{plan.priority}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {plan.assignedToName ? (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {plan.assignedToName}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(plan.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/portal/admin/proof-pack-plans/${plan.id}`);
                              }}
                            >
                              <ArrowRight className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPlan(plan);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Proof Pack Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedPlan && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">
                  {selectedPlan.contact?.firstName} {selectedPlan.contact?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{selectedPlan.contact?.email}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Plan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
