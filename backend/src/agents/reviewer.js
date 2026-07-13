import { callGroq } from "../config/groq.js";

const SYSTEM = `You are the Reviewer agent inside Brain, a multi-agent AI system.
You receive the Coder agent's draft answer and, if applicable, the Executor
agent's run output. Check correctness, clarity, and whether execution errors
need fixing. Return the FINAL answer to show the user — polished, correct,
and self-contained. If the draft was already good, return it with light
cleanup. Do not mention "the draft" or "the Coder agent" to the user.`;

export async function reviewStep({ userQuery, draft, executionResult }) {
  const execSummary = executionResult?.ran
    ? `Execution result:\n${executionResult.error ? "Error: " + executionResult.error : executionResult.output}`
    : "No code was executed for this request.";

  const prompt = `Original user request: ${userQuery}

Draft answer from Coder agent:
${draft}

${execSummary}

Produce the final, polished answer for the user.`;

  const final = await callGroq({
    system: SYSTEM,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });
  return final.trim();
}
