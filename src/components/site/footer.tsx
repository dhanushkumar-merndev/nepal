"use client";

import { usePathname } from "next/navigation";
import { LocaleLink } from "@/components/site/locale-link";
import { getLocaleFromPathname } from "@/lib/locale";
import { getSiteCopy } from "@/lib/site-copy";

const support = [
  { label: "WhatsApp", href: "https://wa.me/9779842901942" },
];

export function Footer() {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = getSiteCopy(locale);
  const navigationLinks = [
    { label: copy.footer.links.plans, href: "/plans" },
    { label: copy.footer.links.services, href: "/#popular-plans" },
    { label: copy.footer.links.reviews, href: "/reviews" },
    { label: copy.footer.links.faq, href: "/#faq" },
    { label: copy.footer.links.contact, href: "/#contact" },
    { label: copy.footer.links.about, href: "/about" },
  ];
  const legalLinks = [
    { label: copy.footer.links.privacy, href: "/privacy" },
    { label: copy.footer.links.terms, href: "/terms" },
  ];

  return (
    <footer id="contact" className="relative mt-auto flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E6F7FD]/30 to-[#159FD3]/10" />

      <div className="relative flex flex-1 flex-col">
        <div className="relative flex-1 overflow-hidden rounded-t-[2.5rem] border border-white/30 border-b-0 bg-white/50 shadow-xl backdrop-blur-2xl">
          <div className="absolute -right-20 -top-20 size-60 rounded-full bg-[#159FD3]/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-60 rounded-full bg-[#0B7FAE]/10 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl gap-6 p-6 sm:grid-cols-2 md:gap-8 md:p-8 lg:gap-y-6 lg:gap-x-8 lg:p-10 lg:grid-cols-[1.45fr_repeat(3,minmax(0,0.72fr))_1.1fr] xl:gap-x-10">
            <div className="sm:col-span-2 lg:col-span-1">
              <h2 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">
                Ott Subscription<br />Nepal
              </h2>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#555]">
                {copy.footer.brandDescription}
              </p>
              <div className="mt-4 flex gap-2">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="grid size-9 place-items-center rounded-xl border border-white/30 bg-white/60 shadow-sm backdrop-blur-sm transition-all hover:bg-[#1877F2] hover:text-white hover:shadow-md"
                >
                  <svg viewBox="0 0 24 24" className="size-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a
                  href="https://www.instagram.com/ottsubscriptionnepal4?igsh=MWJjYzZ6bTR0aGxnMQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="grid size-9 place-items-center rounded-xl border border-white/30 bg-white/60 shadow-sm backdrop-blur-sm transition-all hover:bg-[#E4405F] hover:text-white hover:shadow-md"
                >
                  <svg viewBox="0 0 24 24" className="size-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="grid size-9 place-items-center rounded-xl border border-white/30 bg-white/60 shadow-sm backdrop-blur-sm transition-all hover:bg-[#FF0000] hover:text-white hover:shadow-md"
                >
                  <svg viewBox="0 0 24 24" className="size-4 fill-current"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>

            <div className="order-1 lg:order-none">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#737373]">{copy.footer.navigate}</h3>
              <nav aria-label="Footer navigation" className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm lg:grid-cols-1">
                {navigationLinks.map((link) => (
                  <LocaleLink
                    key={link.href}
                    href={link.href}
                    className="text-[#555] transition hover:text-[#159FD3]"
                  >
                    {link.label}
                  </LocaleLink>
                ))}
              </nav>
            </div>

            <div className="order-2 lg:order-none">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#737373]">{copy.footer.connect}</h3>
              <nav aria-label="Support links" className="mt-3 grid gap-2 text-sm">
                {support.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="text-[#555] transition hover:text-[#159FD3]"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="order-3 lg:order-none">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#737373]">{copy.footer.legal}</h3>
              <nav aria-label="Legal links" className="mt-3 grid gap-2 text-sm">
                {legalLinks.map((link) => (
                  <LocaleLink
                    key={link.href}
                    href={link.href}
                    className="text-[#555] transition hover:text-[#159FD3]"
                  >
                    {link.label}
                  </LocaleLink>
                ))}
              </nav>
            </div>

            <div className="order-4 border-white/30 sm:col-span-2 lg:order-none lg:col-span-1 lg:border-l lg:pl-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#737373]">{copy.footer.community}</h3>
              <p className="mt-2 text-sm text-[#555]">
                {copy.footer.communityDescription}
              </p>
              <a
                href="https://chat.whatsapp.com/H3mAuhJlvgKEEXljavLTgx"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-3 rounded-2xl border border-white/30 bg-white/40 p-3 backdrop-blur-sm transition hover:bg-[#25D366]/10 hover:border-[#25D366]/30"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#25D366]/10 text-lg">
                  💬
                </span>
                <div>
                  <p className="text-xs font-bold">{copy.footer.joinWhatsapp}</p>
                  <p className="text-xs text-[#555]">{copy.footer.communityGroup}</p>
                </div>
              </a>
            </div>
            <div className="order-5 col-span-full mt-4 pt-4 md:mt-5 md:pt-5 lg:mt-6 lg:pt-6">
              <div className="flex flex-col items-center justify-center gap-1 text-center text-xs text-[#555] sm:flex-row sm:gap-2">
                <p>&copy; {new Date().getFullYear()} {copy.footer.rights}</p>
                <span className="hidden sm:inline">|</span>
                <p>{copy.footer.supportTagline}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
