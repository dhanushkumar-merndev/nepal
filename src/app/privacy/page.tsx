import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { buildStaticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildStaticPageMetadata("privacy");

export default function PrivacyPage() {
  return <LegalPage page="privacy" locale="en" />;
}
