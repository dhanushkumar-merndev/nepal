import { Redis } from "@upstash/redis";

export const AI_PRODUCT_CONTEXT_KEY = "ott:ai:product-context:v1";

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
}
