/**
 * Google Vertex AI provider - stub implementation.
 * Set VERTEX_PROJECT, VERTEX_LOCATION, VERTEX_MODEL, GOOGLE_APPLICATION_CREDENTIALS to enable.
 */
export async function embed(_texts: string[]): Promise<number[][]> {
  throw new Error(
    "Vertex AI not configured. Set VERTEX_PROJECT, VERTEX_LOCATION, VERTEX_MODEL, GOOGLE_APPLICATION_CREDENTIALS env vars."
  );
}

export async function chat(
  _messages: { role: string; content: string }[],
  _tools?: unknown,
  _responseFormat?: unknown
): Promise<{ text: string; toolCalls?: unknown[]; usage?: unknown }> {
  throw new Error(
    "Vertex AI not configured. Set VERTEX_PROJECT, VERTEX_LOCATION, VERTEX_MODEL, GOOGLE_APPLICATION_CREDENTIALS env vars."
  );
}
