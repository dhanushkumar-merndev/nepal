import type { Review } from "@/lib/types";
import { Stars } from "@/components/site/stars";
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
          <div className="flex items-center gap-1">
            <Stars rating={review.rating} size="md" />
            <span className="text-xs font-bold text-[#555]">{review.rating}</span>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-[#555]">{review.comment}</p>
      <p className="mt-4 text-xs font-medium text-[#737373]">{review.product_name}</p>
    </article>
  );
}
