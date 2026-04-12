import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp, doc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { ProofPackPlanDoc } from "@/lib/types/proofPackPlan";

// Initialize Firebase for API routes
function getDb() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    return null;
  }

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app);
}

// API Key authentication
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-api-key");
  const expectedApiKey = process.env.KDM_WEBHOOK_API_KEY;
  
  if (!expectedApiKey) {
    console.error("KDM_WEBHOOK_API_KEY not configured");
    return false;
  }
  
  return apiKey === expectedApiKey;
}

// KDM Lead Data Structure
interface KDMLeadData {
  // Lead identification
  id?: string;
  kdmLeadId?: string;
  
  // User/Contact Information
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  linkedInUrl?: string;
  website?: string;
  
  // Subscription Details
  planTier: "dwy" | "dfy"; // Done With You or Done For You
  planName: string;
  subscriptionStatus: "active" | "pending" | "cancelled" | "trial";
  subscriptionStartDate?: string;
  monthlyValue?: number;
  
  // Proof Pack Context
  proofPackId?: string;
  proofPackHealthScore?: number;
  capabilities?: string[];
  certifications?: string[];
  industry?: string;
  companySize?: string;
  readinessStage?: string;
  
  // Lead Management
  leadStatus: "new" | "contacted" | "qualified" | "converted" | "lost";
  leadSource: "subscription_checkout" | "proof_pack" | "manual";
  priority: "low" | "medium" | "high";
  assignedTo?: string;
  notes?: string;
  
  // Address
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  lastSyncedAt?: string;
}

/**
 * POST /api/webhooks/kdm/proof-pack-lead
 * Receive new Proof Pack lead from KDM site
 */
export async function POST(request: NextRequest) {
  // Validate API key
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Invalid or missing API key" },
      { status: 401 }
    );
  }

  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const leadData: KDMLeadData = await request.json();

    // Validate required fields
    if (!leadData.userId || !leadData.email || !leadData.planTier) {
      return NextResponse.json(
        { error: "Missing required fields", required: ["userId", "email", "planTier"] },
        { status: 400 }
      );
    }

    const now = Timestamp.now();

    // Check if lead already exists by KDM userId or email
    const plansRef = collection(db, COLLECTIONS.PROOF_PACK_PLANS);
    const existingQuery = query(
      plansRef,
      where("contact.email", "==", leadData.email)
    );
    const existingSnapshot = await getDocs(existingQuery);

    let planId: string;
    let isUpdate = false;

    if (!existingSnapshot.empty) {
      // Update existing plan
      const existingDoc = existingSnapshot.docs[0];
      planId = existingDoc.id;
      isUpdate = true;

      const existingData = existingDoc.data() as ProofPackPlanDoc;
      
      // Add follow-up entry for the sync
      const syncFollowUp = {
        id: `sync_${Date.now()}`,
        date: now,
        type: "note" as const,
        content: `Synced from KDM: ${leadData.leadSource === "subscription_checkout" ? "Subscription checkout" : "Proof Pack submission"}. Status: ${leadData.leadStatus}, Plan: ${leadData.planName}`,
        createdBy: "kdm-sync",
        createdByName: "KDM Sync",
      };

      const updateData: Record<string, unknown> = {
        updatedAt: now,
        "contact.firstName": leadData.firstName || existingData.contact.firstName,
        "contact.lastName": leadData.lastName || existingData.contact.lastName,
        "contact.phone": leadData.phone || existingData.contact.phone,
        "contact.company": leadData.company || existingData.contact.company,
        "contact.title": leadData.jobTitle || existingData.contact.title,
        "contact.linkedInUrl": leadData.linkedInUrl || existingData.contact.linkedInUrl,
        "contact.website": leadData.website || existingData.contact.website,
        "plan.planType": leadData.planName,
        "plan.industry": leadData.industry || existingData.plan.industry,
        "plan.companySize": leadData.companySize || existingData.plan.companySize,
        priority: leadData.priority || existingData.priority,
        status: mapKDMStatusToSVP(leadData.leadStatus),
        kdmUserId: leadData.userId,
        kdmLeadId: leadData.kdmLeadId || leadData.id,
        kdmProofPackId: leadData.proofPackId,
        kdmProofPackHealthScore: leadData.proofPackHealthScore,
        kdmCapabilities: leadData.capabilities || [],
        kdmCertifications: leadData.certifications || [],
        kdmReadinessStage: leadData.readinessStage,
        kdmSubscriptionStatus: leadData.subscriptionStatus,
        kdmMonthlyValue: leadData.monthlyValue,
        kdmLastSyncedAt: now,
        followUps: [syncFollowUp, ...(existingData.followUps || [])],
      };

      if (leadData.address) {
        updateData.address = {
          street: leadData.address.street || existingData.address?.street || "",
          city: leadData.address.city || existingData.address?.city || "",
          state: leadData.address.state || existingData.address?.state || "",
          zipCode: leadData.address.zipCode || existingData.address?.zipCode || "",
          country: leadData.address.country || existingData.address?.country || "US",
        };
      }

      await updateDoc(doc(db, COLLECTIONS.PROOF_PACK_PLANS, planId), updateData);
    } else {
      // Create new plan
      const newPlan: Omit<ProofPackPlanDoc, "id"> = {
        apiEndpoint: "/api/webhooks/kdm/proof-pack-lead",
        receivedAt: now,
        sourceIp: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "KDM Webhook",
        
        contact: {
          firstName: leadData.firstName || "",
          lastName: leadData.lastName || "",
          email: leadData.email,
          phone: leadData.phone || "",
          company: leadData.company || "",
          title: leadData.jobTitle || "",
          linkedInUrl: leadData.linkedInUrl || "",
          website: leadData.website || "",
        },
        
        address: {
          street: leadData.address?.street || "",
          city: leadData.address?.city || "",
          state: leadData.address?.state || "",
          zipCode: leadData.address?.zipCode || "",
          country: leadData.address?.country || "US",
        },
        
        plan: {
          planType: leadData.planName,
          industry: leadData.industry || "",
          companySize: leadData.companySize || "",
          budgetRange: leadData.monthlyValue ? `$${leadData.monthlyValue}/month` : "",
          timeline: "",
          requirements: leadData.capabilities || [],
          challenges: "",
          goals: `KDM ${leadData.planTier.toUpperCase()} Subscription - ${leadData.readinessStage || "Supplier Readiness"}`,
        },
        
        status: mapKDMStatusToSVP(leadData.leadStatus),
        priority: leadData.priority || "medium",
        
        // KDM-specific tracking fields
        kdmUserId: leadData.userId,
        kdmLeadId: leadData.kdmLeadId || leadData.id,
        kdmProofPackId: leadData.proofPackId,
        kdmProofPackHealthScore: leadData.proofPackHealthScore,
        kdmCapabilities: leadData.capabilities || [],
        kdmCertifications: leadData.certifications || [],
        kdmReadinessStage: leadData.readinessStage,
        kdmSubscriptionStatus: leadData.subscriptionStatus,
        kdmMonthlyValue: leadData.monthlyValue,
        kdmPlanTier: leadData.planTier,
        kdmLastSyncedAt: now,
        
        tasks: [],
        taskCount: {
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          blocked: 0,
        },
        
        followUps: [
          {
            id: `initial_${Date.now()}`,
            date: now,
            type: "note",
            content: `Lead created from KDM ${leadData.leadSource === "subscription_checkout" ? "subscription checkout" : "Proof Pack submission"}. Plan: ${leadData.planName}, Health Score: ${leadData.proofPackHealthScore || "N/A"}`,
            createdBy: "kdm-sync",
            createdByName: "KDM Sync",
          },
        ],
        
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.PROOF_PACK_PLANS), newPlan);
      planId = docRef.id;
    }

    // Send notification email to SVP team
    await sendLeadNotificationEmail(leadData, planId, isUpdate);

    return NextResponse.json({
      success: true,
      data: {
        planId,
        action: isUpdate ? "updated" : "created",
        message: isUpdate 
          ? "Lead updated successfully from KDM sync" 
          : "New lead created from KDM",
      },
    }, { status: isUpdate ? 200 : 201 });

  } catch (error) {
    console.error("Error processing KDM lead:", error);
    return NextResponse.json(
      { error: "Failed to process lead", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/webhooks/kdm/proof-pack-lead
 * Update existing lead from KDM
 */
export async function PATCH(request: NextRequest) {
  // Validate API key
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Invalid or missing API key" },
      { status: 401 }
    );
  }

  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const updateData: Partial<KDMLeadData> & { kdmUserId?: string; kdmLeadId?: string } = await request.json();

    if (!updateData.kdmUserId && !updateData.email) {
      return NextResponse.json(
        { error: "Missing identifier", required: ["kdmUserId or email"] },
        { status: 400 }
      );
    }

    const now = Timestamp.now();
    const plansRef = collection(db, COLLECTIONS.PROOF_PACK_PLANS);
    
    // Find existing plan
    let existingQuery;
    if (updateData.email) {
      existingQuery = query(plansRef, where("contact.email", "==", updateData.email));
    } else {
      existingQuery = query(plansRef, where("kdmUserId", "==", updateData.kdmUserId));
    }
    
    const existingSnapshot = await getDocs(existingQuery);

    if (existingSnapshot.empty) {
      return NextResponse.json(
        { error: "Lead not found", message: "No existing lead found to update" },
        { status: 404 }
      );
    }

    const existingDoc = existingSnapshot.docs[0];
    const planId = existingDoc.id;
    const existingPlan = existingDoc.data() as ProofPackPlanDoc;

    // Build update object
    const updateFields: Record<string, unknown> = {
      updatedAt: now,
      kdmLastSyncedAt: now,
    };

    // Update contact fields if provided
    if (updateData.firstName !== undefined) updateFields["contact.firstName"] = updateData.firstName;
    if (updateData.lastName !== undefined) updateFields["contact.lastName"] = updateData.lastName;
    if (updateData.phone !== undefined) updateFields["contact.phone"] = updateData.phone;
    if (updateData.company !== undefined) updateFields["contact.company"] = updateData.company;
    if (updateData.jobTitle !== undefined) updateFields["contact.title"] = updateData.jobTitle;
    if (updateData.linkedInUrl !== undefined) updateFields["contact.linkedInUrl"] = updateData.linkedInUrl;
    if (updateData.website !== undefined) updateFields["contact.website"] = updateData.website;

    // Update plan fields if provided
    if (updateData.planName !== undefined) updateFields["plan.planType"] = updateData.planName;
    if (updateData.industry !== undefined) updateFields["plan.industry"] = updateData.industry;
    if (updateData.companySize !== undefined) updateFields["plan.companySize"] = updateData.companySize;
    if (updateData.monthlyValue !== undefined) {
      updateFields["plan.budgetRange"] = `$${updateData.monthlyValue}/month`;
      updateFields.kdmMonthlyValue = updateData.monthlyValue;
    }

    // Update KDM-specific fields
    if (updateData.proofPackId !== undefined) updateFields.kdmProofPackId = updateData.proofPackId;
    if (updateData.proofPackHealthScore !== undefined) updateFields.kdmProofPackHealthScore = updateData.proofPackHealthScore;
    if (updateData.capabilities !== undefined) {
      updateFields.kdmCapabilities = updateData.capabilities;
      updateFields["plan.requirements"] = updateData.capabilities;
    }
    if (updateData.certifications !== undefined) updateFields.kdmCertifications = updateData.certifications;
    if (updateData.readinessStage !== undefined) updateFields.kdmReadinessStage = updateData.readinessStage;
    if (updateData.subscriptionStatus !== undefined) updateFields.kdmSubscriptionStatus = updateData.subscriptionStatus;
    if (updateData.planTier !== undefined) updateFields.kdmPlanTier = updateData.planTier;

    // Update management fields
    if (updateData.leadStatus !== undefined) {
      updateFields.status = mapKDMStatusToSVP(updateData.leadStatus);
    }
    if (updateData.priority !== undefined) updateFields.priority = updateData.priority;
    if (updateData.assignedTo !== undefined) {
      updateFields.assignedTo = updateData.assignedTo;
      updateFields.assignedToName = updateData.assignedTo;
    }

    // Add address if provided
    if (updateData.address) {
      updateFields.address = {
        street: updateData.address.street || existingPlan.address?.street || "",
        city: updateData.address.city || existingPlan.address?.city || "",
        state: updateData.address.state || existingPlan.address?.state || "",
        zipCode: updateData.address.zipCode || existingPlan.address?.zipCode || "",
        country: updateData.address.country || existingPlan.address?.country || "US",
      };
    }

    // Add follow-up note for the update
    const updateNote = {
      id: `update_${Date.now()}`,
      date: now,
      type: "note" as const,
      content: `Updated from KDM: ${buildUpdateDescription(updateData)}`,
      createdBy: "kdm-sync",
      createdByName: "KDM Sync",
    };

    updateFields.followUps = [updateNote, ...(existingPlan.followUps || [])];

    await updateDoc(doc(db, COLLECTIONS.PROOF_PACK_PLANS, planId), updateFields);

    return NextResponse.json({
      success: true,
      data: {
        planId,
        action: "updated",
        message: "Lead updated successfully from KDM",
      },
    });

  } catch (error) {
    console.error("Error updating KDM lead:", error);
    return NextResponse.json(
      { error: "Failed to update lead", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/kdm/proof-pack-lead
 * Health check endpoint
 */
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "KDM-SVP Sync Webhook",
    version: "1.0.0",
  });
}

// Helper function to map KDM status to SVP status
function mapKDMStatusToSVP(kdmStatus: string): ProofPackPlanDoc["status"] {
  const statusMap: Record<string, ProofPackPlanDoc["status"]> = {
    new: "new",
    contacted: "contacted",
    qualified: "qualified",
    converted: "in_progress",
    lost: "archived",
  };
  
  return statusMap[kdmStatus] || "new";
}

// Helper function to send notification email
async function sendLeadNotificationEmail(
  leadData: KDMLeadData, 
  planId: string, 
  isUpdate: boolean
): Promise<void> {
  const notificationEmail = process.env.LEAD_NOTIFICATION_EMAIL || "nel@strategicvalueplus.com";
  
  // In production, implement actual email sending via SendGrid, AWS SES, etc.
  // For now, log the notification
  console.log(`
[LEAD NOTIFICATION - ${isUpdate ? "UPDATE" : "NEW"}]
To: ${notificationEmail}
Subject: ${isUpdate ? "Updated" : "New"} KDM Proof Pack Lead: ${leadData.company || leadData.email}

Lead Details:
- Name: ${leadData.firstName || ""} ${leadData.lastName || ""}
- Email: ${leadData.email}
- Company: ${leadData.company || "N/A"}
- Plan: ${leadData.planName} (${leadData.planTier.toUpperCase()})
- Status: ${leadData.leadStatus}
- Health Score: ${leadData.proofPackHealthScore || "N/A"}
- Industry: ${leadData.industry || "N/A"}
- Company Size: ${leadData.companySize || "N/A"}

Capabilities: ${leadData.capabilities?.join(", ") || "N/A"}
Certifications: ${leadData.certifications?.join(", ") || "N/A"}
Readiness Stage: ${leadData.readinessStage || "N/A"}

View in SVP Portal:
${process.env.NEXT_PUBLIC_APP_URL || "https://strategicvalueplus.com"}/portal/admin/proof-pack-plans/${planId}
  `);
}

// Helper function to build update description
function buildUpdateDescription(updateData: Partial<KDMLeadData>): string {
  const changes: string[] = [];
  
  if (updateData.leadStatus) changes.push(`Status: ${updateData.leadStatus}`);
  if (updateData.subscriptionStatus) changes.push(`Subscription: ${updateData.subscriptionStatus}`);
  if (updateData.proofPackHealthScore !== undefined) changes.push(`Health Score: ${updateData.proofPackHealthScore}`);
  if (updateData.priority) changes.push(`Priority: ${updateData.priority}`);
  if (updateData.assignedTo) changes.push(`Assigned to: ${updateData.assignedTo}`);
  if (updateData.planName) changes.push(`Plan: ${updateData.planName}`);
  
  return changes.length > 0 ? changes.join(", ") : "General update";
}
