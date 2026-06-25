import { AdminShell } from "@/components/admin/admin-shell";
import { OrderManager } from "@/components/admin/order-manager";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminOrdersPage } from "@/lib/data/admin";

export default async function AdminOrdersPage() {
  const user = await requireAdmin();
  const orders = await getAdminOrdersPage();

  return (
    <AdminShell user={user} title="Orders">
      <OrderManager initialOrders={orders.data} initialTotalCount={orders.totalCount} />
    </AdminShell>
  );
}
