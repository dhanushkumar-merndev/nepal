import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { ServiceCard } from "@/components/site/service-card";
import { getProducts } from "@/lib/data/products";

export default async function ServicesPage() {
  const products = await getProducts();
  const categories = ["All", ...Array.from(new Set(products.map((product) => product.category)))];

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12">
        <p className="text-sm font-bold uppercase tracking-wide text-[#159FD3]">Services</p>
        <h1 className="mt-2 text-4xl font-black">OTT plans and digital services</h1>
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <span key={category} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold">
              {category}
            </span>
          ))}
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ServiceCard key={product.id} product={product} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
