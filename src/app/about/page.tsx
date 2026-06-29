import type { Metadata } from "next";
import { headers } from "next/headers";
import { JsonLd } from "@/components/seo/json-ld";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { AboutPageContent } from "@/components/site/about-page-content";
import { buildStaticPageMetadata } from "@/lib/seo";
import { buildWebPageSchema } from "@/lib/schema";

export const metadata: Metadata = buildStaticPageMetadata("about");

export default async function AboutPage() {
  const pathname = (await headers()).get("x-current-pathname") || "/about";
  return (
    <>
      <JsonLd
        data={buildWebPageSchema({
          pathname,
          title: "About Us",
          description:
            "Learn more about Ott Subscription Nepal, our service, customer support, and mission to make digital subscriptions accessible in Nepal.",
        })}
      />
      <Header />
      <AboutPageContent />
      <Footer />
    </>
  );
}
