import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { AboutPageContent } from "@/components/site/about-page-content";
import { buildStaticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildStaticPageMetadata("about");

export default function AboutPage() {
  return (
    <>
      <Header />
      <AboutPageContent />
      <Footer />
    </>
  );
}
