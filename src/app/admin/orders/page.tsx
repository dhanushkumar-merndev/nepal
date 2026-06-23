import { Header } from "@/components/site/header";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminOrdersPage() {
  await requireAdmin();
  return <AdminSimplePage title="Orders" text="Orders API is ready. Connect Supabase to list saved checkout orders here." />;
}

function AdminSimplePage({ title, text }: { title: string; text: string }) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-12">
        <div className="premium-card p-8">
          <h1 className="text-4xl font-black">{title}</h1>
          <p className="mt-4 text-[#555]">{text}</p>
        </div>
      </main>
    </>
  );
}
