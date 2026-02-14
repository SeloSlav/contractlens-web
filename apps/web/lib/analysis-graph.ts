import {
  StateGraph,
  Annotation,
  START,
  END,
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import { queryByDocId } from "./chroma";
import type { Finding } from "@contractlens/shared";

const CATEGORIES = [
  "termination",
  "liability",
  "indemnity",
  "privacy",
  "payment",
  "renewal",
  "jurisdiction",
  "IP",
  "confidentiality",
  "warranty",
  "limitation_of_liability",
  "assignment",
  "dispute_resolution",
  "SLA",
];

const AnalysisState = Annotation.Root({
  docId: Annotation<string>(),
  focusAreas: Annotation<string[]>(),
  riskAppetite: Annotation<string>(),
  docContext: Annotation<Record<string, unknown>>(),
  seedClauses: Annotation<Record<string, { id: string; text: string }[]>>(),
  findings: Annotation<Finding[]>(),
  runId: Annotation<string>(),
  retryCount: Annotation<number>(),
});

type State = typeof AnalysisState.State;

async function loadDocContext(state: State): Promise<Partial<State>> {
  const db = await getDb();
  const doc = await db.collection("documents").findOne({
    _id: new ObjectId(state.docId),
  });
  if (!doc) throw new Error("Document not found");
  return {
    docContext: {
      _id: String(doc._id),
      title: doc.title,
      sourceType: doc.sourceType,
      status: doc.status,
    },
  };
}

async function retrieveSeedClauses(state: State): Promise<Partial<State>> {
  const focusAreas = state.focusAreas?.length
    ? state.focusAreas
    : CATEGORIES;
  const seedClauses: Record<string, { id: string; text: string }[]> = {};
  const retryCount = (state.retryCount ?? 0) + 1;

  for (const cat of focusAreas) {
    const chunks = await queryByDocId(state.docId, cat, 5);
    seedClauses[cat] = chunks.map((c) => ({ id: c.id, text: c.text }));
  }

  return { seedClauses, retryCount };
}

async function extractFindings(state: State): Promise<Partial<State>> {
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0,
  });

  const findings: Finding[] = [];
  const schema = `{
    "risk_level": "low" | "medium" | "high",
    "category": "string",
    "title": "string",
    "description": "string",
    "why_it_matters": "string",
    "suggested_questions": ["string"],
    "suggested_redline": "string (optional)",
    "citations": [{"docId": "string", "chunkId": "string", "snippet": "string"}],
    "confidence": 0.0-1.0
  }`;

  for (const [cat, chunks] of Object.entries(state.seedClauses ?? {})) {
    if (chunks.length === 0) continue;
    const context = chunks.map((c) => `[${c.id}]: ${c.text}`).join("\n\n");
    const res = await model.invoke([
      {
        role: "system",
        content: `You are a contract risk analyst. Extract risk findings from the provided clauses. 
Output valid JSON matching this schema: ${schema}
Only report findings that are grounded in the text. Every finding MUST have at least one citation with a chunkId from the context.
Do not provide legal advice. Focus on risk signals and questions for counsel.`,
      },
      {
        role: "user",
        content: `Category: ${cat}\n\nContext:\n${context}\n\nExtract findings as JSON array. If no relevant findings, return [].`,
      },
    ]);

    const text = typeof res.content === "string" ? res.content : "";
    try {
      const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      for (const f of arr) {
        if (f && f.citations?.length > 0) {
          findings.push({
            risk_level: f.risk_level ?? "medium",
            category: f.category ?? cat,
            title: f.title ?? "",
            description: f.description ?? "",
            why_it_matters: f.why_it_matters ?? "",
            suggested_questions: f.suggested_questions ?? [],
            suggested_redline: f.suggested_redline,
            citations: f.citations,
            confidence: Math.min(1, Math.max(0, f.confidence ?? 0.7)),
          });
        }
      }
    } catch {
      // Skip malformed
    }
  }

  return { findings };
}

function consolidateAndDedupe(state: State): Partial<State> {
  const findings = state.findings ?? [];
  const seen = new Set<string>();
  const merged: Finding[] = [];

  for (const f of findings) {
    const key = `${f.category}:${f.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(f);
  }

  merged.sort((a, b) => {
    const riskOrder = { high: 0, medium: 1, low: 2 };
    const ra = riskOrder[a.risk_level as keyof typeof riskOrder] ?? 1;
    const rb = riskOrder[b.risk_level as keyof typeof riskOrder] ?? 1;
    if (ra !== rb) return ra - rb;
    return (b.confidence ?? 0) - (a.confidence ?? 0);
  });

  return { findings: merged };
}

function selfCheckGrounding(state: State): "retrieve_seed_clauses" | "finalize" {
  const findings = state.findings ?? [];
  const allHaveCitations = findings.length > 0 && findings.every((f) => f.citations?.length >= 1);
  const retries = state.retryCount ?? 0;
  if (allHaveCitations || retries >= 2) return "finalize";
  return "retrieve_seed_clauses";
}

async function finalize(state: State): Promise<Partial<State>> {
  const db = await getDb();
  const runIdObj = new ObjectId(state.runId);
  await db.collection("runs").updateOne(
    { _id: runIdObj },
    {
      $set: {
        status: "completed",
        outputs: { findings: state.findings },
        completedAt: new Date(),
      },
    }
  );
  return {};
}

export function createAnalysisGraph() {
  const graph = new StateGraph(AnalysisState)
    .addNode("load_doc_context", loadDocContext)
    .addNode("retrieve_seed_clauses", retrieveSeedClauses)
    .addNode("extract_findings", extractFindings)
    .addNode("consolidate_and_dedupe", consolidateAndDedupe)
    .addNode("self_check_grounding", (s) => ({}))
    .addNode("finalize", finalize);

  graph.addEdge(START, "load_doc_context");
  graph.addEdge("load_doc_context", "retrieve_seed_clauses");
  graph.addEdge("retrieve_seed_clauses", "extract_findings");
  graph.addEdge("extract_findings", "consolidate_and_dedupe");
  graph.addEdge("consolidate_and_dedupe", "self_check_grounding");
  graph.addConditionalEdges(
    "self_check_grounding",
    selfCheckGrounding,
    {
      retrieve_seed_clauses: "retrieve_seed_clauses",
      finalize: "finalize",
    }
  );
  graph.addEdge("finalize", END);

  return graph.compile();
}
