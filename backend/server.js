import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));

// ✅ Serve generated files
app.use(
  "/files",
  express.static(path.join(__dirname, "generated"))
);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Brain backend",
    builtBy: "Ayush Kumar Gupta",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

app.use((err, req, res, next) => {
  console.error("[Brain] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

connectDB().finally(() => {
  app.listen(PORT, () => {
    console.log(`[Brain] Backend running on http://localhost:${PORT}`);
  });
});