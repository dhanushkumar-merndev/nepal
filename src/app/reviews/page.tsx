import Link from "next/link";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { ReviewCard } from "@/components/site/review-card";
import { ReviewForm } from "@/components/site/review-form";
import { FadeIn } from "@/components/site/fade-in";
import { SlideIn } from "@/components/site/slide-in";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const { getApprovedReviewsPage } = await import("@/lib/data/reviews");
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params?.page ?? 1) || 1);
  const { reviews, totalCount, pageSize } = await getApprovedReviewsPage(currentPage);
  const totalPages = Math.ceil(totalCount / pageSize);
  const clampedPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const { getProducts } = await import("@/lib/data/products");
  const products = await getProducts();

  return (
    <>
      <Header />
      <main className="flex-1" style={{ minHeight: "calc(100dvh - 10rem)" }}>
        <section className="mx-auto w-full max-w-7xl px-4 py-12">
          <p className="text-sm font-bold uppercase tracking-wide text-[#159FD3]">Website reviews</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-black md:text-6xl">Customer reviews</h1>
          <p className="mt-4 max-w-2xl text-[#555]">
            Real reviews from real customers about our OTT and digital services.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <FadeIn delay={0}>
              <div className="premium-card p-6">
                <p className="text-sm text-[#555]">Average rating</p>
                <p className="mt-2 text-4xl font-black">{average.toFixed(1)}</p>
              </div>
            </FadeIn>
            <FadeIn delay={0.08}>
              <div className="premium-card p-6">
                <p className="text-sm text-[#555]">Total approved reviews</p>
                <p className="mt-2 text-4xl font-black">{totalCount}</p>
              </div>
            </FadeIn>
          </div>
          {totalCount > reviews.length ? (
            <p className="mt-6 text-sm font-semibold text-[#555]">
              Showing {((clampedPage - 1) * pageSize) + 1} to {Math.min(clampedPage * pageSize, totalCount)} of {totalCount} approved reviews.
            </p>
          ) : null}
          <div className="mt-8">
            <ReviewForm products={products.map((p) => ({ id: p.id, name: p.name, logo_url: p.logo_url }))} />
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, i) => (
              <SlideIn key={review.id} delay={i * 0.04}>
                <ReviewCard review={review} />
              </SlideIn>
            ))}
          </div>
          {totalPages > 1 ? (
            <div className="premium-card mt-8 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-[#555]">
                Page <span className="text-[#111]">{clampedPage}</span> of <span className="text-[#111]">{totalPages}</span>
              </p>
              <div className="flex flex-wrap justify-end gap-2">
                <ReviewPageLink page={clampedPage - 1} disabled={clampedPage === 1}>
                  Previous
                </ReviewPageLink>
                {visiblePages(clampedPage, totalPages).map((page) => (
                  <ReviewPageLink key={page} page={page} active={page === clampedPage}>
                    {page}
                  </ReviewPageLink>
                ))}
                <ReviewPageLink page={clampedPage + 1} disabled={clampedPage === totalPages}>
                  Next
                </ReviewPageLink>
              </div>
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </>
  );
}

function ReviewPageLink({
  active,
  children,
  disabled,
  page,
}: {
  active?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  page: number;
}) {
  const className = [
    "inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-bold transition",
    active ? "bg-[#159FD3] text-white" : "border border-black/10 bg-white text-[#111] hover:bg-[#E6F7FD]",
    disabled ? "pointer-events-none opacity-45" : "",
  ].join(" ");

  return (
    <Link href={`/reviews?page=${Math.max(1, page)}`} className={className} aria-current={active ? "page" : undefined}>
      {children}
    </Link>
  );
}

function visiblePages(currentPage: number, totalPages: number) {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
