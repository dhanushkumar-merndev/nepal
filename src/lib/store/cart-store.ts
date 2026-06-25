"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

type CartStore = {
  items: CartItem[];
  usedAddKeys: string[];
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
      usedAddKeys: [],
      addItem: (item) =>
        set((state) => {
          const activePlanIds = new Set(state.items.map((cartItem) => cartItem.planId));
          const currentKeys = (state.usedAddKeys ?? []).filter((key) => {
            const planId = planIdFromAddKey(key);
            return !planId || activePlanIds.has(planId) || planId === item.planId;
          });
          if (item.addKey && currentKeys.includes(item.addKey)) return state;
          const usedAddKeys = item.addKey
            ? [...currentKeys, item.addKey]
            : currentKeys;
          const existing = state.items.find((cartItem) => cartItem.planId === item.planId);
          if (existing) {
            return {
              usedAddKeys,
              items: state.items.map((cartItem) =>
                cartItem.planId === item.planId
                  ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                  : cartItem,
              ),
            };
          }
          return { items: [...state.items, item], usedAddKeys };
        }),
      removeItem: (planId) =>
        set((state) => {
          const usedAddKeys = clearPlanAddKeys(state.usedAddKeys ?? [], planId);
          return { items: state.items.filter((item) => item.planId !== planId), usedAddKeys };
        }),
      increase: (planId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.planId === planId ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        })),
      decrease: (planId) =>
        set((state) => {
          const target = state.items.find((item) => item.planId === planId);
          const newQty = target ? target.quantity - 1 : 0;
          if (newQty <= 0 && target) {
            return {
              usedAddKeys: clearPlanAddKeys(state.usedAddKeys ?? [], planId),
              items: state.items.filter((item) => item.planId !== planId),
            };
          }
          return {
            items: state.items.map((item) =>
              item.planId === planId ? { ...item, quantity: newQty } : item,
            ),
          };
        }),
      clear: () => set({ items: [], usedAddKeys: [] }),
      total: () => get().items.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0),
      count: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: "ott-nepal-cart" },
  ),
);

function planIdFromAddKey(key: string) {
  return key.split(":")[1] || null;
}

function clearPlanAddKeys(keys: string[], planId: string) {
  return keys.filter((key) => planIdFromAddKey(key) !== planId);
}
