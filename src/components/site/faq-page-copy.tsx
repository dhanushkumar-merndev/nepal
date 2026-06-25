"use client";

import { usePathname } from "next/navigation";
import { FAQItem } from "@/components/site/faq-item";
import { SlideIn } from "@/components/site/slide-in";
import { getLocaleFromPathname } from "@/lib/locale";
import { getSiteCopy } from "@/lib/site-copy";

export function FAQPageCopy() {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = getSiteCopy(locale);

  return (
    <>
      <p className="text-sm font-bold uppercase tracking-wide text-[#159FD3]">{copy.faqPage.eyebrow}</p>
      <h1 className="mt-2 max-w-3xl text-4xl font-black md:text-6xl">{copy.faqPage.title}</h1>
      <p className="mt-4 max-w-2xl text-[#555]">{copy.faqPage.description}</p>
      <div className="mt-10 w-full space-y-3">
        {copy.faqPage.items.map((faq, i) => (
          <SlideIn key={i} delay={i * 0.04}>
            <FAQItem question={faq.question} answer={faq.answer} />
          </SlideIn>
        ))}
      </div>
    </>
  );
}
