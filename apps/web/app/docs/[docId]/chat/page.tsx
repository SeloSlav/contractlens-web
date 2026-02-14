"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

async function sendMessage(
  docId: string,
  messages: { role: string; content: string }[]
) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ docId, messages }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Chat failed");
  }
  return res.json();
}

export default function ChatPage() {
  const params = useParams();
  const docId = params?.docId as string | undefined;
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [citations, setCitations] = useState<
    { docId: string; chunkId: string; snippet: string }[]
  >([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!docId || !input.trim() || loading) return;

    const userMsg = { role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { answer, citations: cits } = await sendMessage(docId, [
        ...messages,
        userMsg,
      ]);
      setMessages((m) => [...m, { role: "assistant", content: answer }]);
      setCitations(cits ?? []);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!docId) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800 p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link
            href={`/docs/${docId}`}
            className="text-zinc-600 dark:text-zinc-400 hover:underline"
          >
            ← Back
          </Link>
          <h1 className="font-semibold">Chat with Document</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <p className="text-zinc-500 dark:text-zinc-400 text-center py-12">
              Ask a question about this contract. Answers include citations.
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg ${
                m.role === "user"
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 ml-8"
                  : "bg-zinc-200 dark:bg-zinc-800 mr-8"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 p-4 text-zinc-500">
              <span className="animate-pulse">Thinking...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {citations.length > 0 && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-100 dark:bg-zinc-900/50">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Citations
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {citations.map((c, i) => (
                <div
                  key={i}
                  className="text-xs p-2 bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700"
                >
                  <span className="font-mono text-zinc-500">{c.chunkId}</span>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {c.snippet}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the contract..."
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
