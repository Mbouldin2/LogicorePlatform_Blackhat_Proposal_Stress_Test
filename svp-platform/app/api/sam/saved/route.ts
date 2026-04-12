import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

// GET - list saved opportunities (optionally filtered by assignedToUserId)
export async function GET(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });

  try {
    const { searchParams } = new URL(req.url);
    const assignedTo = searchParams.get("assignedTo");
    const userId = searchParams.get("userId");

    const col = collection(db, COLLECTIONS.SAM_SAVED_OPPORTUNITIES);
    let q;
    if (assignedTo) {
      q = query(col, where("assignedToUserId", "==", assignedTo), orderBy("createdAt", "desc"));
    } else if (userId) {
      q = query(col, where("savedByUserId", "==", userId), orderBy("createdAt", "desc"));
    } else {
      q = query(col, orderBy("createdAt", "desc"));
    }

    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("[SAM Saved] GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - save an opportunity
export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });

  try {
    const body = await req.json();
    const {
      noticeId, title, solicitationNumber, type, postedDate, responseDeadLine,
      department, organizationHierarchy, naicsCode, classificationCode,
      typeOfSetAside, description, uiLink, placeOfPerformance,
      tags, notes, assignedToUserId, assignedToName, status,
      savedByUserId, savedByName,
    } = body;

    if (!noticeId || !savedByUserId) {
      return NextResponse.json({ error: "noticeId and savedByUserId required" }, { status: 400 });
    }

    // Check for duplicate
    const col = collection(db, COLLECTIONS.SAM_SAVED_OPPORTUNITIES);
    const existing = await getDocs(query(col, where("noticeId", "==", noticeId)));
    if (!existing.empty) {
      return NextResponse.json({ error: "Already saved", id: existing.docs[0].id }, { status: 409 });
    }

    const docRef = await addDoc(col, {
      noticeId, title, solicitationNumber, type, postedDate, responseDeadLine,
      department, organizationHierarchy, naicsCode, classificationCode,
      typeOfSetAside, description, uiLink, placeOfPerformance,
      tags: tags || [],
      notes: notes || "",
      assignedToUserId: assignedToUserId || null,
      assignedToName: assignedToName || null,
      status: status || "new",
      savedByUserId,
      savedByName: savedByName || "",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error: any) {
    console.error("[SAM Saved] POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - update tags, notes, status, assignment
export async function PATCH(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });

  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const docRef = doc(db, COLLECTIONS.SAM_SAVED_OPPORTUNITIES, id);
    await updateDoc(docRef, { ...updates, updatedAt: Timestamp.now() });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[SAM Saved] PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - remove a saved opportunity
export async function DELETE(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await deleteDoc(doc(db, COLLECTIONS.SAM_SAVED_OPPORTUNITIES, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[SAM Saved] DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
