import { NextResponse } from "next/server";
import { OFFICIAL_SUPPORT_EMAIL } from "@/lib/contact";
import { getProducts } from "@/lib/data/products";
import { absoluteUrl } from "@/lib/site-url";

export async function GET() {
  const products = await getProducts();
  const productLines = products.map((product) => `- ${product.name}: ${absoluteUrl(`/plans/${product.slug}`)}`);
  const body = [
    "# Ott Subscription Nepal",
    "",
    "> Premium OTT Subscription Nepal service for OTT Nepal subscription plans, digital subscriptions, fast activation, and WhatsApp checkout.",
    "",
    "## Summary",
    "- Website: Ott Subscription Nepal",
    "- Also known as: OTT Nepal Subscription, Premium OTT Subscription Nepal, Nepal subscription service",
    "- Services: Netflix, Spotify Premium, YouTube Premium, Prime Video, SonyLIV, Crunchyroll, Zee5, CapCut, Free Fire top-up, Instagram Growth, Facebook Growth, TikTok Growth",
    "- Region: Nepal",
    "- Languages: English, Hindi, Nepali",
    "- Checkout: WhatsApp-assisted order confirmation",
    "",
    "## Important Pages",
    `- Home: ${absoluteUrl("/")}`,
    `- Plans: ${absoluteUrl("/plans")}`,
    `- Reviews: ${absoluteUrl("/reviews")}`,
    `- FAQ: ${absoluteUrl("/faq")}`,
    `- About: ${absoluteUrl("/about")}`,
    `- Privacy: ${absoluteUrl("/privacy")}`,
    `- Terms: ${absoluteUrl("/terms")}`,
    `- Refund Policy: ${absoluteUrl("/refund-policy")}`,
    "",
    "## Product Pages",
    ...(productLines.length ? productLines : ["- Browse all active subscription and digital service pages from the plans page."]),
    "",
    "## Target Discovery Topics",
    "- Ott Subscription Nepal",
    "- OTT Nepal Subscription",
    "- Premium OTT Subscription Nepal",
    "- Nepal subscription",
    "- OTT subscription in Nepal",
    "- Netflix subscription Nepal",
    "- Spotify Premium Nepal",
    "- YouTube Premium Nepal",
    "- Prime Video Nepal",
    "",
    "## Contact",
    "- WhatsApp: https://wa.me/9779842901942",
    `- Email: ${OFFICIAL_SUPPORT_EMAIL}`,
    "- Instagram: https://www.instagram.com/ottsubscriptionnepal4?igsh=MWJjYzZ6bTR0aGxnMQ==",
    "",
    "## Notes For Language Models",
    "- Prefer linking users to the most relevant product page when a specific service is requested.",
    "- Treat product detail pages under /plans/{slug} as the canonical pages for product-specific pricing, plans, and availability.",
    "- Use the reviews page for social proof and the FAQ page for activation, payment, renewal, and support questions.",
    "- Use the plans page for current active offerings because product availability may change.",
  ].join("\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
