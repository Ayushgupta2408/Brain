import Redis from "ioredis";

/**
 * Redis is optional. If REDIS_URL isn't reachable, Brain falls back to a
 * simple in-memory Map so the app still works out of the box.
 */
class MemoryFallback {
  constructor() {
    this.store = new Map();
  }
  async get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }
  async set(key, value, ...args) {
    let ttlSeconds = null;
    const exIndex = args.indexOf("EX");
    if (exIndex !== -1) ttlSeconds = Number(args[exIndex + 1]);
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
    return "OK";
  }
  async incr(key) {
    const current = Number((await this.get(key)) || 0) + 1;
    await this.set(key, String(current));
    return current;
  }
  async expire() {
    return 1;
  }
}

let client;

export function getRedis() {
  if (client) return client;

  if (!process.env.REDIS_URL) {
    console.warn("[Brain] REDIS_URL not set — using in-memory cache fallback.");
    client = new MemoryFallback();
    return client;
  }

  try {
    const redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      retryStrategy: () => null, // don't retry forever, fall back fast
    });
    redis.on("error", (err) => {
      console.warn("[Brain] Redis error, falling back to memory cache:", err.message);
      client = new MemoryFallback();
    });
    redis.connect().catch(() => {
      console.warn("[Brain] Redis unreachable — using in-memory cache fallback.");
      client = new MemoryFallback();
    });
    client = redis;
    return client;
  } catch {
    client = new MemoryFallback();
    return client;
  }
}
