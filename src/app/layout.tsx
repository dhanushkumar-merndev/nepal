import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { JsonLd } from "@/components/seo/json-ld";
import { ChatWidget } from "@/components/chat/chat-widget";
import { LenisProvider } from "@/components/site/lenis-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getLocaleFromPathname, stripLocalePrefix } from "@/lib/locale";
import { absoluteUrl, getSiteUrlObject } from "@/lib/site-url";
import {
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  buildHomeFaqSchema,
  buildOrganizationSchema,
  buildServiceSchema,
  buildWebPageSchema,
  buildWebsiteSchema,
} from "@/lib/schema";
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
    default: "Ott Subscription Nepal | Premium OTT Subscription Nepal",
    template: "%s | Ott Subscription Nepal",
  },
  description:
    "Ott Subscription Nepal lets you buy premium OTT subscription plans in Nepal, including Netflix, Spotify, Prime Video, YouTube Premium and more with fast activation and WhatsApp checkout.",
  applicationName: "Ott Subscription Nepal",
  category: "shopping",
  keywords: [
    "OTT Subscription Nepal",
    "Ott Subscription Nepal",
    "OTT Nepal Subscription",
    "Premium OTT Subscription Nepal",
    "Nepal subscription",
    "Nepal subscription service",
    "premium ott subscription nepal",
    "ott subscription in nepal",
    "subscription nepal",
    "premium subscription nepal",
    "Netflix subscription Nepal",
    "Spotify Premium Nepal",
    "YouTube Premium Nepal",
    "Prime Video Nepal",
    "digital subscriptions Nepal",
  ],
  authors: [{ name: "Ott Subscription Nepal", url: absoluteUrl("/") }],
  creator: "Ott Subscription Nepal",
  publisher: "Ott Subscription Nepal",
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
    title: "Ott Subscription Nepal | Premium OTT Subscription Nepal",
    description:
      "Ott Subscription Nepal offers premium OTT subscription plans and digital service support in Nepal with fast activation and easy WhatsApp checkout.",
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
    title: "Ott Subscription Nepal | Premium OTT Subscription Nepal",
    description:
      "Ott Subscription Nepal offers premium OTT subscription plans and digital service support in Nepal with fast activation and easy WhatsApp checkout.",
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

export const viewport: Viewport = {
  themeColor: "#159FD3",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get("x-current-pathname") || "/";
  const htmlLang = getLocaleFromPathname(pathname);
  const publicPathname = stripLocalePrefix(pathname);
  const isProductPlanPage = /^\/plans\/[^/]+\/?$/.test(publicPathname);
  const pageSchemas: Array<Record<string, unknown>> = [
    buildOrganizationSchema(),
    buildWebsiteSchema(),
    buildServiceSchema(),
    buildWebPageSchema({
      pathname,
      title: "Ott Subscription Nepal",
      description:
        "Ott Subscription Nepal offers premium OTT subscription plans and digital service support in Nepal with fast activation and easy WhatsApp checkout.",
    }),
    buildBreadcrumbSchema(pathname),
  ];

  if (pathname === "/" || pathname === "/hi" || pathname === "/ne") {
    pageSchemas.push(buildHomeFaqSchema(htmlLang));
  }

  if (pathname === "/faq" || pathname === "/hi/faq" || pathname === "/ne/faq") {
    pageSchemas.push(buildFaqPageSchema(htmlLang));
  }

  return (
    <html
      lang={htmlLang}
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansDevanagari.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={`min-h-full flex flex-col${isProductPlanPage ? " product-detail-page" : ""}`} suppressHydrationWarning>
        <JsonLd data={pageSchemas} />
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
