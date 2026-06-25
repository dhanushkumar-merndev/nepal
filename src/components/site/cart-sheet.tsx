"use client";

import { useState, useEffect } from "react";
import { LocaleLink } from "@/components/site/locale-link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";

export function CartSheet() {
  const items = useCartStore((state) => state.items);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const cartCount = ready ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <LocaleLink
      href="/cart"
      className="relative rounded-full border border-white/20 bg-white/40 p-3 backdrop-blur-xl"
      aria-label="Open cart"
    >
      <ShoppingCart className="size-4 text-[#111]" />
      {cartCount > 0 ? (
        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#159FD3] text-xs font-bold text-white">
          {cartCount}
        </span>
      ) : null}
    </LocaleLink>
  );
}
