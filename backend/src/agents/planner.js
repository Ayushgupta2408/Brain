import { callGroq } from "../config/groq.js";

const BASE_SYSTEM = `You are the Planner agent inside Brain, a multi-agent AI system.
Break the user's request into a short, numbered list of concrete steps the
downstream agents (Retriever, Coder, Executor, Reviewer) should follow.
Be concise — 3 to 6 steps max. Output plain text only, no preamble.`;

export async function planStep(userQuery, history = [], modeDirective = null) {
  const system = modeDirective ? `${BASE_SYSTEM}\n\nMode instruction: ${modeDirective}` : BASE_SYSTEM;
  const plan = await callGroq({
    system,
    messages: [...history, { role: "user", content: userQuery }],
    temperature: 0.3,
  });
  return plan.trim();
}