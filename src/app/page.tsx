import type { Metadata } from "next";
import { headers } from "next/headers";
import { JsonLd } from "@/components/seo/json-ld";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { ServiceCard } from "@/components/site/service-card";
import { FAQSection, TrustPreview } from "@/components/site/sections";
import { TopReviews } from "@/components/site/top-reviews";
import { SlideIn } from "@/components/site/slide-in";
import { getHomeReviews } from "@/lib/data/home-reviews";
import { getProducts } from "@/lib/data/products";
import { HomePopularPlansHeader } from "@/components/site/home-popular-plans-header";
import { buildStaticPageMetadata } from "@/lib/seo";
import { buildWebPageSchema } from "@/lib/schema";

export const metadata: Metadata = buildStaticPageMetadata("home");

export default async function Home() {
  const [products, reviews] = await Promise.all([getProducts(), getHomeReviews()]);
  const pathname = (await headers()).get("x-current-pathname") || "/";
  const bestSellers = products.filter((product) => product.is_best_seller);
  const heroServices = [...bestSellers, ...products.filter((p) => !p.is_best_seller)].slice(0, 4);
  const popularPlans = products.slice(0, 8);

  return (
    <>
      <JsonLd
        data={buildWebPageSchema({
          pathname,
          title: "Ott Subscription Nepal | Premium OTT Subscriptions in Nepal",
          description:
            "Ott Subscription Nepal helps you shop Netflix, Spotify, Prime Video, YouTube Premium and more in Nepal with fast activation, real customer reviews, and WhatsApp checkout.",
        })}
      />
      <Header />
      <main className="flex-1">
        <Hero services={heroServices} />
        <TrustPreview className="hidden lg:block" />
        <section id="popular-plans" className="mx-auto max-w-7xl px-4 pb-12 pt-0 md:pb-8 md:pt-0 lg:pt-8">
          <HomePopularPlansHeader />
          <div className="mt-6 flex flex-wrap justify-center gap-3 md:mt-2 md:grid md:grid-cols-2 md:gap-4 lg:mt-6 lg:grid-cols-4">
            {popularPlans.map((product, i) => (
              <SlideIn key={product.id} delay={i * 0.08}>
                <ServiceCard product={product} />
              </SlideIn>
            ))}
          </div>
          <TrustPreview className="mt-10 lg:hidden" />
        </section>
        <TopReviews reviews={reviews} />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
