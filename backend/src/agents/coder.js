import { callGroq } from "../config/groq.js";

const SYSTEM = `You are the Coder agent inside Brain, a multi-agent AI system.
Using the plan and retrieved context provided, produce the actual answer:
code, explanation, or solution the user asked for. If you include runnable
JavaScript, wrap it in a single \`\`\`javascript code block so the Executor
agent can run it. Be direct and complete.`;

export async function codeStep({ userQuery, plan, context, modeDirective }) {
  const prompt = `User request: ${userQuery}

Plan from Planner agent:
${plan}

Retrieved context from Retriever agent:
${context}

Now produce the solution.`;

  const system = modeDirective ? `${SYSTEM}\n\nMode instruction: ${modeDirective}` : SYSTEM;

  const draft = await callGroq({
    system,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
  });
  return draft.trim();
}

export function extractCodeBlock(text) {
  const match = text.match(/```(?:javascript|js)?\s*([\s\S]*?)```/i);
  return match ? match[1].trim() : null;
}