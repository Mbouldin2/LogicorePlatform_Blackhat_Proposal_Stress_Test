import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { CMMC_COLLECTIONS } from "@/lib/types/cmmc";
import { COLLECTIONS } from "@/lib/schema";
import { getControlById } from "@/lib/data/nist-controls";

/**
 * GET /api/cmmc/controls/detail?assessmentId=xxx&docId=yyy
 * Fetches a single control assessment by its Firestore document ID
 */
export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const docId = searchParams.get("docId");
    const assessmentId = searchParams.get("assessmentId");

    if (!docId) {
      return NextResponse.json({ error: "docId is required" }, { status: 400 });
    }

    const collection = COLLECTIONS.CMMC_CONTROL_ASSESSMENTS || CMMC_COLLECTIONS.CONTROL_ASSESSMENTS;
    const docRef = adminDb.collection(collection).doc(docId);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Control assessment not found" }, { status: 404 });
    }

    const data = snap.data()!;

    // Security check — ensure the doc belongs to the requested assessment
    if (assessmentId && data.assessmentId !== assessmentId) {
      return NextResponse.json({ error: "Control assessment not found" }, { status: 404 });
    }

    const controlDef = getControlById(data.controlId);

    return NextResponse.json({
      id: snap.id,
      ...data,
      controlDefinition: controlDef ?? null,
    });
  } catch (error) {
    console.error("Error fetching control assessment detail:", error);
    return NextResponse.json({ error: "Failed to fetch control assessment" }, { status: 500 });
  }
}
