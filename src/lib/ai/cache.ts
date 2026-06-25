import { Redis } from "@upstash/redis";

export const AI_PRODUCT_CONTEXT_KEY = "ott:ai:product-context:v1";
export const AI_CHAT_RESPONSE_PREFIX = "ott:ai:chat-response:v1:";
export const REVIEWS_PAGE_CACHE_PREFIX = "ott:reviews:approved-page:v2:";

export function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function invalidateProductContextCache() {
  const redis = getRedis();
  if (!redis) return;
  await redis.del(AI_PRODUCT_CONTEXT_KEY);
  await invalidateChatResponseCache(redis);
}

export async function invalidateReviewsCache() {
  const redis = getRedis();
  if (!redis) return;
  const keys = await redis.keys(`${REVIEWS_PAGE_CACHE_PREFIX}*`);
  if (keys.length) await redis.del(...keys);
}

async function invalidateChatResponseCache(redis = getRedis()) {
  if (!redis) return;
  const keys = await redis.keys(`${AI_CHAT_RESPONSE_PREFIX}*`);
  if (keys.length) await redis.del(...keys);
}

export function chatResponseCacheKey(message: string) {
  const normalized = message.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 500);
  return `${AI_CHAT_RESPONSE_PREFIX}${Buffer.from(normalized).toString("base64url")}`;
}
