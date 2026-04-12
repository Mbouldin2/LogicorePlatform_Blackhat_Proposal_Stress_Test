import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const SETTINGS_DOC = "stripe_config";
const SETTINGS_COLLECTION = "platformSettings";

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const docRef = adminDb.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC);
    const snap = await docRef.get();

    const mode: "test" | "live" = snap.exists
      ? (snap.data()?.mode ?? "test")
      : "test";

    return NextResponse.json({ mode });
  } catch (error) {
    console.error("Error fetching Stripe config:", error);
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const body = await request.json();
    const mode = body.mode === "live" ? "live" : "test";

    const docRef = adminDb.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC);
    await docRef.set(
      { mode, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    return NextResponse.json({ mode });
  } catch (error) {
    console.error("Error saving Stripe config:", error);
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }
}
