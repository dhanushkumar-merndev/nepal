import Link from "next/link";
import { FeedbackForm } from "@/components/site/feedback-form";

export function Footer() {
  return (
    <footer id="contact" className="mt-20 border-t border-black/10 bg-white/55">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1.2fr]">
        <div>
          <h2 className="text-xl font-bold">Ott Subscription Nepal</h2>
          <p className="mt-3 text-sm text-[#555]">
            Premium digital subscription support in Nepal.
          </p>
          <p className="mt-5 text-xs text-[#737373]">
            All trademarks belong to their respective owners. We provide subscription activation and digital service support.
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Quick Links</h3>
          <div className="mt-3 grid gap-2 text-sm text-[#555]">
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            <Link href="/reviews">Reviews</Link>
            <Link href="/#faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Support</h3>
          <div className="mt-3 grid gap-2 text-sm text-[#555]">
            <a href="https://wa.me/9779842901942">WhatsApp</a>
            <a href="mailto:support@example.com">Email</a>
          </div>
        </div>
        <FeedbackForm />
      </div>
    </footer>
  );
}
