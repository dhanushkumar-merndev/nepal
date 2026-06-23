"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

export function NotFoundLottie() {
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      fetch("/Lonely%20404.json")
        .then((response) => response.json())
        .then((data) => setAnimationData(data))
        .catch(() => setAnimationData(null));
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  if (!animationData) {
    return <div className="mx-auto h-56 w-full max-w-xl sm:h-72" />;
  }

  return (
    <Lottie
      animationData={animationData}
      loop
      className="mx-auto h-56 w-full max-w-xl sm:h-72"
      aria-label="Page not found animation"
    />
  );
}
