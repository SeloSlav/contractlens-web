import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import {
  DocumentCreateSchema,
  type DocumentRecord,
} from "@contractlens/shared";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = DocumentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { sourceType, content, url, title } = parsed.data;

    if (sourceType === "text" && !content) {
      return NextResponse.json(
        { error: "content is required for text source" },
        { status: 400 }
      );
    }
    if (sourceType === "url" && !url) {
      return NextResponse.json(
        { error: "url is required for url source" },
        { status: 400 }
      );
    }
    if (sourceType === "pdf" && !content) {
      return NextResponse.json(
        { error: "content (base64) is required for pdf source" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const doc = {
      _id: new ObjectId(),
      title: title ?? "Untitled",
      sourceType,
      sourceUrl: sourceType === "url" ? url : undefined,
      content: sourceType !== "url" ? content : undefined,
      createdAt: new Date(),
      status: "queued" as const,
    };

    await db.collection("documents").insertOne(doc);

    return NextResponse.json({ docId: doc._id.toString() });
  } catch (err) {
    console.error("POST /api/docs error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const cursor = db
      .collection("documents")
      .find({})
      .sort({ createdAt: -1 })
      .limit(100);

    const docs: DocumentRecord[] = [];
    for await (const d of cursor) {
      docs.push({
        _id: d._id.toString(),
        title: d.title,
        sourceType: d.sourceType,
        sourceUrl: d.sourceUrl,
        createdAt: d.createdAt,
        status: d.status,
        stats: d.stats,
      });
    }

    return NextResponse.json({ docs });
  } catch (err) {
    console.error("GET /api/docs error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
