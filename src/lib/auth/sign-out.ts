"use client";

import { createClient } from "@/lib/supabase/client";

export async function signOut() {
  const supabase = createClient();
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Sign out error:", error);
}
