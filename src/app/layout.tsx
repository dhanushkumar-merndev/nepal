import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ChatWidget } from "@/components/chat/chat-widget";
import { LenisProvider } from "@/components/site/lenis-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getLocaleFromPathname } from "@/lib/locale";
import { absoluteUrl, getSiteUrlObject } from "@/lib/site-url";
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
  metadataBase: getSiteUrlObject(),
  title: {
    default: "Ott Subscription Nepal | Premium OTT Plans & Digital Services",
    template: "%s | Ott Subscription Nepal",
  },
  description:
    "Buy Netflix, Spotify, Prime Video, YouTube Premium, Crunchyroll, Zee5, Free Fire top-up and other digital services in Nepal with fast activation and easy WhatsApp checkout.",
  applicationName: "Ott Subscription Nepal",
  category: "shopping",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Ott Subscription Nepal",
    description:
      "Premium OTT plans and digital service support in Nepal with fast activation and easy WhatsApp checkout.",
    url: "/",
    siteName: "Ott Subscription Nepal",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Ott Subscription Nepal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ott Subscription Nepal",
    description:
      "Premium OTT plans and digital service support in Nepal with fast activation and easy WhatsApp checkout.",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get("x-current-pathname") || "/";
  const htmlLang = getLocaleFromPathname(pathname);
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ott Subscription Nepal",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo.png"),
    description:
      "Premium OTT subscription activation and digital service support in Nepal with fast WhatsApp checkout.",
    sameAs: ["https://www.instagram.com/ottsubscriptionnepal4?igsh=MWJjYzZ6bTR0aGxnMQ=="],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+9779842901942",
        contactType: "customer support",
        areaServed: "NP",
        availableLanguage: ["en", "hi", "ne"],
      },
    ],
  };

  return (
    <html
      lang={htmlLang}
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansDevanagari.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <TooltipProvider>
          <LenisProvider />
          {children}
          <ChatWidget />
          <Toaster />
        </TooltipProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
