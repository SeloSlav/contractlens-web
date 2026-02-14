# LLM Provider Interface

ContractLens uses a provider abstraction for embeddings and chat. All providers must implement:

## embed(texts: string[]): Promise<number[][]>

Embeds an array of text strings into vectors.

- **Input**: Array of text strings
- **Output**: Array of embedding vectors (each vector is `number[]`)
- **Example**: `embed(["hello", "world"])` → `[[0.1, -0.2, ...], [0.3, 0.1, ...]]`

## chat(messages, tools?, responseFormat?): Promise<{ text, toolCalls?, usage? }>

Sends messages to the LLM and returns the response.

- **messages**: Array of `{ role: "user" | "assistant" | "system", content: string }`
- **tools** (optional): Tool definitions for function calling
- **responseFormat** (optional): JSON schema for structured output
- **Output**: `{ text: string, toolCalls?: Array, usage?: { prompt, completion, total } }`

## Environment Variables

- `AI_PROVIDER`: `openai` | `azure` | `vertex`
- **OpenAI**: `OPENAI_API_KEY`
- **Azure**: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`, `AZURE_OPENAI_DEPLOYMENT`
- **Vertex**: `VERTEX_PROJECT`, `VERTEX_LOCATION`, `VERTEX_MODEL`, `GOOGLE_APPLICATION_CREDENTIALS`
