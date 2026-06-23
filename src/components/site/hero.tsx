"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const services = ["Netflix", "Spotify Premium", "Prime Video", "YouTube Premium"];
const trust = ["Fast Activation", "Nepal Support", "Easy Renewal", "Secure Checkout"];

export function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Badge className="bg-[#E6F7FD] text-[#0B7FAE]">Premium digital services in Nepal</Badge>
        <h1 className="mt-5 max-w-3xl text-5xl font-black tracking-tight text-[#111] md:text-7xl">
          Premium OTT Subscriptions in Nepal
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
        className="premium-card grid gap-4 p-5"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {services.map((service, index) => (
          <div key={service} className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#159FD3]">Popular #{index + 1}</p>
              <h2 className="text-xl font-bold">{service}</h2>
            </div>
            <Badge>Available</Badge>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
