"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { CartSheet } from "@/components/site/cart-sheet";
import { cn } from "@/lib/utils";

const nav: [string, string, boolean][] = [
  ["Home", "/", false],
  ["Plans", "/plans", false],
  ["Reviews", "/reviews", false],
  ["FAQ", "/faq", false],
  ["Contact", "", true],
];

let headerAnimated = false;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [animateHeader] = useState(() => !headerAnimated);
  const pathname = usePathname();
  const scrollRef = useRef(false);

  const contactHref = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9779842901942"}?text=${encodeURIComponent("Hello Ott Subscription Nepal,\n\nI have some query.")}`;

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/";
    return pathname === href;
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
        "sticky top-0 z-40 px-4 transition-all duration-300",
        scrolled ? "top-2" : "top-4",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[90rem] items-center justify-between gap-4 rounded-full border border-white/20 bg-white/40 px-6 shadow-lg backdrop-blur-2xl transition-all duration-300",
          animateHeader && "header-pill",
          scrolled ? "py-1.5" : "py-2",
        )}
      >
        <Link href="/" className="flex items-center gap-3 leading-none">
          <img
            src="/header-logo.png"
            alt="Ott Subscription Nepal"
            width={160}
            height={160}
            className={cn(
              "shrink-0 object-contain transition-all duration-300",
              scrolled ? "size-10" : "size-14",
            )}
          />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-[#555] lg:flex">
          {nav.map(([label, href, external]) =>
            external ? (
              <a key={label} href={contactHref} target="_blank" rel="noopener noreferrer" className="text-[#555] transition-colors hover:text-[#159FD3]">
                {label}
              </a>
            ) : (
              <Link key={label} href={href} className={cn("transition-colors", isActive(href) ? "text-[#159FD3]" : "text-[#555] hover:text-[#159FD3]")}>
                {label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <CartSheet />
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full border border-white/30 bg-white/50 text-[#555] backdrop-blur-sm transition hover:bg-[#159FD3] hover:text-white lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300 lg:hidden",
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        />

        <aside
          className={cn(
            "absolute right-0 top-0 h-full w-72 border-l border-white/20 bg-white/60 shadow-xl backdrop-blur-2xl transition-transform duration-300",
            menuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-white/30 px-5 py-4">
            <span className="text-sm font-bold">Menu</span>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu">
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
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-[#159FD3]/10 hover:text-[#159FD3]",
                    isActive(href) ? "bg-[#159FD3]/10 text-[#159FD3]" : "text-[#555]",
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              )
            )}
          </nav>
        </aside>
      </div>
    </header>
  );
}
