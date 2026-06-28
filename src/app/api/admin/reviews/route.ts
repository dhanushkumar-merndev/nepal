import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth/admin";
import {
  invalidatePublicHomeReviewsCache,
  invalidatePublicProductRatingsCache,
  invalidatePublicProductsCache,
  invalidateReviewsCache,
} from "@/lib/ai/cache";
import { getAdminReviewsPage, invalidateAdminDashboardCache, invalidateAdminListCache } from "@/lib/data/admin";

export async function GET(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const product = searchParams.get("product");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 9);
  const payload = await getAdminReviewsPage({ query, product, from, to, status, page, pageSize });
  return NextResponse.json(payload);
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id, status } = await request.json();
  if (!id || !["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid review update." }, { status: 400 });
  }
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase admin env is missing." }, { status: 503 });

  const { data: existing, error: existingError } = await supabase
    .from("reviews")
    .select("status")
    .eq("id", id)
    .single();

  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });

  if (status === "pending" && existing?.status !== "pending") {
    return NextResponse.json({ error: "Approved or rejected reviews cannot be moved back to pending." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reviews")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, products(name)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await invalidateReviewsCache();
  await invalidatePublicHomeReviewsCache();
  await invalidatePublicProductRatingsCache();
  await invalidatePublicProductsCache();
  await invalidateAdminDashboardCache();
  await invalidateAdminListCache();

  return NextResponse.json({ data: { ...data, product_name: data.products?.name } });
}
