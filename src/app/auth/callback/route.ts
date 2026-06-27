import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const next = requestUrl.searchParams.get("next") ?? "/";
  const origin = requestUrl.origin;

  if (error) {
    console.error("OAuth error:", error, requestUrl.searchParams.get("error_description"));
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error)}`, origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/", origin));
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/?error=supabase_not_configured", origin));
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("Session exchange error:", exchangeError);
    return NextResponse.redirect(new URL("/?error=auth_failed", origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}
