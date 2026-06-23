import { HelpCircle, MessageCircle, PackageCheck, ShieldCheck, Sparkles } from "lucide-react";

export function HowItWorks() {
  const items = [
    ["Choose a plan", "Browse active plans with real price, offer price, and stock status.", PackageCheck],
    ["Add to cart", "Select your plan and quantity before checkout.", Sparkles],
    ["Confirm on WhatsApp", "Send the generated order message and get support fast.", MessageCircle],
  ] as const;

  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16">
      <h2 className="text-3xl font-bold">How it works</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {items.map(([title, text, Icon]) => (
          <div key={title} className="premium-card p-6">
            <Icon className="size-8 text-[#159FD3]" />
            <h3 className="mt-4 text-xl font-bold">{title}</h3>
            <p className="mt-2 text-sm text-[#555]">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FAQSection() {
  const items = [
    ["Are you an official partner?", "No. All trademarks belong to their owners. We provide subscription activation and digital service support."],
    ["How fast is activation?", "Most available plans are handled quickly through WhatsApp after order confirmation."],
    ["Can I renew later?", "Yes. We support easy renewal assistance for active services."],
  ];

  return (
    <section id="faq" className="mx-auto max-w-7xl px-4 py-16">
      <div className="flex items-center gap-3">
        <HelpCircle className="size-7 text-[#159FD3]" />
        <h2 className="text-3xl font-bold">FAQ</h2>
      </div>
      <div className="mt-6 grid gap-3">
        {items.map(([question, answer]) => (
          <details key={question} className="premium-card p-5">
            <summary className="cursor-pointer font-semibold">{question}</summary>
            <p className="mt-3 text-sm text-[#555]">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function TrustSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="premium-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-9 text-[#16A34A]" />
          <div>
            <h2 className="text-xl font-bold">Secure, simple checkout</h2>
            <p className="text-sm text-[#555]">Orders are saved server-side when Supabase is configured, then sent to WhatsApp.</p>
          </div>
        </div>
        <a className="primary-btn px-5 py-3 text-center text-sm font-bold" href="https://wa.me/9779842901942">
          Chat on WhatsApp
        </a>
      </div>
    </section>
  );
}
