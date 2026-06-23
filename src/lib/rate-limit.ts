import { Redis } from "@upstash/redis";

const memory = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(key: string) {
  const limit = Number(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE ?? 30);
  const windowSeconds = 60;
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    const redis = new Redis({ url: redisUrl, token: redisToken });
    const redisKey = `rate:${key}`;
    const count = await redis.incr(redisKey);
    if (count === 1) await redis.expire(redisKey, windowSeconds);
    return { success: count <= limit, limit, remaining: Math.max(0, limit - count) };
  }

  const now = Date.now();
  const current = memory.get(key);
  if (!current || current.resetAt < now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { success: true, limit, remaining: limit - 1 };
  }

  current.count += 1;
  return { success: current.count <= limit, limit, remaining: Math.max(0, limit - current.count) };
}

export function getIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}
