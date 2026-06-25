"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { CheckCircle2, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LocaleLink } from "@/components/site/locale-link";
import { getLocaleFromPathname } from "@/lib/locale";
import { getSiteCopy } from "@/lib/site-copy";
import type { Product } from "@/lib/types";
import { usePathname } from "next/navigation";

export function TrustBadges({ className = "" }: { className?: string }) {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = getSiteCopy(locale);

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-3">
        {copy.hero.trust.map((item) => (
          <span
            key={item}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/50 p-3 text-sm font-semibold text-[#555] shadow-sm backdrop-blur-xl"
          >
            <CheckCircle2 className="size-4 shrink-0 text-[#16A34A]" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Hero({ services }: { services: Pick<Product, "name" | "logo_url" | "stock_status">[] }) {
  const heroServices = services.slice(0, 4);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = getSiteCopy(locale);
  const shouldSplitHeading = locale === "en";

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    const chars = el.querySelectorAll<HTMLElement>(".gsap-char");
    if (!chars.length) return;

    const animation = gsap.fromTo(
      chars,
      { opacity: 0, y: 40, rotateX: -90 },
      { opacity: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.04, ease: "back.out(1.7)" }
    );

    return () => {
      animation.kill();
    };
  }, []);

  const heading = copy.hero.heading;

  return (
    <section className="mx-auto grid max-w-7xl items-center gap-6 px-4 pb-10 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:py-24">
      <div>
        <motion.div
          className="hidden sm:inline-flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
        >
          <Badge className="border border-[#159FD3]/40 bg-white/60 text-[#159FD3] shadow-sm backdrop-blur-xl">{copy.hero.badge}</Badge>
        </motion.div>
        <h1
          ref={headingRef}
          className="mt-3 max-w-3xl break-words text-4xl font-black tracking-tight text-[#111] md:text-5xl lg:text-7xl"
        >
          {heading.split("\n").map((line, li) => (
            <span
              key={li}
              className={shouldSplitHeading ? undefined : "block"}
            >
              {shouldSplitHeading && li > 0 ? <br /> : null}
              {shouldSplitHeading ? (
                line.split("").map((char, ci) => (
                  <span
                    key={`${li}-${ci}`}
                    className="gsap-char inline-block opacity-0"
                    style={char === " " ? { width: "0.35em" } : undefined}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))
              ) : (
                <motion.span
                  className="block"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.08 + li * 0.08, ease: "easeOut" }}
                >
                  {line}
                </motion.span>
              )}
            </span>
          ))}
        </h1>
        <motion.p
          className="mt-4 max-w-2xl text-base leading-7 text-[#555] lg:mt-6 lg:text-lg lg:leading-8"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25, ease: "easeOut" }}
        >
          {copy.hero.description}
        </motion.p>
        <motion.div
          className="mt-6 hidden flex-wrap justify-center gap-3 sm:justify-start lg:mt-8 lg:flex"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32, ease: "easeOut" }}
        >
          <Button>
            <LocaleLink href="/plans">{copy.hero.viewAllPlans}</LocaleLink>
          </Button>
          <Button variant="secondary">
            <a href="#popular-plans">{copy.hero.popularPlans}</a>
          </Button>
        </motion.div>
        <div className="mt-6 hidden lg:flex lg:mt-8">
          <div className="flex flex-wrap gap-3">
            {copy.hero.trust.map((item, index) => (
              <motion.span
                key={item}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#555]"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.4 + index * 0.08, ease: "easeOut" }}
              >
                <CheckCircle2 className="size-4 text-[#16A34A]" />
                {item}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
      <motion.div
        className="hidden gap-2 rounded-3xl border border-white/20 bg-white/30 p-3 shadow-lg backdrop-blur-2xl md:gap-4 md:p-5 lg:grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      >
        {heroServices.map((service, index) => (
          <div key={service.name} className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/50 p-3 shadow-sm backdrop-blur-xl md:gap-4 md:p-5">
            <div className="flex min-w-0 items-center gap-2 md:gap-4">
              <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md md:size-14">
                {service.logo_url ? (
                  <img
                    src={service.logo_url}
                    alt={service.name}
                    width={48}
                    height={48}
                    className="size-8 rounded-md object-contain md:size-11"
                  />
                ) : (
                  <Tv className="size-5 text-[#0B7FAE] md:size-7" />
                )}
              </div>
              <div className="min-w-0">
                <motion.p
                  className="text-[10px] font-semibold uppercase tracking-wide text-[#159FD3] md:text-xs"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.12, ease: "easeOut" }}
                >{copy.hero.popularLabel} #{index + 1}</motion.p>
                <h2 className="truncate text-sm font-bold md:text-xl">{service.name}</h2>
              </div>
            </div>
            <Badge className="shrink-0">{service.stock_status === "Coming Soon" ? copy.hero.soon : copy.hero.available}</Badge>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
