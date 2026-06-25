import { AdminShell } from "@/components/admin/admin-shell";
import { ProductListManager } from "@/components/admin/product-manager";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminProducts } from "@/lib/data/admin";

export default async function AdminProductsPage() {
  const user = await requireAdmin();
  const products = await getAdminProducts();

  return (
    <AdminShell user={user} title="Products">
      <ProductListManager products={products} />
    </AdminShell>
  );
}
