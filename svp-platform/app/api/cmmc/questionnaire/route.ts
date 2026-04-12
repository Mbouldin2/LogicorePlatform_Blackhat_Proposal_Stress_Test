import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { CMMC_COLLECTIONS } from "@/lib/types/cmmc";
import { Timestamp } from "firebase-admin/firestore";

/**
 * GET /api/cmmc/questionnaire?assessmentId=xxx
 * Returns all questionnaire responses for an assessment
 */
export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get("assessmentId");

    if (!assessmentId) {
      return NextResponse.json({ error: "assessmentId is required" }, { status: 400 });
    }

    const snapshot = await adminDb
      .collection(CMMC_COLLECTIONS.QUESTIONNAIRE_RESPONSES)
      .where("assessmentId", "==", assessmentId)
      .get();

    const responses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ responses });
  } catch (error) {
    console.error("Error fetching questionnaire responses:", error);
    return NextResponse.json({ error: "Failed to fetch questionnaire responses" }, { status: 500 });
  }
}

/**
 * POST /api/cmmc/questionnaire
 * Upserts questionnaire responses for an assessment
 * Body: { assessmentId: string, responses: { questionId: string, answer: string | string[] | boolean }[] }
 */
export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const body = await request.json();
    const { assessmentId, responses } = body;

    if (!assessmentId || !Array.isArray(responses)) {
      return NextResponse.json({ error: "assessmentId and responses array are required" }, { status: 400 });
    }

    const batch = adminDb.batch();
    const now = Timestamp.now();

    for (const { questionId, answer, notes } of responses) {
      if (!questionId) continue;

      // Use a deterministic doc ID so we can upsert
      const docId = `${assessmentId}_${questionId}`;
      const ref = adminDb.collection(CMMC_COLLECTIONS.QUESTIONNAIRE_RESPONSES).doc(docId);

      batch.set(
        ref,
        {
          assessmentId,
          questionId,
          answer,
          notes: notes ?? null,
          answeredAt: now,
        },
        { merge: true }
      );
    }

    await batch.commit();

    return NextResponse.json({ success: true, count: responses.length });
  } catch (error) {
    console.error("Error saving questionnaire responses:", error);
    return NextResponse.json({ error: "Failed to save questionnaire responses" }, { status: 500 });
  }
}
