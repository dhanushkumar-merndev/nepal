import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { AboutPageContent } from "@/components/site/about-page-content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn more about Ott Subscription Nepal, our service, customer support, and mission to make digital subscriptions accessible in Nepal.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <AboutPageContent />
      <Footer />
    </>
  );
}
