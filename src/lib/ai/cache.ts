import { Redis } from "@upstash/redis";

export const ONE_HOUR_CACHE_TTL_SECONDS = 60 * 60;
export const ONE_MONTH_CACHE_TTL_SECONDS = 60 * 60 * 24 * 30;
export const AI_PRODUCT_CONTEXT_KEY = "ott:ai:product-context:v1";
export const AI_CHAT_RESPONSE_PREFIX = "ott:ai:chat-response:v1:";
export const AI_PRODUCT_SEO_DESCRIPTION_PREFIX = "ott:ai:product-seo-description:v7:";
export const AI_PRODUCT_PAGE_INTRO_PREFIX = "ott:ai:product-page-intro:v5:";
export const AI_PRODUCT_PLAN_FEATURES_PREFIX = "ott:ai:product-plan-features:v7:";
export const REVIEWS_PAGE_CACHE_PREFIX = "ott:reviews:approved-page:v2:";
export const PUBLIC_PRODUCTS_KEY = "ott:public:products:v1";
export const PUBLIC_HOME_REVIEWS_KEY = "ott:public:home-reviews:v1";
export const PUBLIC_PRODUCT_RATINGS_KEY = "ott:public:product-ratings:v1";

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

export async function invalidatePublicProductsCache() {
  const redis = getRedis();
  if (!redis) return;
  await redis.del(PUBLIC_PRODUCTS_KEY);
}

export async function invalidatePublicHomeReviewsCache() {
  const redis = getRedis();
  if (!redis) return;
  await redis.del(PUBLIC_HOME_REVIEWS_KEY);
}

export async function invalidatePublicProductRatingsCache() {
  const redis = getRedis();
  if (!redis) return;
  await redis.del(PUBLIC_PRODUCT_RATINGS_KEY);
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
