import { createClient } from "@/lib/supabase/server";
import { getRedis, REVIEWS_PAGE_CACHE_PREFIX } from "@/lib/ai/cache";
import type { Review } from "@/lib/types";

const REVIEWS_PER_PAGE = 18;
const REVIEWS_CACHE_TTL_SECONDS = 60 * 60 * 24;

export async function getApprovedReviews() {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("*, products(name)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error || !data?.length) return [];

  return data.map((review) => ({
    ...review,
    product_name: review.products?.name,
  })) as Review[];
}

export async function getApprovedReviewsPage(page = 1) {
  const pageSize = REVIEWS_PER_PAGE;
  const currentPage = Math.max(1, page);
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;
  const redis = getRedis();
  const ttl = Number(process.env.REVIEWS_PAGE_CACHE_TTL_SECONDS ?? REVIEWS_CACHE_TTL_SECONDS);
  const cacheKey = `${REVIEWS_PAGE_CACHE_PREFIX}${currentPage}:${pageSize}`;

  if (redis) {
    const cached = await redis.get<{ reviews: Review[]; totalCount: number; page: number; pageSize: number }>(cacheKey);
    if (cached) return cached;
  }

  const supabase = await createClient();
  if (!supabase) return { reviews: [], totalCount: 0, page: currentPage, pageSize };

  const { data, error, count } = await supabase
    .from("reviews")
    .select("*, products(name)", { count: "exact" })
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return { reviews: [], totalCount: 0, page: currentPage, pageSize };

  const result = {
    reviews: (data ?? []).map((review) => ({
      ...review,
      product_name: review.products?.name,
    })) as Review[],
    totalCount: count ?? 0,
    page: currentPage,
    pageSize,
  };

  if (redis) await redis.set(cacheKey, result, { ex: ttl });
  return result;
}
