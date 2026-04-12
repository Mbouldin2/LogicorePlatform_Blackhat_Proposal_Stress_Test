import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { WebinarDoc, UpdateWebinarRequest } from "@/lib/types/webinar";

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

/**
 * GET /api/admin/webinars/[id]
 * Get a single webinar by ID
 */
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

    const docRef = doc(db, COLLECTIONS.WEBINARS, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: "Webinar not found" },
        { status: 404 }
      );
    }

    const data = snapshot.data() as WebinarDoc;

    const { id: _docId, ...restData } = data;
    
    return NextResponse.json({
      data: {
        ...restData,
        id: snapshot.id,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        publishedAt: data.publishedAt?.toDate?.() || null,
        scheduledPublishAt: data.scheduledPublishAt?.toDate?.() || null,
        eventDate: data.eventDate?.toDate?.() || null,
      },
    });
  } catch (error) {
    console.error("Error fetching webinar:", error);
    return NextResponse.json(
      { error: "Failed to fetch webinar" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/webinars/[id]
 * Update a webinar
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDb();

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const body: UpdateWebinarRequest = await request.json();

    const docRef = doc(db, COLLECTIONS.WEBINARS, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: "Webinar not found" },
        { status: 404 }
      );
    }

    // Convert date fields to Timestamps if provided
    const updateData: Record<string, unknown> = {
      ...body,
      updatedAt: Timestamp.now(),
    };

    if (body.eventDate) {
      updateData.eventDate = Timestamp.fromDate(new Date(body.eventDate as unknown as string));
    }

    if (body.scheduledPublishAt) {
      updateData.scheduledPublishAt = Timestamp.fromDate(new Date(body.scheduledPublishAt as unknown as string));
    }

    await updateDoc(docRef, updateData);

    // Fetch updated document
    const updatedSnapshot = await getDoc(docRef);
    const updatedData = updatedSnapshot.data() as WebinarDoc;

    const { id: _updatedDocId, ...restUpdatedData } = updatedData;
    
    return NextResponse.json({
      data: {
        ...restUpdatedData,
        id: updatedSnapshot.id,
        createdAt: updatedData.createdAt?.toDate?.() || new Date(),
        updatedAt: updatedData.updatedAt?.toDate?.() || new Date(),
        publishedAt: updatedData.publishedAt?.toDate?.() || null,
        scheduledPublishAt: updatedData.scheduledPublishAt?.toDate?.() || null,
        eventDate: updatedData.eventDate?.toDate?.() || null,
      },
    });
  } catch (error) {
    console.error("Error updating webinar:", error);
    return NextResponse.json(
      { error: "Failed to update webinar" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/webinars/[id]
 * Delete a webinar
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDb();

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const docRef = doc(db, COLLECTIONS.WEBINARS, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: "Webinar not found" },
        { status: 404 }
      );
    }

    await deleteDoc(docRef);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Error deleting webinar:", error);
    return NextResponse.json(
      { error: "Failed to delete webinar" },
      { status: 500 }
    );
  }
}
