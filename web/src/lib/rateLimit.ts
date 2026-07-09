import "server-only";

/**
 * Rate limiting for the lead action. Real, distributed protection when
 * UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are configured
 * (sliding window, 5 requests / 10 minutes per IP).
 *
 * Without Upstash, falls back to an in-memory counter — this is
 * DEV-ONLY. Vercel serverless functions are stateless and horizontally
 * scaled, so an in-memory Map does not meaningfully rate-limit in
 * production (concurrent requests routinely land on different cold
 * instances). Enable Vercel's platform-level Firewall/Rate-Limiting
 * rules for real production protection regardless of this module.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

let upstash: {
  limit: (id: string) => Promise<{ success: boolean }>;
} | null = null;
let upstashInitAttempted = false;

async function getUpstashLimiter() {
  if (upstashInitAttempted) return upstash;
  upstashInitAttempted = true;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({ url, token });
  upstash = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS, "10 m"),
    prefix: "infobackground:lead",
  });
  return upstash;
}

const memoryHits = new Map<string, number[]>();

function checkInMemory(id: string): boolean {
  const now = Date.now();
  const hits = (memoryHits.get(id) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  memoryHits.set(id, hits);
  return hits.length <= MAX_REQUESTS;
}

export async function checkLeadRateLimit(identifier: string): Promise<boolean> {
  const limiter = await getUpstashLimiter();
  if (limiter) {
    const { success } = await limiter.limit(identifier);
    return success;
  }
  return checkInMemory(identifier);
}
