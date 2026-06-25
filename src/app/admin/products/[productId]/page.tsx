import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { ProductDetailManager } from "@/components/admin/product-manager";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminProducts } from "@/lib/data/admin";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const [{ productId }, user, products] = await Promise.all([
    params,
    requireAdmin(),
    getAdminProducts(),
  ]);

  const product = productId === "new" ? null : products.find((item) => item.id === productId) ?? null;
  if (productId !== "new" && !product) notFound();
  const categories = Array.from(new Set(products.map((item) => item.category).filter(Boolean)));

  return (
    <AdminShell user={user} title={product ? product.name : "Create product"}>
      <ProductDetailManager product={product} categories={categories} />
    </AdminShell>
  );
}
