"use client";

import { createClient } from "@/lib/supabase/client";

export async function signInWithGoogle(next = "/") {
  const supabase = createClient();
  if (!supabase) throw new Error("Supabase env is missing.");

  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
}
