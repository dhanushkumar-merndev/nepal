import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the privacy policy for Ott Subscription Nepal, including what data we collect and how we use it.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-[#159FD3]">Legal</p>
        <h1 className="mt-2 text-4xl font-black">Privacy Policy</h1>
        <p className="mt-1 text-sm text-[#555]">Last updated: June 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#555]">
          <section>
            <h2 className="text-lg font-bold text-[#111]">1. Information We Collect</h2>
            <p className="mt-2">
              We collect only the information you provide when placing an order or submitting a review:
              your name, email address, and order details. If you sign in with Google,
              we receive your name, email, and avatar URL from your Google profile.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">2. How We Use Your Information</h2>
            <p className="mt-2">
              Your information is used solely to process your orders, communicate order status,
              display your reviews (name and avatar only), and improve our services.
              We do not sell, rent, or share your personal data with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">3. Data Storage & Security</h2>
            <p className="mt-2">
              Your data is stored securely in Supabase (PostgreSQL) with encryption in transit and at rest.
              We implement reasonable security measures to protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">4. Third-Party Services</h2>
            <p className="mt-2">
              We use the following third-party services: Supabase (database & authentication),
              Upstash Redis (caching), and WhatsApp (order communication).
              Each service has its own privacy policy governing data handling.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">5. Cookies</h2>
            <p className="mt-2">
              We use essential cookies for authentication (Supabase session) and cart persistence (localStorage).
              No tracking or advertising cookies are used.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">6. Your Rights</h2>
            <p className="mt-2">
              You may request access to, correction of, or deletion of your personal data at any time
              by contacting us via WhatsApp or email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#111]">7. Contact</h2>
            <p className="mt-2">
              For privacy-related inquiries, reach out via WhatsApp or email us at
              support@ottsubscriptionnepal.com.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
