import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getAdminState() {
  const supabase = await createClient();
  if (!supabase) return { user: null, isAdmin: false };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, isAdmin: false };

  const { data } = await supabase
    .from("admin_users")
    .select("id,email,role")
    .eq("id", user.id)
    .maybeSingle();

  return { user, isAdmin: Boolean(data) };
}

export async function requireAdmin() {
  const { user, isAdmin } = await getAdminState();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin/login?not_admin=1");
  return user;
}

export async function isAdminRequest() {
  const { isAdmin } = await getAdminState();
  return isAdmin;
}
