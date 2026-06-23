import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { FeedbackForm } from "@/components/site/feedback-form";

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-12 md:grid-cols-2">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#159FD3]">Contact</p>
          <h1 className="mt-2 text-4xl font-black">Need help with a plan?</h1>
          <p className="mt-4 text-[#555]">
            Message us on WhatsApp for availability, activation, renewal, payment help, or custom digital service support.
          </p>
          <a className="primary-btn mt-6 inline-flex px-5 py-3 text-sm font-bold" href="https://wa.me/9779842901942">
            Open WhatsApp
          </a>
        </div>
        <FeedbackForm />
      </main>
      <Footer />
    </>
  );
}
