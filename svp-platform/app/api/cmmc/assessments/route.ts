import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp, Query } from "firebase-admin/firestore";
import { 
  SystemAssessment, 
  CMMC_COLLECTIONS,
  ControlAssessment,
  AssessmentStatus 
} from "@/lib/types/cmmc";
import { NIST_CONTROLS, getControlsByLevel } from "@/lib/data/nist-controls";
import { determineApplicableControls } from "@/lib/data/cmmc-questionnaire";

/**
 * GET /api/cmmc/assessments
 * Get all assessments for the current user/organization
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get("id");
    const status = searchParams.get("status") as AssessmentStatus | null;

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Get specific assessment
    if (assessmentId) {
      const doc = await adminDb
        .collection(COLLECTIONS.CMMC_ASSESSMENTS || CMMC_COLLECTIONS.ASSESSMENTS)
        .doc(assessmentId)
        .get();

      if (!doc.exists) {
        return NextResponse.json(
          { error: "Assessment not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        id: doc.id,
        ...doc.data(),
      });
    }

    // List assessments with optional filter
    let query: Query = adminDb.collection(
      COLLECTIONS.CMMC_ASSESSMENTS || CMMC_COLLECTIONS.ASSESSMENTS
    );

    if (status) {
      query = query.where("status", "==", status);
    }

    query = query.orderBy("createdAt", "desc");

    const snapshot = await query.get();
    const assessments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ assessments });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cmmc/assessments
 * Create a new assessment
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
      name,
      description,
      organizationName,
      systemOwner,
      systemOwnerEmail,
      securityOfficer,
      securityOfficerEmail,
      systemType,
      cloudProvider,
      handlesCUI,
      cuiCategories,
      networkDiagramAvailable,
      userCount,
      targetLevel = 2,
    } = data;

    // Validate required fields
    if (!name || !systemOwner || !systemOwnerEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create assessment
    const assessmentData: Omit<SystemAssessment, "id"> = {
      name,
      description: description || "",
      organizationName: organizationName || "",
      systemOwner,
      systemOwnerEmail,
      securityOfficer: securityOfficer || "",
      securityOfficerEmail: securityOfficerEmail || "",
      systemType: systemType || "on_premise",
      cloudProvider: cloudProvider || "",
      handlesCUI: handlesCUI || false,
      cuiCategories: cuiCategories || [],
      networkDiagramAvailable: networkDiagramAvailable || false,
      userCount: userCount || 0,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
      targetLevel,
    };

    const docRef = await adminDb
      .collection(COLLECTIONS.CMMC_ASSESSMENTS || CMMC_COLLECTIONS.ASSESSMENTS)
      .add({
        ...assessmentData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

    // Initialize control assessments for the target CMMC level
    await initializeControlAssessments(docRef.id, targetLevel);

    return NextResponse.json({
      success: true,
      assessmentId: docRef.id,
      assessment: {
        id: docRef.id,
        ...assessmentData,
      },
    });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { error: "Failed to create assessment" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cmmc/assessments
 * Update an existing assessment
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
    const { assessmentId, ...updates } = data;

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID required" },
        { status: 400 }
      );
    }

    // Add updated timestamp
    updates.updatedAt = Timestamp.now();

    await adminDb
      .collection(COLLECTIONS.CMMC_ASSESSMENTS || CMMC_COLLECTIONS.ASSESSMENTS)
      .doc(assessmentId)
      .update(updates);

    return NextResponse.json({
      success: true,
      message: "Assessment updated successfully",
    });
  } catch (error) {
    console.error("Error updating assessment:", error);
    return NextResponse.json(
      { error: "Failed to update assessment" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cmmc/assessments
 * Delete an assessment and related data
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
    const assessmentId = searchParams.get("id");

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID required" },
        { status: 400 }
      );
    }

    // Delete control assessments
    const controlAssessments = await adminDb
      .collection(COLLECTIONS.CMMC_CONTROL_ASSESSMENTS || CMMC_COLLECTIONS.CONTROL_ASSESSMENTS)
      .where("assessmentId", "==", assessmentId)
      .get();

    const batch = adminDb.batch();
    controlAssessments.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete the assessment
    batch.delete(
      adminDb
        .collection(COLLECTIONS.CMMC_ASSESSMENTS || CMMC_COLLECTIONS.ASSESSMENTS)
        .doc(assessmentId)
    );

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: "Assessment and related data deleted",
    });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    return NextResponse.json(
      { error: "Failed to delete assessment" },
      { status: 500 }
    );
  }
}

/**
 * Initialize control assessments for a new assessment
 */
async function initializeControlAssessments(
  assessmentId: string,
  targetLevel: number
) {
  if (!adminDb) return;

  const controls = getControlsByLevel(targetLevel as 1 | 2 | 3);
  const batch = adminDb.batch();

  for (const control of controls) {
    const controlAssessment: Omit<ControlAssessment, "id"> = {
      assessmentId,
      controlId: control.id,
      isApplicable: true, // Default to applicable, will be refined by AI
      status: "not_tested",
      hasFinding: false,
      updatedAt: new Date(),
    };

    const docRef = adminDb
      .collection(COLLECTIONS.CMMC_CONTROL_ASSESSMENTS || CMMC_COLLECTIONS.CONTROL_ASSESSMENTS)
      .doc();

    batch.set(docRef, {
      ...controlAssessment,
      updatedAt: Timestamp.now(),
    });
  }

  await batch.commit();
}
