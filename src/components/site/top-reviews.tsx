import Link from "next/link";
import { Quote, Star } from "lucide-react";
import type { Review } from "@/lib/types";
import { initials } from "@/lib/utils/format";

export function TopReviews({ reviews }: { reviews: Review[] }) {
  const topReviews = reviews.slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="premium-card overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="bg-[#111] p-8 text-white md:p-10">
            <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#9BE3FF]">
              Top reviews
            </p>
            <h2 className="mt-5 text-4xl font-black leading-tight">
              Fresh customer feedback
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/70">
              Showing the latest approved reviews from real customers. This section refreshes from the database, so new approved reviews can appear within 24 hours.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-white/80">
              <span className="grid size-9 place-items-center rounded-full bg-[#159FD3]">
                <Star className="size-4 fill-white" />
              </span>
              Top 6 review highlights
            </div>
            <Link
              href="/reviews"
              className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-[#111]"
            >
              View all reviews
            </Link>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
            {topReviews.length ? (
              topReviews.map((review) => <HomeReviewCard key={review.id} review={review} />)
            ) : (
              <div className="rounded-3xl border border-black/10 bg-white p-6 md:col-span-2">
                <p className="text-sm font-semibold text-[#111]">No approved reviews yet.</p>
                <p className="mt-2 text-sm text-[#555]">
                  Once customer reviews are approved in admin, the top six will show here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeReviewCard({ review }: { review: Review }) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
      <Quote className="absolute right-4 top-4 size-10 text-[#E6F7FD]" />
      <div className="relative flex items-center gap-3">
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
        <div className="min-w-0">
          <h3 className="truncate font-bold">{review.customer_name}</h3>
          <p className="truncate text-xs font-medium text-[#737373]">{review.product_name}</p>
        </div>
      </div>
      <div className="mt-4 flex text-[#F59E0B]">
        {Array.from({ length: review.rating }).map((_, index) => (
          <Star key={index} className="size-4 fill-current" />
        ))}
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#555]">{review.comment}</p>
    </article>
  );
}
