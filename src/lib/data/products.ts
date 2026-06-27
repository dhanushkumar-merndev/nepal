import type { Plan, Product } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { getRedis, PUBLIC_PRODUCTS_KEY } from "@/lib/ai/cache";

type ProductRow = Omit<Product, "plans"> & { plans?: Plan[] | null };

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

  const { data, error } = await supabase
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
    .order("sort_order", { referencedTable: "plans", ascending: true });

  if (error || !data?.length) return [];

  const products = (data as ProductRow[]).map((product) => ({
    ...product,
    rating: product.rating ?? 4.8,
    review_count: product.review_count ?? 0,
    plans: (product.plans ?? []).filter((plan) => plan.is_active),
  }));

  const ttl = Number(process.env.PUBLIC_PRODUCTS_CACHE_TTL ?? 300);
  if (redis) await redis.set(PUBLIC_PRODUCTS_KEY, JSON.stringify(products), { ex: ttl });

  return products;
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}
