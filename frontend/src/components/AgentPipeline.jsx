import { useSelector } from "react-redux";
import { AGENT_NODES } from "../store/chatSlice.js";

const LABELS = {
  planner: "Planner",
  retriever: "Retriever",
  coder: "Coder",
  executor: "Executor",
  reviewer: "Reviewer",
};

const STATUS_STYLES = {
  idle: "bg-surface2 border-line text-muted",
  running: "bg-signal/10 border-signal text-signal animate-firing shadow-node",
  done: "bg-good/10 border-good text-good",
};

export default function AgentPipeline() {
  const pipeline = useSelector((s) => s.chat.pipeline);
  const detail = useSelector((s) => s.chat.pipelineDetail);

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h3 className="font-display text-sm tracking-wide text-muted mb-4">
        AGENT PIPELINE
      </h3>
      <div className="flex items-center">
        {AGENT_NODES.map((node, i) => (
          <div key={node} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-mono text-xs transition-all duration-300 ${STATUS_STYLES[pipeline[node]]}`}
              >
                {i + 1}
              </div>
              <span className="text-[11px] font-medium text-muted whitespace-nowrap">
                {LABELS[node]}
              </span>
            </div>
            {i < AGENT_NODES.length - 1 && (
              <div
                className={`h-[2px] flex-1 mx-1 mb-5 rounded transition-colors duration-500 ${
                  pipeline[node] === "done" ? "bg-good/60" : "bg-line"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {Object.keys(detail).length > 0 && (
        <div className="mt-5 space-y-2 max-h-40 overflow-y-auto font-mono text-[11px] text-muted">
          {AGENT_NODES.filter((n) => detail[n]).map((n) => (
            <div key={n} className="border-l-2 border-line pl-3">
              <span className="text-synapse">{LABELS[n]}:</span>{" "}
              {summarize(n, detail[n])}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function summarize(node, payload) {
  if (node === "planner") return truncate(payload.plan);
  if (node === "retriever") return `${payload.sources?.length ?? 0} context chunk(s) retrieved`;
  if (node === "coder") return truncate(payload.draft);
  if (node === "executor")
    return payload.executionResult?.ran
      ? payload.executionResult.error
        ? `execution error — ${payload.executionResult.error}`
        : "code executed successfully"
      : "no code to execute";
  if (node === "reviewer") return "final answer ready";
  return "";
}

function truncate(text, len = 90) {
  if (!text) return "";
  return text.length > len ? text.slice(0, len) + "…" : text;
}
