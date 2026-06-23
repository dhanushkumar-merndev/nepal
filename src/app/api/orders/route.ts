import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getIp, rateLimit } from "@/lib/rate-limit";
import { orderSchema } from "@/lib/validators/order";

export async function POST(request: Request) {
  const limit = await rateLimit(`orders:${getIp(request)}`);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Please try again after a minute." }, { status: 429 });
  }

  const parsed = orderSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ ok: true, fallback: true });

  const { error } = await supabase.from("orders").insert(parsed.data);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
