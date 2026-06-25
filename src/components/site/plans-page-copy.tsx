"use client";

import { usePathname } from "next/navigation";
import { getLocaleFromPathname } from "@/lib/locale";
import { getSiteCopy } from "@/lib/site-copy";

export function PlansPageCopy() {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = getSiteCopy(locale);

  return (
    <>
      <p className="hidden text-sm font-bold uppercase tracking-wide text-[#159FD3] lg:block">{copy.plansPage.eyebrow}</p>
      <h1 className="mt-2 hidden max-w-3xl text-4xl font-black lg:block md:text-6xl">
        {copy.plansPage.title}
      </h1>
      <p className="mt-4 hidden max-w-2xl text-[#555] lg:block">
        {copy.plansPage.description}
      </p>
    </>
  );
}
