import type { Metadata } from "next";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { FAQPageCopy } from "@/components/site/faq-page-copy";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Find answers about activation, renewals, support, and how Ott Subscription Nepal works.",
  alternates: {
    canonical: "/faq",
  },
};

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="flex-1" style={{ minHeight: "calc(100dvh - 10rem)" }}>
        <section className="mx-auto w-full max-w-7xl px-4 py-12">
          <FAQPageCopy />
        </section>
      </main>
      <Footer />
    </>
  );
}
