import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { ReviewCard } from "@/components/site/review-card";
import { getApprovedReviews } from "@/lib/data/reviews";

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews();
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12">
        <p className="text-sm font-bold uppercase tracking-wide text-[#159FD3]">Google reviews</p>
        <h1 className="mt-2 text-4xl font-black">Customer reviews</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="premium-card p-6">
            <p className="text-sm text-[#555]">Average rating</p>
            <p className="mt-2 text-4xl font-black">{average.toFixed(1)}</p>
          </div>
          <div className="premium-card p-6">
            <p className="text-sm text-[#555]">Total approved reviews</p>
            <p className="mt-2 text-4xl font-black">{reviews.length}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
