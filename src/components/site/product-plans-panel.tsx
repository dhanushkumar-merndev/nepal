"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLocaleFromPathname, localizePath } from "@/lib/locale";
import { LocaleLink } from "@/components/site/locale-link";
import { getSiteCopy, translateStockStatus } from "@/lib/site-copy";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/lib/store/cart-store";
import { canBuy, getDisplayPrice, getSaveAmount, hasOffer } from "@/lib/utils/pricing";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export function ProductPlansPanel({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [pendingConfirm, setPendingConfirm] = useState<Product["plans"][number] | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = getSiteCopy(locale);
  const cartItems = useCartStore((state) => state.items);
  const usedAddKeys = useCartStore((state) => state.usedAddKeys ?? []);
  const addItem = useCartStore((state) => state.addItem);
  const increase = useCartStore((state) => state.increase);
  const decrease = useCartStore((state) => state.decrease);
  const removeItem = useCartStore((state) => state.removeItem);

  function quantityFor(planId: string) {
    const cartItem = cartItems.find((item) => item.planId === planId);
    return cartItem?.quantity ?? quantities[planId] ?? 1;
  }

  function changeQuantity(planId: string, direction: 1 | -1) {
    setQuantities((current) => ({
      ...current,
      [planId]: Math.max(1, Math.min(10, (current[planId] ?? 1) + direction)),
    }));
  }

  function addPlan(plan: Product["plans"][number], confirmed = false) {
    const quantity = quantityFor(plan.id);
    if (quantity > 5 && !confirmed) {
      setPendingConfirm(plan);
      setShowSuggestions(false);
      return;
    }

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
    const label = quantity > 1 ? `${quantity}× ${plan.name}` : plan.name;
    toast.success(`${label} added to cart`, {
      description: `${product.name} - Rs. ${(getDisplayPrice(plan) ?? Number(plan.real_price) ?? 0) * quantity}`,
      action: (
        <button
          type="button"
          onClick={() => {
            window.location.href = localizePath("/cart", locale);
          }}
          className="font-semibold text-[#159FD3] hover:text-[#0B7FAE]"
        >
          View Cart
        </button>
      ),
    });
    setPendingConfirm(null);
    setShowSuggestions(false);
  }

  function declineLargeQuantity() {
    setPendingConfirm(null);
    setShowSuggestions(true);
  }

  return (
    <div className={cn("grid gap-3", className)}>
      {product.plans.map((plan) => {
        const quantity = quantityFor(plan.id);
        const disabled = !canBuy(product.stock_status) || !canBuy(plan.stock_status);
        const cartItem = cartItems.find((item) => item.planId === plan.id);
        const cartQuantity = cartItem?.quantity ?? 0;
        const addKey = `${product.slug}:${plan.id}:${quantity}`;
        const alreadyAdded = usedAddKeys.includes(addKey);
        const inCart = cartQuantity > 0;
        const displayQty = inCart ? cartQuantity : quantity;

        const isPending = pendingConfirm?.id === plan.id;

        return (
          <div key={plan.id} className="rounded-2xl border border-black/10 bg-white p-3 text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black text-[#111]">{plan.name}</p>
                <p className="text-[11px] text-[#555]">{plan.duration || "Instant support"}</p>
                {plan.features?.length ? (
                  <ul className="mt-2 space-y-1 text-[11px] leading-4 text-[#555]">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex gap-1.5"
                      >
                        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#159FD3]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge className="px-2 py-0.5 text-[10px]">{translateStockStatus(plan.stock_status, locale)}</Badge>
                {cartQuantity > 0 ? (
                  <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-black text-[#15803D]">
                    {copy.productUi.inCart} x{cartQuantity}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-end justify-between gap-3 rounded-2xl bg-[#E6F7FD] p-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wide text-[#0B7FAE]">{copy.productUi.finalPrice}</p>
                <p className="text-xl font-black text-[#111] lg:text-2xl">{formatPrice(getDisplayPrice(plan) * displayQty)}</p>
              </div>
              {hasOffer(plan) ? (
                <div className="text-right text-xs">
                  <p className="text-[#737373] line-through">{formatPrice(Number(plan.real_price) * displayQty)}</p>
                  <p className="font-bold text-[#16A34A]">{copy.productUi.save} {formatPrice(getSaveAmount(plan) * displayQty)}</p>
                </div>
              ) : null}
            </div>

            {inCart ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="grid h-10 w-32 grid-cols-3 items-center rounded-full border border-black/10 bg-white">
                  <button
                    type="button"
                    className="grid h-10 place-items-center rounded-l-full"
                    onClick={() => decrease(plan.id)}
                    aria-label={`Decrease ${plan.name} quantity`}
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="grid h-10 place-items-center text-sm font-black">{cartQuantity}</span>
                  <button
                    type="button"
                    className="grid h-10 place-items-center rounded-r-full"
                    onClick={() => increase(plan.id)}
                    aria-label={`Increase ${plan.name} quantity`}
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  className="grid size-10 place-items-center rounded-full border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100"
                  aria-label={`Remove ${plan.name} from cart`}
                  onClick={() => removeItem(plan.id)}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="grid h-10 w-32 grid-cols-3 items-center rounded-full border border-black/10 bg-white">
                  <button
                    type="button"
                    className="grid h-10 place-items-center rounded-l-full"
                    onClick={() => changeQuantity(plan.id, -1)}
                    aria-label={`Decrease ${plan.name} quantity`}
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="grid h-10 place-items-center text-sm font-black">{quantity}</span>
                  <button
                    type="button"
                    className="grid h-10 place-items-center rounded-r-full"
                    onClick={() => changeQuantity(plan.id, 1)}
                    aria-label={`Increase ${plan.name} quantity`}
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <Button
                  className="w-32 px-3 py-2 text-xs"
                  disabled={disabled || alreadyAdded}
                  onClick={() => addPlan(plan)}
                >
                  <ShoppingCart className="size-3.5" />
                  {alreadyAdded ? copy.productUi.inCart : cartQuantity > 0 ? copy.productUi.addMore : copy.productUi.addToCart}
                </Button>
              </div>
            )}
            {isPending ? (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-bold text-amber-900">
                  {copy.productUi.areYouSureQty} {quantity}?
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-[#16A34A] px-3 py-1.5 text-xs font-black text-white"
                    onClick={() => addPlan(plan, true)}
                  >
                    {copy.productUi.yes}
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-black text-amber-900"
                    onClick={declineLargeQuantity}
                  >
                    {copy.productUi.no}
                  </button>
                </div>
              </div>
            ) : null}
            {showSuggestions ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 3, 5].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="rounded-full border border-[#159FD3]/20 bg-[#E6F7FD] px-3 py-1.5 text-xs font-bold text-[#0B7FAE]"
                    onClick={() => {
                      setQuantities((current) => ({ ...current, [plan.id]: suggestion }));
                      setShowSuggestions(false);
                    }}
                  >
                    {copy.productUi.qty} {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
      <div className="rounded-2xl border border-[#159FD3]/15 bg-[#EAF8FE] p-4">
        <p className="text-sm font-black text-[#111]">{copy.productUi.trustTitle}</p>
        <ul className="mt-2 space-y-2 text-sm leading-6 text-[#555]">
          {copy.productUi.trustItems.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#159FD3]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-3">
          <LocaleLink href="/refund-policy" className="text-sm font-bold text-[#0B7FAE] hover:text-[#159FD3]">
            {copy.productUi.policyLink}
          </LocaleLink>
          <LocaleLink href="/faq" className="text-sm font-bold text-[#0B7FAE] hover:text-[#159FD3]">
            {copy.productUi.faqLink}
          </LocaleLink>
        </div>
      </div>
    </div>
  );
}
