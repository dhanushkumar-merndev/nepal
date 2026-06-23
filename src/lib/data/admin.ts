import { createAdminClient } from "@/lib/supabase/admin";

export async function getAdminOrders() {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return [];
  return data;
}

export async function getAdminReviews() {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("*, products(name)")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return [];
  return data.map((review) => ({ ...review, product_name: review.products?.name }));
}
