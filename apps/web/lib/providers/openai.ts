import OpenAI from "openai";

export async function embed(texts: string[]): Promise<number[][]> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}

export async function chat(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  _tools?: unknown,
  _responseFormat?: unknown
): Promise<{ text: string; toolCalls?: unknown[]; usage?: { prompt: number; completion: number; total: number } }> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
  const choice = res.choices[0];
  return {
    text: choice?.message?.content ?? "",
    usage: res.usage
      ? {
          prompt: res.usage.prompt_tokens,
          completion: res.usage.completion_tokens,
          total: res.usage.total_tokens ?? 0,
        }
      : undefined,
  };
}
