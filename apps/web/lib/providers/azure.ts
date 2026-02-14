/**
 * Azure OpenAI provider - stub implementation.
 * Set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT to enable.
 */
export async function embed(_texts: string[]): Promise<number[][]> {
  throw new Error(
    "Azure OpenAI not configured. Set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT env vars."
  );
}

export async function chat(
  _messages: { role: string; content: string }[],
  _tools?: unknown,
  _responseFormat?: unknown
): Promise<{ text: string; toolCalls?: unknown[]; usage?: unknown }> {
  throw new Error(
    "Azure OpenAI not configured. Set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT env vars."
  );
}
