import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const docId = request.nextUrl.searchParams.get("docId");
  if (!docId) {
    return NextResponse.json({ error: "docId required" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const runs = await db
      .collection("runs")
      .find({ docId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    const result = runs.map((r) => ({
      _id: r._id.toString(),
      docId: r.docId,
      type: r.type,
      createdAt: r.createdAt,
      status: r.status,
      durationMs: r.durationMs,
      outputs: r.outputs,
    }));

    return NextResponse.json({ runs: result });
  } catch (err) {
    console.error("GET /api/runs error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
