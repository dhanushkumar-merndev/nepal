"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/lib/store/cart-store";
import { canBuy, getDisplayPrice, getSaveAmount, hasOffer } from "@/lib/utils/pricing";
import { formatPrice } from "@/lib/utils/format";

export function ProductPlanCheckout({ product }: { product: Product }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const addItem = useCartStore((state) => state.addItem);

  function quantityFor(planId: string) {
    return quantities[planId] ?? 1;
  }

  function changeQuantity(planId: string, direction: 1 | -1) {
    setQuantities((current) => ({
      ...current,
      [planId]: Math.max(1, Math.min(10, (current[planId] ?? 1) + direction)),
    }));
  }

  function addPlan(plan: Product["plans"][number]) {
    const quantity = quantityFor(plan.id);
    addItem({
      productId: product.id,
      productName: product.name,
      planId: plan.id,
      planName: plan.name,
      realPrice: Number(plan.real_price),
      offerPrice: plan.offer_price,
      finalPrice: getDisplayPrice(plan),
      quantity,
      imageUrl: product.image_url,
    });
  }

  return (
    <div className="mt-8 grid gap-5 md:grid-cols-2">
      {product.plans.map((plan) => {
        const disabled = !canBuy(product.stock_status) || !canBuy(plan.stock_status);
        return (
          <article key={plan.id} className="group [perspective:1200px]">
            <div className="relative min-h-[420px] rounded-3xl transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
              <div className="absolute inset-0 flex flex-col rounded-3xl border border-black/10 bg-white p-5 shadow-sm [backface-visibility:hidden]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#159FD3]">Plan</p>
                    <h2 className="mt-1 text-2xl font-black">{plan.name}</h2>
                    <p className="text-sm text-[#555]">{plan.duration}</p>
                  </div>
                  <Badge>{plan.stock_status}</Badge>
                </div>
                <ul className="mt-5 grid gap-2 text-sm text-[#555]">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Zap className="mt-0.5 size-4 shrink-0 text-[#159FD3]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto rounded-3xl bg-[#E6F7FD] p-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#0B7FAE]">Final price</p>
                      <p className="text-3xl font-black">{formatPrice(getDisplayPrice(plan))}</p>
                    </div>
                    {hasOffer(plan) ? (
                      <div className="text-right text-sm">
                        <p className="text-[#737373] line-through">{formatPrice(Number(plan.real_price))}</p>
                        <p className="font-bold text-[#16A34A]">Save {formatPrice(getSaveAmount(plan))}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex rotate-y-180 flex-col rounded-3xl border border-[#159FD3]/30 bg-[#111] p-5 text-white shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <p className="text-xs font-bold uppercase tracking-wide text-[#9BE3FF]">Add to cart</p>
                <h3 className="mt-2 text-2xl font-black">{product.name}</h3>
                <p className="mt-2 text-sm text-white/70">{plan.name} - {formatPrice(getDisplayPrice(plan))}</p>
                <div className="mt-6 rounded-3xl bg-white/10 p-4">
                  <p className="text-sm font-semibold text-white/80">Quantity</p>
                  <div className="mt-3 grid h-12 grid-cols-3 items-center rounded-full bg-white text-[#111]">
                    <button
                      type="button"
                      className="grid h-12 place-items-center rounded-l-full"
                      onClick={() => changeQuantity(plan.id, -1)}
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="grid h-12 place-items-center text-center font-black">{quantityFor(plan.id)}</span>
                    <button
                      type="button"
                      className="grid h-12 place-items-center rounded-r-full"
                      onClick={() => changeQuantity(plan.id, 1)}
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-auto grid gap-3">
                  <Button variant="secondary" disabled={disabled} onClick={() => addPlan(plan)}>
                    <ShoppingCart className="size-4" />
                    Add to cart
                  </Button>
                  <p className="text-center text-xs text-white/60">
                    WhatsApp checkout is available from the cart after adding your plans.
                  </p>
                  {disabled ? <p className="text-xs text-white/60">This plan is not available.</p> : null}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
