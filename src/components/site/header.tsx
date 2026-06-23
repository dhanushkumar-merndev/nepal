import Image from "next/image";
import Link from "next/link";
import { CartSheet } from "@/components/site/cart-sheet";

const nav = [
  ["Home", "/"],
  ["How It Works", "/#how-it-works"],
  ["FAQ", "/#faq"],
  ["Contact", "/contact"],
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="OTT Subscriptions Nepal" width={44} height={44} className="rounded-xl" />
          <span className="hidden text-sm font-bold sm:block">OTT Subscriptions Nepal</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#555] lg:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-[#0B7FAE]">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <CartSheet />
        </div>
      </div>
    </header>
  );
}
