import { Star } from "lucide-react";

export function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "size-5" : size === "md" ? "size-4" : "size-3";
  const floor = Math.floor(rating);
  const frac = rating - floor;

  return (
    <span className="inline-flex items-center gap-0.5 text-[#F59E0B]">
      {Array.from({ length: 5 }, (_, i) => {
        if (i < floor) {
          return <Star key={i} className={`${cls} fill-current`} />;
        }
        if (i === floor && frac > 0) {
          return (
            <span key={i} className="relative inline-block">
              <Star className={`${cls} fill-none opacity-30`} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${frac * 100}%` }}>
                <Star className={`${cls} fill-current`} />
              </span>
            </span>
          );
        }
        return <Star key={i} className={`${cls} fill-none opacity-30`} />;
      })}
    </span>
  );
}
