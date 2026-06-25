export const locales = ["en", "hi", "ne"] as const;

export type SiteLocale = (typeof locales)[number];

export const defaultLocale: SiteLocale = "en";

export const localeLabels: Record<SiteLocale, { label: string; nativeLabel: string }> = {
  en: { label: "English", nativeLabel: "English" },
  hi: { label: "Hindi", nativeLabel: "हिन्दी" },
  ne: { label: "Nepali", nativeLabel: "नेपाली" },
};

export function isSupportedLocale(value: string): value is SiteLocale {
  return (locales as readonly string[]).includes(value);
}

export function getLocaleFromPathname(pathname: string) {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment && isSupportedLocale(segment) ? segment : defaultLocale;
}

export function stripLocalePrefix(pathname: string) {
  const parts = pathname.split("/");
  const [, maybeLocale, ...rest] = parts;
  if (maybeLocale && isSupportedLocale(maybeLocale)) {
    return `/${rest.join("/")}`.replace(/\/+/g, "/") || "/";
  }
  return pathname || "/";
}

export function localizePath(path: string, locale: SiteLocale) {
  if (!path) return locale === defaultLocale ? "/" : `/${locale}`;

  const [pathnameWithQuery, hash = ""] = path.split("#");
  const [pathname = "/", query = ""] = pathnameWithQuery.split("?");
  const normalized = stripLocalePrefix(pathname.startsWith("/") ? pathname : `/${pathname}`);

  const prefixed = locale === defaultLocale ? normalized : `/${locale}${normalized === "/" ? "" : normalized}`;
  return `${prefixed}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}
