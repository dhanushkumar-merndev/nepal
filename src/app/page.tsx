
import Link from "next/link";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { ServiceCard } from "@/components/site/service-card";
import { FAQSection, TrustSection } from "@/components/site/sections";
import { getProducts } from "@/lib/data/products";

export default async function Home() {
  const products = await getProducts();
  const featured = products.filter((product) => product.is_best_seller).slice(0, 4);

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <TrustSection />
        <section id="popular-plans" className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-[#159FD3]">Popular OTT plans</p>
              <h2 className="mt-2 text-3xl font-bold">Popular plans</h2>
            </div>
            <Link
              href="/plans"
              className="hidden rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold text-[#0B7FAE] md:inline-flex"
            >
              View all plans
            </Link>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {(featured.length ? featured : products.slice(0, 4)).map((product) => (
              <ServiceCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-6 md:hidden">
            <Link
              href="/plans"
              className="inline-flex rounded-full bg-[#159FD3] px-5 py-3 text-sm font-bold text-white"
            >
              View all plans
            </Link>
          </div>
        </section>
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
