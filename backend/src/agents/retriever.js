import { searchDocuments } from "../rag/qdrantClient.js";

export async function retrieveStep(userQuery) {
  const results = await searchDocuments(userQuery, 4);
  const context = results
    .filter((r) => r.text)
    .map((r, i) => `[${i + 1}] ${r.text}`)
    .join("\n");

  return {
    context: context || "No directly relevant indexed context was found.",
    sources: results.map((r) => ({ id: r.id, score: Number(r.score?.toFixed(3)) })),
  };
}
