import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function isLocalAdminBypassEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.DEV_ADMIN_BYPASS === "true";
}

function createLocalAdminUser(): User {
  return {
    id: "local-dev-admin",
    app_metadata: {},
    user_metadata: {
      full_name: "Local Admin",
    },
    aud: "authenticated",
    created_at: new Date(0).toISOString(),
    email: "local-admin@localhost",
  } as User;
}

export async function getAdminState() {
  if (isLocalAdminBypassEnabled()) {
    return { user: createLocalAdminUser(), isAdmin: true };
  }

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
  if (isLocalAdminBypassEnabled()) return true;

  const { isAdmin } = await getAdminState();
  return isAdmin;
}
