import { ChromaClient } from "chromadb";
import OpenAI from "openai";

const CHROMA_URL = process.env.CHROMA_URL ?? "http://localhost:8000";
const COLLECTION_NAME = "contractlens_chunks";

let chromaClient: ChromaClient | null = null;

function getChromaClient(): ChromaClient {
  if (!chromaClient) {
    chromaClient = new ChromaClient({ path: CHROMA_URL });
  }
  return chromaClient;
}

async function embedQuery(text: string): Promise<number[][]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: [text],
  });
  return res.data.map((d) => d.embedding);
}

export async function queryByDocId(
  docId: string,
  queryText: string,
  nResults = 5
): Promise<{ id: string; text: string; metadata: Record<string, unknown> }[]> {
  const chroma = getChromaClient();
  const collection = await chroma.getOrCreateCollection({
    name: COLLECTION_NAME,
  });

  const queryEmbeddings = await embedQuery(queryText);

  const results = await collection.query({
    queryEmbeddings,
    nResults,
    where: { docId },
  });

  if (!results.ids?.[0] || !results.documents?.[0] || !results.metadatas?.[0]) {
    return [];
  }

  return results.ids[0].map((id, i) => ({
    id: id as string,
    text: (results.documents![0][i] as string) ?? "",
    metadata: (results.metadatas![0][i] as Record<string, unknown>) ?? {},
  }));
}
