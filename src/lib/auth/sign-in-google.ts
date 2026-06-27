"use client";

import { createClient } from "@/lib/supabase/client";

export async function signInWithGoogle(next = "/") {
  const supabase = createClient();
  if (!supabase) throw new Error("Supabase env is missing.");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
}
