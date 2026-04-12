import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";
import { CMMC_COLLECTIONS, POAM, POAMStatus } from "@/lib/types/cmmc";
import { getControlById } from "@/lib/data/nist-controls";

/**
 * GET /api/cmmc/poams
 * Get POAMs for an assessment
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get("assessmentId");
    const poamId = searchParams.get("id");
    const status = searchParams.get("status") as POAMStatus | null;

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Get specific POAM
    if (poamId) {
      const doc = await adminDb
        .collection(COLLECTIONS.CMMC_POAMS || CMMC_COLLECTIONS.POAMS)
        .doc(poamId)
        .get();

      if (!doc.exists) {
        return NextResponse.json(
          { error: "POAM not found" },
          { status: 404 }
        );
      }

      const data = doc.data();
      const control = getControlById(data?.controlId);

      return NextResponse.json({
        id: doc.id,
        ...data,
        controlDefinition: control,
      });
    }

    // Get POAMs for assessment
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID required" },
        { status: 400 }
      );
    }

    let query = adminDb
      .collection(COLLECTIONS.CMMC_POAMS || CMMC_COLLECTIONS.POAMS)
      .where("assessmentId", "==", assessmentId);

    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    const poams = snapshot.docs.map((doc) => {
      const data = doc.data();
      const control = getControlById(data.controlId);

      return {
        id: doc.id,
        ...data,
        controlDefinition: control,
      };
    });

    // Sort in-memory to avoid requiring a composite Firestore index
    poams.sort((a, b) => {
      const aData = a as Record<string, any>;
      const bData = b as Record<string, any>;
      const aTime = aData.createdAt?.toMillis?.() ?? aData.createdAt?.seconds ?? 0;
      const bTime = bData.createdAt?.toMillis?.() ?? bData.createdAt?.seconds ?? 0;
      return bTime - aTime;
    });

    return NextResponse.json({ poams });
  } catch (error) {
    console.error("Error fetching POAMs:", error);
    return NextResponse.json(
      { error: "Failed to fetch POAMs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cmmc/poams
 * Create a new POAM
 */
export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const data = await request.json();
    const {
      assessmentId,
      findingId,
      controlId,
      weaknessDescription,
      severity,
      correctiveAction,
      resourcesRequired,
      responsibleParty,
      responsiblePartyEmail,
      scheduledCompletionDate,
      milestones,
      aiSuggestedSteps,
      aiPriorityRanking,
      aiResourceEstimate,
    } = data;

    // Validate required fields
    if (!assessmentId || !controlId || !weaknessDescription || !scheduledCompletionDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const poamData: Omit<POAM, "id"> = {
      assessmentId,
      findingId: findingId || "",
      controlId,
      weaknessDescription,
      severity: severity || "medium",
      correctiveAction: correctiveAction || "",
      resourcesRequired: resourcesRequired || [],
      responsibleParty: responsibleParty || "",
      responsiblePartyEmail: responsiblePartyEmail || "",
      scheduledCompletionDate: new Date(scheduledCompletionDate),
      milestones: milestones || [],
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system", // Should be current user
    };

    if (aiSuggestedSteps) poamData.aiSuggestedSteps = aiSuggestedSteps;
    if (aiPriorityRanking) poamData.aiPriorityRanking = aiPriorityRanking;
    if (aiResourceEstimate) poamData.aiResourceEstimate = aiResourceEstimate;

    const docRef = await adminDb
      .collection(COLLECTIONS.CMMC_POAMS || CMMC_COLLECTIONS.POAMS)
      .add({
        ...poamData,
        scheduledCompletionDate: Timestamp.fromDate(new Date(scheduledCompletionDate)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

    // Update finding with POAM link
    if (findingId) {
      await adminDb
        .collection(COLLECTIONS.CMMC_FINDINGS || CMMC_COLLECTIONS.FINDINGS)
        .doc(findingId)
        .update({
          poamId: docRef.id,
          updatedAt: Timestamp.now(),
        });
    }

    return NextResponse.json({
      success: true,
      poamId: docRef.id,
      poam: {
        id: docRef.id,
        ...poamData,
      },
    });
  } catch (error) {
    console.error("Error creating POAM:", error);
    return NextResponse.json(
      { error: "Failed to create POAM" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cmmc/poams
 * Update a POAM
 */
export async function PUT(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const data = await request.json();
    const { poamId, ...updates } = data;

    if (!poamId) {
      return NextResponse.json(
        { error: "POAM ID required" },
        { status: 400 }
      );
    }

    // Convert dates to timestamps
    if (updates.scheduledCompletionDate) {
      updates.scheduledCompletionDate = Timestamp.fromDate(new Date(updates.scheduledCompletionDate));
    }
    if (updates.actualCompletionDate) {
      updates.actualCompletionDate = Timestamp.fromDate(new Date(updates.actualCompletionDate));
    }
    if (updates.milestones) {
      updates.milestones = updates.milestones.map((m: { targetDate?: string; completedDate?: string }) => ({
        ...m,
        targetDate: m.targetDate ? Timestamp.fromDate(new Date(m.targetDate)) : undefined,
        completedDate: m.completedDate ? Timestamp.fromDate(new Date(m.completedDate)) : undefined,
      }));
    }

    updates.updatedAt = Timestamp.now();

    await adminDb
      .collection(COLLECTIONS.CMMC_POAMS || CMMC_COLLECTIONS.POAMS)
      .doc(poamId)
      .update(updates);

    return NextResponse.json({
      success: true,
      message: "POAM updated successfully",
    });
  } catch (error) {
    console.error("Error updating POAM:", error);
    return NextResponse.json(
      { error: "Failed to update POAM" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cmmc/poams
 * Delete a POAM
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const poamId = searchParams.get("id");

    if (!poamId) {
      return NextResponse.json(
        { error: "POAM ID required" },
        { status: 400 }
      );
    }

    // Get POAM to check for linked finding
    const poamDoc = await adminDb
      .collection(COLLECTIONS.CMMC_POAMS || CMMC_COLLECTIONS.POAMS)
      .doc(poamId)
      .get();

    if (!poamDoc.exists) {
      return NextResponse.json(
        { error: "POAM not found" },
        { status: 404 }
      );
    }

    const poam = poamDoc.data() as POAM;

    // Clear finding link if exists
    if (poam.findingId) {
      await adminDb
        .collection(COLLECTIONS.CMMC_FINDINGS || CMMC_COLLECTIONS.FINDINGS)
        .doc(poam.findingId)
        .update({
          poamId: null,
          updatedAt: Timestamp.now(),
        });
    }

    // Delete POAM
    await adminDb
      .collection(COLLECTIONS.CMMC_POAMS || CMMC_COLLECTIONS.POAMS)
      .doc(poamId)
      .delete();

    return NextResponse.json({
      success: true,
      message: "POAM deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting POAM:", error);
    return NextResponse.json(
      { error: "Failed to delete POAM" },
      { status: 500 }
    );
  }
}
