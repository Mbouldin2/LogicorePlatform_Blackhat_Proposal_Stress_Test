import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { ProofPackPlanDoc, ProofPackTask, UpdateTaskRequest } from "@/lib/types/proofPackPlan";

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
  params: Promise<{ id: string; taskId: string }>;
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
// PUT /api/admin/proof-pack-plans/[id]/tasks/[taskId]
// Update a task
// ============================================================================
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: planId, taskId } = await params;
    const db = getDb();

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const body: UpdateTaskRequest = await request.json();

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
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const now = Timestamp.now();
    const existingTask = tasks[taskIndex];

    // Update task fields
    const updatedTask: ProofPackTask = {
      ...existingTask,
      title: body.title !== undefined ? body.title : existingTask.title,
      description: body.description !== undefined ? body.description : existingTask.description,
      status: body.status !== undefined ? body.status : existingTask.status,
      priority: body.priority !== undefined ? body.priority : existingTask.priority,
      assignedTo: body.assignedTo !== undefined ? body.assignedTo : existingTask.assignedTo,
      assignedToName: body.assignedToName !== undefined ? body.assignedToName : existingTask.assignedToName,
      dueDate: body.dueDate !== undefined 
        ? (body.dueDate ? Timestamp.fromDate(new Date(body.dueDate)) : undefined)
        : existingTask.dueDate,
      completedAt: body.status === "completed" && !existingTask.completedAt
        ? now
        : body.completedAt !== undefined
          ? (body.completedAt ? Timestamp.fromDate(new Date(body.completedAt)) : undefined)
          : existingTask.completedAt,
      actualHours: body.actualHours !== undefined ? body.actualHours : existingTask.actualHours,
      notes: body.notes !== undefined ? body.notes : existingTask.notes,
      attachments: body.attachments !== undefined ? body.attachments : existingTask.attachments,
      updatedAt: now,
    };

    const updatedTasks = [
      ...tasks.slice(0, taskIndex),
      updatedTask,
      ...tasks.slice(taskIndex + 1),
    ];

    const taskCount = calculateTaskCounts(updatedTasks);

    await updateDoc(docRef, {
      tasks: updatedTasks,
      taskCount,
      updatedAt: now,
    });

    return NextResponse.json({
      data: {
        ...updatedTask,
        dueDate: updatedTask.dueDate?.toDate?.() || null,
        completedAt: updatedTask.completedAt?.toDate?.() || null,
        createdAt: existingTask.createdAt?.toDate?.() || new Date(),
        updatedAt: now.toDate(),
      },
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/admin/proof-pack-plans/[id]/tasks/[taskId]
// Delete a task
// ============================================================================
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: planId, taskId } = await params;
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
    const updatedTasks = tasks.filter(t => t.id !== taskId);

    if (tasks.length === updatedTasks.length) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const now = Timestamp.now();
    const taskCount = calculateTaskCounts(updatedTasks);

    await updateDoc(docRef, {
      tasks: updatedTasks,
      taskCount,
      updatedAt: now,
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
