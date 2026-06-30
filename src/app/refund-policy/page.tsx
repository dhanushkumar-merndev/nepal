import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { OFFICIAL_SUPPORT_EMAIL } from "@/lib/contact";
import { buildStaticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildStaticPageMetadata("refund");

export default function RefundPolicyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-16">
        <p className="text-xs font-bold uppercase tracking-wide text-[#159FD3]">Legal</p>
        <h1 className="mt-2 text-4xl font-black">Refund and Replacement Policy</h1>
        <p className="mt-1 text-sm text-[#555]">Last updated: June 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#555]">
          <section>
            <h2 className="text-lg font-bold text-[#111]">1. Digital Service Nature</h2>
            <p className="mt-2">
              Most of our products are digital subscriptions or activation services. Because delivery can happen
              quickly and access may begin immediately, refunds are not automatic after purchase.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">2. When We Review Refund or Replacement Requests</h2>
            <p className="mt-2">
              We review requests case by case when there is a verified activation problem, service mismatch,
              duplicate charge, or delivery issue caused on our side. Depending on the situation, we may provide
              support, replacement, store credit, or a refund.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">3. Situations Usually Not Eligible</h2>
            <p className="mt-2">
              Refunds or replacements are usually not available for customer mistakes, change of mind after delivery,
              unsupported device limitations, third-party platform policy changes, or misuse of an account after access
              has already been provided.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">4. Shared and Private Access</h2>
            <p className="mt-2">
              Some plans may be shared while others may be private. Customers should review the listed plan features
              and ask for confirmation on WhatsApp before payment if account type matters for the order.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">5. How To Request Help</h2>
            <p className="mt-2">
              If there is a problem, contact us as soon as possible with your order details, the affected service,
              and a clear explanation of the issue. Faster reporting helps us verify and resolve the case more easily.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">6. Resolution Timing</h2>
            <p className="mt-2">
              We aim to review valid cases quickly during support hours. Resolution time can vary depending on the
              provider, order status, and the information available for verification.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">7. Contact</h2>
            <p className="mt-2">
              For refund, replacement, or order-related questions, contact us via WhatsApp or email at{" "}
              <a href={`mailto:${OFFICIAL_SUPPORT_EMAIL}`} className="text-[#159FD3] hover:underline">
                {OFFICIAL_SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
