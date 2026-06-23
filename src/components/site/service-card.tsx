"use client";

import { ShoppingCart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductArt } from "@/components/site/product-art";
import { ProductModal } from "@/components/site/product-modal";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/lib/store/cart-store";
import { canBuy, getDisplayPrice, getSaveAmount, getStartingPlan, hasOffer } from "@/lib/utils/pricing";
import { formatPrice } from "@/lib/utils/format";

export function ServiceCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const startingPlan = getStartingPlan(product);
  const disabled = !startingPlan || !canBuy(product.stock_status) || !canBuy(startingPlan.stock_status);

  function addToCart() {
    if (!startingPlan || disabled) return;
    addItem({
      productId: product.id,
      productName: product.name,
      planId: startingPlan.id,
      planName: startingPlan.name,
      realPrice: Number(startingPlan.real_price),
      offerPrice: startingPlan.offer_price,
      finalPrice: getDisplayPrice(startingPlan),
      quantity: 1,
      imageUrl: product.image_url,
    });
  }

  return (
    <Card className="flex h-full min-h-[560px] flex-col overflow-hidden p-0">
      <div className="h-44 overflow-hidden">
        <ProductArt name={product.name} imageUrl={product.image_url} logoUrl={product.logo_url} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex min-h-[64px] content-start flex-wrap gap-2">
          <Badge>{product.category}</Badge>
          <Badge className={product.stock_status === "In Stock" ? "text-[#16A34A]" : "text-[#F59E0B]"}>
            {product.stock_status}
          </Badge>
          {product.is_best_seller ? <Badge className="bg-[#E6F7FD] text-[#0B7FAE]">Best Seller</Badge> : null}
        </div>
        <h3 className="mt-4 min-h-[56px] text-xl font-bold leading-7">{product.name}</h3>
        <p className="mt-2 min-h-[66px] text-sm leading-6 text-[#555]">{product.description}</p>
        {startingPlan ? (
          <div className="mt-4 min-h-[92px]">
            <p className="text-sm text-[#737373]">From</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">{formatPrice(getDisplayPrice(startingPlan))}</span>
              {hasOffer(startingPlan) ? (
                <span className="pb-1 text-sm text-[#737373] line-through">
                  {formatPrice(startingPlan.real_price)}
                </span>
              ) : null}
            </div>
            {hasOffer(startingPlan) ? (
              <p className="mt-1 text-sm font-semibold text-[#16A34A]">
                Save {formatPrice(getSaveAmount(startingPlan))}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="mt-4 flex items-center gap-1 text-sm text-[#555]">
          <Star className="size-4 fill-[#F59E0B] text-[#F59E0B]" />
          <span>{product.rating ?? 4.8}</span>
          <span>({product.review_count ?? 0} reviews)</span>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <ProductModal product={product} />
          <Button onClick={addToCart} disabled={disabled}>
            <ShoppingCart className="size-4" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}
