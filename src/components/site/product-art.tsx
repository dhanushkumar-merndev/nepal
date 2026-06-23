import Image from "next/image";
import { Tv } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductArtProps = {
  name: string;
  imageUrl?: string | null;
  className?: string;
};

export function ProductArt({ name, imageUrl, className }: ProductArtProps) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={500}
        height={320}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br from-[#E6F7FD] to-white text-[#0B7FAE]",
        className,
      )}
    >
      <div className="text-center">
        <Tv className="mx-auto mb-3 size-10" />
        <p className="text-lg font-bold text-[#111]">{name}</p>
      </div>
    </div>
  );
}
