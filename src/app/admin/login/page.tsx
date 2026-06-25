import { redirect } from "next/navigation";
import { AdminGoogleLogin } from "@/components/auth/admin-google-login";
import { Header } from "@/components/site/header";
import { getAdminState } from "@/lib/auth/admin";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ not_admin?: string }>;
}) {
  const [{ not_admin: notAdmin }, { user, isAdmin }] = await Promise.all([
    searchParams,
    getAdminState(),
  ]);

  if (isAdmin) redirect("/admin");

  return (
    <>
      <Header />
      <main className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-4">
        <div className="premium-card p-8 text-center">
          <h1 className="text-3xl font-bold">Admin login</h1>
          <p className="mt-3 text-[#555]">
            Sign in with Google. Only authorised admin accounts can access this page.
          </p>
          {user && !isAdmin ? (
            <div className="mt-5 rounded-2xl border border-[#F59E0B]/30 bg-orange-50 p-4 text-sm text-[#555]">
              <p className="font-semibold text-[#111]">You are not an admin.</p>
            </div>
          ) : null}
          {notAdmin ? (
            <p className="mt-4 text-sm font-semibold text-[#F59E0B]">
              You are not an admin.
            </p>
          ) : null}
          <div className="mt-6">
            <AdminGoogleLogin signedIn={Boolean(user)} />
          </div>
        </div>
      </main>
    </>
  );
}
