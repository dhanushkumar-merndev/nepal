
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
        <TrustSection />
        <section id="popular-plans" className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#159FD3]">Popular OTT plans</p>
              <h2 className="mt-1 text-2xl font-bold">Popular plans</h2>
            </div>
            <Link
              href="/plans"
              className="hidden rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-bold text-[#0B7FAE] md:inline-flex"
            >
              View all plans
            </Link>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {popularPlans.map((product, i) => (
              <SlideIn key={product.id} delay={i * 0.08}>
                <ServiceCard product={product} />
              </SlideIn>
            ))}
          </div>
          <div className="mt-4 md:hidden">
            <Link
              href="/plans"
              className="inline-flex rounded-full bg-[#159FD3] px-4 py-2 text-sm font-bold text-white"
            >
              View all plans
            </Link>
          </div>
        </section>
        <TopReviews reviews={reviews} />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
