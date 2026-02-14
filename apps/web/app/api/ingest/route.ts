import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const IngestBodySchema = z.object({ docId: z.string().min(1) });

const WORKER_URL = process.env.WORKER_URL ?? "http://localhost:8001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = IngestBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "docId is required" },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 2 min
    const res = await fetch(`${WORKER_URL}/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docId: parsed.data.docId }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.text();
      console.error("Worker ingest error:", err);
      return NextResponse.json(
        { error: "Ingest failed", details: err },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ accepted: true, ...data });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { error: "Ingest timed out (120s)" },
        { status: 504 }
      );
    }
    console.error("POST /api/ingest error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
