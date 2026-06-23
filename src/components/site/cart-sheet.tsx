"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { formatPrice } from "@/lib/utils/format";
import { buildWhatsAppMessage, getWhatsAppUrl } from "@/lib/utils/whatsapp";

export function CartSheet() {
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Manual Confirmation");
  const [note, setNote] = useState("");
  const { items, count, total, increase, decrease, removeItem, clear } = useCartStore();

  async function checkout() {
    if (!customerName || !phone || !items.length) return;

    const payload = {
      customer_name: customerName,
      phone,
      payment_method: paymentMethod,
      note,
      cart_items: items,
      total_amount: total(),
      whatsapp_sent: true,
    };

    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    const message = buildWhatsAppMessage({
      customerName,
      phone,
      paymentMethod,
      note,
      items,
    });
    window.open(getWhatsAppUrl(message), "_blank");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative rounded-full border border-black/10 bg-white p-3"
        aria-label="Open cart"
      >
        <ShoppingCart className="size-5" />
        {count() > 0 ? (
          <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#159FD3] text-xs font-bold text-white">
            {count()}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close cart overlay"
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Your cart</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close cart">
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-6 flex-1 space-y-4 overflow-y-auto">
              {items.length ? (
                items.map((item) => (
                  <div key={item.planId} className="rounded-2xl border border-black/10 p-4">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{item.productName}</h3>
                        <p className="text-sm text-[#555]">{item.planName}</p>
                        <div className="mt-2 text-sm">
                          {item.offerPrice ? (
                            <span className="mr-2 text-[#737373] line-through">
                              {formatPrice(item.realPrice)}
                            </span>
                          ) : null}
                          <span className="font-bold">{formatPrice(item.finalPrice)}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeItem(item.planId)}>
                        <Trash2 className="size-4 text-[#DC2626]" />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Button variant="secondary" className="px-3" onClick={() => decrease(item.planId)}>
                        <Minus className="size-4" />
                      </Button>
                      <span className="min-w-8 text-center font-semibold">{item.quantity}</span>
                      <Button variant="secondary" className="px-3" onClick={() => increase(item.planId)}>
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-[#E6F7FD] p-4 text-sm text-[#555]">
                  Your cart is empty. Add a plan to start checkout.
                </p>
              )}
            </div>
            <div className="border-t border-black/10 pt-4">
              <div className="mb-4 flex justify-between text-lg font-bold">
                <span>Subtotal</span>
                <span>{formatPrice(total())}</span>
              </div>
              <div className="grid gap-3">
                <input
                  className="rounded-xl border border-black/10 px-4 py-3"
                  placeholder="Customer name"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                />
                <input
                  className="rounded-xl border border-black/10 px-4 py-3"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
                <select
                  className="rounded-xl border border-black/10 px-4 py-3"
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                >
                  <option>eSewa</option>
                  <option>Khalti</option>
                  <option>Bank Transfer</option>
                  <option>Manual Confirmation</option>
                </select>
                <textarea
                  className="rounded-xl border border-black/10 px-4 py-3"
                  placeholder="Optional note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="flex-1" onClick={checkout} disabled={!items.length}>
                  Checkout on WhatsApp
                </Button>
                <Button variant="secondary" onClick={clear}>
                  Clear
                </Button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
