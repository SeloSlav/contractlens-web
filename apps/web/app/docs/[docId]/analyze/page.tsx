"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AnalyzePage() {
  const params = useParams();
  const docId = params?.docId as string | undefined;
  const [runId, setRunId] = useState<string | null>(null);
  const [events, setEvents] = useState<{ type: string; node?: string; data?: unknown }[]>([]);
  const [findings, setFindings] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startAnalysis() {
    if (!docId || loading) return;
    setLoading(true);
    setError(null);
    setEvents([]);
    setFindings([]);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start");
      setRunId(data.runId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!runId || !docId) return;

    const es = new EventSource(`/api/analyze/stream?runId=${runId}`);

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setEvents((prev) => [...prev, data]);
        if (data.type === "complete" && data.findings) {
          setFindings(data.findings);
          setLoading(false);
          es.close();
        }
        if (data.type === "error") {
          setError(data.error ?? "Unknown error");
          setLoading(false);
          es.close();
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setLoading(false);
      es.close();
    };

    return () => es.close();
  }, [runId, docId]);

  if (!docId) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/docs/${docId}`}
          className="text-zinc-600 dark:text-zinc-400 hover:underline mb-6 inline-block"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Run Analysis
        </h1>

        <button
          onClick={startAnalysis}
          disabled={loading}
          className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 disabled:opacity-50 mb-6"
        >
          {loading ? "Analyzing..." : "Run Analysis"}
        </button>

        {error && (
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        )}

        {events.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-2">Progress</h2>
            <div className="space-y-1 text-sm">
              {events
                .filter((e) => e.type === "node")
                .map((e, i) => (
                  <div key={i} className="text-zinc-600 dark:text-zinc-400">
                    {e.node}
                  </div>
                ))}
            </div>
          </div>
        )}

        {findings.length > 0 && (
          <div>
            <h2 className="text-lg font-medium mb-4">Findings</h2>
            <div className="space-y-4">
              {(findings as Record<string, unknown>[]).map((f, i) => (
                <div
                  key={i}
                  className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                >
                  <div className="flex gap-2 items-center mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        f.risk_level === "high"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : f.risk_level === "medium"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      {String(f.risk_level)}
                    </span>
                    <span className="text-zinc-500 text-xs">
                      {String(f.category)}
                    </span>
                    <span className="text-zinc-500 text-xs">
                      {Math.round((Number(f.confidence) ?? 0) * 100)}% conf
                    </span>
                  </div>
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                    {String(f.title)}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {String(f.description)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
