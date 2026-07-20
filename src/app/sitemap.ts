import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data/products";
import { defaultLocale, locales, localizePath } from "@/lib/locale";
import { absoluteUrl } from "@/lib/site-url";

const staticRoutes = ["/", "/about", "/plans", "/reviews", "/faq", "/privacy", "/terms", "/refund-policy"];

function sitemapAlternates(route: string) {
  return {
    languages: {
      ...Object.fromEntries(locales.map((locale) => [locale, absoluteUrl(localizePath(route, locale))])),
      "x-default": absoluteUrl(localizePath(route, defaultLocale)),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  const localizedStaticEntries = staticRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: absoluteUrl(localizePath(route, locale)),
      alternates: sitemapAlternates(route),
    })),
  );

  const productEntries = products
    .filter((product) => product.is_active && product.slug && !/[/?#]/.test(product.slug))
    .flatMap((product) => {
      const route = `/plans/${encodeURIComponent(product.slug)}`;

      return locales.map((locale) => ({
        url: absoluteUrl(localizePath(route, locale)),
        alternates: sitemapAlternates(route),
      }));
    });

  return [...localizedStaticEntries, ...productEntries];
}
