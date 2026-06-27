import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/data/products";
import { buildProductMetadata, normalizeSiteLocale } from "@/lib/seo";

export { default } from "../../../plans/[slug]/page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Plan Not Found",
    };
  }

  return buildProductMetadata({
    locale: normalizeSiteLocale(locale),
    slug: product.slug,
    productName: product.name,
    description: product.description,
  });
}
