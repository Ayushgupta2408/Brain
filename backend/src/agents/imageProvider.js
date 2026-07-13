import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "..", "..", "generated");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Pollinations.ai
const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt";

export async function generateImage(
  prompt,
  { width = 1024, height = 1024 } = {}
) {
  const cleanPrompt = (prompt || "").trim().slice(0, 300);

  if (!cleanPrompt) {
    throw new Error("No image prompt was provided");
  }

  const seed = Math.floor(Math.random() * 1_000_000_000);

  const url =
    `${POLLINATIONS_BASE}/${encodeURIComponent(cleanPrompt)}` +
    `?width=${width}` +
    `&height=${height}` +
    `&seed=${seed}` +
    `&nologo=true`;

  console.log("\n========== POLLINATIONS ==========");
  console.log("Prompt:", cleanPrompt);
  console.log("URL:", url);

  // 30-second timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  let res;

  try {
    res = await fetch(url, {
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  console.log("Status:", res.status);
  console.log("Content-Type:", res.headers.get("content-type"));

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("Response Body:", body);

    throw new Error(
      `Image provider request failed (${res.status}).`
    );
  }

  const contentType = res.headers.get("content-type") || "";

  if (!contentType.startsWith("image/")) {
    const body = await res.text();
    console.error("Unexpected Response:", body);

    throw new Error(
      `Expected image but received ${contentType}`
    );
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  console.log("Downloaded:", buffer.length, "bytes");

  const filename = `brain-${Date.now()}.png`;
  const filepath = path.join(OUTPUT_DIR, filename);

  fs.writeFileSync(filepath, buffer);

  console.log("Saved Image:", filepath);
  console.log("=================================\n");

  return {
    filename,
    url: `/files/${filename}`,
    prompt: cleanPrompt,
  };
}