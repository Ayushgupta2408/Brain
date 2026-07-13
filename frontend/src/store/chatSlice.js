import { createSlice } from "@reduxjs/toolkit";

const AGENT_NODES = ["planner", "retriever", "coder", "executor", "reviewer"];

const initialState = {
  messages: [], // { role, content }
  pipeline: Object.fromEntries(AGENT_NODES.map((n) => [n, "idle"])), // idle | running | done
  pipelineDetail: {},
  isStreaming: false,
  chatId: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    startNewChat: (state) => {
      state.messages = [];
      state.pipeline = Object.fromEntries(AGENT_NODES.map((n) => [n, "idle"]));
      state.pipelineDetail = {};
      state.chatId = null;
    },
    setChatId: (state, action) => {
      state.chatId = action.payload;
    },
    userMessageSent: (state, action) => {
      state.messages.push({ role: "user", content: action.payload });
      state.isStreaming = true;
      state.pipeline = Object.fromEntries(AGENT_NODES.map((n) => [n, "idle"]));
      state.pipelineDetail = {};
    },
    pipelineEvent: (state, action) => {
      const { node, status, payload } = action.payload;
      if (AGENT_NODES.includes(node)) {
        state.pipeline[node] = status;
        state.pipelineDetail[node] = payload;
      }
    },
    streamComplete: (state, action) => {
      state.isStreaming = false;
      if (action.payload?.finalAnswer) {
        state.messages.push({
          role: "assistant",
          content: action.payload.finalAnswer,
          file: action.payload.file || null,
        });
      }
    },
    streamFailed: (state, action) => {
      state.isStreaming = false;
      state.messages.push({
        role: "assistant",
        content: `⚠️ Pipeline error: ${action.payload || "unknown error"}`,
      });
    },
  },
});

export const {
  startNewChat,
  setChatId,
  userMessageSent,
  pipelineEvent,
  streamComplete,
  streamFailed,
} = chatSlice.actions;
export default chatSlice.reducer;
export { AGENT_NODES };