import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { invalidateProductContextCache } from "@/lib/ai/cache";
import { invalidateAdminDashboardCache } from "@/lib/data/admin";

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Product id is required." }, { status: 400 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase admin env is missing." }, { status: 503 });
  
  const { error } = await supabase.from("products").update({ is_deleted: false }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  await invalidateProductContextCache();
  await invalidateAdminDashboardCache();
  
  return NextResponse.json({ ok: true, message: "Product restored." });
}
