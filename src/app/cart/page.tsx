"use client";

import { Suspense, useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { formatPrice } from "@/lib/utils/format";
import { getSaveAmount } from "@/lib/utils/pricing";
import { buildWhatsAppMessage, getWhatsAppUrl } from "@/lib/utils/whatsapp";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogle } from "@/lib/auth/sign-in-google";
import { getLocaleFromPathname, localizePath } from "@/lib/locale";
import { getSiteCopy } from "@/lib/site-copy";

const PENDING_CHECKOUT_KEY = "ott-nepal-pending-checkout";

export function CartPage() {
  const [ready, setReady] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const resumedCheckout = useRef(false);
  const { items, total, increase, decrease, removeItem, clear } = useCartStore();
  const pathname = usePathname() || "/cart";
  const locale = getLocaleFromPathname(pathname);
  const copy = getSiteCopy(locale);

  const cartItems = useMemo(() => (ready ? items : []), [ready, items]);
  const cartTotal = ready ? total() : 0;

  const applyAuthUser = useCallback((user: User | null) => {
    setCustomerEmail(user?.email ?? null);
    const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name;
    if (displayName) setCustomerName((current) => current || displayName);
  }, []);

  const completeCheckout = useCallback(async ({
    name,
    email,
    orderNote,
    redirectToWhatsApp,
  }: {
    name: string;
    email: string;
    orderNote: string;
    redirectToWhatsApp: boolean;
  }) => {
    setSubmitting(true);

    const payload = {
      customer_name: name,
      customer_email: email,
      phone: "whatsapp",
      note: orderNote,
      cart_items: cartItems,
      total_amount: cartTotal,
      whatsapp_sent: true,
    };

    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    const message = buildWhatsAppMessage({
      customerName: name,
      note: orderNote,
      items: cartItems,
    });
    const whatsappUrl = getWhatsAppUrl(message);
    setSubmitting(false);
    if (redirectToWhatsApp) window.location.assign(whatsappUrl);
    else window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }, [cartItems, cartTotal]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => applyAuthUser(data.user ?? null));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      applyAuthUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, [applyAuthUser]);

  useEffect(() => {
    if (!ready || !customerEmail || !cartItems.length || resumedCheckout.current) return;
    const pending = readPendingCheckout();
    if (!pending) return;

    resumedCheckout.current = true;
    sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
    const timer = window.setTimeout(() => {
      void completeCheckout({
        name: pending.customerName,
        email: customerEmail,
        orderNote: pending.note,
        redirectToWhatsApp: true,
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [ready, customerEmail, cartItems.length, completeCheckout]);

  async function handleCheckout() {
    const trimmedName = customerName.trim();
    if (!trimmedName || !cartItems.length) {
      toast.error(copy.cartPage.enterNameError);
      return;
    }

    if (!customerEmail) {
      sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify({ customerName: trimmedName, note, createdAt: Date.now() }));
      toast.info(copy.cartPage.signInHint);
      await signInWithGoogle(localizePath("/cart", locale));
      return;
    }

    await completeCheckout({
      name: trimmedName,
      email: customerEmail,
      orderNote: note,
      redirectToWhatsApp: true,
    });
  }

  const emptyState = (
    <div className="m-auto flex flex-col items-center gap-4 text-center">
      <div className="grid size-20 place-items-center rounded-full bg-[#E6F7FD]">
        <ShoppingCart className="size-8 text-[#0B7FAE]" />
      </div>
      <h2 className="text-2xl font-bold">{copy.cartPage.emptyTitle}</h2>
      <p className="max-w-sm text-[#555]">{copy.cartPage.emptyDescription}</p>
      <div className="flex gap-3">
        <Button onClick={() => window.history.back()}>{copy.cartPage.goBack}</Button>
        <Button variant="secondary" onClick={() => window.location.href = localizePath("/plans", locale)}>{copy.cartPage.browsePlans}</Button>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-[calc(100dvh-10rem)] max-w-6xl flex-col px-4 py-10 lg:pt-16 lg:pb-10">
        {cartItems.length ? (
          <>
            <h1 className="text-3xl font-black md:text-4xl">{copy.cartPage.title}</h1>
            <p className="mt-2 text-[#555]">{copy.cartPage.subtitle}</p>
          </>
        ) : null}

        {!cartItems.length ? emptyState : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-4">
              <h2 className="text-lg font-bold">{copy.cartPage.items}</h2>
              {cartItems.map((item) => {
                const save = item.offerPrice ? getSaveAmount({ real_price: item.realPrice, offer_price: item.offerPrice }) : 0;
                return (
                  <div key={item.planId} className="rounded-3xl border border-black/10 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-wide text-[#159FD3]">{item.productName}</p>
                        <h3 className="mt-1 text-xl font-black">{item.planName}</h3>
                        <p className="text-sm text-[#555]">{copy.cartPage.qty}: {item.quantity}</p>
                        {item.offerPrice ? (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <span className="text-[#737373] line-through">{formatPrice(item.realPrice)}</span>
                            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700">
                              Save {formatPrice(save)}
                            </span>
                          </div>
                        ) : null}
                        <div className="mt-3 flex items-center gap-2">
                          <Button variant="secondary" className="h-8 px-2" onClick={() => decrease(item.planId)}>
                            <Minus className="size-3.5" />
                          </Button>
                          <span className="min-w-8 text-center font-bold">{item.quantity}</span>
                          <Button variant="secondary" className="h-8 px-2" onClick={() => increase(item.planId)}>
                            <Plus className="size-3.5" />
                          </Button>
                          <button
                            type="button"
                            className="ml-2 rounded-full p-2 text-[#DC2626] hover:bg-red-50"
                            onClick={() => removeItem(item.planId)}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-2xl font-black">{formatPrice(item.finalPrice)}</p>
                        <p className="text-xs text-[#555]">{copy.cartPage.each}</p>
                        {item.quantity > 1 ? (
                          <p className="mt-1 text-sm text-[#737373]">
                            {copy.cartPage.subTotal}: {formatPrice(item.finalPrice * item.quantity)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
              <Button variant="secondary" className="text-sm" onClick={clear}>
                <Trash2 className="size-4" />
                {copy.cartPage.clearAll}
              </Button>
            </section>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-3xl border border-black/10 bg-white p-6">
                <h2 className="text-lg font-bold">{copy.cartPage.orderSummary}</h2>

                <div className="mt-5 space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.planId} className="flex items-center justify-between text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{item.productName}</p>
                        <p className="text-xs text-[#555]">{item.planName} x{item.quantity}</p>
                      </div>
                      <span className="ml-3 font-bold">{formatPrice(item.finalPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-black/10 pt-4">
                  <div className="flex items-center justify-between text-lg font-black">
                    <span>{copy.cartPage.total}</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <p className="mt-1 text-right text-xs text-[#555]">{copy.cartPage.totalHint}</p>
                </div>

                <div className="mt-6 space-y-3">
                  <input
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#159FD3]"
                    placeholder={copy.cartPage.namePlaceholder}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />

                  <textarea
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#159FD3]"
                    placeholder={copy.cartPage.notePlaceholder}
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                <Button
                  className="mt-5 w-full py-3 text-base"
                  loading={submitting}
                  disabled={!customerName || !cartItems.length}
                  onClick={handleCheckout}
                >
                  {copy.cartPage.checkoutWhatsapp}
                </Button>
                <p className="mt-3 text-center text-xs text-[#555]">
                  {copy.cartPage.redirectHint}
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function readPendingCheckout() {
  try {
    const raw = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { customerName?: unknown; note?: unknown; createdAt?: unknown };
    if (typeof parsed.createdAt === "number" && Date.now() - parsed.createdAt > 10 * 60 * 1000) {
      sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
      return null;
    }
    if (typeof parsed.customerName !== "string" || !parsed.customerName.trim()) return null;
    return {
      customerName: parsed.customerName.trim(),
      note: typeof parsed.note === "string" ? parsed.note : "",
    };
  } catch {
    sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
    return null;
  }
}

export default function CartPageWrapper() {
  return (
    <Suspense fallback={null}>
      <CartPage />
    </Suspense>
  );
}
