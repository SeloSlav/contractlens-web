"""
ContractLens Worker - FastAPI service for document ingestion.
Extracts text from PDF/URL/text, chunks, embeds, stores in Chroma + Mongo.
"""

from dotenv import load_dotenv
load_dotenv(".env.local")
load_dotenv()

import base64
import os
import re
import time
from typing import Optional
from urllib.parse import urlparse

import chromadb
import httpx
from bson import ObjectId
from fastapi import Body, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_text_splitters import RecursiveCharacterTextSplitter
from openai import OpenAI
from pymongo import MongoClient
from pypdf import PdfReader
from io import BytesIO

app = FastAPI(title="ContractLens Worker", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/contractlens")
CHROMA_URL = os.getenv("CHROMA_URL", "http://localhost:8000")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

COLLECTION_NAME = "contractlens_chunks"


def get_mongo():
    client = MongoClient(MONGODB_URI)
    return client.get_default_database()


def get_chroma():
    parsed = urlparse(CHROMA_URL)
    host = parsed.hostname or "localhost"
    port = parsed.port or (443 if parsed.scheme == "https" else 8000)
    return chromadb.HttpClient(host=host, port=port)


def extract_text_from_pdf(content: bytes) -> str:
    """Extract text from PDF bytes."""
    reader = PdfReader(BytesIO(content))
    parts = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            parts.append(text)
    return "\n\n".join(parts)


def extract_text_from_url(url: str) -> str:
    """Fetch URL and extract visible text from HTML."""
    with httpx.Client(follow_redirects=True, timeout=30) as client:
        resp = client.get(url)
        resp.raise_for_status()
        html = resp.text

    try:
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")
        for tag in soup(["script", "style"]):
            tag.decompose()
        text = soup.get_text(separator="\n")
        return text
    except ImportError:
        import re
        text = re.sub(r"<[^>]+>", " ", html)
        text = re.sub(r"\s+", " ", text)
        return text.strip()


def normalize_text(text: str) -> str:
    """Normalize whitespace."""
    return re.sub(r"\s+", " ", text).strip()


def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
    """Split text into chunks using LangChain."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
    )
    return splitter.split_text(text)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/ingest")
async def ingest(body: dict = Body(default={})):
    """
    Ingest a document. Either provide docId (to fetch from Mongo) or
    sourceType + content/url + optional title.
    """
    start = time.time()
    mongo = get_mongo()
    docs_col = mongo["documents"]
    chunks_col = mongo["chunks"]

    docId = body.get("docId")
    source_type = body.get("sourceType")
    content_raw = body.get("content")
    url_val = body.get("url")
    title_val = body.get("title") or "Untitled"

    if docId:
        try:
            doc = docs_col.find_one({"_id": ObjectId(docId)})
        except Exception:
            doc = None
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        source_type = doc["sourceType"]
        content_raw = doc.get("content")
        url_val = doc.get("sourceUrl")
        title_val = doc.get("title", "Untitled")
    else:
        if not source_type:
            raise HTTPException(status_code=400, detail="docId or sourceType required")

    text = ""
    if source_type == "text":
        if not content_raw:
            raise HTTPException(status_code=400, detail="content required for text")
        text = content_raw
    elif source_type == "url":
        if not url_val:
            raise HTTPException(status_code=400, detail="url required")
        text = extract_text_from_url(url_val)
    elif source_type == "pdf":
        if not content_raw:
            raise HTTPException(status_code=400, detail="content (base64) required for pdf")
        raw_bytes = base64.b64decode(content_raw)
        text = extract_text_from_pdf(raw_bytes)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown sourceType: {source_type}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="No text extracted from document")

    text = normalize_text(text)
    chunks = chunk_text(text)
    num_chunks = len(chunks)
    token_approx = sum(len(c.split()) for c in chunks) * 4 // 3

    if docId:
        existing_doc_id = docId
    else:
        new_id = ObjectId()
        new_doc = {
            "_id": new_id,
            "title": title_val,
            "sourceType": source_type,
            "sourceUrl": url_val,
            "createdAt": time.time(),
            "status": "processing",
        }
        docs_col.insert_one(new_doc)
        existing_doc_id = str(new_id)
        docId = existing_doc_id

    try:
        docs_col.update_one(
            {"_id": ObjectId(existing_doc_id)},
            {"$set": {"status": "processing"}},
        )
    except Exception:
        pass

    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")

    client = OpenAI(api_key=OPENAI_API_KEY)
    embed_response = client.embeddings.create(
        model="text-embedding-3-small",
        input=chunks,
    )
    embeddings = [e.embedding for e in embed_response.data]

    chroma_client = get_chroma()
    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

    ids = [f"{docId}:{i}" for i in range(num_chunks)]
    metadatas = [
        {
            "docId": docId,
            "chunkIndex": i,
            "sourceType": source_type,
            "sourceUrl": url_val or "",
            "createdAt": str(int(time.time())),
        }
        for i in range(num_chunks)
    ]

    collection.upsert(ids=ids, documents=chunks, embeddings=embeddings, metadatas=metadatas)

    chunk_records = []
    for i, (chunk_content, chunk_id) in enumerate(zip(chunks, ids)):
        chunk_records.append({
            "docId": docId,
            "chunkIndex": i,
            "chromaId": chunk_id,
            "text": chunk_content,
            "textPreview": chunk_content[:200] + ("..." if len(chunk_content) > 200 else ""),
            "tokenApprox": len(chunk_content.split()) * 4 // 3,
            "metadata": {},
        })

    chunks_col.delete_many({"docId": docId})
    if chunk_records:
        chunks_col.insert_many(chunk_records)

    ingest_ms = int((time.time() - start) * 1000)
    docs_col.update_one(
        {"_id": ObjectId(existing_doc_id)},
        {
            "$set": {
                "status": "ready",
                "stats": {
                    "numChunks": num_chunks,
                    "numTokensApprox": token_approx,
                    "ingestMs": ingest_ms,
                },
            }
        },
    )

    return {
        "docId": docId,
        "status": "ready",
        "numChunks": num_chunks,
        "ingestMs": ingest_ms,
    }
