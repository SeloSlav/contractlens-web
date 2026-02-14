# Railway Deployment Guide

ContractLens deploys as multiple services on Railway.

## Services

| Service | Type | Description |
|---------|------|-------------|
| web | Next.js | Main app (apps/web) |
| worker | Python FastAPI | Document ingestion |
| mongodb | Railway Plugin | MongoDB database |
| chroma | Docker | ChromaDB vector store |

## Setup

### 1. Create a Railway Project

Create a new project and add services:

- **MongoDB**: Add MongoDB plugin from Railway marketplace
- **ChromaDB**: Add a service from Docker image `chromadb/chroma`
- **web**: Connect repo, set root directory or use monorepo config
- **worker**: Connect repo, set root to `apps/worker`

### 2. Web Service

- **Build Command**: `npm install && npm run build --workspace=@contractlens/web`
- **Start Command**: `npm run start --workspace=@contractlens/web`
- **Root Directory**: `/` (monorepo root)

### 3. Worker Service

- **Start Command**: `pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Root Directory**: `apps/worker`

### 4. ChromaDB

- Use Docker image: `chromadb/chroma`
- Expose port 8000
- Add volume for persistence if needed

## Environment Variables

| Variable | Service | Required | Description |
|----------|---------|----------|-------------|
| MONGODB_URI | web, worker | Yes | MongoDB connection string (from plugin) |
| CHROMA_URL | web, worker | Yes | ChromaDB URL (e.g. `http://chroma:8000`) |
| WORKER_URL | web | Yes | Worker internal URL (e.g. `https://worker.railway.internal`) |
| OPENAI_API_KEY | web, worker | Yes | OpenAI API key |
| AI_PROVIDER | web | No | `openai` \| `azure` \| `vertex` (default: openai) |

### Azure OpenAI (optional)

- AZURE_OPENAI_ENDPOINT
- AZURE_OPENAI_KEY
- AZURE_OPENAI_DEPLOYMENT

### Vertex AI (optional)

- VERTEX_PROJECT
- VERTEX_LOCATION
- VERTEX_MODEL
- GOOGLE_APPLICATION_CREDENTIALS

## Health Endpoints

- **Web**: `GET /` (or any page)
- **Worker**: `GET /health` → `{ "status": "ok" }`

## Internal Networking

Railway provides private networking. Use the internal hostname for WORKER_URL:

- `https://<worker-service-name>.railway.internal`

Or use the public URL if internal is not available.

## Local Development

```bash
# Start MongoDB + ChromaDB
docker compose up -d

# Start web app
npm run dev

# Start worker (separate terminal)
cd apps/worker && pip install -r requirements.txt && uvicorn main:app --reload --port 8001
```

Set env: `WORKER_URL=http://localhost:8001`, `CHROMA_URL=http://localhost:8000`, `MONGODB_URI=mongodb://localhost:27017/contractlens`
