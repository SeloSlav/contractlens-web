"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DocActions({
  docId,
  status,
}: {
  docId: string;
  status: string;
}) {
  const [ingesting, setIngesting] = useState(false);
  const router = useRouter();

  async function handleIngest() {
    setIngesting(true);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.details ?? data.error ?? "Ingest failed";
        throw new Error(msg);
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ingest failed");
    } finally {
      setIngesting(false);
    }
  }

  return (
    <div className="flex gap-4 mt-8 flex-wrap">
      {status === "queued" && (
        <button
          onClick={handleIngest}
          disabled={ingesting}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
        >
          {ingesting ? "Ingesting..." : "Run Ingest"}
        </button>
      )}
      <Link
        href={`/docs/${docId}/chat`}
        className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-90"
      >
        Chat
      </Link>
      <Link
        href={`/docs/${docId}/analyze`}
        className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        Analyze
      </Link>
    </div>
  );
}
