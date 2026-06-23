import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { ProductArt } from "@/components/site/product-art";
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
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Link href="/plans" className="text-sm font-bold text-[#0B7FAE]">
              Back to all plans
            </Link>
            <div className="mt-5 overflow-hidden rounded-3xl">
              <ProductArt
                name={product.name}
                imageUrl={product.image_url}
                logoUrl={product.logo_url}
                className="h-72 lg:h-[520px]"
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#159FD3]">{product.category}</p>
            <h1 className="mt-3 text-4xl font-black md:text-6xl">{product.name}</h1>
            <p className="mt-4 max-w-2xl text-[#555]">{product.description}</p>
            <ProductPlanCheckout product={product} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
