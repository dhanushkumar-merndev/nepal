"use client";

import { LanguagesIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { defaultLocale, getLocaleFromPathname, localeLabels, locales, localizePath, type SiteLocale } from "@/lib/locale";
import { getSiteCopy } from "@/lib/site-copy";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const currentLocale = getLocaleFromPathname(pathname);
  const queryString = searchParams.toString();
  const currentPath = `${pathname}${queryString ? `?${queryString}` : ""}`;
  const copy = getSiteCopy(currentLocale);

  if (mobile) {
    return (
      <div className="mt-auto border-t border-black/8 p-4">
        <p className="px-2 text-xs font-bold uppercase tracking-wide text-[#737373]">{copy.nav.language}</p>
        <div className="mt-3 grid gap-2">
          {locales.map((locale) => (
            <LocaleOption
              key={locale}
              currentLocale={currentLocale}
              currentPath={currentPath}
              locale={locale}
              mobile
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/40 px-3 py-1.5 text-sm font-semibold text-[#22313c] backdrop-blur-xl transition hover:bg-white/55">
        <LanguagesIcon className="size-4 text-[#159FD3]" />
        <span>{currentLocale.toUpperCase()}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44 rounded-[1.5rem] border border-white/20 bg-white/92 p-1.5 shadow-lg backdrop-blur-xl">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            render={<Link href={localizePath(currentPath, locale)} hrefLang={locale} />}
            aria-current={locale === currentLocale ? "page" : undefined}
            className={cn(
              "cursor-pointer rounded-[1rem] px-3 py-2.5 text-sm text-[#22313c] transition hover:bg-[#F7FBFD]",
              locale === currentLocale && "bg-[#F1FAFE] font-semibold text-[#0B7FAE]",
            )}
          >
            <div className="flex w-full items-center justify-between gap-3">
              <span>{localeLabels[locale].label}</span>
              <span className="text-xs text-[#737373]">{localeLabels[locale].nativeLabel}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LocaleOption({
  currentLocale,
  currentPath,
  locale,
  mobile,
  onNavigate,
}: {
  currentLocale: SiteLocale;
  currentPath: string;
  locale: SiteLocale;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={localizePath(currentPath, locale)}
      hrefLang={locale}
      aria-current={locale === currentLocale ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition",
        locale === currentLocale ? "bg-[#E6F7FD] text-[#0B7FAE]" : "bg-white text-[#555] hover:bg-[#F6FCFF]",
        mobile && "border border-black/8 shadow-sm",
      )}
    >
      <span>{localeLabels[locale].label}</span>
      <span className="text-xs text-[#737373]">{locale === defaultLocale ? "Default" : localeLabels[locale].nativeLabel}</span>
    </Link>
  );
}
