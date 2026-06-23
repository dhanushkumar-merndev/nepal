import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/auth/admin";

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ data: [], fallback: true });
  const { data, error } = await supabase.from("reviews").select("*, products(name)").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id, status } = await request.json();
  if (!id || !["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid review update." }, { status: 400 });
  }
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase admin env is missing." }, { status: 503 });
  const { data, error } = await supabase.from("reviews").update({ status }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
