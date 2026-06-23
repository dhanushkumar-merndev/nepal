import { Header } from "@/components/site/header";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminFeedbackPage() {
  await requireAdmin();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-12">
        <div className="premium-card p-8">
          <h1 className="text-4xl font-black">Feedback</h1>
          <p className="mt-4 text-[#555]">View feedback and mark items resolved after Supabase is configured.</p>
        </div>
      </main>
    </>
  );
}
