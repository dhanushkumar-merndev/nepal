"use client";

import { MessageCircle, PackageCheck, ShieldCheck, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { FadeIn } from "@/components/site/fade-in";
import { LocaleLink } from "@/components/site/locale-link";
import { FAQItem } from "@/components/site/faq-item";
import { TrustBadges } from "@/components/site/hero";
import { getLocaleFromPathname } from "@/lib/locale";
import { getSiteCopy } from "@/lib/site-copy";

export function HowItWorks() {
  const items = [
    ["Choose a plan", "Browse active plans with real price, offer price, and stock status.", PackageCheck],
    ["Add to cart", "Select your plan and quantity before checkout.", Sparkles],
    ["Confirm on WhatsApp", "Send the generated order message and get support fast.", MessageCircle],
  ] as const;

  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16">
      <h2 className="text-3xl font-bold">How it works</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {items.map(([title, text, Icon]) => (
          <div key={title} className="premium-card p-6">
            <Icon className="size-8 text-[#159FD3]" />
            <h3 className="mt-4 text-xl font-bold">{title}</h3>
            <p className="mt-2 text-sm text-[#555]">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FAQSection() {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = getSiteCopy(locale);

  return (
    <section id="faq" className="mx-auto max-w-7xl  px-4 pb-10 lg:pb-20">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[#159FD3]">{copy.faq.eyebrow}</p>
        <h2 className="mt-1 text-2xl font-bold">{copy.faq.title}</h2>
      </div>
      <div className="mt-4 grid gap-3">
        {copy.faq.items.map(({ question, answer }) => (
          <FAQItem key={question} question={question} answer={answer} />
        ))}
      </div>
      <LocaleLink
        href="/faq"
        className="mt-5 flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-[#159FD3] shadow-[0_8px_20px_rgba(0,0,0,0.08)] lg:hidden"
      >
        {copy.faq.viewAll}
      </LocaleLink>
    </section>
  );
}

export function TrustSection({ className = "", showBadges = false }: { className?: string; showBadges?: boolean }) {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = getSiteCopy(locale);

  return (
    <section className={`mx-auto max-w-7xl px-4 pb-8 pt-3 lg:py-10 ${className}`.trim()}>
      <FadeIn>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/20 bg-white/40 px-6 py-6 text-center shadow-lg backdrop-blur-2xl md:flex-row md:items-center md:gap-4 md:rounded-full md:px-8 md:py-5 md:text-left">
          <ShieldCheck className="size-9 shrink-0 text-[#16A34A]" />
          <div>
            <h2 className="text-xl font-bold">{copy.trustSection.title}</h2>
            <p className="mt-1 text-sm text-[#555]">
              {copy.trustSection.description}
            </p>
          </div>
        </div>
        {showBadges ? <TrustBadges className="mt-4 lg:hidden" /> : null}
      </FadeIn>
    </section>
  );
}
