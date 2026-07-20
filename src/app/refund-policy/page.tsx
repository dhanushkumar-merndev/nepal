import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { buildStaticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildStaticPageMetadata("refund");

export default function RefundPolicyPage() {
  return <LegalPage page="refund" locale="en" />;
}
