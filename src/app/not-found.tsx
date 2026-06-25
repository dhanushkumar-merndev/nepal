import { Suspense } from "react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { LocaleLink } from "@/components/site/locale-link";
import { NotFoundLottie } from "@/components/site/not-found-lottie";

function NotFoundContent() {
  return (
    <>
      <Header />
      <main className="grid min-h-[70vh] place-items-center px-4 py-16 text-center">
        <section className="mx-auto max-w-2xl">
          <NotFoundLottie />
          <p className="text-sm font-bold uppercase tracking-wide text-[#159FD3]">
            Page not found
          </p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">
            This page is not available
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[#555]">
            The link may be broken or the plan may have moved. You can return home or browse all active plans.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LocaleLink className="primary-btn px-5 py-3 text-sm font-bold" href="/">
              Go home
            </LocaleLink>
            <LocaleLink
              className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold text-[#0B7FAE]"
              href="/plans"
            >
              Browse plans
            </LocaleLink>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={null}>
      <NotFoundContent />
    </Suspense>
  );
}
