/**
 * Proof Pack Plan Types
 * 
 * Schema definitions for Proof Pack deliverables tracking system.
 * Manages leads from API endpoints with contact info and task management.
 */

import { Timestamp } from "firebase/firestore";

// ============================================================================
// Enums and Constants
// ============================================================================

export type ProofPackStatus = "new" | "contacted" | "qualified" | "in_progress" | "completed" | "archived";
export type TaskStatus = "pending" | "in_progress" | "completed" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export const PROOF_PACK_STATUSES: ProofPackStatus[] = [
  "new",
  "contacted",
  "qualified",
  "in_progress",
  "completed",
  "archived",
];

export const TASK_STATUSES: TaskStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "blocked",
];

export const TASK_PRIORITIES: TaskPriority[] = [
  "low",
  "medium",
  "high",
  "urgent",
];

// ============================================================================
// Contact Information
// ============================================================================

export interface ProofPackContact {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  linkedInUrl?: string;
  website?: string;
}

export interface ProofPackAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

// ============================================================================
// Plan Information
// ============================================================================

export interface ProofPackPlan {
  planType: string; // e.g., "Basic", "Professional", "Enterprise"
  industry?: string;
  companySize?: string;
  budgetRange?: string;
  timeline?: string;
  requirements?: string[];
  challenges?: string;
  goals?: string;
}

// ============================================================================
// Task Management
// ============================================================================

export interface ProofPackTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string; // Team member ID
  assignedToName?: string; // Display name
  dueDate?: Timestamp;
  completedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deliverableType?: string; // e.g., "Gap Analysis", "Audit", "Roadmap", "Training"
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
  attachments?: string[]; // File URLs
  dependencies?: string[]; // Task IDs
}

// ============================================================================
// Follow-up and Notes
// ============================================================================

export interface FollowUpEntry {
  id: string;
  date: Timestamp;
  type: "email" | "call" | "meeting" | "note" | "status_change";
  content: string;
  createdBy: string;
  createdByName: string;
  newStatus?: ProofPackStatus;
}

// ============================================================================
// Main Document Interface
// ============================================================================

export interface ProofPackPlanDoc {
  id: string;
  // API Source
  apiEndpoint: string;
  receivedAt: Timestamp;
  sourceIp?: string;
  userAgent?: string;
  
  // Contact Information
  contact: ProofPackContact;
  address?: ProofPackAddress;
  
  // Plan Details
  plan: ProofPackPlan;
  
  // Status and Assignment
  status: ProofPackStatus;
  assignedTo?: string; // Team member ID
  assignedToName?: string;
  
  // Task Management
  tasks: ProofPackTask[];
  taskCount: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    blocked: number;
  };
  
  // Follow-up History
  followUps: FollowUpEntry[];
  lastContactedAt?: Timestamp;
  nextFollowUpDate?: Timestamp;
  
  // Metadata
  tags?: string[];
  priority: "low" | "medium" | "high";
  estimatedValue?: number;
  notes?: string;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;

  // KDM Integration Fields (optional, for KDM site sync)
  kdmUserId?: string;
  kdmLeadId?: string;
  kdmProofPackId?: string;
  kdmProofPackHealthScore?: number;
  kdmCapabilities?: string[];
  kdmCertifications?: string[];
  kdmReadinessStage?: string;
  kdmSubscriptionStatus?: string;
  kdmMonthlyValue?: number;
  kdmPlanTier?: "dwy" | "dfy";
  kdmLastSyncedAt?: Timestamp;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateProofPackRequest {
  apiEndpoint: string;
  contact: Omit<ProofPackContact, "email"> & { email: string };
  address?: ProofPackAddress;
  plan: Omit<ProofPackPlan, "planType"> & { planType: string };
  sourceIp?: string;
  userAgent?: string;
}

export interface UpdateProofPackRequest {
  status?: ProofPackStatus;
  assignedTo?: string;
  assignedToName?: string;
  priority?: "low" | "medium" | "high";
  tags?: string[];
  estimatedValue?: number;
  nextFollowUpDate?: string;
  contact?: Partial<ProofPackContact>;
  address?: Partial<ProofPackAddress>;
  plan?: Partial<ProofPackPlan>;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assignedTo?: string;
  assignedToName?: string;
  dueDate?: string;
  deliverableType?: string;
  estimatedHours?: number;
  dependencies?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  assignedToName?: string;
  dueDate?: string;
  completedAt?: string;
  actualHours?: number;
  notes?: string;
  attachments?: string[];
}

export interface AddFollowUpRequest {
  type: FollowUpEntry["type"];
  content: string;
  newStatus?: ProofPackStatus;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getStatusColor(status: ProofPackStatus): string {
  const colors: Record<ProofPackStatus, string> = {
    new: "bg-blue-500",
    contacted: "bg-yellow-500",
    qualified: "bg-purple-500",
    in_progress: "bg-orange-500",
    completed: "bg-green-500",
    archived: "bg-gray-500",
  };
  return colors[status] || "bg-gray-500";
}

export function getStatusBadgeVariant(status: ProofPackStatus): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<ProofPackStatus, "default" | "secondary" | "destructive" | "outline"> = {
    new: "default",
    contacted: "secondary",
    qualified: "default",
    in_progress: "secondary",
    completed: "default",
    archived: "outline",
  };
  return variants[status] || "default";
}

export function getTaskStatusColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    pending: "bg-gray-500",
    in_progress: "bg-blue-500",
    completed: "bg-green-500",
    blocked: "bg-red-500",
  };
  return colors[status];
}

export function getPriorityColor(priority: TaskPriority | ProofPackPlanDoc["priority"]): string {
  const colors: Record<string, string> = {
    low: "bg-gray-400",
    medium: "bg-blue-400",
    high: "bg-orange-500",
    urgent: "bg-red-500",
  };
  return colors[priority] || "bg-gray-400";
}

export function formatStatusLabel(status: string): string {
  return status
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
