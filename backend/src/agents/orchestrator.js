import crypto from "crypto";
import { planStep } from "./planner.js";
import { retrieveStep } from "./retriever.js";
import { codeStep, extractCodeBlock } from "./coder.js";
import { executeStep } from "./executor.js";
import { reviewStep } from "./reviewer.js";
import { generatePptx } from "./formatter.js";
import { generateImage } from "./imageProvider.js";
import { getRedis } from "../config/redis.js";

/**
 * Runs the Planner -> Retriever -> Coder -> Executor -> Reviewer graph.
 * `emit(nodeName, status, payload)` is called after each node so the caller
 * can stream progress to the client (see routes/chatRoutes.js SSE handler).
 * This mirrors a LangGraph state graph's node-by-node execution model,
 * implemented directly in Node so the whole stack stays JS end to end.
 */
export async function runAgentPipeline(
  { userQuery, history = [], mode = "auto", modeDirective = null },
  emit = () => {}
) {
  const redis = getRedis();
  const cacheKey = `brain:pipeline:${mode}:${crypto
    .createHash("sha256")
    .update(userQuery)
    .digest("hex")}`;

  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) {
    const parsed = JSON.parse(cached);
    emit("cache", "hit", { message: "Served from cache" });
    emit("done", "complete", parsed);
    return parsed;
  }

  emit("planner", "running", {});
  const plan = await planStep(userQuery, history, modeDirective);
  emit("planner", "done", { plan });

  emit("retriever", "running", {});
  const { context, sources } = await retrieveStep(userQuery);
  emit("retriever", "done", { context, sources });

  emit("coder", "running", {});
  const draft = await codeStep({ userQuery, plan, context, modeDirective });
  emit("coder", "done", { draft });

  emit("executor", "running", {});
  const code = extractCodeBlock(draft);
  const executionResult = executeStep(code);
  emit("executor", "done", { executionResult, code });

  emit("reviewer", "running", {});
  const finalAnswer = await reviewStep({ userQuery, draft, executionResult });
  emit("reviewer", "done", { finalAnswer });

  let file = null;
  if (mode === "ppt") {
    emit("formatter", "running", {});
    try {
      file = await generatePptx(finalAnswer, { title: userQuery.slice(0, 60) });
      emit("formatter", "done", { file });
    } catch (err) {
      emit("formatter", "error", { message: err.message });
    }
  } else if (mode === "image") {
  emit("formatter", "running", {});
  try {
    console.log("\n========== IMAGE MODE ==========");
    console.log("User Query:", userQuery);
    console.log("Draft Prompt:", draft);

    file = await generateImage(draft || userQuery);

    console.log("Generated File:", file);
    console.log("================================\n");

    emit("formatter", "done", { file });
  } catch (err) {
    console.error("Image Generation Error:");
    console.error(err);

    emit("formatter", "error", {
      message: err.message,
    });
  }
}

  const result = { plan, context, sources, draft, executionResult, finalAnswer, file };

  await redis.set(cacheKey, JSON.stringify(result), "EX", 600).catch(() => {});
  emit("done", "complete", result);
  return result;
}