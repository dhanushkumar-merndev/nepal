import { AdminShell } from "@/components/admin/admin-shell";
import { ApprovalManager } from "@/components/admin/approval-manager";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminReviewsPage } from "@/lib/data/admin";

export default async function AdminReviewsPage() {
  const user = await requireAdmin();
  const reviews = await getAdminReviewsPage();

  return (
    <AdminShell user={user} title="Reviews">
      <ApprovalManager initialItems={reviews.data} initialTotalCount={reviews.totalCount} />
    </AdminShell>
  );
}
