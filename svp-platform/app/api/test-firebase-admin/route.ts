import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({
        success: false,
        error: "Firebase Admin not initialized",
        adminDb: null,
      }, { status: 500 });
    }

    // Try to read from Firestore
    const testCollection = adminDb.collection("proposalSignatures");
    const snapshot = await testCollection.limit(1).get();

    return NextResponse.json({
      success: true,
      message: "Firebase Admin is working",
      adminDbInitialized: !!adminDb,
      canReadFirestore: true,
      documentCount: snapshot.size,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      success: false,
      error: message,
      adminDbInitialized: !!adminDb,
    }, { status: 500 });
  }
}
