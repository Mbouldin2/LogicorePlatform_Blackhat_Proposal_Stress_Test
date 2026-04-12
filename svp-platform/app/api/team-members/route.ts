import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const col = collection(db, COLLECTIONS.TEAM_MEMBERS);
    const q = status ? query(col, where("status", "==", status)) : query(col);
    const snapshot = await getDocs(q);

    const teamMembers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ teamMembers });
  } catch (error) {
    console.error("[team-members GET]", error);
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}
