import { memoryVectorStore, embed } from "./vectorStore.js";

const QDRANT_URL = process.env.QDRANT_URL;
const COLLECTION = process.env.QDRANT_COLLECTION || "brain_knowledge";

const SEED_DOCS = [
  {
    id: "seed-1",
    text: "Brain is a multi-agent AI platform where a Planner breaks a goal into steps, a Retriever pulls relevant context, a Coder drafts a solution, an Executor runs it safely, and a Reviewer checks the output before it reaches the user.",
    metadata: { source: "system" },
  },
  {
    id: "seed-2",
    text: "The RAG layer indexes documents into a vector store and retrieves the most relevant chunks for a query using cosine similarity, giving agents grounded context instead of relying purely on model memory.",
    metadata: { source: "system" },
  },
  {
    id: "seed-3",
    text: "Redis caches recent agent pipeline results and enforces per-user rate limits so repeated queries resolve instantly and the Groq API isn't overloaded.",
    metadata: { source: "system" },
  },
];

async function qdrantFetch(path, options = {}) {
  const res = await fetch(`${QDRANT_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Qdrant request failed: ${res.status}`);
  return res.json();
}

async function ensureCollection() {
  try {
    await qdrantFetch(`/collections/${COLLECTION}`);
  } catch {
    await qdrantFetch(`/collections/${COLLECTION}`, {
      method: "PUT",
      body: JSON.stringify({ vectors: { size: 256, distance: "Cosine" } }),
    });
  }
}

export async function upsertDocuments(docs) {
  if (!QDRANT_URL) {
    memoryVectorStore.upsert(docs);
    return;
  }
  try {
    await ensureCollection();
    await qdrantFetch(`/collections/${COLLECTION}/points`, {
      method: "PUT",
      body: JSON.stringify({
        points: docs.map((d, i) => ({
          id: d.id || `doc-${Date.now()}-${i}`,
          vector: embed(d.text),
          payload: { text: d.text, ...d.metadata },
        })),
      }),
    });
  } catch (err) {
    console.warn("[Brain] Qdrant upsert failed, using in-memory fallback:", err.message);
    memoryVectorStore.upsert(docs);
  }
}

export async function searchDocuments(query, topK = 4) {
  if (!QDRANT_URL) {
    memoryVectorStore.seedIfEmpty(SEED_DOCS);
    return memoryVectorStore.search(query, topK);
  }
  try {
    await ensureCollection();
    const result = await qdrantFetch(`/collections/${COLLECTION}/points/search`, {
      method: "POST",
      body: JSON.stringify({ vector: embed(query), limit: topK, with_payload: true }),
    });
    return (result.result || []).map((point) => ({
      id: point.id,
      text: point.payload?.text,
      score: point.score,
      metadata: point.payload,
    }));
  } catch (err) {
    console.warn("[Brain] Qdrant search failed, using in-memory fallback:", err.message);
    memoryVectorStore.seedIfEmpty(SEED_DOCS);
    return memoryVectorStore.search(query, topK);
  }
}

// Always keep the memory store seeded too, so fallback is instant if Qdrant drops mid-session.
memoryVectorStore.seedIfEmpty(SEED_DOCS);
