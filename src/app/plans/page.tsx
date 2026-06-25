import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PlansFilter } from "@/components/site/plans-filter";
import { PlansPageCopy } from "@/components/site/plans-page-copy";
import { getProducts } from "@/lib/data/products";

export default async function PlansPage() {
  const products = await getProducts();

  return (
    <>
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
