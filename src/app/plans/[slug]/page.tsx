import { notFound } from "next/navigation";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { LocaleLink } from "@/components/site/locale-link";
import { ProductPlanCheckout } from "@/components/site/product-plan-checkout";
import { getProductBySlug } from "@/lib/data/products";

export default async function ProductPlansPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-10">
          <LocaleLink href="/plans" className="text-sm font-bold text-[#0B7FAE]">
            Back to all plans
          </LocaleLink>
          <div className="mt-6 max-w-3xl text-left">
            <p className="text-sm font-bold uppercase tracking-wide text-[#159FD3]">{product.category}</p>
            <h1 className="mt-3 text-4xl font-black md:text-6xl">{product.name}</h1>
            <p className="mt-4 text-[#555]">{product.description}</p>
          </div>
          <ProductPlanCheckout product={product} />
        </section>
      </main>
      <Footer />
    </>
  );
}
