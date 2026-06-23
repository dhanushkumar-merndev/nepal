"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

type CartStore = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (planId: string) => void;
  increase: (planId: string) => void;
  decrease: (planId: string) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((cartItem) => cartItem.planId === item.planId);
          if (existing) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.planId === item.planId
                  ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                  : cartItem,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (planId) =>
        set((state) => ({ items: state.items.filter((item) => item.planId !== planId) })),
      increase: (planId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.planId === planId ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        })),
      decrease: (planId) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.planId === planId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item,
            )
            .filter((item) => item.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0),
      count: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: "ott-nepal-cart" },
  ),
);
