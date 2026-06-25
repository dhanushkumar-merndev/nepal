import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import { ChatWidget } from "@/components/chat/chat-widget";
import { HtmlLangSync } from "@/components/site/html-lang-sync";
import { LenisProvider } from "@/components/site/lenis-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-sans-devanagari",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Ott Subscription Nepal | Premium OTT Plans & Digital Services",
  description:
    "Buy Netflix, Spotify, Prime Video, YouTube Premium, Crunchyroll, Zee5, Free Fire topup and digital services in Nepal with easy WhatsApp checkout.",
  openGraph: {
    title: "Ott Subscription Nepal",
    description:
      "Premium OTT plans and digital service support in Nepal with easy WhatsApp checkout.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansDevanagari.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <TooltipProvider>
          <HtmlLangSync />
          <LenisProvider />
          {children}
          <ChatWidget />
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
