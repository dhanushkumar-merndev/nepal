import { Header } from "@/components/site/header";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-12">
        <div className="premium-card p-8">
          <h1 className="text-4xl font-black">Settings</h1>
          <p className="mt-4 text-[#555]">
            WhatsApp number, support email, payment instructions, announcements, and maintenance mode belong here.
          </p>
        </div>
      </main>
    </>
  );
}
