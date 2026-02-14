# ContractLens

**AI-powered contract risk scanner** — Upload contracts (PDF, text, or URL), get structured risk findings with citations, and chat with your documents. Built for teams who need to quickly surface clauses worth reviewing.

> **Disclaimer:** ContractLens highlights risk signals and suggests questions for counsel. It does not provide legal advice.

## Features

- **Multi-format ingest** — PDF, plain text, or URL (HTML extraction)
- **RAG chat** — Ask questions; answers include citations to source chunks
- **LangGraph analysis** — Structured risk findings (termination, liability, indemnity, etc.) with confidence scores
- **Evidence panel** — Expand any finding to see cited snippets
- **Run history & feedback** — Track analyses and rate findings (thumbs up/down)

## Tech Stack

| Layer | Stack |
|-------|------|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind |
| API | Next.js API Routes, Zod validation |
| Worker | Python FastAPI (ingest, chunking, embeddings) |
| Orchestration | LangGraph, LangChain |
| Vector DB | ChromaDB |
| Metadata DB | MongoDB |
| AI | OpenAI (with abstraction for Azure/Vertex) |

## Quick Start

**Prerequisites:** Node.js 20+, Python 3.11+, Docker

```bash
# 1. Start MongoDB + ChromaDB
docker compose up -d

# 2. Install and run web app
npm install
npm run dev

# 3. Run worker (separate terminal)
cd apps/worker
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8001
```

**4. Configure env vars** — Copy `apps/web/.env.example` to `apps/web/.env.local` and `apps/worker/.env.example` to `apps/worker/.env`. Add your `OPENAI_API_KEY`.

**5. Open** http://localhost:3000

## User Flow

1. **Upload** — Paste text, enter URL, or upload PDF
2. **Ingest** — Click "Run Ingest" to chunk, embed, and index
3. **Chat** — Ask questions; answers cite source chunks
4. **Analyze** — Run the LangGraph workflow for structured risk findings
5. **Feedback** — Rate findings to improve future runs

## Project Structure

```
contractlens-web/
├── apps/
│   ├── web/          # Next.js (pages, API, LangGraph)
│   └── worker/       # FastAPI ingest (PDF/URL/text → Chroma + Mongo)
├── packages/
│   └── shared/       # Zod schemas, provider interface
├── eval/             # Fixtures + grounding eval script
├── docs/             # Railway deployment guide
└── docker-compose.yml
```

## API Overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/docs` | Create document |
| GET | `/api/docs` | List documents |
| POST | `/api/ingest` | Trigger worker ingest |
| POST | `/api/chat` | RAG chat with citations |
| POST | `/api/analyze` | Start analysis run |
| GET | `/api/analyze/stream?runId=` | SSE stream of analysis events |
| GET | `/api/runs?docId=` | List runs for document |
| POST | `/api/feedback` | Submit feedback on finding |

## Deployment

See [docs/RAILWAY.md](docs/RAILWAY.md) for deploying to Railway (web, worker, MongoDB, ChromaDB).

## License

MIT
