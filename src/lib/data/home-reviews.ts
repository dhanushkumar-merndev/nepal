import { createAdminClient } from "@/lib/supabase/admin";
import { getApprovedReviews } from "@/lib/data/reviews";
import type { Review } from "@/lib/types";

export async function getHomeReviews() {
  const supabase = createAdminClient();
  if (!supabase) return getApprovedReviews();

  const mode = process.env.HOME_REVIEWS_MODE ?? "auto";
  const ids = (process.env.HOME_REVIEW_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (mode === "manual" && ids.length) {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, products(name)")
      .eq("status", "approved")
      .in("id", ids);

    if (!error && data?.length) {
      const order = new Map(ids.map((id, index) => [id, index]));
      return data
        .map((review) => ({ ...review, product_name: review.products?.name }) as Review)
        .sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));
    }
  }

  const { data: highlights } = await supabase
    .from("reviews")
    .select("*, products(name)")
    .eq("status", "approved")
    .order("rating", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(6);

  if (highlights?.length) {
    return highlights.map((review) => ({
      ...review,
      product_name: review.products?.name,
    })) as Review[];
  }

  return [];
}
