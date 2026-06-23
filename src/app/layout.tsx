import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ChatWidget } from "@/components/chat/chat-widget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "OTT Subscriptions Nepal | Premium OTT Plans & Digital Services",
  description:
    "Buy Netflix, Spotify, Prime Video, YouTube Premium, Crunchyroll, Zee5, Free Fire topup and digital services in Nepal with easy WhatsApp checkout.",
  openGraph: {
    title: "OTT Subscriptions Nepal",
    description:
      "Premium OTT plans and digital service support in Nepal with easy WhatsApp checkout.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
