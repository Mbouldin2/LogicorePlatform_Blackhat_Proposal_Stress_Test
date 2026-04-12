import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { 
  ProofPackPlanDoc, 
  UpdateProofPackRequest,
  ProofPackTask,
  CreateTaskRequest,
  UpdateTaskRequest,
  AddFollowUpRequest,
  FollowUpEntry
} from "@/lib/types/proofPackPlan";

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

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================================================
// GET /api/admin/proof-pack-plans/[id]
// Get a single Proof Pack Plan by ID
// ============================================================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDb();

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const docRef = doc(db, COLLECTIONS.PROOF_PACK_PLANS, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: "Proof Pack Plan not found" },
        { status: 404 }
      );
    }

    const data = snapshot.data() as ProofPackPlanDoc;

    return NextResponse.json({
      data: {
        id: snapshot.id,
        apiEndpoint: data.apiEndpoint,
        receivedAt: data.receivedAt?.toDate?.() || null,
        sourceIp: data.sourceIp,
        userAgent: data.userAgent,
        contact: data.contact,
        address: data.address,
        plan: data.plan,
        status: data.status,
        assignedTo: data.assignedTo,
        assignedToName: data.assignedToName,
        priority: data.priority,
        estimatedValue: data.estimatedValue,
        tags: data.tags || [],
        tasks: data.tasks || [],
        taskCount: data.taskCount || { total: 0, pending: 0, inProgress: 0, completed: 0, blocked: 0 },
        followUps: data.followUps || [],
        lastContactedAt: data.lastContactedAt?.toDate?.() || null,
        nextFollowUpDate: data.nextFollowUpDate?.toDate?.() || null,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        completedAt: data.completedAt?.toDate?.() || null,
      },
    });
  } catch (error) {
    console.error("Error fetching proof pack plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch proof pack plan" },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/admin/proof-pack-plans/[id]
// Update a Proof Pack Plan
// ============================================================================
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: planId } = await params;
    const db = getDb();

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const body: UpdateProofPackRequest = await request.json();

    const docRef = doc(db, COLLECTIONS.PROOF_PACK_PLANS, planId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: "Proof Pack Plan not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    // Update allowed fields
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === "completed") {
        updateData.completedAt = Timestamp.now();
      }
    }
    if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo;
    if (body.assignedToName !== undefined) updateData.assignedToName = body.assignedToName;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.estimatedValue !== undefined) updateData.estimatedValue = body.estimatedValue;
    if (body.nextFollowUpDate) {
      updateData.nextFollowUpDate = Timestamp.fromDate(new Date(body.nextFollowUpDate));
    }
    if (body.contact) {
      updateData.contact = { ...snapshot.data().contact, ...body.contact };
    }
    if (body.address) {
      updateData.address = { ...snapshot.data().address, ...body.address };
    }
    if (body.plan) {
      updateData.plan = { ...snapshot.data().plan, ...body.plan };
    }

    await updateDoc(docRef, updateData);

    // Fetch updated document
    const updatedSnapshot = await getDoc(docRef);
    const { id: _docId, ...updatedData } = updatedSnapshot.data() as ProofPackPlanDoc;

    return NextResponse.json({
      data: {
        ...updatedData,
        id: updatedSnapshot.id,
        receivedAt: updatedData.receivedAt?.toDate?.() || null,
        createdAt: updatedData.createdAt?.toDate?.() || new Date(),
        updatedAt: updatedData.updatedAt?.toDate?.() || new Date(),
        completedAt: updatedData.completedAt?.toDate?.() || null,
        lastContactedAt: updatedData.lastContactedAt?.toDate?.() || null,
        nextFollowUpDate: updatedData.nextFollowUpDate?.toDate?.() || null,
      },
    });
  } catch (error) {
    console.error("Error updating proof pack plan:", error);
    return NextResponse.json(
      { error: "Failed to update proof pack plan" },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/admin/proof-pack-plans/[id]
// Delete a Proof Pack Plan
// ============================================================================
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: planId } = await params;
    const db = getDb();

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const docRef = doc(db, COLLECTIONS.PROOF_PACK_PLANS, planId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: "Proof Pack Plan not found" },
        { status: 404 }
      );
    }

    await deleteDoc(docRef);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Error deleting proof pack plan:", error);
    return NextResponse.json(
      { error: "Failed to delete proof pack plan" },
      { status: 500 }
    );
  }
}
