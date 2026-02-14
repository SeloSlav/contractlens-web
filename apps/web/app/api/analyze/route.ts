import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";

const AnalyzeBodySchema = z.object({
  docId: z.string().min(1),
  focusAreas: z.array(z.string()).optional(),
  riskAppetite: z.enum(["conservative", "balanced", "aggressive"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = AnalyzeBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { docId, focusAreas, riskAppetite } = parsed.data;

    const db = await getDb();
    const runDoc = {
      _id: new ObjectId(),
      docId,
      type: "analysis",
      status: "running",
      createdAt: new Date(),
      provider: "openai",
      model: "gpt-4o-mini",
      inputs: { docId, focusAreas, riskAppetite },
    };
    await db.collection("runs").insertOne(runDoc);

    return NextResponse.json({ runId: runDoc._id.toString() });
  } catch (err) {
    console.error("POST /api/analyze error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
