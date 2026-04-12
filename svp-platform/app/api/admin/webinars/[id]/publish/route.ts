import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, Timestamp, deleteField } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { WebinarDoc } from "@/lib/types/webinar";

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
 * POST /api/admin/webinars/[id]/publish
 * Publish a webinar
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDb();

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { scheduledAt } = body as { scheduledAt?: string };

    const docRef = doc(db, COLLECTIONS.WEBINARS, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: "Webinar not found" },
        { status: 404 }
      );
    }

    const data = snapshot.data() as WebinarDoc;

    // Validate webinar has required content
    if (!data.title || !data.slug) {
      return NextResponse.json(
        { error: "Webinar must have a title and slug before publishing" },
        { status: 400 }
      );
    }

    if (!data.landingPage?.hero?.headline) {
      return NextResponse.json(
        { error: "Webinar must have a landing page headline before publishing" },
        { status: 400 }
      );
    }

    const now = Timestamp.now();
    
    if (scheduledAt) {
      // Schedule for future publishing
      const scheduledTimestamp = Timestamp.fromDate(new Date(scheduledAt));
      
      await updateDoc(docRef, {
        status: "scheduled",
        scheduledPublishAt: scheduledTimestamp,
        updatedAt: now,
      });

      return NextResponse.json({
        data: {
          success: true,
          status: "scheduled",
          scheduledPublishAt: new Date(scheduledAt),
        },
      });
    } else {
      // Publish immediately
      await updateDoc(docRef, {
        status: "published",
        publishedAt: now,
        updatedAt: now,
      });

      return NextResponse.json({
        data: {
          success: true,
          status: "published",
          publishedAt: now.toDate(),
        },
      });
    }
  } catch (error) {
    console.error("Error publishing webinar:", error);
    return NextResponse.json(
      { error: "Failed to publish webinar" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/webinars/[id]/publish
 * Unpublish a webinar (set back to draft)
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

    await updateDoc(docRef, {
      status: "draft",
      publishedAt: deleteField(),
      scheduledPublishAt: deleteField(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      data: {
        success: true,
        status: "draft",
      },
    });
  } catch (error) {
    console.error("Error unpublishing webinar:", error);
    return NextResponse.json(
      { error: "Failed to unpublish webinar" },
      { status: 500 }
    );
  }
}
