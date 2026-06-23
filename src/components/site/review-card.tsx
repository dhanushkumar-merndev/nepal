import { Star } from "lucide-react";
import type { Review } from "@/lib/types";
import { initials } from "@/lib/utils/format";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="premium-card p-5">
      <div className="flex items-center gap-3">
        {review.customer_avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.customer_avatar_url}
            alt={review.customer_name}
            className="size-11 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-11 items-center justify-center rounded-full bg-[#E6F7FD] font-bold text-[#0B7FAE]">
            {initials(review.customer_name)}
          </div>
        )}
        <div>
          <h3 className="font-semibold">{review.customer_name}</h3>
          <div className="flex text-[#F59E0B]">
            {Array.from({ length: review.rating }).map((_, index) => (
              <Star key={index} className="size-4 fill-current" />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-[#555]">{review.comment}</p>
      <p className="mt-4 text-xs font-medium text-[#737373]">{review.product_name}</p>
    </article>
  );
}
