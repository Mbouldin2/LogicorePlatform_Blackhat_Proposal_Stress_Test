import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  Timestamp, 
  query, 
  orderBy,
  where,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { 
  ProofPackPlanDoc, 
  CreateProofPackRequest, 
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

// ============================================================================
// GET /api/admin/proof-pack-plans
// List all Proof Pack Plans with optional filtering
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized", details: "Firebase configuration missing" },
        { status: 500 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assignedTo = searchParams.get("assignedTo");
    const limit = parseInt(searchParams.get("limit") || "100");

    const plansRef = collection(db, COLLECTIONS.PROOF_PACK_PLANS);
    let q = query(plansRef);

    // Apply filters
    if (status) {
      q = query(q, where("status", "==", status));
    }
    if (priority) {
      q = query(q, where("priority", "==", priority));
    }
    if (assignedTo) {
      q = query(q, where("assignedTo", "==", assignedTo));
    }

    // Order by created date (descending)
    q = query(q, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);

    const plans = snapshot.docs.slice(0, limit).map((doc) => {
      const data = doc.data() as ProofPackPlanDoc;
      return {
        id: doc.id,
        apiEndpoint: data.apiEndpoint,
        receivedAt: data.receivedAt?.toDate?.() || null,
        contact: data.contact,
        address: data.address,
        plan: data.plan,
        status: data.status,
        assignedTo: data.assignedTo,
        assignedToName: data.assignedToName,
        taskCount: data.taskCount || { total: 0, pending: 0, inProgress: 0, completed: 0, blocked: 0 },
        priority: data.priority || "medium",
        estimatedValue: data.estimatedValue,
        tags: data.tags || [],
        lastContactedAt: data.lastContactedAt?.toDate?.() || null,
        nextFollowUpDate: data.nextFollowUpDate?.toDate?.() || null,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      };
    });

    return NextResponse.json({ data: plans });
  } catch (error) {
    console.error("Error fetching proof pack plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch proof pack plans", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/admin/proof-pack-plans
// Create a new Proof Pack Plan (typically from webhook/API)
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const body: CreateProofPackRequest = await request.json();

    // Validate required fields
    if (!body.apiEndpoint || !body.contact?.email || !body.plan?.planType) {
      return NextResponse.json(
        { error: "Missing required fields: apiEndpoint, contact.email, plan.planType" },
        { status: 400 }
      );
    }

    const now = Timestamp.now();

    const newPlan: Omit<ProofPackPlanDoc, "id"> = {
      apiEndpoint: body.apiEndpoint,
      receivedAt: now,
      sourceIp: body.sourceIp,
      userAgent: body.userAgent,
      contact: {
        firstName: body.contact.firstName || "",
        lastName: body.contact.lastName || "",
        email: body.contact.email,
        phone: body.contact.phone || "",
        company: body.contact.company || "",
        title: body.contact.title || "",
        linkedInUrl: body.contact.linkedInUrl || "",
        website: body.contact.website || "",
      },
      address: body.address || {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
      },
      plan: {
        planType: body.plan.planType,
        industry: body.plan.industry || "",
        companySize: body.plan.companySize || "",
        budgetRange: body.plan.budgetRange || "",
        timeline: body.plan.timeline || "",
        requirements: body.plan.requirements || [],
        challenges: body.plan.challenges || "",
        goals: body.plan.goals || "",
      },
      status: "new",
      priority: "medium",
      tasks: [],
      taskCount: {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        blocked: 0,
      },
      followUps: [],
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.PROOF_PACK_PLANS), newPlan);

    return NextResponse.json({
      data: {
        id: docRef.id,
        ...newPlan,
        receivedAt: now.toDate(),
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating proof pack plan:", error);
    return NextResponse.json(
      { error: "Failed to create proof pack plan" },
      { status: 500 }
    );
  }
}
