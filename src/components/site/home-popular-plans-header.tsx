"use client";

import { usePathname } from "next/navigation";
import { LocaleLink } from "@/components/site/locale-link";
import { getLocaleFromPathname } from "@/lib/locale";
import { getSiteCopy } from "@/lib/site-copy";
import { SlideIn } from "@/components/site/slide-in";

export function HomePopularPlansHeader() {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = getSiteCopy(locale);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="hidden lg:block">
        <p className="text-xs font-bold uppercase tracking-wide text-[#159FD3]">{copy.home.popularEyebrow}</p>
        <h2 className="mt-1 text-2xl font-bold">{copy.home.popularHeading}</h2>
      </div>
      <div className="mobile-cta-enter lg:hidden">
        <LocaleLink
          href="/plans"
          className="mobile-shine-btn mb-8 flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#30B8F0_0%,#159FD3_52%,#0B7FAE_100%)] px-4 py-3 text-sm font-bold text-white ring-1 ring-white/40 shadow-[0_14px_32px_rgba(21,159,211,0.28)]"
        >
          <span className="relative z-10">{copy.hero.viewAllPlans}</span>
        </LocaleLink>
      </div>
      <SlideIn delay={0.12}>
        <LocaleLink
          href="/plans"
          className="hidden rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-bold text-[#0B7FAE] lg:flex"
        >
          {copy.hero.viewAllPlans}
        </LocaleLink>
      </SlideIn>
    </div>
  );
}
