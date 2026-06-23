import { Header } from "@/components/site/header";
import { getProducts } from "@/lib/data/products";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await getProducts();
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-12">
        <h1 className="text-4xl font-black">Products</h1>
        <div className="mt-6 overflow-hidden rounded-3xl border border-black/10 bg-white">
          {products.map((product) => (
            <div key={product.id} className="grid gap-2 border-b border-black/10 p-4 md:grid-cols-4">
              <strong>{product.name}</strong>
              <span>{product.category}</span>
              <span>{product.stock_status}</span>
              <span>{product.plans.length} plans</span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
