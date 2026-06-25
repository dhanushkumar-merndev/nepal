import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getIp, rateLimit } from "@/lib/rate-limit";
import { reviewSchema } from "@/lib/validators/review";
import { invalidateAdminDashboardCache, invalidateAdminListCache } from "@/lib/data/admin";

export async function POST(request: Request) {
  const limit = await rateLimit(`reviews:${getIp(request)}`);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Please try again after a minute." }, { status: 429 });
  }

  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Google login is required." }, { status: 401 });

  const name = user.user_metadata?.full_name || user.user_metadata?.name || "Google User";
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  const { error } = await supabase.from("reviews").insert({
    product_id: parsed.data.product_id,
    user_id: user.id,
    customer_name: name,
    customer_email: user.email,
    customer_avatar_url: avatarUrl,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    status: "pending",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await invalidateAdminDashboardCache();
  await invalidateAdminListCache();
  return NextResponse.json({ ok: true, message: "Review submitted. It will appear after approval." });
}
