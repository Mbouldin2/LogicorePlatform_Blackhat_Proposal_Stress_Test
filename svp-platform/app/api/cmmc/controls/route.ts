import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";
import { 
  ControlAssessment,
  CMMC_COLLECTIONS,
  ControlStatus 
} from "@/lib/types/cmmc";
import { getControlById, NIST_CONTROLS } from "@/lib/data/nist-controls";

/**
 * GET /api/cmmc/controls
 * Get control assessments for an assessment
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get("assessmentId");
    const controlId = searchParams.get("controlId");

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID required" },
        { status: 400 }
      );
    }

    // Get specific control assessment
    if (controlId) {
      const snapshot = await adminDb
        .collection(COLLECTIONS.CMMC_CONTROL_ASSESSMENTS || CMMC_COLLECTIONS.CONTROL_ASSESSMENTS)
        .where("assessmentId", "==", assessmentId)
        .where("controlId", "==", controlId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return NextResponse.json(
          { error: "Control assessment not found" },
          { status: 404 }
        );
      }

      const doc = snapshot.docs[0];
      const controlDef = getControlById(controlId);

      return NextResponse.json({
        id: doc.id,
        ...doc.data(),
        controlDefinition: controlDef,
      });
    }

    // Get all control assessments for assessment
    const snapshot = await adminDb
      .collection(COLLECTIONS.CMMC_CONTROL_ASSESSMENTS || CMMC_COLLECTIONS.CONTROL_ASSESSMENTS)
      .where("assessmentId", "==", assessmentId)
      .get();

    const controlAssessments = snapshot.docs.map((doc) => {
      const data = doc.data() as ControlAssessment & { controlId: string };
      const controlDef = getControlById(data.controlId);
      
      return {
        ...data,
        id: doc.id,
        controlDefinition: controlDef,
      };
    });

    // Sort by control ID
    controlAssessments.sort((a, b) => a.controlId.localeCompare(b.controlId));

    return NextResponse.json({ controlAssessments });
  } catch (error) {
    console.error("Error fetching control assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch control assessments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cmmc/controls
 * Update a control assessment
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
      controlAssessmentId,
      isApplicable,
      notApplicableReason,
      status,
      implementationDescription,
      implementationEvidence,
      aiSuggestedResponse,
      aiArtifacts,
      aiRecommendations,
      assessorNotes,
      artifactsReviewed,
      interviewsConducted,
      testsPerformed,
      hasFinding,
      findingId,
    } = data;

    if (!controlAssessmentId) {
      return NextResponse.json(
        { error: "Control Assessment ID required" },
        { status: 400 }
      );
    }

    const updates: Partial<ControlAssessment> = {
      updatedAt: new Date(),
    };

    if (isApplicable !== undefined) updates.isApplicable = isApplicable;
    if (notApplicableReason !== undefined) updates.notApplicableReason = notApplicableReason;
    if (status !== undefined) updates.status = status as ControlStatus;
    if (implementationDescription !== undefined) updates.implementationDescription = implementationDescription;
    if (implementationEvidence !== undefined) updates.implementationEvidence = implementationEvidence;
    if (aiSuggestedResponse !== undefined) updates.aiSuggestedResponse = aiSuggestedResponse;
    if (aiArtifacts !== undefined) updates.aiArtifacts = aiArtifacts;
    if (aiRecommendations !== undefined) updates.aiRecommendations = aiRecommendations;
    if (assessorNotes !== undefined) updates.assessorNotes = assessorNotes;
    if (artifactsReviewed !== undefined) updates.artifactsReviewed = artifactsReviewed;
    if (interviewsConducted !== undefined) updates.interviewsConducted = interviewsConducted;
    if (testsPerformed !== undefined) updates.testsPerformed = testsPerformed;
    if (hasFinding !== undefined) updates.hasFinding = hasFinding;
    if (findingId !== undefined) updates.findingId = findingId;

    await adminDb
      .collection(COLLECTIONS.CMMC_CONTROL_ASSESSMENTS || CMMC_COLLECTIONS.CONTROL_ASSESSMENTS)
      .doc(controlAssessmentId)
      .update({
        ...updates,
        updatedAt: Timestamp.now(),
      });

    return NextResponse.json({
      success: true,
      message: "Control assessment updated successfully",
    });
  } catch (error) {
    console.error("Error updating control assessment:", error);
    return NextResponse.json(
      { error: "Failed to update control assessment" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cmmc/controls/bulk
 * Bulk update control assessments
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
    const { assessmentId, updates } = data;

    if (!assessmentId || !updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Assessment ID and updates array required" },
        { status: 400 }
      );
    }

    const batch = adminDb.batch();

    for (const update of updates) {
      if (!update.controlAssessmentId) continue;

      const docRef = adminDb
        .collection(COLLECTIONS.CMMC_CONTROL_ASSESSMENTS || CMMC_COLLECTIONS.CONTROL_ASSESSMENTS)
        .doc(update.controlAssessmentId);

      const { controlAssessmentId, ...updateData } = update;
      updateData.updatedAt = Timestamp.now();

      batch.update(docRef, updateData);
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} control assessments`,
    });
  } catch (error) {
    console.error("Error bulk updating control assessments:", error);
    return NextResponse.json(
      { error: "Failed to update control assessments" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cmmc/controls/families
 * Get controls grouped by family
 */
export async function GET_FAMILIES() {
  const families: Record<string, typeof NIST_CONTROLS> = {};
  
  for (const control of NIST_CONTROLS) {
    if (!families[control.family]) {
      families[control.family] = [];
    }
    families[control.family].push(control);
  }

  return NextResponse.json({ families });
}

/**
 * GET /api/cmmc/controls/stats
 * Get control statistics for an assessment
 */
export async function GET_STATS(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get("assessmentId");

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID required" },
        { status: 400 }
      );
    }

    const snapshot = await adminDb
      .collection(COLLECTIONS.CMMC_CONTROL_ASSESSMENTS || CMMC_COLLECTIONS.CONTROL_ASSESSMENTS)
      .where("assessmentId", "==", assessmentId)
      .get();

    const stats = {
      total: snapshot.size,
      applicable: 0,
      notApplicable: 0,
      implemented: 0,
      partiallyImplemented: 0,
      notImplemented: 0,
      notTested: 0,
      byFamily: {} as Record<string, { total: number; implemented: number }>,
      byLevel: { 1: 0, 2: 0, 3: 0 } as Record<number, number>,
    };

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const control = getControlById(data.controlId);

      if (data.isApplicable) {
        stats.applicable++;
      } else {
        stats.notApplicable++;
      }

      switch (data.status) {
        case 'implemented':
          stats.implemented++;
          break;
        case 'partially_implemented':
          stats.partiallyImplemented++;
          break;
        case 'not_implemented':
          stats.notImplemented++;
          break;
        case 'not_tested':
        default:
          stats.notTested++;
          break;
      }

      if (control) {
        // By family
        if (!stats.byFamily[control.family]) {
          stats.byFamily[control.family] = { total: 0, implemented: 0 };
        }
        stats.byFamily[control.family].total++;
        if (data.status === 'implemented') {
          stats.byFamily[control.family].implemented++;
        }

        // By level
        stats.byLevel[control.cmmcLevel]++;
      }
    }

    const complianceScore = stats.applicable > 0
      ? Math.round((stats.implemented / stats.applicable) * 100)
      : 0;

    return NextResponse.json({
      stats,
      complianceScore,
    });
  } catch (error) {
    console.error("Error fetching control stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch control statistics" },
      { status: 500 }
    );
  }
}
