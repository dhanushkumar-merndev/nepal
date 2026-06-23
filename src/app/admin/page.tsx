import Link from "next/link";
import { Header } from "@/components/site/header";
import { requireAdmin } from "@/lib/auth/admin";

const cards = [
  ["Products", "/admin/products"],
  ["Orders", "/admin/orders"],
  ["Reviews", "/admin/reviews"],
  ["Feedback", "/admin/feedback"],
  ["Settings", "/admin/settings"],
];

export default async function AdminPage() {
  await requireAdmin();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-12">
        <p className="text-sm font-bold uppercase tracking-wide text-[#159FD3]">Admin</p>
        <h1 className="mt-2 text-4xl font-black">Dashboard</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {cards.map(([label, href]) => (
            <Link key={href} href={href} className="premium-card p-6">
              <p className="text-sm text-[#555]">Manage</p>
              <h2 className="mt-2 text-2xl font-bold">{label}</h2>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
