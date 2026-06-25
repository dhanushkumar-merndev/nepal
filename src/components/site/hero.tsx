"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { CheckCircle2, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";

const trust = ["Fast Activation", "Nepal Support", "Easy Renewal", "Secure Checkout"];

export function Hero({ services }: { services: Pick<Product, "name" | "logo_url" | "stock_status">[] }) {
  const heroServices = services.slice(0, 4);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    const chars = el.querySelectorAll<HTMLElement>(".gsap-char");
    if (!chars.length) return;

    const animation = gsap.fromTo(
      chars,
      { opacity: 0, y: 40, rotateX: -90 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.6,
        stagger: 0.04,
        ease: "back.out(1.7)",
      },
    );

    return () => {
      animation.kill();
    };
  }, []);

  const heading = "Premium OTT Subscriptions in\nNepal";

  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Badge className="border border-[#159FD3]/40 bg-white/60 text-[#159FD3] shadow-sm backdrop-blur-xl">Premium digital services in Nepal</Badge>
        <h1
          ref={headingRef}
          className="mt-5 max-w-3xl text-5xl font-black tracking-tight text-[#111] md:text-7xl"
        >
          {heading.split("\n").map((line, li) => (
            <span key={li}>
              {li > 0 ? <br /> : null}
              {line.split("").map((char, ci) => (
                <span
                  key={`${li}-${ci}`}
                  className="gsap-char inline-block"
                  style={char === " " ? { width: "0.35em" } : undefined}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
          ))}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#555]">
          Netflix, Spotify, Prime Video, YouTube Premium and more - easy activation, fast support, and simple WhatsApp checkout.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button>
            <Link href="/plans">View All Plans</Link>
          </Button>
          <Button variant="secondary">
            <Link href="#popular-plans">Popular OTT Plans</Link>
          </Button>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {trust.map((item) => (
            <span key={item} className="inline-flex items-center gap-2 text-sm font-semibold text-[#555]">
              <CheckCircle2 className="size-4 text-[#16A34A]" />
              {item}
            </span>
          ))}
        </div>
      </motion.div>
      <motion.div
        className="grid gap-4 rounded-3xl border border-white/20 bg-white/30 p-5 shadow-lg backdrop-blur-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      >
        {heroServices.map((service, index) => (
          <div key={service.name} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/50 p-5 shadow-sm backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid size-14 shrink-0 place-items-center overflow-hidden">
                {service.logo_url ? (
                  <img
                    src={service.logo_url}
                    alt={service.name}
                    width={48}
                    height={48}
                    className="size-11 object-contain"
                  />
                ) : (
                  <Tv className="size-7 text-[#0B7FAE]" />
                )}
              </div>
              <div className="min-w-0">
                <motion.p
                  className="text-xs font-semibold uppercase tracking-wide text-[#159FD3]"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.12, ease: "easeOut" }}
                >Popular #{index + 1}</motion.p>
                <h2 className="truncate text-xl font-bold">{service.name}</h2>
              </div>
            </div>
            <Badge className="shrink-0">{service.stock_status === "Coming Soon" ? "Soon" : "Available"}</Badge>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
