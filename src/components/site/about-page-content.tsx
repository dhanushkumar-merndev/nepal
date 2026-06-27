"use client";

import { motion } from "framer-motion";
import { useIsCompactViewport } from "@/hooks/use-compact-viewport";

const stats = [
  {
    label: "Since",
    value: "2023",
    text: "We have been helping customers access premium subscriptions and digital services with ease.",
  },
  {
    label: "Customers",
    value: "3,000+",
    text: "Happy customers have trusted us for a smooth, reliable, and friendly subscription experience.",
  },
  {
    label: "Focus",
    value: "Support",
    text: "Fast service, helpful support, and a hassle-free experience from start to finish.",
  },
] as const;

const focusItems = [
  "Fast and easy subscription service",
  "Affordable pricing",
  "Friendly customer support",
  "Secure and reliable service",
  "A hassle-free experience from start to finish",
] as const;

export function AboutPageContent() {
  const isCompactViewport = useIsCompactViewport();
  const shouldAnimate = !isCompactViewport;

  return (
    <main className="flex-1" style={{ minHeight: "calc(100dvh - 10rem)" }}>
      <div className="mx-auto w-full max-w-7xl px-4 py-12">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#159FD3]">About Us</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-black md:text-6xl">Ott Subscription Nepal</h1>
          <p className="mt-4 max-w-2xl text-[#555]">
            Welcome to <strong>Ott Subscription Nepal</strong>, your trusted destination for affordable
            and convenient digital subscription services in Nepal.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {stats.map((item, index) => (
            <motion.article
              key={item.label}
              className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm"
              initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
              animate={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.45, delay: 0.12 + index * 0.08, ease: "easeOut" }}
            >
              <p className="text-sm font-bold uppercase tracking-wide text-[#159FD3]">{item.label}</p>
              <p className="mt-2 text-3xl font-black text-[#111]">{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-[#555]">{item.text}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="mt-10 space-y-6 text-base leading-8 text-[#555]"
          initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.45, delay: 0.28, ease: "easeOut" }}
        >
          <section>
            <p>
              We offer subscriptions for popular platforms such as <strong>Netflix</strong>,{" "}
              <strong>Prime Video</strong>, <strong>SonyLIV</strong>, <strong>Spotify</strong>,{" "}
              <strong>Canva</strong>, <strong>CapCut</strong>, and more. Our goal is to make
              entertainment, creativity, and digital tools more accessible to everyone in Nepal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-[#111]">What We Focus On</h2>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              {focusItems.map((item, index) => (
                <motion.div
                  key={item}
                  className={index === focusItems.length - 1 ? "rounded-2xl border border-black/10 bg-white px-4 py-3 md:col-span-2" : "rounded-2xl border border-black/10 bg-white px-4 py-3"}
                  initial={shouldAnimate ? { opacity: 0, y: 18 } : false}
                  animate={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
                  transition={{ duration: 0.35, delay: 0.34 + index * 0.06, ease: "easeOut" }}
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <p>
              Whether you want to watch your favorite movies and series, enjoy music, edit videos,
              design content, or use premium digital tools, we are here to help you get started quickly.
            </p>
          </section>

          <section>
            <p>
              Thank you for choosing <strong>Ott Subscription Nepal</strong>. Your trust motivates us
              to keep improving and delivering the best subscription service experience in Nepal.
            </p>
          </section>
        </motion.div>
      </div>
    </main>
  );
}
