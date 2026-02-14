import { notFound } from "next/navigation";
import Link from "next/link";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { DocActions } from "./DocActions";
import { FindingsTable } from "./FindingsTable";
import { RunHistory } from "./RunHistory";

async function getDoc(docId: string) {
  if (!ObjectId.isValid(docId)) return null;
  const db = await getDb();
  const d = await db.collection("documents").findOne({
    _id: new ObjectId(docId),
  });
  if (!d) return null;
  return {
    _id: d._id.toString(),
    title: d.title,
    sourceType: d.sourceType,
    sourceUrl: d.sourceUrl,
    status: d.status,
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const { docId } = await params;
  const doc = await getDoc(docId);
  if (!doc) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-zinc-600 dark:text-zinc-400 hover:underline mb-6 inline-block"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          {doc.title}
        </h1>
        <div className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          <span>Source: {doc.sourceType}</span>
          <span
            className={`px-2 py-0.5 rounded ${
              doc.status === "ready"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : doc.status === "failed"
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
            }`}
          >
            {doc.status}
          </span>
        </div>
        {doc.sourceUrl && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            URL: {doc.sourceUrl}
          </p>
        )}
        <DocActions docId={docId} status={doc.status} />
        <RunHistory docId={docId} />
        <FindingsTable docId={docId} />
      </div>
    </div>
  );
}
