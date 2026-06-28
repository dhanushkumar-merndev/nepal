"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useIsCompactViewport } from "@/hooks/use-compact-viewport";
import { getLocaleFromPathname } from "@/lib/locale";
import { getSiteCopy } from "@/lib/site-copy";

export function AboutPageContent() {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);
  const aboutCopy = getSiteCopy(locale).aboutPage;
  const isCompactViewport = useIsCompactViewport();
  const shouldAnimate = !isCompactViewport;
  const stats = [aboutCopy.stats.since, aboutCopy.stats.customers, aboutCopy.stats.focus];

  return (
    <main className="flex-1" style={{ minHeight: "calc(100dvh - 10rem)" }}>
      <div className="mx-auto w-full max-w-7xl px-4 py-12">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#159FD3]">{aboutCopy.eyebrow}</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-black md:text-6xl">{aboutCopy.title}</h1>
          <p className="mt-4 max-w-2xl text-[#555]">{aboutCopy.intro}</p>
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
            <p>{aboutCopy.services}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-[#111]">{aboutCopy.focusTitle}</h2>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              {aboutCopy.focusItems.map((item, index) => (
                <motion.div
                  key={item}
                  className={index === aboutCopy.focusItems.length - 1 ? "rounded-2xl border border-black/10 bg-white px-4 py-3 md:col-span-2" : "rounded-2xl border border-black/10 bg-white px-4 py-3"}
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
            <p>{aboutCopy.supportText}</p>
          </section>

          <section>
            <p>{aboutCopy.closingText}</p>
          </section>
        </motion.div>
      </div>
    </main>
  );
}
