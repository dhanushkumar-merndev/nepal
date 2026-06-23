import { Header } from "@/components/site/header";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminReviews } from "@/lib/data/admin";
import { initials } from "@/lib/utils/format";

export default async function AdminReviewsPage() {
  await requireAdmin();
  const reviews = await getAdminReviews();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-12">
        <h1 className="text-4xl font-black">Reviews</h1>
        <p className="mt-3 text-sm text-[#555]">
          Set homepage top reviews with settings: `home_reviews_mode=manual` and `home_review_ids=id1,id2,id3`, or use `auto`.
        </p>
        <div className="mt-6 overflow-hidden rounded-3xl border border-black/10 bg-white">
          {reviews.length ? (
            reviews.map((review) => (
              <div key={review.id} className="grid gap-3 border-b border-black/10 p-4 md:grid-cols-[1.2fr_1fr_80px_110px_1fr]">
                <div className="flex min-w-0 items-center gap-3">
                  {review.customer_avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={review.customer_avatar_url}
                      alt={review.customer_name}
                      className="size-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#E6F7FD] font-bold text-[#0B7FAE]">
                      {initials(review.customer_name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <strong className="block truncate">{review.customer_name}</strong>
                    <span className="block truncate text-xs text-[#737373]">{review.customer_email}</span>
                  </div>
                </div>
                <span>{review.product_name}</span>
                <span>{review.rating}/5</span>
                <span className="rounded-full bg-[#E6F7FD] px-3 py-1 text-xs font-bold text-[#0B7FAE]">
                  {review.status}
                </span>
                <span className="truncate text-sm text-[#555]">{review.comment}</span>
              </div>
            ))
          ) : (
            <p className="p-5 text-sm text-[#555]">No reviews yet.</p>
          )}
        </div>
      </main>
    </>
  );
}
