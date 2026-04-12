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
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

// GET - list all search schedules
export async function GET() {
  if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });

  try {
    const col = collection(db, COLLECTIONS.SAM_SEARCH_SCHEDULES);
    const snap = await getDocs(query(col, orderBy("createdAt", "desc")));
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - create a new schedule
export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });

  try {
    const body = await req.json();
    const {
      name, query: searchQuery, filters, emailRecipients, emailSubject,
      schedule, scheduleDay, scheduleHour, isActive,
      createdByUserId, createdByName,
    } = body;

    if (!name || !searchQuery || !emailRecipients?.length || !schedule) {
      return NextResponse.json({ error: "name, query, emailRecipients, and schedule are required" }, { status: 400 });
    }

    const col = collection(db, COLLECTIONS.SAM_SEARCH_SCHEDULES);
    const docRef = await addDoc(col, {
      name,
      query: searchQuery,
      filters: filters || {},
      emailRecipients,
      emailSubject: emailSubject || `SAM.gov Opportunities: ${searchQuery}`,
      schedule,
      scheduleDay: scheduleDay ?? null,
      scheduleHour: scheduleHour ?? 8,
      isActive: isActive ?? true,
      lastRunAt: null,
      nextRunAt: null,
      lastResultCount: null,
      createdByUserId: createdByUserId || "",
      createdByName: createdByName || "",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - update a schedule
export async function PATCH(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });

  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const docRef = doc(db, COLLECTIONS.SAM_SEARCH_SCHEDULES, id);
    await updateDoc(docRef, { ...updates, updatedAt: Timestamp.now() });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - remove a schedule
export async function DELETE(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await deleteDoc(doc(db, COLLECTIONS.SAM_SEARCH_SCHEDULES, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
