import type { Metadata } from "next";
import { headers } from "next/headers";
import { JsonLd } from "@/components/seo/json-ld";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PlansFilter } from "@/components/site/plans-filter";
import { PlansPageCopy } from "@/components/site/plans-page-copy";
import { getProducts } from "@/lib/data/products";
import { buildStaticPageMetadata } from "@/lib/seo";
import { buildWebPageSchema } from "@/lib/schema";

export const metadata: Metadata = buildStaticPageMetadata("plans");

export default async function PlansPage() {
  const products = await getProducts();
  const pathname = (await headers()).get("x-current-pathname") || "/plans";

  return (
    <>
      <JsonLd
        data={buildWebPageSchema({
          pathname,
          title: "Premium OTT Subscription Nepal Plans",
          description:
            "Browse Premium OTT Subscription Nepal plans, compare active OTT Nepal subscription prices and offers, and checkout through WhatsApp.",
        })}
      />
      <Header />
      <main className="flex-1 lg:min-h-[calc(100dvh-10rem)]">
        <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-4 lg:py-12">
          <PlansPageCopy />
          <PlansFilter products={products} />
        </section>
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}
