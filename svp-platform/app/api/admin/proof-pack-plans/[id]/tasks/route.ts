import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { ProofPackPlanDoc, ProofPackTask, CreateTaskRequest, UpdateTaskRequest } from "@/lib/types/proofPackPlan";

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

function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function calculateTaskCounts(tasks: ProofPackTask[]) {
  return {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
    blocked: tasks.filter(t => t.status === "blocked").length,
  };
}

// ============================================================================
// GET /api/admin/proof-pack-plans/[id]/tasks
// Get all tasks for a Proof Pack Plan
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
    const tasks = data.tasks || [];

    // Convert timestamps to dates for response
    const tasksWithDates = tasks.map(task => ({
      ...task,
      dueDate: task.dueDate?.toDate?.() || null,
      completedAt: task.completedAt?.toDate?.() || null,
      createdAt: task.createdAt?.toDate?.() || new Date(),
      updatedAt: task.updatedAt?.toDate?.() || new Date(),
    }));

    return NextResponse.json({ data: tasksWithDates });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/admin/proof-pack-plans/[id]/tasks
// Create a new task for a Proof Pack Plan
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

    const body: CreateTaskRequest = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { error: "Task title is required" },
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

    const data = snapshot.data() as ProofPackPlanDoc;
    const now = Timestamp.now();

    const newTask: ProofPackTask = {
      id: generateTaskId(),
      title: body.title,
      description: body.description || "",
      status: "pending",
      priority: body.priority || "medium",
      assignedTo: body.assignedTo || "",
      assignedToName: body.assignedToName || "",
      dueDate: body.dueDate ? Timestamp.fromDate(new Date(body.dueDate)) : undefined,
      createdAt: now,
      updatedAt: now,
      deliverableType: body.deliverableType || "",
      estimatedHours: body.estimatedHours || 0,
      actualHours: 0,
      notes: "",
      attachments: [],
      dependencies: body.dependencies || [],
    };

    const updatedTasks = [...(data.tasks || []), newTask];
    const taskCount = calculateTaskCounts(updatedTasks);

    await updateDoc(docRef, {
      tasks: updatedTasks,
      taskCount,
      updatedAt: now,
    });

    return NextResponse.json({
      data: {
        ...newTask,
        dueDate: newTask.dueDate?.toDate?.() || null,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
