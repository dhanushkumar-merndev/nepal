import { createClient } from "@/lib/supabase/server";
import type { Review } from "@/lib/types";

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
