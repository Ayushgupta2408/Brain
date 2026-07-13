import Groq from "groq-sdk";
import "dotenv/config";

if (!process.env.GROQ_API_KEY) {
  console.warn(
    "[Brain] GROQ_API_KEY is not set. Add it to backend/.env before starting a chat."
  );
}

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
export const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

/**
 * Thin wrapper around Groq chat completions used by every agent.
 * Keeps retry/backoff logic in one place so agents stay simple.
 */
export async function callGroq({ system, messages = [], temperature = 0.4, maxRetries = 3 }) {
  let attempt = 0;
  let delay = 800;

  while (attempt < maxRetries) {
    try {
      const response = await groq.chat.completions.create({
        model: GROQ_MODEL,
        temperature,
        messages: [{ role: "system", content: system }, ...messages],
      });
      return response.choices[0]?.message?.content ?? "";
    } catch (err) {
      attempt += 1;
      const status = err?.status || err?.response?.status;
      const retryable = status === 429 || status >= 500;
      if (!retryable || attempt >= maxRetries) throw err;
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2; // exponential backoff
    }
  }
}
