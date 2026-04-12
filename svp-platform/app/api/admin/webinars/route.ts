import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, Timestamp, query, orderBy } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { WebinarDoc, CreateWebinarRequest } from "@/lib/types/webinar";
import { getDefaultWebinar } from "@/lib/types/webinar";

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

/**
 * GET /api/admin/webinars
 * List all webinars
 */
export async function GET() {
  try {
    const db = getDb();
    if (!db) {
      console.error("Database not initialized. Check NEXT_PUBLIC_FIREBASE_* env vars.");
      return NextResponse.json(
        { error: "Database not initialized", details: "Firebase configuration missing" },
        { status: 500 }
      );
    }

    const webinarsRef = collection(db, COLLECTIONS.WEBINARS);
    let snapshot;
    
    try {
      const q = query(webinarsRef, orderBy("createdAt", "desc"));
      snapshot = await getDocs(q);
    } catch {
      // Fallback if index doesn't exist
      snapshot = await getDocs(webinarsRef);
    }

    const webinars = snapshot.docs.map((doc) => {
      const data = doc.data() as WebinarDoc;
      return {
        id: doc.id,
        title: data.title || "",
        slug: data.slug || "",
        status: data.status || "draft",
        publishedAt: data.publishedAt?.toDate?.() || null,
        scheduledPublishAt: data.scheduledPublishAt?.toDate?.() || null,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      };
    });

    // Sort client-side
    webinars.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ data: webinars });
  } catch (error) {
    console.error("Error fetching webinars:", error);
    return NextResponse.json(
      { error: "Failed to fetch webinars", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/webinars
 * Create a new webinar
 */
export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const body: CreateWebinarRequest = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check for duplicate slug
    const webinarsRef = collection(db, COLLECTIONS.WEBINARS);
    const existingSnapshot = await getDocs(webinarsRef);
    const slugExists = existingSnapshot.docs.some(
      (doc) => (doc.data() as WebinarDoc).slug === slug
    );

    if (slugExists) {
      return NextResponse.json(
        { error: "A webinar with this URL slug already exists" },
        { status: 400 }
      );
    }

    // Create default webinar with provided data
    const now = Timestamp.now();
    const defaultWebinar = getDefaultWebinar("admin"); // TODO: Get actual user ID
    
    const newWebinar = {
      ...defaultWebinar,
      title: body.title,
      shortDescription: body.shortDescription || "",
      slug,
      createdAt: now,
      updatedAt: now,
      seo: {
        landingPage: {
          metaTitle: body.title,
          metaDescription: body.shortDescription || "",
        },
        confirmationPage: {
          metaTitle: `${body.title} - Confirmation`,
          metaDescription: "",
        },
      },
    };

    const docRef = await addDoc(webinarsRef, newWebinar);

    return NextResponse.json({
      data: {
        id: docRef.id,
        ...newWebinar,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      },
    });
  } catch (error) {
    console.error("Error creating webinar:", error);
    return NextResponse.json(
      { error: "Failed to create webinar" },
      { status: 500 }
    );
  }
}
