import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";
import { CMMC_COLLECTIONS, SystemAssessment, Finding, ControlAssessment } from "@/lib/types/cmmc";
import { 
  generateControlAnalysis, 
  generateControlResponse,
  analyzeFinding,
  generatePOAMSuggestion,
  performPreAudit,
  AIControlAnalysis,
  AIResponseSuggestion,
  AIFindingAnalysis,
  AIPOAMSuggestion,
  AIPreAuditResult,
} from "@/lib/ai/cmmc-ai-service";
import { getControlById } from "@/lib/data/nist-controls";

/**
 * POST /api/cmmc/ai/analyze-control
 * AI analysis for a specific control
 */
export async function POST_ANALYZE_CONTROL(request: NextRequest) {
  try {
    const data = await request.json();
    const { controlId, assessmentId, questionnaireResponses } = data;

    if (!controlId || !assessmentId) {
      return NextResponse.json(
        { error: "Control ID and Assessment ID required" },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Get assessment data
    const assessmentDoc = await adminDb
      .collection(COLLECTIONS.CMMC_ASSESSMENTS || CMMC_COLLECTIONS.ASSESSMENTS)
      .doc(assessmentId)
      .get();

    if (!assessmentDoc.exists) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const assessment = {
      id: assessmentId,
      ...assessmentDoc.data(),
    } as SystemAssessment;

    // Generate AI analysis
    const analysis = await generateControlAnalysis(
      controlId,
      assessment,
      questionnaireResponses
    );

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error analyzing control:", error);
    return NextResponse.json(
      { error: "Failed to analyze control" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cmmc/ai/suggest-response
 * AI-suggested response for control implementation
 */
export async function POST_SUGGEST_RESPONSE(request: NextRequest) {
  try {
    const data = await request.json();
    const { controlId, assessmentId, existingImplementation } = data;

    if (!controlId || !assessmentId) {
      return NextResponse.json(
        { error: "Control ID and Assessment ID required" },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Get assessment data
    const assessmentDoc = await adminDb
      .collection(COLLECTIONS.CMMC_ASSESSMENTS || CMMC_COLLECTIONS.ASSESSMENTS)
      .doc(assessmentId)
      .get();

    if (!assessmentDoc.exists) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const assessment = assessmentDoc.data() as unknown as SystemAssessment;

    // Generate AI response suggestion
    const suggestion = await generateControlResponse(
      controlId,
      assessment,
      existingImplementation
    );

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("Error generating response suggestion:", error);
    return NextResponse.json(
      { error: "Failed to generate response suggestion" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cmmc/ai/analyze-finding
 * AI analysis for a finding
 */
export async function POST_ANALYZE_FINDING(request: NextRequest) {
  try {
    const data = await request.json();
    const { findingId, assessmentId } = data;

    if (!findingId || !assessmentId) {
      return NextResponse.json(
        { error: "Finding ID and Assessment ID required" },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Get finding data
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

    const finding = findingDoc.data() as unknown as Finding;
    finding.id = findingId;

    // Get control assessment
    const controlAssessmentDoc = await adminDb
      .collection(COLLECTIONS.CMMC_CONTROL_ASSESSMENTS || CMMC_COLLECTIONS.CONTROL_ASSESSMENTS)
      .doc(finding.controlAssessmentId)
      .get();

    const controlAssessment = controlAssessmentDoc.exists 
      ? (controlAssessmentDoc.data() as unknown as ControlAssessment)
      : null;

    // Get assessment
    const assessmentDoc = await adminDb
      .collection(COLLECTIONS.CMMC_ASSESSMENTS || CMMC_COLLECTIONS.ASSESSMENTS)
      .doc(assessmentId)
      .get();

    const assessment = assessmentDoc.exists
      ? (assessmentDoc.data() as unknown as SystemAssessment)
      : {} as SystemAssessment;

    // Generate AI analysis
    const analysis = await analyzeFinding(
      finding,
      controlAssessment || {
        id: '',
        assessmentId: '',
        controlId: finding.controlId,
        isApplicable: true,
        status: 'not_implemented',
        hasFinding: true,
        updatedAt: new Date(),
      },
      assessment
    );

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error analyzing finding:", error);
    return NextResponse.json(
      { error: "Failed to analyze finding" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cmmc/ai/suggest-poam
 * AI-suggested POAM for a finding
 */
export async function POST_SUGGEST_POAM(request: NextRequest) {
  try {
    const data = await request.json();
    const { findingId, assessmentId } = data;

    if (!findingId || !assessmentId) {
      return NextResponse.json(
        { error: "Finding ID and Assessment ID required" },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Get finding data
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

    const finding = findingDoc.data() as unknown as Finding;
    finding.id = findingId;

    // Get control assessment
    const controlAssessmentDoc = await adminDb
      .collection(COLLECTIONS.CMMC_CONTROL_ASSESSMENTS || CMMC_COLLECTIONS.CONTROL_ASSESSMENTS)
      .doc(finding.controlAssessmentId)
      .get();

    const controlAssessment = controlAssessmentDoc.exists
      ? (controlAssessmentDoc.data() as unknown as ControlAssessment)
      : null;

    // Get assessment
    const assessmentDoc = await adminDb
      .collection(COLLECTIONS.CMMC_ASSESSMENTS || CMMC_COLLECTIONS.ASSESSMENTS)
      .doc(assessmentId)
      .get();

    const assessment = assessmentDoc.exists
      ? (assessmentDoc.data() as unknown as SystemAssessment)
      : {} as SystemAssessment;

    // Generate AI POAM suggestion
    const suggestion = await generatePOAMSuggestion(
      finding,
      controlAssessment || {
        id: '',
        assessmentId: '',
        controlId: finding.controlId,
        isApplicable: true,
        status: 'not_implemented',
        hasFinding: true,
        updatedAt: new Date(),
      },
      assessment
    );

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("Error generating POAM suggestion:", error);
    return NextResponse.json(
      { error: "Failed to generate POAM suggestion" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cmmc/ai/pre-audit
 * Perform AI pre-audit of the system
 */
export async function POST_PRE_AUDIT(request: NextRequest) {
  try {
    const data = await request.json();
    const { assessmentId, scopeControls } = data;

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID required" },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Get assessment data
    const assessmentDoc = await adminDb
      .collection(COLLECTIONS.CMMC_ASSESSMENTS || CMMC_COLLECTIONS.ASSESSMENTS)
      .doc(assessmentId)
      .get();

    if (!assessmentDoc.exists) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const assessment = assessmentDoc.data() as unknown as SystemAssessment;
    assessment.id = assessmentId;

    // Get control assessments
    const controlAssessmentsSnapshot = await adminDb
      .collection(COLLECTIONS.CMMC_CONTROL_ASSESSMENTS || CMMC_COLLECTIONS.CONTROL_ASSESSMENTS)
      .where("assessmentId", "==", assessmentId)
      .get();

    const controlAssessments = controlAssessmentsSnapshot.docs.map((doc) => ({
      ...(doc.data() as ControlAssessment),
      id: doc.id,
    })) as ControlAssessment[];

    // Perform AI pre-audit
    const auditResult = await performPreAudit(
      assessment,
      controlAssessments.map(ca => ({
        ...ca,
        hasFinding: ca.status !== 'implemented' && ca.status !== 'not_applicable',
        updatedAt: new Date(),
      })),
      scopeControls
    );

    // Store pre-audit result
    const preAuditDoc = await adminDb
      .collection(COLLECTIONS.CMMC_PRE_AUDITS || CMMC_COLLECTIONS.PRE_AUDITS)
      .add({
        assessmentId,
        type: 'pre_audit',
        status: 'completed',
        result: auditResult,
        createdAt: Timestamp.now(),
        completedAt: Timestamp.now(),
      });

    return NextResponse.json({
      auditResult,
      preAuditId: preAuditDoc.id,
    });
  } catch (error) {
    console.error("Error performing pre-audit:", error);
    return NextResponse.json(
      { error: "Failed to perform pre-audit" },
      { status: 500 }
    );
  }
}

/**
 * Main handler that routes to specific endpoints
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  switch (action) {
    case "analyze-control":
      return POST_ANALYZE_CONTROL(request);
    case "suggest-response":
      return POST_SUGGEST_RESPONSE(request);
    case "analyze-finding":
      return POST_ANALYZE_FINDING(request);
    case "suggest-poam":
      return POST_SUGGEST_POAM(request);
    case "pre-audit":
      return POST_PRE_AUDIT(request);
    default:
      return NextResponse.json(
        { error: "Invalid action. Valid actions: analyze-control, suggest-response, analyze-finding, suggest-poam, pre-audit" },
        { status: 400 }
      );
  }
}
