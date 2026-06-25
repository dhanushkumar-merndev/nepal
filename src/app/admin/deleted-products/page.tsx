import { AdminShell } from "@/components/admin/admin-shell";
import { DeletedProductListManager } from "@/components/admin/deleted-products-manager";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminProducts } from "@/lib/data/admin";

export default async function AdminDeletedProductsPage() {
  const user = await requireAdmin();
  // Fetch only deleted products
  const products = await getAdminProducts({ includeDeleted: true });
  const deletedProducts = products.filter(p => p.is_deleted);

  return (
    <AdminShell user={user} title="Deleted Products">
      <DeletedProductListManager products={deletedProducts} />
    </AdminShell>
  );
}
