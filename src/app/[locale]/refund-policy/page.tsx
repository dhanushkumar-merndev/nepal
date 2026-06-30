import type { Metadata } from "next";
import { buildStaticPageMetadata, normalizeSiteLocale } from "@/lib/seo";

export { default } from "../../refund-policy/page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata("refund", normalizeSiteLocale(locale));
}
