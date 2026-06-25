import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getIp, rateLimit } from "@/lib/rate-limit";
import { orderSchema } from "@/lib/validators/order";
import { sendOrderThankYouEmail } from "@/lib/email/brevo";
import { formatPrice } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/server";
import { invalidateAdminDashboardCache, invalidateAdminListCache } from "@/lib/data/admin";

export async function POST(request: Request) {
  const limit = await rateLimit(`orders:${getIp(request)}`);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Please try again after a minute." }, { status: 429 });
  }

  const parsed = orderSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const authSupabase = await createClient();
  const { data: authData } = authSupabase ? await authSupabase.auth.getUser() : { data: { user: null } };
  const customerEmail = parsed.data.customer_email ?? authData.user?.email;

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
    .insert({ ...parsed.data, customer_email: customerEmail, cart_items: cartItems })
    .select("id,customer_name,customer_email,total_amount,cart_items")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await invalidateAdminDashboardCache();
  await invalidateAdminListCache();

  // Order thank-you emails are sent only after a successful order/payment creation.
  // Do not call this from admin order status changes; Completed/Cancelled/New/Processing status changes must not send email.
  const emailToSend = typeof order?.customer_email === "string" ? order.customer_email : customerEmail;
  if (emailToSend) {
    void sendOrderThankYouEmail({
      to: emailToSend,
      name: order?.customer_name ?? parsed.data.customer_name,
      orderId: order?.id ?? "new-order",
      productName: getOrderProductName(cartItems),
      price: formatPrice(Number(order?.total_amount ?? parsed.data.total_amount ?? 0)),
    });
  } else {
    console.log("[brevo] order-thank-you skipped: buyer is not Google signed in and order has no email", { orderId: order?.id });
  }

  return NextResponse.json({ ok: true });
}

function isCartObject(item: unknown): item is { planId: string } {
  return Boolean(item && typeof item === "object" && "planId" in item && typeof (item as { planId?: unknown }).planId === "string");
}

function getOrderProductName(items: unknown[]) {
  const names = items
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const productName = (item as { productName?: unknown }).productName;
      return typeof productName === "string" ? productName.trim() : "";
    })
    .filter(Boolean);

  if (!names.length) return "Your order";
  return Array.from(new Set(names)).join(", ");
}
