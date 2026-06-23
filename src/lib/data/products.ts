import type { Plan, Product } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

type ProductRow = Omit<Product, "plans"> & { plans?: Plan[] | null };

export async function getProducts() {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*, plans(*)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("sort_order", { referencedTable: "plans", ascending: true });

  if (error || !data?.length) return [];

  return (data as ProductRow[]).map((product) => ({
    ...product,
    rating: product.rating ?? 4.8,
    review_count: product.review_count ?? 0,
    plans: (product.plans ?? []).filter((plan) => plan.is_active),
  }));
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}
