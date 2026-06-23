import { createAdminClient } from "@/lib/supabase/admin";
import { getApprovedReviews } from "@/lib/data/reviews";
import type { Review } from "@/lib/types";

export async function getHomeReviews() {
  const supabase = createAdminClient();
  if (!supabase) return getApprovedReviews();

  const { data: settings } = await supabase
    .from("settings")
    .select("key,value")
    .in("key", ["home_reviews_mode", "home_review_ids"]);

  const mode = settings?.find((item) => item.key === "home_reviews_mode")?.value ?? "auto";
  const ids: string[] = (settings?.find((item) => item.key === "home_review_ids")?.value ?? "")
    .split(",")
    .map((id: string) => id.trim())
    .filter(Boolean);

  if (mode === "manual" && ids.length) {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, products(name)")
      .eq("status", "approved")
      .in("id", ids);

    if (!error && data?.length) {
      const order = new Map(ids.map((id: string, index: number) => [id, index]));
      return data
        .map((review) => ({ ...review, product_name: review.products?.name }) as Review)
        .sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));
    }
  }

  return getApprovedReviews();
}
