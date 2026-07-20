import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { buildStaticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildStaticPageMetadata("terms");

export default function TermsPage() {
  return <LegalPage page="terms" locale="en" />;
}
