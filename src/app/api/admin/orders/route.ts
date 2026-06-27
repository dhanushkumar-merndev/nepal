import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth/admin";
import { getAdminOrdersPage, invalidateAdminDashboardCache, invalidateAdminListCache } from "@/lib/data/admin";

const ORDER_STATUSES = ["new", "processing", "completed", "cancelled"];

export async function GET(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const product = searchParams.get("product");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 9);

  const payload = await getAdminOrdersPage({ query, product, from, to, page, pageSize });
  return NextResponse.json(payload);
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const { id, status } = await request.json();
  if (!id || !ORDER_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid order update." }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase admin env is missing." }, { status: 503 });

  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await invalidateAdminDashboardCache();
  await invalidateAdminListCache();
  return NextResponse.json({ data });
}
