import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/data/products";
import { getProductSeoDescription } from "@/lib/ai/product-seo";
import { buildProductMetadata, normalizeSiteLocale } from "@/lib/seo";
import { getDisplayPrice, getStartingPlan } from "@/lib/utils/pricing";

export { default } from "../../../plans/[slug]/page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolvedLocale = normalizeSiteLocale(locale);
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Plan Not Found",
    };
  }

  const seoDescription = await getProductSeoDescription(product, resolvedLocale);
  const startingPlan = getStartingPlan(product);

  return buildProductMetadata({
    locale: resolvedLocale,
    slug: product.slug,
    productName: product.name,
    description: seoDescription,
    category: product.category,
    imageUrl: product.image_url,
    logoUrl: product.logo_url,
    startingPrice: startingPlan ? getDisplayPrice(startingPlan) : null,
    stockStatus: product.stock_status,
  });
}
