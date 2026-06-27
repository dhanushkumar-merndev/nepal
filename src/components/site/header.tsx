"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { CartSheet } from "@/components/site/cart-sheet";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { LocaleLink } from "@/components/site/locale-link";
import { getLocaleFromPathname, stripLocalePrefix } from "@/lib/locale";
import { getSiteCopy } from "@/lib/site-copy";
import { cn } from "@/lib/utils";

let headerAnimated = false;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [animateHeader] = useState(() => !headerAnimated);
  const pathname = usePathname();
  const scrollRef = useRef(false);
  const locale = getLocaleFromPathname(pathname || "/");
  const copy = getSiteCopy(locale);
  const nav: [string, string, boolean][] = [
    [copy.nav.home, "/", false],
    [copy.nav.plans, "/plans", false],
    [copy.nav.reviews, "/reviews", false],
    [copy.nav.faq, "/faq", false],
    [copy.nav.contact, "", true],
    ["About Us", "/about", false],
  ];

  const contactHref = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9779842901942"}?text=${encodeURIComponent("Hello Ott Subscription Nepal,\n\nI have some query.")}`;
  const publicPathname = stripLocalePrefix(pathname || "/");

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return publicPathname === "/";
    return publicPathname === href;
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 100) {
        if (!scrollRef.current) { scrollRef.current = true; setScrolled(true); }
      } else if (y < 40) {
        if (scrollRef.current) { scrollRef.current = false; setScrolled(false); }
      }
    };
    scrollRef.current = window.scrollY > 100;
    window.requestAnimationFrame(() => setScrolled(scrollRef.current));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (animateHeader) headerAnimated = true;
  }, [animateHeader]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 px-2 transition-all duration-300 sm:px-4",
        scrolled ? "top-4 sm:top-6" : "top-4 sm:top-6",
      )}
    >
        <div
        className={cn(
          "mx-auto flex w-full max-w-[90rem] items-center justify-between gap-2 rounded-full border border-black/8 bg-white px-3 shadow-md transition-all duration-300 sm:gap-4 sm:px-6 lg:border-white/20 lg:bg-white/40 lg:shadow-lg lg:backdrop-blur-2xl",
          animateHeader && "header-pill",
          scrolled ? "py-1.5 lg:py-1.5" : "py-1.5 lg:py-2",
        )}
      >
        <LocaleLink href="/" className="flex items-center gap-2 leading-none sm:gap-3">
          <picture>
            <source srcSet="/header-logo-80.webp 80w, /header-logo-160.webp 160w" sizes="(max-width: 1023px) 36px, 56px" type="image/webp" />
            <source srcSet="/header-logo-80.png 80w, /header-logo-160.png 160w" sizes="(max-width: 1023px) 36px, 56px" type="image/png" />
            <img
              src="/header-logo-80.png"
              alt="Ott Subscription Nepal"
              width={160}
              height={160}
              className={cn(
                "shrink-0 object-contain transition-all duration-300",
                scrolled ? "size-9 lg:size-10" : "size-9 lg:size-14",
              )}
            />
          </picture>
        </LocaleLink>

        <nav className="hidden items-center gap-6 text-sm font-medium text-[#555] lg:flex">
          {nav.map(([label, href, external]) =>
            external ? (
              <a key={label} href={contactHref} target="_blank" rel="noopener noreferrer" className="text-[#555] transition-colors hover:text-[#159FD3]">
                {label}
              </a>
            ) : (
              <LocaleLink key={label} href={href} className={cn("transition-colors", isActive(href) ? "text-[#159FD3]" : "text-[#555] hover:text-[#159FD3]")}>
                {label}
              </LocaleLink>
            )
          )}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden lg:block">
            <Suspense fallback={null}>
              <LanguageSwitcher />
            </Suspense>
          </div>
          <CartSheet />
          <button
            type="button"
            className="grid size-8 place-items-center rounded-full border border-black/10 bg-white text-[#555] transition hover:bg-[#159FD3] hover:text-white lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          menuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <button
          type="button"
          className="absolute inset-0"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          <span
            className={cn(
              "absolute inset-0 bg-black/30 transition-opacity duration-300",
              menuOpen ? "opacity-100" : "opacity-0",
            )}
          />
          <span
            className={cn(
              "absolute inset-0 backdrop-blur-sm transition-opacity duration-300",
              menuOpen ? "opacity-100" : "opacity-0",
            )}
          />
        </button>

        <aside
          className={cn(
            "absolute left-0 top-0 h-full w-72 border-r border-gray-200/60 bg-white shadow-xl transition-transform duration-300 lg:bg-white/95 lg:backdrop-blur-xl",
            menuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-white/30 px-5 py-4">
            <span className="text-sm font-bold">{copy.nav.menu}</span>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label={copy.nav.closeMenu}>
              <X className="size-5 text-[#555]" />
            </button>
          </div>
          <nav className="grid gap-1 p-4">
            {nav.map(([label, href, external]) =>
              external ? (
                <a
                  key={label}
                  href={contactHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl px-4 py-3 text-sm font-medium text-[#555] transition hover:bg-[#159FD3]/10 hover:text-[#159FD3]"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </a>
              ) : (
                <LocaleLink
                  key={label}
                  href={href}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-[#159FD3]/10 hover:text-[#159FD3]",
                    isActive(href) ? "bg-[#159FD3]/10 text-[#159FD3]" : "text-[#555]",
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </LocaleLink>
              )
            )}
          </nav>
          <Suspense fallback={null}>
            <LanguageSwitcher mobile onNavigate={() => setMenuOpen(false)} />
          </Suspense>
        </aside>
      </div>
    </header>
  );
}
