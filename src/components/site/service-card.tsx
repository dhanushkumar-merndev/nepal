"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ShoppingCart, Tv } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProductArt } from "@/components/site/product-art";
import { Stars } from "@/components/site/stars";
import { ProductModal } from "@/components/site/product-modal";
import { getLocaleFromPathname } from "@/lib/locale";
import { getSiteCopy, translateStockStatus } from "@/lib/site-copy";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart-store";
import { getDisplayPrice, getSaveAmount, getStartingPlan, hasOffer } from "@/lib/utils/pricing";
import { formatPrice } from "@/lib/utils/format";

export function ServiceCard({ product }: { product: Product }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = getSiteCopy(locale);
  const startingPlan = getStartingPlan(product);
  const cart = useCartStore();
  const inCartQty = product.plans.reduce((sum, plan) => {
    const item = cart.items.find((ci) => ci.planId === plan.id);
    return sum + (item?.quantity ?? 0);
  }, 0);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`View ${product.name} plans`}
        className="flex w-[76px] cursor-pointer flex-col items-center gap-0 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159FD3] focus-visible:ring-offset-2 md:hidden"
        onClick={() => setModalOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setModalOpen(true);
          }
        }}
      >
        <div className="relative mx-auto size-[68px] rounded-[20px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          {product.logo_url ? (
            <>
              {!logoLoaded && !logoFailed ? (
                <span className="absolute inset-[10px] animate-pulse rounded-[14px] bg-black/[0.05]" aria-hidden="true" />
              ) : null}
              {!logoFailed ? (
                <img
                    key={product.logo_url}
                    src={product.logo_url}
                    alt={`${product.name} logo`}
                    width={68}
                    height={68}
                    loading="eager"
                    decoding="async"
                    className={cn(
                      "relative z-[1] size-full rounded-[20px] object-contain p-2.5 transition-opacity duration-200",
                      logoLoaded ? "opacity-100" : "opacity-85",
                    )}
                    onLoad={() => setLogoLoaded(true)}
                    onError={() => {
                      setLogoFailed(true);
                      setLogoLoaded(false);
                    }}
                  />
                ) : null}
                {logoFailed ? (
                  <div className="flex size-full items-center justify-center rounded-[20px] bg-gradient-to-br from-[#E6F7FD] to-white text-[#0B7FAE]">
                    <Tv className="size-7" />
                  </div>
                ) : null}
              </>
          ) : (
            <div className="flex size-full items-center justify-center rounded-[20px] text-[#0B7FAE]">
              <Tv className="size-7" />
            </div>
          )}
          {inCartQty > 0 ? (
            <span className="absolute -right-1 -top-1 z-10 flex size-[20px] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
              {inCartQty}
            </span>
          ) : null}
        </div>
        <p className="mt-1 truncate text-center text-[10px] font-medium leading-tight text-[#333]">{product.name}</p>
      </div>
      <Card
        role="button"
        tabIndex={0}
        aria-label={`View ${product.name} plans`}
        className="hidden h-[405px] cursor-pointer gap-0 overflow-hidden border border-black/5 bg-white/92 p-0 shadow-[0_10px_30px_rgba(17,17,17,0.06)] ring-0 transition hover:-translate-y-0.5 hover:border-[#159FD3]/20 hover:shadow-[0_16px_42px_rgba(17,17,17,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#159FD3] focus-visible:ring-offset-2 md:block"
        onClick={() => setModalOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setModalOpen(true);
          }
        }}
      >
        <div className="relative h-40 overflow-hidden">
          <ProductArt name={product.name} imageUrl={product.image_url} logoUrl={product.logo_url} />
          {inCartQty > 0 ? (
            <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-red-500 shadow-sm">
              <ShoppingCart className="size-3" />
              {inCartQty}
            </span>
          ) : null}
        </div>
        <div className="relative h-[245px]">
          <div className="flex h-full flex-col bg-white">
            <div className="flex flex-1 flex-col p-3">
              <div className="flex flex-wrap gap-1.5">
                <Badge className="text-[10px]">{product.category}</Badge>
                <Badge className={cn("text-[10px]", product.stock_status === "In Stock" ? "text-[#16A34A]" : "text-[#F59E0B]")}>
                  {translateStockStatus(product.stock_status, locale)}
                </Badge>
                {product.is_best_seller ? <Badge className="bg-[#E6F7FD] text-[10px] text-[#0B7FAE]">{copy.productUi.bestSeller}</Badge> : null}
                {product.is_limited ? <Badge className="bg-amber-50 text-[10px] text-amber-700">{copy.productUi.limited}</Badge> : null}
              </div>
              <h3 className="mt-1.5 text-base font-bold">{product.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#555]">{product.description}</p>
              {startingPlan ? (
                <div className="mt-1.5">
                  <p className="text-xs text-[#737373]">{copy.productUi.from}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-lg font-bold">{formatPrice(getDisplayPrice(startingPlan))}</span>
                    {hasOffer(startingPlan) ? (
                      <span className="pb-0 text-[10px] text-[#737373] line-through">
                        {formatPrice(startingPlan.real_price)}
                      </span>
                    ) : null}
                  </div>
                  {hasOffer(startingPlan) ? (
                    <p className="mt-0 text-[10px] font-semibold text-[#16A34A]">
                      {copy.productUi.save} {formatPrice(getSaveAmount(startingPlan))}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div className="mt-1.5 flex items-center gap-1 text-[10px] text-[#555]">
                <Stars rating={product.rating ?? 4.8} />
                <span>{product.rating ?? 4.8}</span>
                {product.review_count ? <span>({product.review_count})</span> : null}
              </div>
              <div className="mt-2 pb-1">
                <span className="inline-flex w-full items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold text-black transition group-hover/card:bg-[#E6F7FD]">
                  {copy.productUi.viewPlans}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <ProductModal product={product} open={modalOpen} onOpenChange={setModalOpen} showTrigger={false} />
    </>
  );
}
