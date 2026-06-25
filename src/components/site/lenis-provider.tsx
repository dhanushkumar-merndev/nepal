"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export function LenisProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.05,
      easing: (time) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
      prevent: (node) => Boolean(node.closest("[data-lenis-prevent]")),
    });

    function handleAnchor(this: HTMLElement, e: Event) {
      const target = e.currentTarget as HTMLAnchorElement;
      if (!target.hash) return;
      const path = target.pathname || "/";
      if (path !== window.location.pathname) return;
      e.preventDefault();
      const el = document.querySelector(target.hash);
      if (el) lenis.scrollTo(el as HTMLElement, { offset: -80 });
    }

    const selector = 'a[href*="#"]';
    const anchors = document.querySelectorAll<HTMLElement>(selector);
    anchors.forEach((a) => a.addEventListener("click", handleAnchor));

    const observer = new MutationObserver(() => {
      if (document.body.style.overflow === "hidden") {
        lenis.stop();
      } else {
        lenis.start();
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);

    const resizeObserver = new ResizeObserver(() => lenis.resize());
    resizeObserver.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      observer.disconnect();
      resizeObserver.disconnect();
      anchors.forEach((a) => a.removeEventListener("click", handleAnchor));
    };
  }, [pathname]);

  return null;
}
