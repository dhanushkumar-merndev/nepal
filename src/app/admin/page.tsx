import { AdminOverview } from "@/components/admin/admin-overview";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminDashboardData } from "@/lib/data/admin";

export default async function AdminPage() {
  const user = await requireAdmin();
  const { metrics, dailyOrders } = await getAdminDashboardData();

  return (
    <AdminShell user={user} title="Dashboard">
      <AdminOverview metrics={metrics} dailyOrders={dailyOrders} />
    </AdminShell>
  );
}
