import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data/products";
import { defaultLocale, locales, localizePath } from "@/lib/locale";
import { absoluteUrl } from "@/lib/site-url";

const staticRoutes = ["/", "/about", "/plans", "/reviews", "/faq", "/privacy", "/terms", "/refund-policy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await getProducts();
  const homeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "daily";
  const pageFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly";

  const localizedStaticEntries = staticRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: absoluteUrl(localizePath(route, locale)),
      lastModified: now,
      changeFrequency: route === "/" ? homeFrequency : pageFrequency,
      priority: locale === defaultLocale && route === "/" ? 1 : route === "/" ? 0.9 : 0.8,
    })),
  );

  const productEntries = products.flatMap((product) =>
    locales.map((locale) => ({
      url: absoluteUrl(localizePath(`/plans/${product.slug}`, locale)),
      lastModified: now,
      changeFrequency: pageFrequency,
      priority: locale === defaultLocale ? 0.8 : 0.7,
    })),
  );

  return [...localizedStaticEntries, ...productEntries];
}
