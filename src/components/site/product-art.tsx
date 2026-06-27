"use client";

import { useState } from "react";
import { Tv } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductArtProps = {
  name: string;
  imageUrl?: string | null;
  logoUrl?: string | null;
  className?: string;
};

export function ProductArt({ name, imageUrl, logoUrl, className }: ProductArtProps) {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#E6F7FD] to-white text-[#0B7FAE]",
        className,
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          width={500}
          height={320}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-white/25" />
      <div className="relative text-center">
        <div className="mx-auto grid size-16 place-items-center overflow-hidden rounded-lg border border-black/10 bg-white">
          {logoUrl ? (
            <>
              {!logoLoaded && !logoFailed ? <span className="size-15 animate-pulse rounded-md bg-black/[0.05]" aria-hidden="true" /> : null}
              {!logoFailed ? (
                <img
                  key={logoUrl}
                  src={logoUrl}
                  alt={`${name} logo`}
                  width={64}
                  height={64}
                  loading="eager"
                  decoding="async"
                  className={cn("size-15 object-contain transition-opacity duration-200", logoLoaded ? "opacity-100" : "opacity-85")}
                  onLoad={() => setLogoLoaded(true)}
                  onError={() => {
                    setLogoFailed(true);
                    setLogoLoaded(false);
                  }}
                />
              ) : null}
              {logoFailed ? <Tv className="size-8" /> : null}
            </>
          ) : (
            <Tv className="size-8" />
          )}
        </div>
      </div>
    </div>
  );
}
