import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const { docId } = await params;
    if (!ObjectId.isValid(docId)) {
      return NextResponse.json({ error: "Invalid docId" }, { status: 400 });
    }

    const db = await getDb();
    const d = await db.collection("documents").findOne({
      _id: new ObjectId(docId),
    });

    if (!d) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: d._id.toString(),
      title: d.title,
      sourceType: d.sourceType,
      sourceUrl: d.sourceUrl,
      createdAt: d.createdAt,
      status: d.status,
      stats: d.stats,
    });
  } catch (err) {
    console.error("GET /api/docs/[docId] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
