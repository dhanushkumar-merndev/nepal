import type { Plan, Product } from "@/lib/types";

export function getDisplayPrice(plan: Pick<Plan, "real_price" | "offer_price">) {
  return Number(plan.offer_price ?? plan.real_price);
}

export function hasOffer(plan: Pick<Plan, "real_price" | "offer_price">) {
  return (
    plan.offer_price !== null &&
    plan.offer_price !== undefined &&
    Number(plan.offer_price) < Number(plan.real_price)
  );
}

export function getSaveAmount(plan: Pick<Plan, "real_price" | "offer_price">) {
  return hasOffer(plan) ? Number(plan.real_price) - Number(plan.offer_price) : 0;
}

export function getStartingPlan(product: Product) {
  const activePlans = product.plans.filter((plan) => plan.is_active);
  return [...activePlans].sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b))[0];
}

export function canBuy(stockStatus: string) {
  return stockStatus === "In Stock" || stockStatus === "Low Stock";
}
