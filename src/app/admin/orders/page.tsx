import { Header } from "@/components/site/header";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminOrders } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils/format";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await getAdminOrders();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-12">
        <h1 className="text-4xl font-black">Orders</h1>
        <div className="mt-6 overflow-hidden rounded-3xl border border-black/10 bg-white">
          {orders.length ? (
            orders.map((order) => (
              <div key={order.id} className="grid gap-3 border-b border-black/10 p-4 md:grid-cols-5">
                <strong>{order.customer_name}</strong>
                <span>{order.phone}</span>
                <span>{order.payment_method ?? "Manual"}</span>
                <span>{formatPrice(Number(order.total_amount ?? 0))}</span>
                <span className="rounded-full bg-[#E6F7FD] px-3 py-1 text-xs font-bold text-[#0B7FAE]">
                  {order.status}
                </span>
              </div>
            ))
          ) : (
            <p className="p-5 text-sm text-[#555]">No orders yet.</p>
          )}
        </div>
      </main>
    </>
  );
}
