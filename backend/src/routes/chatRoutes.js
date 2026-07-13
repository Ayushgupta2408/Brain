import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { runAgentPipeline } from "../agents/orchestrator.js";
import { getRedis } from "../config/redis.js";
import Chat from "../models/Chat.js";

const router = Router();
const RATE_LIMIT_PER_MINUTE = 20;

async function checkRateLimit(userId) {
  const redis = getRedis();
  const key = `brain:ratelimit:${userId}:${Math.floor(Date.now() / 60000)}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60);
  return count <= RATE_LIMIT_PER_MINUTE;
}

// POST /api/chat/stream — Server-Sent Events stream of pipeline progress
router.post("/stream", requireAuth, async (req, res) => {
  const { message, chatId, history = [], mode = "auto", modeDirective = null } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: "message is required" });

  const allowed = await checkRateLimit(req.user.id).catch(() => true);
  if (!allowed) {
    return res.status(429).json({ error: "Rate limit exceeded — please wait a minute and try again." });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const emit = (node, status, payload) => {
    res.write(`data: ${JSON.stringify({ node, status, payload })}\n\n`);
  };

  try {
    const result = await runAgentPipeline(
      { userQuery: message, history: history.slice(-10), mode, modeDirective },
      emit
    );

    if (chatId) {
      await Chat.findByIdAndUpdate(chatId, {
        $push: {
          messages: {
            $each: [
              { role: "user", content: message },
              { role: "assistant", content: result.finalAnswer, pipeline: result },
            ],
          },
        },
      }).catch(() => {});
    }

    res.end();
  } catch (err) {
    emit("error", "failed", { message: err.message });
    res.end();
  }
});

// GET /api/chat — list chats for the logged-in user
router.get("/", requireAuth, async (req, res) => {
  const chats = await Chat.find({ user: req.user.id }).select("title createdAt updatedAt").sort({ updatedAt: -1 });
  res.json(chats);
});

// POST /api/chat — create a new chat
router.post("/", requireAuth, async (req, res) => {
  const chat = await Chat.create({ user: req.user.id, title: req.body.title || "New chat", messages: [] });
  res.status(201).json(chat);
});

// GET /api/chat/:id — full chat with messages
router.get("/:id", requireAuth, async (req, res) => {
  const chat = await Chat.findOne({ _id: req.params.id, user: req.user.id });
  if (!chat) return res.status(404).json({ error: "Chat not found" });
  res.json(chat);
});

export default router;