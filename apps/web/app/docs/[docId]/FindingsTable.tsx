"use client";

import { useState, useEffect } from "react";

type Finding = {
  risk_level: string;
  category: string;
  title: string;
  description: string;
  why_it_matters?: string;
  suggested_questions?: string[];
  suggested_redline?: string;
  citations?: { docId: string; chunkId: string; snippet: string }[];
  confidence?: number;
};

async function submitFeedback(
  runId: string,
  findingId: string,
  rating: 1 | -1,
  note?: string
) {
  await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ runId, findingId, rating, note }),
  });
}

type Run = {
  _id: string;
  type: string;
  createdAt: string;
  status: string;
  outputs?: { findings?: Finding[] };
};

export function FindingsTable({ docId }: { docId: string }) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/runs?docId=${docId}`)
      .then((r) => r.json())
      .then((d) => {
        setRuns(d.runs ?? []);
        const analysisRun = (d.runs ?? []).find(
          (r: Run) => r.type === "analysis" && r.outputs?.findings
        );
        if (analysisRun) setSelectedRunId(analysisRun._id);
      });
  }, [docId]);

  const selectedRun = runs.find((r) => r._id === selectedRunId);
  const findings = selectedRun?.outputs?.findings ?? [];

  if (runs.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
        Findings
      </h2>
      {findings.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          No findings yet. Run analysis to generate findings.
        </p>
      ) : (
        <div className="space-y-2">
          {findings.map((f, i) => {
            const fid = `${selectedRunId}-${i}`;
            const chunkId = f.citations?.[0]?.chunkId ?? fid;
            const expanded = expandedId === fid;
            return (
              <div
                key={fid}
                className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : fid)}
                  className="w-full px-4 py-3 flex items-center gap-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      f.risk_level === "high"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : f.risk_level === "medium"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {f.risk_level}
                  </span>
                  <span className="text-xs text-zinc-500">{f.category}</span>
                  <span className="flex-1 font-medium">{f.title}</span>
                  <span className="text-xs text-zinc-500">
                    {Math.round((f.confidence ?? 0) * 100)}%
                  </span>
                  <span className="text-zinc-400">{expanded ? "−" : "+"}</span>
                </button>
                {expanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/30">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                      {f.description}
                    </p>
                    {f.why_it_matters && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                        <strong>Why it matters:</strong> {f.why_it_matters}
                      </p>
                    )}
                    {f.suggested_questions && f.suggested_questions.length > 0 && (
                      <div className="mt-2">
                        <strong className="text-sm">Suggested questions:</strong>
                        <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                          {f.suggested_questions.map((q, j) => (
                            <li key={j}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {f.suggested_redline && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                        <strong>Suggested redline:</strong> {f.suggested_redline}
                      </p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          if (selectedRunId) {
                            submitFeedback(selectedRunId, chunkId, 1);
                            setFeedbackSent((s) => new Set(s).add(`${fid}-up`));
                          }
                        }}
                        disabled={feedbackSent.has(`${fid}-up`)}
                        className="px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                      >
                        👍
                      </button>
                      <button
                        onClick={() => {
                          if (selectedRunId) {
                            submitFeedback(selectedRunId, chunkId, -1);
                            setFeedbackSent((s) => new Set(s).add(`${fid}-down`));
                          }
                        }}
                        disabled={feedbackSent.has(`${fid}-down`)}
                        className="px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                      >
                        👎
                      </button>
                    </div>
                    {f.citations && f.citations.length > 0 && (
                      <div className="mt-3">
                        <strong className="text-sm">Evidence:</strong>
                        <div className="mt-2 space-y-2">
                          {f.citations.map((c, j) => (
                            <div
                              key={j}
                              className="p-2 bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-xs"
                            >
                              <span className="font-mono text-zinc-500">
                                {c.chunkId}
                              </span>
                              <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                                {c.snippet}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
