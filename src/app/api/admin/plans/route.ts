import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { planSchema } from "@/lib/validators/plan";
import { invalidateProductContextCache } from "@/lib/ai/cache";
import { isAdminRequest } from "@/lib/auth/admin";

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ data: [], fallback: true });
  const { data, error } = await supabase.from("plans").select("*").order("sort_order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const parsed = planSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase admin env is missing." }, { status: 503 });
  const { data, error } = await supabase.from("plans").insert(parsed.data).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await invalidateProductContextCache();
  return NextResponse.json({ data, message: "Product updated and AI cache refreshed." });
}
