import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { ReviewCard } from "@/components/site/review-card";
import { ServiceCard } from "@/components/site/service-card";
import { FAQSection, HowItWorks } from "@/components/site/sections";
import { getProducts } from "@/lib/data/products";
import { getApprovedReviews } from "@/lib/data/reviews";

export default async function PlansPage() {
  const [products, reviews] = await Promise.all([getProducts(), getApprovedReviews()]);
  const categories = ["All", ...Array.from(new Set(products.map((product) => product.category)))];

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-7xl px-4 py-12">
          <p className="text-sm font-bold uppercase tracking-wide text-[#159FD3]">All plans</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-black md:text-6xl">
            Browse every active OTT and digital service plan
          </h1>
          <p className="mt-4 max-w-2xl text-[#555]">
            Compare prices, offers, stock status, and add plans to cart. Checkout will prepare the full WhatsApp order message automatically.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold"
              >
                {category}
              </span>
            ))}
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ServiceCard key={product.id} product={product} />
            ))}
          </div>
        </section>
        <HowItWorks />
        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-3xl font-bold">Reviews</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, 6).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
