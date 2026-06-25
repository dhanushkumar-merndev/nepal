
import Link from "next/link";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { ServiceCard } from "@/components/site/service-card";
import { FAQSection, TrustSection } from "@/components/site/sections";
import { TopReviews } from "@/components/site/top-reviews";
import { SlideIn } from "@/components/site/slide-in";
import { getHomeReviews } from "@/lib/data/home-reviews";
import { getProducts } from "@/lib/data/products";

export default async function Home() {
  const [products, reviews] = await Promise.all([getProducts(), getHomeReviews()]);
  const bestSellers = products.filter((product) => product.is_best_seller);
  const heroServices = [...bestSellers, ...products.filter((p) => !p.is_best_seller)].slice(0, 4);
  const popularPlans = products.slice(0, 8);

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero services={heroServices} />
        <TrustSection className="hidden lg:block" />
        <section id="popular-plans" className="mx-auto max-w-7xl px-4 pb-12 pt-0 md:pb-8 md:pt-0 lg:pt-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="hidden lg:block">
              <p className="text-xs font-bold uppercase tracking-wide text-[#159FD3]">Popular OTT plans</p>
              <h2 className="mt-1 text-2xl font-bold">Popular plans</h2>
            </div>
            <div className="lg:hidden">
              <Link
                href="/plans"
                className="mobile-shine-btn mb-8 flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#30B8F0_0%,#159FD3_52%,#0B7FAE_100%)] px-4 py-3 text-sm font-bold text-white ring-1 ring-white/40"
              >
                View all plans
              </Link>
            </div>
            <SlideIn delay={0.12}>
              <Link
                href="/plans"
                className="hidden rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-bold text-[#0B7FAE] lg:flex"
              >
                View all plans
              </Link>
            </SlideIn>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3 md:mt-2 md:grid md:grid-cols-2 md:gap-4 lg:mt-6 lg:grid-cols-4">
            {popularPlans.map((product, i) => (
              <SlideIn key={product.id} delay={i * 0.08}>
                <ServiceCard product={product} />
              </SlideIn>
            ))}
          </div>
        </section>
        <TrustSection className="pt-0 lg:hidden" showBadges />
        <TopReviews reviews={reviews} />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
