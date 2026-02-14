import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/contractlens";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

function getClient(): Promise<MongoClient> {
  if (clientPromise) return clientPromise;
  clientPromise = new MongoClient(uri).connect();
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const c = await getClient();
  return c.db();
}

export async function ensureIndexes(): Promise<void> {
  const db = await getDb();
  await db.collection("documents").createIndex({ createdAt: -1 });
  await db.collection("chunks").createIndex({ docId: 1 });
  await db.collection("runs").createIndex({ docId: 1 });
  await db.collection("feedback").createIndex({ runId: 1 });
}
