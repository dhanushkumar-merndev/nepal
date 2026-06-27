import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";

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
      <main className="mx-auto max-w-4xl flex-1 px-4 py-16">
        <p className="text-xs font-bold uppercase tracking-wide text-[#159FD3]">About Us</p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl">OTT Subscription Nepal</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[#555]">
          Welcome to <strong>OTT Subscription Nepal</strong>, your trusted destination for affordable
          and convenient digital subscription services in Nepal.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <article className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-[#159FD3]">Since</p>
            <p className="mt-2 text-3xl font-black text-[#111]">2023</p>
            <p className="mt-2 text-sm leading-6 text-[#555]">
              We have been helping customers access premium subscriptions and digital services with ease.
            </p>
          </article>
          <article className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-[#159FD3]">Customers</p>
            <p className="mt-2 text-3xl font-black text-[#111]">3,000+</p>
            <p className="mt-2 text-sm leading-6 text-[#555]">
              Happy customers have trusted us for a smooth, reliable, and friendly subscription experience.
            </p>
          </article>
          <article className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-[#159FD3]">Focus</p>
            <p className="mt-2 text-3xl font-black text-[#111]">Support</p>
            <p className="mt-2 text-sm leading-6 text-[#555]">
              Fast service, helpful support, and a hassle-free experience from start to finish.
            </p>
          </article>
        </div>

        <div className="mt-10 space-y-6 text-base leading-8 text-[#555]">
          <section>
            <p>
              We offer subscriptions for popular platforms such as <strong>Netflix</strong>,{" "}
              <strong>Prime Video</strong>, <strong>SonyLIV</strong>, <strong>Spotify</strong>,{" "}
              <strong>Canva</strong>, <strong>CapCut</strong>, and more. Our goal is to make
              entertainment, creativity, and digital tools more accessible to everyone in Nepal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-[#111]">What We Focus On</h2>
            <ul className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <li className="rounded-2xl border border-black/10 bg-white px-4 py-3">Fast and easy subscription service</li>
              <li className="rounded-2xl border border-black/10 bg-white px-4 py-3">Affordable pricing</li>
              <li className="rounded-2xl border border-black/10 bg-white px-4 py-3">Friendly customer support</li>
              <li className="rounded-2xl border border-black/10 bg-white px-4 py-3">Secure and reliable service</li>
              <li className="rounded-2xl border border-black/10 bg-white px-4 py-3 md:col-span-2">A hassle-free experience from start to finish</li>
            </ul>
          </section>

          <section>
            <p>
              Whether you want to watch your favorite movies and series, enjoy music, edit videos,
              design content, or use premium digital tools, we are here to help you get started quickly.
            </p>
          </section>

          <section>
            <p>
              Thank you for choosing <strong>OTT Subscription Nepal</strong>. Your trust motivates us
              to keep improving and delivering the best subscription service experience in Nepal.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
