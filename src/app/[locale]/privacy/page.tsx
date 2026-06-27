import type { Metadata } from "next";
import { buildStaticPageMetadata, normalizeSiteLocale } from "@/lib/seo";

export { default } from "../../privacy/page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata("privacy", normalizeSiteLocale(locale));
}
