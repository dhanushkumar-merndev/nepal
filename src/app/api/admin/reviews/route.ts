import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth/admin";
import { invalidateReviewsCache } from "@/lib/ai/cache";
import { getAdminReviewsPage, invalidateAdminDashboardCache, invalidateAdminListCache } from "@/lib/data/admin";
import { sendReviewAppreciationEmail, sendReviewApprovedEmail, sendReviewFollowUpEmail } from "@/lib/email/brevo";

export async function GET(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 9);
  const payload = await getAdminReviewsPage({ query, from, to, status, page, pageSize });
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
    .select("status,customer_name,customer_email,comment,products(name)")
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
  await invalidateAdminDashboardCache();
  await invalidateAdminListCache();

  // Review approved emails are sent only when moving from Pending/Rejected to Approved.
  // Re-selecting Approved on an already approved review, Pending, and Rejected do not send email.
  if (existing.status !== "approved" && status === "approved" && data.customer_email) {
    void sendReviewApprovedEmail({
      to: data.customer_email,
      name: data.customer_name,
      productName: data.products?.name ?? "your product",
      reviewText: data.comment,
    });
  }

  return NextResponse.json({ data: { ...data, product_name: data.products?.name } });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id, type } = await request.json();
  if (!id || !["appreciation", "follow_up"].includes(type)) {
    return NextResponse.json({ error: "Invalid email request." }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase admin env is missing." }, { status: 503 });

  const { data, error } = await supabase
    .from("reviews")
    .select("customer_name,customer_email,comment,rating,products(name)")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data.customer_email) return NextResponse.json({ error: "This review has no customer email." }, { status: 400 });

  const product = Array.isArray(data.products) ? data.products[0] : data.products;
  const input = {
    to: data.customer_email,
    name: data.customer_name,
    productName: product?.name ?? "your product",
    reviewText: data.comment,
    rating: Number(data.rating ?? 0),
  };

  const result = type === "appreciation"
    ? await sendReviewAppreciationEmail(input)
    : await sendReviewFollowUpEmail(input);

  if ("ok" in result && result.ok === false) {
    return NextResponse.json({ error: "Unable to send email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
