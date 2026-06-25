import Link from "next/link";
import { Quote, Star } from "lucide-react";
import type { Review } from "@/lib/types";
import { Stars } from "@/components/site/stars";
import { initials } from "@/lib/utils/format";

export function TopReviews({ reviews }: { reviews: Review[] }) {
  const topReviews = reviews.slice(0, 6);
  const compactReviews = reviews.slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 pt-3 lg:pb-16 lg:pt-10">
      <div className="hidden overflow-hidden p-0 lg:block premium-card">
        <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,#0b2a36_0%,#151515_38%,#111_100%)] p-8 text-white md:p-10">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.16]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.35) 1px, transparent 0)",
                backgroundSize: "18px 18px",
              }}
            />
            <div className="relative">
              <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#9BE3FF]">
                Top reviews
              </p>
              <h2 className="mt-5 text-4xl font-black leading-tight">
                Fresh customer reviews
              </h2>
              <p className="mt-4 text-sm leading-6 text-white/70">
                Recent customer stories and top-rated experiences from people who used our OTT and digital services.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-white/80">
                <span className="grid size-9 place-items-center rounded-full bg-[#159FD3]">
                  <Star className="size-4 fill-white" />
                </span>
                Latest and highest-rated picks
              </div>
              <Link
                href="/reviews"
                className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-[#111]"
              >
                View all reviews
              </Link>
            </div>
          </div>
          <div className="hidden grid-cols-2 gap-4 bg-white/40 p-6 backdrop-blur-2xl lg:grid">
            {topReviews.length ? (
              topReviews.map((review) => <HomeReviewCard key={review.id} review={review} />)
            ) : (
              <div className="rounded-3xl border border-white/20 bg-white/60 p-6 backdrop-blur-2xl md:col-span-2">
                <p className="text-sm font-semibold text-[#111]">No approved reviews yet.</p>
                <p className="mt-2 text-sm text-[#555]">
                  Customer highlights will appear here once reviews are available.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="lg:hidden">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#159FD3]">Top reviews</p>
          <h2 className="mt-1 whitespace-nowrap text-xl font-bold text-[#111] sm:text-2xl">Fresh customer reviews</h2>
        </div>
      </div>
      <div className="mt-6 lg:hidden">
        <div className="grid gap-3 sm:grid-cols-2">
          {compactReviews.length ? (
            compactReviews.map((review) => <CompactHomeReviewCard key={review.id} review={review} />)
          ) : (
            <div className="rounded-2xl border border-black/8 bg-[#FAFCFD] p-4 sm:col-span-2">
              <p className="text-sm font-semibold text-[#111]">No approved reviews yet.</p>
              <p className="mt-1 text-sm text-[#555]">
                Customer highlights will appear here once reviews are available.
              </p>
            </div>
          )}
        </div>
        <Link
          href="/reviews"
          className="mt-5 flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-[#159FD3] shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
        >
          View all reviews
        </Link>
      </div>
    </section>
  );
}

function HomeReviewCard({ review }: { review: Review }) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-5 shadow-sm backdrop-blur-2xl">
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
      <div className="mt-4 flex items-center gap-1">
        <Stars rating={review.rating} size="md" />
        <span className="text-xs font-bold text-[#555]">{review.rating}</span>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#555]">{review.comment}</p>
    </article>
  );
}

function CompactHomeReviewCard({ review }: { review: Review }) {
  return (
    <article className="rounded-2xl border border-black/8 bg-[#FAFCFD] p-4 shadow-[0_6px_20px_rgba(17,17,17,0.04)]">
      <div className="flex items-center gap-3">
        {review.customer_avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.customer_avatar_url}
            alt={review.customer_name}
            className="size-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-full bg-[#E6F7FD] text-sm font-bold text-[#0B7FAE]">
            {initials(review.customer_name)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-[#111]">{review.customer_name}</h3>
          <p className="truncate text-xs font-medium text-[#737373]">{review.product_name}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1">
        <Stars rating={review.rating} size="sm" />
        <span className="text-xs font-bold text-[#555]">{review.rating}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#555]">{review.comment}</p>
    </article>
  );
}
