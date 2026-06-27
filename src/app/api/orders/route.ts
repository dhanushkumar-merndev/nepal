import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getIp, rateLimit } from "@/lib/rate-limit";
import { orderSchema } from "@/lib/validators/order";
import { invalidateAdminDashboardCache, invalidateAdminListCache } from "@/lib/data/admin";

export async function POST(request: Request) {
  const limit = await rateLimit(`orders:${getIp(request)}`);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Please try again after a minute." }, { status: 429 });
  }

  const parsed = orderSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ ok: true, fallback: true });

  const planIds = parsed.data.cart_items
    .map((item) => (isCartObject(item) ? item.planId : null))
    .filter((id): id is string => Boolean(id));
  const actualPrices = new Map<string, number>();

  if (planIds.length) {
    const { data: plans } = await supabase
      .from("plans")
      .select("id,actual_price")
      .in("id", planIds);

    for (const plan of plans ?? []) {
      actualPrices.set(plan.id, Number(plan.actual_price ?? 0));
    }
  }

  const cartItems = parsed.data.cart_items.map((item) => {
    if (!isCartObject(item)) return item;
    return {
      ...item,
      actualPrice: actualPrices.get(item.planId) ?? 0,
    };
  });

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      ...parsed.data,
      cart_items: cartItems,
    })
    .select("id,customer_name,customer_email,total_amount,cart_items")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await invalidateAdminDashboardCache();
  await invalidateAdminListCache();

  return NextResponse.json({ ok: true });
}

function isCartObject(item: unknown): item is { planId: string } {
  return Boolean(item && typeof item === "object" && "planId" in item && typeof (item as { planId?: unknown }).planId === "string");
}
