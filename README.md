# 🧠 Brain — Multi-Agent AI Platform

A production-shaped MERN application where a single user request is handled
by five cooperating agents instead of one big prompt:

```
Planner → Retriever → Coder → Executor → Reviewer
```

Built by **Ayush Kumar Gupta**.

---
<img width="1917" height="917" alt="image" src="https://github.com/user-attachments/assets/33dd0508-7e92-4c94-a136-298e95be16b4" />

---

## Architecture

| Layer | Tech |
|---|---|
| Frontend | React 18, Redux Toolkit, React Router, Tailwind CSS, Vite |
| Backend | Node.js, Express |
| LLM | **Groq API** (`llama-3.3-70b-versatile` by default) |
| Agent orchestration | Custom LangGraph-style state pipeline (`backend/src/agents/orchestrator.js`) |
| RAG | Qdrant vector DB — auto-falls back to an in-memory cosine-similarity store if Qdrant isn't running |
| Caching / rate limiting | Redis — auto-falls back to an in-memory cache if Redis isn't running |
| Persistence | MongoDB (users + chat history) |
| Auth | JWT |
| Sandbox execution | `vm2` (demo-grade — see note below) |
| Containers | Docker + docker-compose |

**Everything optional degrades gracefully.** You only *need* a Groq API key
and MongoDB to run this locally — Redis and Qdrant are nice-to-haves that
the app detects and falls back from automatically.

### How a request flows

1. User sends a message → `POST /api/chat/stream` (Server-Sent Events).
2. **Planner** breaks the request into steps.
3. **Retriever** pulls relevant context from the vector store (Qdrant or in-memory).
4. **Coder** drafts the answer, using the plan + retrieved context.
5. **Executor** runs any JavaScript in the draft inside a sandboxed VM.
6. **Reviewer** checks the draft + execution output and produces the final answer.
7. Every step streams live to the frontend, which lights up the agent
   pipeline visualizer node by node in real time.
8. The full pipeline result is cached in Redis for 10 minutes, keyed by a
   hash of the query, so repeated questions resolve instantly.

---
<img width="831" height="1891" alt="ChatGPT Image Jul 13, 2026, 03_39_18 PM" src="https://github.com/user-attachments/assets/a4594e9c-b373-4231-b5df-3a41041bde2a" />

---

## Quick start (local, no Docker)

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env and set GROQ_API_KEY + JWT_SECRET (Mongo/Redis/Qdrant are optional)
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` to the backend.

### 3. Use it

Open `http://localhost:5173`, register an account, and start chatting.
Watch the pipeline visualizer light up as each agent runs.

---

## Quick start (Docker — full stack incl. Mongo, Redis, Qdrant)

```bash
cp backend/.env.example .env   # then edit GROQ_API_KEY + JWT_SECRET at repo root
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000/api/health`

---

## Environment variables (backend)

| Variable | Required | Default |
|---|---|---|
| `GROQ_API_KEY` | ✅ | — |
| `JWT_SECRET` | ✅ | — |
| `PORT` | ❌ | `5000` |
| `CLIENT_ORIGIN` | ❌ | `http://localhost:5173` |
| `MONGO_URI` | ✅ | `mongodb://localhost:27017/brain` |
| `REDIS_URL` | ✅ | in-memory fallback |
| `QDRANT_URL` | ✅ | in-memory fallback |
| `GROQ_MODEL` | ✅ | `llama-3.3-70b-versatile` |

---

## Project structure

```
brain/
├── backend/
│   ├── server.js
│   └── src/
│       ├── agents/         # planner, retriever, coder, executor, reviewer, orchestrator
│       ├── config/         # groq.js, db.js, redis.js
│       ├── rag/            # qdrantClient.js, vectorStore.js (fallback)
│       ├── models/         # User.js, Chat.js
│       ├── middleware/     # auth.js
│       └── routes/         # authRoutes.js, chatRoutes.js
├── frontend/
│   └── src/
│       ├── components/     # Sidebar, ChatWindow, AgentPipeline, MessageBubble, Footer
│       ├── pages/          # Login, Register, ChatPage
│       └── store/          # Redux Toolkit slices
├── docker-compose.yml
└── README.md
```

---

## Notes on production-hardening

This repo is structured the way a production app would be, with a few
things deliberately simplified for a local/demo footprint — called out here
so nothing is presented as more finished than it is:

- **Sandbox execution** uses `vm2` in-process with a 2s timeout. For real
  untrusted-code execution, run the Executor agent's code in an isolated
  container or microVM (e.g. Firecracker, gVisor), not in-process.
- **Image generation mode** calls [Pollinations.ai](https://pollinations.ai),
  a free, open-source image API that needs no signup or key. Anonymous usage
  is rate-limited (~1 request/15s) with no uptime SLA — fine for demos, not
  for production traffic. Swap in OpenAI Images, Stability AI, or Replicate
  in `backend/src/agents/imageProvider.js` for production-grade generation.
- **PPT mode** renders a real `.pptx` via `pptxgenjs` in
  `backend/src/agents/formatter.js` — no external API needed.
- **RAG embeddings** use a deterministic hashed bag-of-words vector when no
  external embedding model is wired up, so the app works offline. Swap in a
  real embedding model for production-quality retrieval.
- **Rate limiting** is a simple fixed-window counter in Redis — fine for a
  demo, consider a sliding-window/token-bucket approach at scale.

## License

MIT
