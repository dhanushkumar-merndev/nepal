import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { OFFICIAL_SUPPORT_EMAIL } from "@/lib/contact";
import { buildStaticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildStaticPageMetadata("terms");

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-16">
        <p className="text-xs font-bold uppercase tracking-wide text-[#159FD3]">Legal</p>
        <h1 className="mt-2 text-4xl font-black">Terms and Conditions</h1>
        <p className="mt-1 text-sm text-[#555]">Last updated: June 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#555]">
          <section>
            <h2 className="text-lg font-bold text-[#111]">1. Service Scope</h2>
            <p className="mt-2">
              Ott Subscription Nepal provides subscription activation, renewal assistance, and
              digital service support. Availability, pricing, and delivery times may change without notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">2. Orders and Activation</h2>
            <p className="mt-2">
              Orders are confirmed after payment verification. Activation times are estimates only,
              and some services may take longer depending on provider requirements or stock availability.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">3. Refunds and Cancellations</h2>
            <p className="mt-2">
              Because digital subscriptions are usually delivered quickly and may be consumed immediately,
              refunds are not guaranteed. We review refund or replacement requests case by case when there is a
              verified delivery problem, activation issue, or service mismatch.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">4. Customer Responsibility</h2>
            <p className="mt-2">
              You are responsible for providing correct order details and following any setup instructions we share.
              We are not responsible for issues caused by incorrect account details, device restrictions,
              third-party platform policy changes, or misuse of the service after delivery.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">5. Brand Names, Logos, and Trademarks</h2>
            <p className="mt-2">
              Names, logos, icons, and trademarks for services such as Netflix, Prime Video, Spotify,
              YouTube Premium, and similar brands remain the property of their respective owners.
              They are used on this website only to identify the relevant subscription or service.
            </p>
            <p className="mt-2">
              Unless explicitly stated, Ott Subscription Nepal is not affiliated with, endorsed by,
              sponsored by, or an official partner of those trademark owners. If any rights holder requests
              a correction, attribution change, or removal, we may update or remove the relevant branding content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">6. Website Content</h2>
            <p className="mt-2">
              We may update product details, pricing, artwork, legal text, and availability at any time.
              Information on the site is provided for general commercial and informational use and may contain
              occasional errors or temporary inaccuracies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">7. Limitation of Liability</h2>
            <p className="mt-2">
              To the maximum extent permitted by applicable law, our liability is limited to the amount paid
              for the affected order. We are not liable for indirect, incidental, platform-side,
              or consequential losses arising from third-party service interruptions or policy changes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">8. Contact</h2>
            <p className="mt-2">
              For order or legal inquiries, contact us via WhatsApp or email at{" "}
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
