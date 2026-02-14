import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { FeedbackCreateSchema } from "@contractlens/shared";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = FeedbackCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { runId, findingId, rating, note } = parsed.data;

    const db = await getDb();
    await db.collection("feedback").insertOne({
      runId,
      findingId: findingId ?? null,
      rating,
      note: note ?? null,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/feedback error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
