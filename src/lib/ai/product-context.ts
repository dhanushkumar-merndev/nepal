import { getProducts } from "@/lib/data/products";
import { getDisplayPrice } from "@/lib/utils/pricing";
import { formatPrice } from "@/lib/utils/format";
import { AI_PRODUCT_CONTEXT_KEY, getRedis } from "@/lib/ai/cache";

export async function getProductContext() {
  const redis = getRedis();
  const ttl = Number(process.env.AI_PRODUCT_CONTEXT_TTL_SECONDS ?? 86400);

  if (redis) {
    const cached = await redis.get<string>(AI_PRODUCT_CONTEXT_KEY);
    if (cached) return cached;
  }

  const products = await getProducts();
  const context = [
    "Products:",
    ...products.map((product) => {
      const plans = product.plans
        .filter((plan) => plan.is_active)
        .map((plan) => {
          const offer = plan.offer_price ? formatPrice(Number(plan.offer_price)) : "None";
          const features = plan.features?.length ? `, Features: ${plan.features.join(", ")}` : "";
          return `- ${plan.name}${plan.duration ? ` (${plan.duration})` : ""}: Real ${formatPrice(Number(plan.real_price))}, Offer ${offer}, Final ${formatPrice(getDisplayPrice(plan))}, Stock: ${plan.stock_status}${features}`;
        })
        .join("\n");

      return `${product.name}
Category: ${product.category}
Description: ${product.description ?? "Digital service support."}
Product Stock: ${product.stock_status}
Best Seller: ${product.is_best_seller ? "Yes" : "No"}
Limited: ${product.is_limited ? "Yes" : "No"}
Plans:
${plans}`;
    }),
  ].join("\n\n");

  if (redis) await redis.set(AI_PRODUCT_CONTEXT_KEY, context, { ex: ttl });
  return context;
}
