"use client";

import { usePathname } from "next/navigation";
import { getLocaleFromPathname } from "@/lib/locale";
import { getSiteCopy } from "@/lib/site-copy";

export function ReviewsPageIntro() {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = getSiteCopy(locale);

  return (
    <>
      <p className="text-sm font-bold uppercase tracking-wide text-[#159FD3]">{copy.reviewsPage.eyebrow}</p>
      <h1 className="mt-2 max-w-3xl text-4xl font-black md:text-6xl">{copy.reviewsPage.title}</h1>
      <p className="mt-4 max-w-2xl text-[#555]">{copy.reviewsPage.description}</p>
    </>
  );
}

export function ReviewsPageStats({ average, totalCount }: { average: number; totalCount: number }) {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = getSiteCopy(locale);

  return (
    <div className="mt-6 grid grid-cols-2 gap-4">
      <div className="premium-card p-6">
        <p className="text-sm text-[#555]">{copy.reviewsPage.averageRating}</p>
        <p className="mt-2 text-4xl font-black">{average.toFixed(1)}</p>
      </div>
      <div className="premium-card p-6">
        <p className="text-sm text-[#555]">{copy.reviewsPage.totalReviews}</p>
        <p className="mt-2 text-4xl font-black">{totalCount}</p>
      </div>
    </div>
  );
}

export function ReviewsShowingCopy({
  start,
  end,
  totalCount,
}: {
  start: number;
  end: number;
  totalCount: number;
}) {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = getSiteCopy(locale);

  return <>{copy.reviewsPage.showing} {start} to {end} of {totalCount} approved reviews.</>;
}

export function ReviewsPaginationCopy({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = getSiteCopy(locale);

  return <>{copy.reviewsPage.page} <span className="text-[#111]">{currentPage}</span> {copy.reviewsPage.of} <span className="text-[#111]">{totalPages}</span></>;
}

export function ReviewPagerLabel({ type }: { type: "previous" | "next" }) {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = getSiteCopy(locale);

  return <>{type === "previous" ? copy.reviewsPage.previous : copy.reviewsPage.next}</>;
}
