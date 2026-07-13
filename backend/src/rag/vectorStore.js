/**
 * Lightweight in-memory vector store used when Qdrant isn't configured.
 * Uses a hashed bag-of-words embedding (deterministic, no external API
 * required) so RAG works immediately in local/demo environments.
 * Swap for real embeddings (e.g. an embeddings-capable model) in production.
 */

const DIMENSIONS = 256;

function embed(text) {
  const vector = new Array(DIMENSIONS).fill(0);
  const tokens = text.toLowerCase().match(/[a-z0-9]+/g) || [];
  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
    }
    vector[hash % DIMENSIONS] += 1;
  }
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vector.map((v) => v / norm);
}

function cosineSimilarity(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

class InMemoryVectorStore {
  constructor() {
    this.documents = []; // { id, text, metadata, vector }
  }

  upsert(docs) {
    for (const doc of docs) {
      this.documents.push({ ...doc, vector: embed(doc.text) });
    }
  }

  search(query, topK = 4) {
    const qVector = embed(query);
    return this.documents
      .map((doc) => ({ ...doc, score: cosineSimilarity(qVector, doc.vector) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  seedIfEmpty(seedDocs) {
    if (this.documents.length === 0) this.upsert(seedDocs);
  }
}

export const memoryVectorStore = new InMemoryVectorStore();
export { embed };
