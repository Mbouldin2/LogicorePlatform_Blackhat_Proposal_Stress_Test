import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    const sigDoc = await adminDb.collection(COLLECTIONS.PROPOSAL_SIGNATURES).doc(id).get();

    if (!sigDoc.exists) {
      return NextResponse.json({ error: "Signed document not found" }, { status: 404 });
    }

    const data = sigDoc.data()!;

    if ((data.status !== "signed" && data.status !== "signed_countersigned") || !data.signedPdfBase64) {
      return NextResponse.json({ error: "Document has not been signed yet" }, { status: 400 });
    }

    // Decode the base64 HTML and return as an HTML page that auto-triggers print
    const htmlContent = Buffer.from(data.signedPdfBase64, "base64").toString("utf-8");

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${(data.proposalName || "signed-document").replace(/[^a-zA-Z0-9]/g, "_")}_signed.html"`,
      },
    });
  } catch (error) {
    console.error("Download signed document error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to download document", details: message }, { status: 500 });
  }
}
