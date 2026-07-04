"use client";

import { motion } from "framer-motion";
import { useIsCompactViewport } from "@/hooks/use-compact-viewport";

export function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const isCompactViewport = useIsCompactViewport();

  if (isCompactViewport) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}
