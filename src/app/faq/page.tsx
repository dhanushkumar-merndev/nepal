import type { Metadata } from "next";
import { headers } from "next/headers";
import { JsonLd } from "@/components/seo/json-ld";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { FAQPageCopy } from "@/components/site/faq-page-copy";
import { buildStaticPageMetadata } from "@/lib/seo";
import { buildWebPageSchema } from "@/lib/schema";

export const metadata: Metadata = buildStaticPageMetadata("faq");

export default function FAQPage() {
  const pathnamePromise = headers();
  return (
    <>
      <FAQPageSchema pathnamePromise={pathnamePromise} />
      <Header />
      <main className="flex-1" style={{ minHeight: "calc(100dvh - 10rem)" }}>
        <section className="mx-auto w-full max-w-7xl px-4 py-12">
          <FAQPageCopy />
        </section>
      </main>
      <Footer />
    </>
  );
}

async function FAQPageSchema({ pathnamePromise }: { pathnamePromise: ReturnType<typeof headers> }) {
  const pathname = (await pathnamePromise).get("x-current-pathname") || "/faq";

  return (
    <JsonLd
      data={buildWebPageSchema({
        pathname,
        title: "Frequently asked questions",
        description: "Everything you need to know about Ott Subscription Nepal.",
      })}
    />
  );
}
