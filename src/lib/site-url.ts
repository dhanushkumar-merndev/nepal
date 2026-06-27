const FALLBACK_SITE_URL = "http://localhost:3000";

export function getSiteUrl() {
  const envValue = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const strictProduction = process.env.VERCEL_ENV === "production" || process.env.CI === "true";

  if (strictProduction) {
    if (!envValue) {
      throw new Error("NEXT_PUBLIC_SITE_URL must be set in production.");
    }

    const hostname = safeHostname(envValue);
    if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") {
      throw new Error("NEXT_PUBLIC_SITE_URL must be a public production URL.");
    }
  } else if (process.env.NODE_ENV === "production" && isLocalHostname(envValue)) {
    console.warn("NEXT_PUBLIC_SITE_URL is pointing to localhost during a production build. Set it to your public domain before deploying.");
  }

  const raw = envValue || FALLBACK_SITE_URL;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export function getSiteUrlObject() {
  return new URL(getSiteUrl());
}

export function absoluteUrl(pathname = "/") {
  return new URL(pathname, getSiteUrl()).toString();
}

function safeHostname(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

function isLocalHostname(value?: string) {
  if (!value) return true;
  const hostname = safeHostname(value);
  return !hostname || hostname === "localhost" || hostname === "127.0.0.1";
}
