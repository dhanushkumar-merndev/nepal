"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ServiceCard } from "@/components/site/service-card";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PlansFilter({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [maxHeight, setMaxHeight] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );
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

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition",
              activeCategory === category
                ? "border-[#159FD3] bg-[#159FD3] text-white shadow-sm"
                : "border-black/10 bg-white text-[#111] hover:bg-[#E6F7FD]",
            )}
            onClick={() => setActiveCategory(category)}
          >
            <span>{category}</span>
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
      <motion.div
        layout
        ref={gridRef}
        className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 items-start content-start"
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
    </>
  );
}
