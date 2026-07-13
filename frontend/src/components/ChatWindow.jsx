import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MessageBubble from "./MessageBubble.jsx";
import AgentPipeline from "./AgentPipeline.jsx";
import ModeSelector, { MODES } from "./ModeSelector.jsx";
import {
  userMessageSent,
  pipelineEvent,
  streamComplete,
  streamFailed,
} from "../store/chatSlice.js";

export default function ChatWindow() {
  const dispatch = useDispatch();
  const messages = useSelector((s) => s.chat.messages);
  const isStreaming = useSelector((s) => s.chat.isStreaming);
  const token = useSelector((s) => s.auth.token);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("auto");
  const scrollRef = useRef(null);
  const activeMode = MODES.find((m) => m.id === mode) ?? MODES[0];

  async function sendMessage() {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    dispatch(userMessageSent(text));

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          mode: activeMode.id,
          modeDirective: activeMode.directive,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const chunks = buffer.split("\n\n");
        buffer = chunks.pop(); // keep incomplete chunk in buffer

        for (const chunk of chunks) {
          if (!chunk.startsWith("data: ")) continue;
          const event = JSON.parse(chunk.slice(6));

          if (event.node === "done") {
            dispatch(streamComplete(event.payload));
          } else if (event.node === "error") {
            dispatch(streamFailed(event.payload?.message));
          } else if (event.node !== "cache") {
            dispatch(pipelineEvent(event));
          }
        }
      }
    } catch (err) {
      dispatch(streamFailed(err.message));
    } finally {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-signal/10 border border-signal/40 flex items-center justify-center">
              <span className="text-signal font-display text-2xl font-bold">B</span>
            </div>
            <h2 className="font-display text-xl">Ask Brain anything</h2>
            <p className="text-muted text-sm max-w-sm">
              Your request runs through five agents — Planner, Retriever, Coder,
              Executor, Reviewer — before you see an answer.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} file={m.file} />
        ))}

        {isStreaming && (
          <div className="max-w-md">
            <AgentPipeline />
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="border-t border-line px-8 py-4 space-y-3">
        <ModeSelector activeMode={mode} onChange={setMode} disabled={isStreaming} />

        <div className="flex items-end gap-3 bg-surface border border-line rounded-xl px-4 py-3 focus-within:border-signal transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={activeMode.placeholder}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm placeholder:text-muted"
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            className="rounded-lg bg-signal hover:bg-signal/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            {isStreaming ? "Thinking…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}