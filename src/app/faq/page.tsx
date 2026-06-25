import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { FAQItem } from "@/components/site/faq-item";
import { SlideIn } from "@/components/site/slide-in";

const faqs = [
  {
    q: "How do I activate my OTT subscription?",
    a: "After you complete payment via WhatsApp, we will activate your subscription within 5–30 minutes. You will receive login credentials or setup instructions on WhatsApp.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept eSewa, Khalti, Bank Transfer, and Manual Confirmation. All payments are coordinated through WhatsApp after you place an order.",
  },
  {
    q: "How does the WhatsApp checkout work?",
    a: "Add plans to your cart, fill in your name on the checkout page, then click 'Checkout on WhatsApp'. You will be redirected to WhatsApp with a pre-filled order message. We will confirm and activate your plan.",
  },
  {
    q: "Can I get a refund?",
    a: "Refunds are handled on a case-by-case basis. Please contact us on WhatsApp with your order details and we will assist you.",
  },
  {
    q: "How long does activation take?",
    a: "Most subscriptions are activated within 5–30 minutes after payment confirmation. Some services may take up to 24 hours depending on the provider.",
  },
  {
    q: "Do you offer customer support?",
    a: "Yes, you can reach us on WhatsApp for any questions about plans, activation, renewal, payment, or technical issues. Our response time is usually within a few minutes during business hours.",
  },
  {
    q: "Can I change my plan after purchase?",
    a: "Plan changes depend on the service. Contact us on WhatsApp with your order details and we will check availability.",
  },
];

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="flex-1" style={{ minHeight: "calc(100dvh - 10rem)" }}>
        <section className="mx-auto w-full max-w-7xl px-4 py-12">
          <p className="text-sm font-bold uppercase tracking-wide text-[#159FD3]">FAQ</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-black md:text-6xl">Frequently asked questions</h1>
          <p className="mt-4 max-w-2xl text-[#555]">
            Everything you need to know about Ott Subscription Nepal.
          </p>
          <div className="mt-10 w-full space-y-3">
          {faqs.map((faq, i) => (
            <SlideIn key={i} delay={i * 0.04}>
              <FAQItem question={faq.q} answer={faq.a} />
            </SlideIn>
          ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}