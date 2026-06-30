"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";
import { LocaleLink } from "@/components/site/locale-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLocaleFromPathname } from "@/lib/locale";
import { getSiteCopy, translateStockStatus } from "@/lib/site-copy";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/lib/store/cart-store";
import { canBuy, getDisplayPrice, getSaveAmount, hasOffer } from "@/lib/utils/pricing";
import { formatPrice } from "@/lib/utils/format";

export function ProductPlanCheckout({ product }: { product: Product }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = getSiteCopy(locale);
  const cartItems = useCartStore((state) => state.items);
  const usedAddKeys = useCartStore((state) => state.usedAddKeys ?? []);
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
    const addKey = `${product.slug}:${plan.id}:${quantity}`;
    if (usedAddKeys.includes(addKey)) {
      toast.info("Already in cart", {
        description: `${product.name} ${plan.name} x${quantity}`,
      });
      return;
    }

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
      addKey,
    });
  }

  return (
    <div className="mt-8 grid gap-5 md:grid-cols-2">
      {product.plans.map((plan) => {
        const disabled = !canBuy(product.stock_status) || !canBuy(plan.stock_status);
        const addKey = `${product.slug}:${plan.id}:${quantityFor(plan.id)}`;
        const alreadyAdded = usedAddKeys.includes(addKey);
        const cartItem = cartItems.find((item) => item.planId === plan.id);
        const cartQuantity = cartItem?.quantity ?? 0;
        return (
          <article key={plan.id} className="flex min-h-[420px] flex-col rounded-3xl border border-black/10 bg-white p-5 text-left shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#159FD3]">Plan</p>
                <p className="text-xs font-bold uppercase tracking-wide text-[#159FD3]">{copy.productUi.plan}</p>
                <h2 className="mt-1 text-2xl font-black">{plan.name}</h2>
                <p className="text-sm text-[#555]">{plan.duration}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge>{translateStockStatus(plan.stock_status, locale)}</Badge>
                {cartQuantity > 0 ? (
                  <span className="rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-black text-[#15803D]">
                    {copy.productUi.inCart} x{cartQuantity}
                  </span>
                ) : null}
              </div>
            </div>
            <ul className="mt-5 grid gap-2 text-sm text-[#555]">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Zap className="mt-0.5 size-4 shrink-0 text-[#159FD3]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto grid gap-4">
              <div className="rounded-3xl bg-[#E6F7FD] p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#0B7FAE]">{copy.productUi.finalPrice}</p>
                    <p className="text-3xl font-black">{formatPrice(getDisplayPrice(plan))}</p>
                  </div>
                  {hasOffer(plan) ? (
                    <div className="text-right text-sm">
                      <p className="text-[#737373] line-through">{formatPrice(Number(plan.real_price))}</p>
                      <p className="font-bold text-[#16A34A]">{copy.productUi.save} {formatPrice(getSaveAmount(plan))}</p>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="grid h-11 w-36 grid-cols-3 items-center rounded-full border border-black/10 bg-white text-[#111]">
                  <button
                    type="button"
                    className="grid h-11 place-items-center rounded-l-full"
                    onClick={() => changeQuantity(plan.id, -1)}
                    aria-label={`Decrease ${plan.name} quantity`}
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="grid h-11 place-items-center text-center font-black">{quantityFor(plan.id)}</span>
                  <button
                    type="button"
                    className="grid h-11 place-items-center rounded-r-full"
                    onClick={() => changeQuantity(plan.id, 1)}
                    aria-label={`Increase ${plan.name} quantity`}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <Button className="w-40 justify-center" disabled={disabled || alreadyAdded} onClick={() => addPlan(plan)}>
                  <ShoppingCart className="size-4" />
                  {alreadyAdded ? copy.productUi.inCart : cartQuantity > 0 ? copy.productUi.addMore : copy.productUi.addToCart}
                </Button>
              </div>
              {disabled ? <p className="text-xs text-[#737373]">{copy.productUi.notAvailable}</p> : null}
            </div>
          </article>
        );
      })}
      <article className="rounded-3xl border border-[#159FD3]/15 bg-[#EAF8FE] p-5 text-left shadow-sm md:col-span-2">
        <h2 className="text-xl font-black text-[#111]">{copy.productUi.trustTitle}</h2>
        <ul className="mt-4 grid gap-3 text-sm leading-6 text-[#555] md:grid-cols-3">
          {copy.productUi.trustItems.map((item) => (
            <li key={item} className="rounded-2xl border border-white/60 bg-white/70 p-4">
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <LocaleLink
            href="/refund-policy"
            className="inline-flex items-center justify-center rounded-full bg-[#159FD3] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0B7FAE]"
          >
            {copy.productUi.policyLink}
          </LocaleLink>
          <LocaleLink
            href="/faq"
            className="inline-flex items-center justify-center rounded-full border border-[#159FD3]/20 bg-white px-4 py-2 text-sm font-bold text-[#0B7FAE] transition hover:bg-[#E6F7FD]"
          >
            {copy.productUi.faqLink}
          </LocaleLink>
        </div>
      </article>
    </div>
  );
}
