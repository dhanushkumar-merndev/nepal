import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/site/legal-page";
import { isSupportedLocale } from "@/lib/locale";
import { buildStaticPageMetadata, normalizeSiteLocale } from "@/lib/seo";

type LocalizedLegalPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedPrivacyPage({ params }: LocalizedLegalPageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale) || locale === "en") {
    notFound();
  }

  return <LegalPage page="privacy" locale={locale} />;
}

export async function generateMetadata({
  params,
}: LocalizedLegalPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata("privacy", normalizeSiteLocale(locale));
}
