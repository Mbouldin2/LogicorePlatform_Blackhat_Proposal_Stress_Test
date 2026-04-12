import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const body = await request.json();
    const { proposalId } = body;

    if (!proposalId) {
      return NextResponse.json({ error: "proposalId is required" }, { status: 400 });
    }

    const proposalRef = adminDb.collection(COLLECTIONS.PROPOSALS).doc(proposalId);
    const proposalSnap = await proposalRef.get();

    if (!proposalSnap.exists) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const proposalData = proposalSnap.data();

    // If there's a linked signature doc, delete it from PROPOSAL_SIGNATURES
    if (proposalData?.signatureId) {
      try {
        await adminDb
          .collection(COLLECTIONS.PROPOSAL_SIGNATURES)
          .doc(proposalData.signatureId)
          .delete();
      } catch (err) {
        console.warn("Could not delete signature doc:", err);
      }
    }

    // Also delete any other signature docs linked to this proposal by proposalId
    try {
      const sigSnapshot = await adminDb
        .collection(COLLECTIONS.PROPOSAL_SIGNATURES)
        .where("proposalId", "==", proposalId)
        .get();
      const batch = adminDb.batch();
      sigSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
      if (!sigSnapshot.empty) await batch.commit();
    } catch (err) {
      console.warn("Could not delete linked signature docs:", err);
    }

    // Reset the proposal back to draft status, clearing all signature fields
    await proposalRef.update({
      status: "draft",
      signatureStatus: null,
      signatureId: null,
      signedAt: null,
      signerName: null,
      signerTitle: null,
      signerCompany: null,
      signatureData: null,
      countersignedBy: null,
      countersignedAt: null,
      signatureSubmissionId: null,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ success: true, message: "Signature reset. Proposal is now a draft." });
  } catch (error) {
    console.error("Reset signature error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to reset signature", details: message }, { status: 500 });
  }
}
