"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Run = {
  _id: string;
  type: string;
  createdAt: string;
  status: string;
  durationMs?: number;
};

export function RunHistory({ docId }: { docId: string }) {
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    fetch(`/api/runs?docId=${docId}`)
      .then((r) => r.json())
      .then((d) => setRuns(d.runs ?? []));
  }, [docId]);

  if (runs.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
        Run History
      </h2>
      <div className="space-y-2">
        {runs.map((r) => (
          <div
            key={r._id}
            className="flex items-center gap-4 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
          >
            <span className="text-zinc-500">{r.type}</span>
            <span className="text-zinc-500">
              {new Date(r.createdAt).toLocaleString()}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs ${
                r.status === "completed" || r.status === "ready"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : r.status === "failed"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}
            >
              {r.status}
            </span>
            {r.durationMs != null && (
              <span className="text-zinc-500">{r.durationMs}ms</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
