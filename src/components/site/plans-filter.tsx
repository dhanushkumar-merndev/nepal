"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ServiceCard } from "@/components/site/service-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { getLocaleFromPathname } from "@/lib/locale";
import { getSiteCopy } from "@/lib/site-copy";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PlansFilter({ products }: { products: Product[] }) {
  const isMobile = useIsMobile();
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = getSiteCopy(locale);
  const [activeCategory, setActiveCategory] = useState("All");
  const [maxHeight, setMaxHeight] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState(el: HTMLDivElement) {
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );

  useEffect(() => {
    const el = catRef.current;
    if (!el || !isMobile) return;
    const ro = new ResizeObserver(() => updateScrollState(el));
    ro.observe(el);
    updateScrollState(el);
    return () => ro.disconnect();
  }, [categories, isMobile]);
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>([["All", products.length]]);
    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    return counts;
  }, [products]);
  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((product) => product.category === activeCategory);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      if (h > maxHeight) setMaxHeight(h);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [filteredProducts, maxHeight]);

  const catMask = isMobile && (canScrollLeft || canScrollRight)
    ? canScrollLeft && canScrollRight
      ? "[mask-image:linear-gradient(to_right,transparent_0,black_28px,black_calc(100%-28px),transparent_100%)]"
      : canScrollLeft && !canScrollRight
        ? "[mask-image:linear-gradient(to_right,transparent_0,black_28px)]"
        : "[mask-image:linear-gradient(to_right,black_calc(100%-28px),transparent_100%)]"
    : "";

  return (
    <>
      <div
        ref={catRef}
        onScroll={(e) => updateScrollState(e.currentTarget)}
        className={cn(
          "mt-6 flex gap-2",
          isMobile
            ? "overflow-x-auto overscroll-x-contain pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "flex-wrap",
          catMask,
        )}
      >
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
              activeCategory === category
                ? "border-[#159FD3] bg-[#159FD3] text-white shadow-sm"
                : "border-black/10 bg-white text-[#111] hover:bg-[#E6F7FD]",
            )}
            onClick={() => setActiveCategory(category)}
          >
            <span>{category === "All" ? copy.plansPage.categories.all : category}</span>
            <span
              className={cn(
                "ml-2 inline-flex min-w-6 justify-center rounded-full px-1.5 py-0.5 text-xs font-black",
                activeCategory === category
                  ? "bg-white/20 text-white"
                  : "bg-[#E6F7FD] text-[#0B7FAE]",
              )}
            >
              {categoryCounts.get(category) ?? 0}
            </span>
          </button>
        ))}
      </div>
      {isMobile ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {filteredProducts.map((product) => (
            <ServiceCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <motion.div
          layout
          ref={gridRef}
          className="mt-8 grid grid-cols-2 gap-5 xl:grid-cols-4 items-start content-start"
          style={{ minHeight: maxHeight > 0 ? maxHeight : undefined }}
        >
          <AnimatePresence mode="sync">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <ServiceCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      <div className="mt-8 flex justify-center lg:hidden">
        <span className="inline-flex items-center rounded-full border border-[#159FD3]/20 bg-[#E6F7FD] px-4 py-2 text-sm font-semibold text-[#0B7FAE]">
          {copy.plansPage.pressService}
        </span>
      </div>
    </>
  );
}
