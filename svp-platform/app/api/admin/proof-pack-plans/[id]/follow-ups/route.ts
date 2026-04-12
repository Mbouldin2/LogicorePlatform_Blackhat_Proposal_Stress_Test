import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { ProofPackPlanDoc, AddFollowUpRequest, FollowUpEntry } from "@/lib/types/proofPackPlan";

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

function generateFollowUpId(): string {
  return `followup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// GET /api/admin/proof-pack-plans/[id]/follow-ups
// Get all follow-ups for a Proof Pack Plan
// ============================================================================
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const data = snapshot.data() as ProofPackPlanDoc;
    const followUps = data.followUps || [];

    // Convert timestamps to dates for response
    const followUpsWithDates = followUps.map(entry => ({
      ...entry,
      date: entry.date?.toDate?.() || new Date(),
    }));

    return NextResponse.json({ data: followUpsWithDates });
  } catch (error) {
    console.error("Error fetching follow-ups:", error);
    return NextResponse.json(
      { error: "Failed to fetch follow-ups" },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/admin/proof-pack-plans/[id]/follow-ups
// Add a new follow-up entry
// ============================================================================
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: planId } = await params;
    const db = getDb();

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const body: AddFollowUpRequest = await request.json();

    if (!body.content || !body.type) {
      return NextResponse.json(
        { error: "Follow-up content and type are required" },
        { status: 400 }
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

    const now = Timestamp.now();
    const userId = "admin"; // TODO: Get from auth context
    const userName = "Admin"; // TODO: Get from auth context

    const newFollowUp: FollowUpEntry = {
      id: generateFollowUpId(),
      date: now,
      type: body.type,
      content: body.content,
      createdBy: userId,
      createdByName: userName,
      newStatus: body.newStatus,
    };

    const data = snapshot.data() as ProofPackPlanDoc;
    const updatedFollowUps = [newFollowUp, ...(data.followUps || [])];

    const updateData: Record<string, unknown> = {
      followUps: updatedFollowUps,
      lastContactedAt: now,
      updatedAt: now,
    };

    // Update status if provided
    if (body.newStatus) {
      updateData.status = body.newStatus;
      if (body.newStatus === "completed") {
        updateData.completedAt = now;
      }
    }

    await updateDoc(docRef, updateData);

    return NextResponse.json({
      data: {
        ...newFollowUp,
        date: now.toDate(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding follow-up:", error);
    return NextResponse.json(
      { error: "Failed to add follow-up" },
      { status: 500 }
    );
  }
}
