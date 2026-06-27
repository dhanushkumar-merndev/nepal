import { createAdminClient } from "@/lib/supabase/admin";
import { getApprovedReviews } from "@/lib/data/reviews";
import { getRedis, PUBLIC_HOME_REVIEWS_KEY } from "@/lib/ai/cache";
import type { Review } from "@/lib/types";

export async function getHomeReviews() {
  const redis = getRedis();
  if (redis) {
    const cached = await redis.get<string>(PUBLIC_HOME_REVIEWS_KEY);
    if (cached) return JSON.parse(cached) as Review[];
  }

  const supabase = createAdminClient();
  if (!supabase) return getApprovedReviews();

  const mode = process.env.HOME_REVIEWS_MODE ?? "auto";
  const ids = (process.env.HOME_REVIEW_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  let reviews: Review[] = [];

  if (mode === "manual" && ids.length) {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, products(name)")
      .eq("status", "approved")
      .in("id", ids);

    if (!error && data?.length) {
      const order = new Map(ids.map((id, index) => [id, index]));
      reviews = data
        .map((review) => ({ ...review, product_name: review.products?.name }) as Review)
        .sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));
    }
  }

  if (!reviews.length) {
    const { data: highlights } = await supabase
      .from("reviews")
      .select("*, products(name)")
      .eq("status", "approved")
      .order("rating", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(6);

    if (highlights?.length) {
      reviews = highlights.map((review) => ({
        ...review,
        product_name: review.products?.name,
      })) as Review[];
    }
  }

  const ttl = Number(process.env.HOME_REVIEWS_CACHE_TTL ?? 300);
  if (redis && reviews.length) await redis.set(PUBLIC_HOME_REVIEWS_KEY, JSON.stringify(reviews), { ex: ttl });

  return reviews;
}
