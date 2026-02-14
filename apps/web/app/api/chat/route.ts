import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { getDb } from "@/lib/mongodb";
import { queryByDocId } from "@/lib/chroma";

const ChatBodySchema = z.object({
  docId: z.string().min(1),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
});

const SYSTEM_PROMPT = `You are a contract analysis assistant. Answer ONLY based on the provided context from the document.
If the answer is not found in the context, say "Not found in the provided document."
Always cite your sources by referencing the chunk ID (e.g., [chunk: docId:0]) when making claims.
Be concise and professional. Do not provide legal advice.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ChatBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { docId, messages } = parsed.data;
    const lastMessage = messages.filter((m) => m.role === "user").pop();
    if (!lastMessage) {
      return NextResponse.json(
        { error: "At least one user message required" },
        { status: 400 }
      );
    }

    const chunks = await queryByDocId(docId, lastMessage.content, 8);
    const context = chunks
      .map((c) => `[${c.id}]: ${c.text}`)
      .join("\n\n");

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "system",
          content: `Context from document:\n\n${context || "(No relevant chunks found)"}`,
        },
        ...messages,
      ],
    });

    const choice = completion.choices[0];
    const answer = choice?.message?.content ?? "No response generated.";
    const usage = completion.usage;

    const citations = chunks.map((c) => ({
      docId,
      chunkId: c.id,
      snippet: c.text.slice(0, 200) + (c.text.length > 200 ? "..." : ""),
    }));

    const db = await getDb();
    await db.collection("runs").insertOne({
      docId,
      type: "chat",
      createdAt: new Date(),
      provider: "openai",
      model: "gpt-4o-mini",
      tokenUsage: usage
        ? { prompt: usage.prompt_tokens, completion: usage.completion_tokens, total: usage.total_tokens }
        : undefined,
      inputs: { docId, messageCount: messages.length },
      outputs: { answer, citationCount: citations.length },
    });

    return NextResponse.json({
      answer,
      citations,
      usage: usage
        ? { prompt: usage.prompt_tokens, completion: usage.completion_tokens, total: usage.total_tokens }
        : undefined,
    });
  } catch (err) {
    console.error("POST /api/chat error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
