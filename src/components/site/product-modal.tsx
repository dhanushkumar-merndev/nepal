"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductArt } from "@/components/site/product-art";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/lib/store/cart-store";
import { canBuy, getDisplayPrice, getSaveAmount, hasOffer } from "@/lib/utils/pricing";
import { formatPrice } from "@/lib/utils/format";

export function ProductModal({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(product.plans[0]?.id ?? "");
  const addItem = useCartStore((state) => state.addItem);
  const selectedPlan = product.plans.find((plan) => plan.id === selectedPlanId) ?? product.plans[0];

  function addSelectedPlan() {
    if (!selectedPlan || !canBuy(selectedPlan.stock_status) || !canBuy(product.stock_status)) return;
    addItem({
      productId: product.id,
      productName: product.name,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      realPrice: Number(selectedPlan.real_price),
      offerPrice: selectedPlan.offer_price,
      finalPrice: getDisplayPrice(selectedPlan),
      quantity: 1,
      imageUrl: product.image_url,
    });
    setOpen(false);
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        View Plans
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <button
            aria-label="Close product modal"
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="premium-card relative max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-white p-5">
            <button
              type="button"
              aria-label="Close product modal"
              className="absolute right-4 top-4 rounded-full bg-white p-2 shadow"
              onClick={() => setOpen(false)}
            >
              <X className="size-5" />
            </button>
            <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
              <div className="overflow-hidden rounded-3xl">
                <ProductArt name={product.name} imageUrl={product.image_url} className="min-h-64" />
              </div>
              <div>
                <Badge>{product.category}</Badge>
                <h2 className="mt-3 text-3xl font-bold">{product.name}</h2>
                <p className="mt-3 text-[#555]">{product.description}</p>
                <div className="mt-5 space-y-3">
                  {product.plans.map((plan) => {
                    const disabled = !canBuy(plan.stock_status);
                    return (
                      <label
                        key={plan.id}
                        className={`block rounded-2xl border p-4 ${
                          selectedPlanId === plan.id ? "border-[#159FD3] bg-[#E6F7FD]" : "border-black/10 bg-white"
                        } ${disabled ? "opacity-60" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`plan-${product.id}`}
                          className="sr-only"
                          disabled={disabled}
                          checked={selectedPlanId === plan.id}
                          onChange={() => setSelectedPlanId(plan.id)}
                        />
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">{plan.name}</h3>
                            <p className="text-sm text-[#555]">{plan.duration}</p>
                            <ul className="mt-2 text-sm text-[#555]">
                              {plan.features.map((feature) => (
                                <li key={feature}>- {feature}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{formatPrice(getDisplayPrice(plan))}</p>
                            {hasOffer(plan) ? (
                              <p className="text-sm text-[#737373]">
                                <span className="line-through">{formatPrice(plan.real_price)}</span>{" "}
                                Save {formatPrice(getSaveAmount(plan))}
                              </p>
                            ) : null}
                            <Badge className="mt-2">{plan.stock_status}</Badge>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <Button className="mt-5 w-full" onClick={addSelectedPlan} disabled={!selectedPlan || !canBuy(selectedPlan.stock_status)}>
                  Add selected plan to cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
