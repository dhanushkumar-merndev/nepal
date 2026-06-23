import { Tv } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductArtProps = {
  name: string;
  imageUrl?: string | null;
  logoUrl?: string | null;
  className?: string;
};

export function ProductArt({ name, imageUrl, logoUrl, className }: ProductArtProps) {
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
        <div className="mx-auto mb-3 grid size-16 place-items-center overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${name} logo`}
              width={48}
              height={48}
              className="size-11 object-contain"
            />
          ) : (
            <Tv className="size-9" />
          )}
        </div>
        <p className="px-4 text-lg font-bold text-[#111]">{name}</p>
      </div>
    </div>
  );
}
