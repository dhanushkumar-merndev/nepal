import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PlansFilter } from "@/components/site/plans-filter";
import { getProducts } from "@/lib/data/products";

export default async function PlansPage() {
  const products = await getProducts();

  return (
    <>
      <Header />
      <main className="flex-1 lg:min-h-[calc(100dvh-10rem)]">
        <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-4 lg:py-12">
          <p className="hidden text-sm font-bold uppercase tracking-wide text-[#159FD3] lg:block">All plans</p>
          <h1 className="mt-2 hidden max-w-3xl text-4xl font-black lg:block md:text-6xl">
            Browse every active OTT and digital service plan
          </h1>
          <p className="mt-4 hidden max-w-2xl text-[#555] lg:block">
            Compare prices, offers, stock status, and add plans to cart. Checkout will prepare the full WhatsApp order message automatically.
          </p>
          <PlansFilter products={products} />
        </section>
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}
