import type { Plan, Product } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { getRedis, ONE_HOUR_CACHE_TTL_SECONDS, PUBLIC_PRODUCTS_KEY, PUBLIC_PRODUCT_RATINGS_KEY } from "@/lib/ai/cache";
import { withCachedProductAssets } from "@/lib/utils/product-assets";

type ProductRow = Omit<Product, "plans"> & { plans?: Plan[] | null; updated_at?: string | null };
type ProductRatingStats = Record<string, { rating: number; review_count: number }>;

async function getProductRatingStats() {
  const redis = getRedis();
  if (redis) {
    const cached = await redis.get<string>(PUBLIC_PRODUCT_RATINGS_KEY);
    if (cached) {
      try {
        return JSON.parse(cached) as ProductRatingStats;
      } catch {
        // Ignore stale cache and rebuild it below.
      }
    }
  }

  const supabase = await createClient();
  if (!supabase) return {} as ProductRatingStats;

  const { data, error } = await supabase
    .from("reviews")
    .select("product_id, rating")
    .eq("status", "approved");

  if (error || !data?.length) return {} as ProductRatingStats;

  const stats = data.reduce<ProductRatingStats>((acc, review) => {
    const current = acc[review.product_id] ?? { rating: 0, review_count: 0 };
    const reviewCount = current.review_count + 1;
    acc[review.product_id] = {
      review_count: reviewCount,
      rating: Number((((current.rating * current.review_count) + review.rating) / reviewCount).toFixed(1)),
    };
    return acc;
  }, {});

  const ttl = Number(process.env.PUBLIC_PRODUCT_RATINGS_CACHE_TTL ?? ONE_HOUR_CACHE_TTL_SECONDS);
  if (redis) await redis.set(PUBLIC_PRODUCT_RATINGS_KEY, JSON.stringify(stats), { ex: ttl });

  return stats;
}

export async function getProducts() {
  const redis = getRedis();
  if (redis) {
    const cached = await redis.get<string>(PUBLIC_PRODUCTS_KEY);
    if (cached) {
      try { return JSON.parse(cached) as Product[]; } catch { /* stale cache, refetch */ }
    }
  }

  const supabase = await createClient();
  if (!supabase) return [];

  const [{ data, error }, ratingStats] = await Promise.all([
    supabase
      .from("products")
      .select(`
        *,
        plans(
          id,
          product_id,
          name,
          duration,
          real_price,
          offer_price,
          features,
          stock_status,
          is_active,
          sort_order
        )
      `)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("sort_order", { referencedTable: "plans", ascending: true }),
    getProductRatingStats(),
  ]);

  if (error || !data?.length) return [];

  const products = (data as ProductRow[]).map((product) =>
    withCachedProductAssets({
      ...product,
      rating: ratingStats[product.id]?.rating ?? 4.8,
      review_count: ratingStats[product.id]?.review_count ?? 0,
      plans: (product.plans ?? []).filter((plan) => plan.is_active),
    }),
  );

  const ttl = Number(process.env.PUBLIC_PRODUCTS_CACHE_TTL ?? ONE_HOUR_CACHE_TTL_SECONDS);
  if (redis) await redis.set(PUBLIC_PRODUCTS_KEY, JSON.stringify(products), { ex: ttl });

  return products;
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}
