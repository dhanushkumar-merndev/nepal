"use client";

import { createClient } from "@/lib/supabase/client";

export async function signOut() {
  const supabase = createClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}
