import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_URL } from "@/lib/site-url";

const canonicalUrl = new URL(SITE_URL);

export async function proxy(request: NextRequest) {
  const { searchParams, pathname } = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const requestHost = forwardedHost.split(",")[0].trim().split(":")[0].toLowerCase();
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim().toLowerCase();
  const requestProtocol = forwardedProtocol || request.nextUrl.protocol.replace(":", "");

  if (
    (requestHost === canonicalUrl.hostname || requestHost === "ottsubscriptionnepal.shop") &&
    (requestHost !== canonicalUrl.hostname || requestProtocol !== "https")
  ) {
    const destination = new URL(`${pathname}${request.nextUrl.search}`, canonicalUrl);
    return NextResponse.redirect(destination, 308);
  }

  const code = searchParams.get("code");

  if (code && !pathname.startsWith("/auth/callback")) {
    const url = new URL("/auth/callback", request.url);
    url.search = searchParams.toString();
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-current-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
