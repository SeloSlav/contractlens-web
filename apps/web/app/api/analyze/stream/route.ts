import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { createAnalysisGraph } from "@/lib/analysis-graph";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const runId = request.nextUrl.searchParams.get("runId");
  if (!runId) {
    return new Response("runId required", { status: 400 });
  }

  const db = await getDb();
  const run = await db.collection("runs").findOne({
    _id: new ObjectId(runId),
  });

  if (!run) {
    return new Response("Run not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        send({ type: "start", runId });

        const graph = createAnalysisGraph();
        const inputs = run.inputs as Record<string, unknown> | undefined;
        const input = {
          docId: run.docId,
          focusAreas: (inputs?.focusAreas as string[]) ?? [],
          riskAppetite: (inputs?.riskAppetite as string) ?? "balanced",
          runId,
          retryCount: 0,
        };

        const nodes = [
          "load_doc_context",
          "retrieve_seed_clauses",
          "extract_findings",
          "consolidate_and_dedupe",
          "self_check_grounding",
          "finalize",
        ];

        for await (const chunk of await graph.stream(input, {
          streamMode: "updates",
        })) {
          for (const node of Object.keys(chunk)) {
            const data = (chunk as Record<string, unknown>)[node];
            if (data && typeof data === "object" && "findings" in data) {
              send({
                type: "node",
                node,
                data: { count: (data.findings as unknown[])?.length ?? 0 },
              });
            } else {
              send({ type: "node", node, data: {} });
            }
          }
        }

        const finalRun = await db.collection("runs").findOne({
          _id: new ObjectId(runId),
        });
        const findings = finalRun?.outputs?.findings ?? [];

        send({
          type: "complete",
          findings,
        });
      } catch (err) {
        send({
          type: "error",
          error: err instanceof Error ? err.message : String(err),
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
