"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Tab = "pdf" | "url" | "text";

export default function Home() {
  const [tab, setTab] = useState<Tab>("text");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let body: Record<string, unknown> = { title: title || "Untitled" };

      if (tab === "url") {
        if (!url.trim()) {
          setError("URL is required");
          setLoading(false);
          return;
        }
        body = { ...body, sourceType: "url", url: url.trim() };
      } else if (tab === "text") {
        if (!text.trim()) {
          setError("Text content is required");
          setLoading(false);
          return;
        }
        body = { ...body, sourceType: "text", content: text.trim() };
      } else {
        if (!file) {
          setError("Please select a PDF file");
          setLoading(false);
          return;
        }
        const buf = await file.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        body = { ...body, sourceType: "pdf", content: base64 };
      }

      const res = await fetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to create document");
      }

      router.push(`/docs/${data.docId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-8">
      <main className="w-full max-w-2xl">
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          ContractLens
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          AI Contract Risk Scanner - Upload a contract to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Contract"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <div className="flex gap-2 mb-4">
              {(["text", "url", "pdf"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    tab === t
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                  }`}
                >
                  {t === "text" ? "Paste Text" : t === "url" ? "URL" : "PDF"}
                </button>
              ))}
            </div>

            {tab === "text" && (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your contract text here..."
                rows={12}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
              />
            )}
            {tab === "url" && (
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/terms-of-service"
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            )}
            {tab === "pdf" && (
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-zinc-200 dark:file:bg-zinc-700 file:text-zinc-900 dark:file:text-zinc-100"
              />
            )}
          </div>

          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Document"}
          </button>
        </form>

        <div className="mt-8">
          <a
            href="/api/docs"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
          >
            List documents (API)
          </a>
        </div>
      </main>
    </div>
  );
}
