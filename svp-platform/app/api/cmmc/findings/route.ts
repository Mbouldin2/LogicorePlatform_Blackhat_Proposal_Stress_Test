import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";
import { CMMC_COLLECTIONS, Finding, POAM, POAMStatus } from "@/lib/types/cmmc";
import { getControlById } from "@/lib/data/nist-controls";

/**
 * GET /api/cmmc/findings
 * Get findings for an assessment
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get("assessmentId");
    const findingId = searchParams.get("id");
    const severity = searchParams.get("severity");

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Get specific finding
    if (findingId) {
      const doc = await adminDb
        .collection(COLLECTIONS.CMMC_FINDINGS || CMMC_COLLECTIONS.FINDINGS)
        .doc(findingId)
        .get();

      if (!doc.exists) {
        return NextResponse.json(
          { error: "Finding not found" },
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

    // Get findings for assessment
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID required" },
        { status: 400 }
      );
    }

    let query = adminDb
      .collection(COLLECTIONS.CMMC_FINDINGS || CMMC_COLLECTIONS.FINDINGS)
      .where("assessmentId", "==", assessmentId);

    if (severity) {
      query = query.where("severity", "==", severity);
    }

    const snapshot = await query.get();
    const findings = snapshot.docs.map((doc) => {
      const data = doc.data();
      const control = getControlById(data.controlId);

      return {
        id: doc.id,
        ...data,
        controlDefinition: control,
      };
    });

    // Sort in-memory to avoid requiring a composite Firestore index
    findings.sort((a, b) => {
      const aData = a as Record<string, any>;
      const bData = b as Record<string, any>;
      const aTime = aData.identifiedAt?.toMillis?.() ?? aData.identifiedAt?.seconds ?? 0;
      const bTime = bData.identifiedAt?.toMillis?.() ?? bData.identifiedAt?.seconds ?? 0;
      return bTime - aTime;
    });

    return NextResponse.json({ findings });
  } catch (error) {
    console.error("Error fetching findings:", error);
    return NextResponse.json(
      { error: "Failed to fetch findings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cmmc/findings
 * Create a new finding
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
      controlId,
      controlAssessmentId,
      title,
      description,
      severity,
      rootCause,
      affectedAssets,
      identifiedBy,
      aiRiskAnalysis,
      aiRemediationSuggestions,
    } = data;

    // Validate required fields
    if (!assessmentId || !controlId || !title || !severity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const findingData: Omit<Finding, "id"> = {
      assessmentId,
      controlId,
      controlAssessmentId: controlAssessmentId || "",
      title,
      description: description || "",
      severity,
      rootCause: rootCause || "",
      affectedAssets: affectedAssets || [],
      identifiedBy: identifiedBy || "System",
      identifiedAt: new Date(),
      updatedAt: new Date(),
    };

    if (aiRiskAnalysis) findingData.aiRiskAnalysis = aiRiskAnalysis;
    if (aiRemediationSuggestions) findingData.aiRemediationSuggestions = aiRemediationSuggestions;

    const docRef = await adminDb
      .collection(COLLECTIONS.CMMC_FINDINGS || CMMC_COLLECTIONS.FINDINGS)
      .add({
        ...findingData,
        identifiedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

    // Update control assessment to mark hasFinding
    if (controlAssessmentId) {
      await adminDb
        .collection(COLLECTIONS.CMMC_CONTROL_ASSESSMENTS || CMMC_COLLECTIONS.CONTROL_ASSESSMENTS)
        .doc(controlAssessmentId)
        .update({
          hasFinding: true,
          findingId: docRef.id,
          updatedAt: Timestamp.now(),
        });
    }

    return NextResponse.json({
      success: true,
      findingId: docRef.id,
      finding: {
        id: docRef.id,
        ...findingData,
      },
    });
  } catch (error) {
    console.error("Error creating finding:", error);
    return NextResponse.json(
      { error: "Failed to create finding" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cmmc/findings
 * Update a finding
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
    const { findingId, ...updates } = data;

    if (!findingId) {
      return NextResponse.json(
        { error: "Finding ID required" },
        { status: 400 }
      );
    }

    updates.updatedAt = Timestamp.now();

    await adminDb
      .collection(COLLECTIONS.CMMC_FINDINGS || CMMC_COLLECTIONS.FINDINGS)
      .doc(findingId)
      .update(updates);

    return NextResponse.json({
      success: true,
      message: "Finding updated successfully",
    });
  } catch (error) {
    console.error("Error updating finding:", error);
    return NextResponse.json(
      { error: "Failed to update finding" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cmmc/findings
 * Delete a finding
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
    const findingId = searchParams.get("id");

    if (!findingId) {
      return NextResponse.json(
        { error: "Finding ID required" },
        { status: 400 }
      );
    }

    // Get finding to check for linked POAM
    const findingDoc = await adminDb
      .collection(COLLECTIONS.CMMC_FINDINGS || CMMC_COLLECTIONS.FINDINGS)
      .doc(findingId)
      .get();

    if (!findingDoc.exists) {
      return NextResponse.json(
        { error: "Finding not found" },
        { status: 404 }
      );
    }

    const finding = findingDoc.data() as Finding;

    // Delete linked POAM if exists
    if (finding.poamId) {
      await adminDb
        .collection(COLLECTIONS.CMMC_POAMS || CMMC_COLLECTIONS.POAMS)
        .doc(finding.poamId)
        .delete();
    }

    // Update control assessment to clear finding
    if (finding.controlAssessmentId) {
      await adminDb
        .collection(COLLECTIONS.CMMC_CONTROL_ASSESSMENTS || CMMC_COLLECTIONS.CONTROL_ASSESSMENTS)
        .doc(finding.controlAssessmentId)
        .update({
          hasFinding: false,
          findingId: null,
          updatedAt: Timestamp.now(),
        });
    }

    // Delete finding
    await adminDb
      .collection(COLLECTIONS.CMMC_FINDINGS || CMMC_COLLECTIONS.FINDINGS)
      .doc(findingId)
      .delete();

    return NextResponse.json({
      success: true,
      message: "Finding deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting finding:", error);
    return NextResponse.json(
      { error: "Failed to delete finding" },
      { status: 500 }
    );
  }
}
