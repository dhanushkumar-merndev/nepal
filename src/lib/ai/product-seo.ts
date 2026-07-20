import { createHash } from "node:crypto";
import { cache } from "react";
import { defaultLocale, type SiteLocale } from "@/lib/locale";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils/format";
import { getDisplayPrice, getStartingPlan } from "@/lib/utils/pricing";
import {
  AI_PRODUCT_PAGE_INTRO_PREFIX,
  AI_PRODUCT_SEO_DESCRIPTION_PREFIX,
  getRedis,
  ONE_MONTH_CACHE_TTL_SECONDS,
} from "@/lib/ai/cache";

const MIN_DESCRIPTION_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 165;
const PAGE_INTRO_LINE_COUNT = 3;
const MIN_PAGE_INTRO_LINE_LENGTH = 32;
const MAX_PAGE_INTRO_LINE_LENGTH = 120;

export const getProductSeoDescription = cache(async (product: Product, locale: SiteLocale = defaultLocale) => {
  const fallback = buildFallbackSeoDescription(product, locale);
  const redis = getRedis();
  const cacheKey = productSeoDescriptionCacheKey(product, locale);

  if (redis) {
    const cached = normalizeSeoDescription(await redis.get<string>(cacheKey));
    if (cached) return cached;
  }

  const generated = await generateProductSeoDescription(product, locale);

  if (generated && redis) {
    const ttl = Number(process.env.AI_PRODUCT_SEO_TTL_SECONDS ?? ONE_MONTH_CACHE_TTL_SECONDS);
    await redis.set(cacheKey, generated, { ex: ttl });
  }

  return generated ?? fallback;
});

export const getProductPageIntroLines = cache(async (product: Product, locale: SiteLocale = defaultLocale) => {
  const fallback = buildFallbackPageIntroLines(product, locale);
  const redis = getRedis();
  const cacheKey = productPageIntroCacheKey(product, locale);

  if (redis) {
    const cached = normalizePageIntroLines(await redis.get<unknown>(cacheKey));
    if (cached) return cached;
  }

  const generated = await generateProductPageIntro(product, locale);

  if (generated && redis) {
    const ttl = Number(process.env.AI_PRODUCT_PAGE_INTRO_TTL_SECONDS ?? ONE_MONTH_CACHE_TTL_SECONDS);
    await redis.set(cacheKey, generated, { ex: ttl });
  }

  return generated ?? fallback;
});

export function buildFallbackSeoDescription(product: Product, locale: SiteLocale = defaultLocale) {
  const startingPlan = getStartingPlan(product);
  const startingPrice = startingPlan ? formatPrice(getDisplayPrice(startingPlan)) : null;
  const isTopUp = /top|free fire|diamond/i.test(`${product.name} ${product.category}`);
  const isEditing = /edit|capcut/i.test(`${product.name} ${product.category}`);
  const productUse = isTopUp
    ? "top-up options"
    : isEditing
      ? "creative editing plans"
      : "subscription plans";
  if (locale === "hi") {
    const localizedUse = isTopUp ? "टॉप-अप विकल्प" : isEditing ? "क्रिएटिव एडिटिंग प्लान" : "सब्सक्रिप्शन प्लान";
    const localizedPrice = startingPrice ? ` ${startingPrice} से शुरू होते हैं` : " उपलब्ध हैं";
    return normalizeSeoDescription(
      `${product.name} के ${localizedUse} नेपाल में${localizedPrice}। सक्रिय प्लान, स्टॉक स्थिति और Ott Subscription Nepal की स्थानीय सहायता देखें।`,
    )!;
  }

  if (locale === "ne") {
    const localizedUse = isTopUp ? "टप-अप विकल्प" : isEditing ? "क्रिएटिभ एडिटिङ प्लान" : "सब्सक्रिप्सन प्लान";
    const localizedPrice = startingPrice ? ` ${startingPrice} बाट सुरु हुन्छन्` : " उपलब्ध छन्";
    return normalizeSeoDescription(
      `${product.name} का ${localizedUse} नेपालमा${localizedPrice}। सक्रिय प्लान, स्टक स्थिति र Ott Subscription Nepal को स्थानीय सहयोग हेर्नुहोस्।`,
    )!;
  }

  const priceText = startingPrice ? ` from ${startingPrice}` : "";
  const fallbackDescription = `${product.name} ${productUse} in Nepal${priceText}. View active plan details, stock status, and local support from Ott Subscription Nepal.`;
  return normalizeSeoDescription(fallbackDescription)!;
}

function buildFallbackPageIntroLines(product: Product, locale: SiteLocale) {
  const startingPlan = getStartingPlan(product);
  const startingPrice = startingPlan ? formatPrice(getDisplayPrice(startingPlan)) : "available pricing";
  const activePlanCount = product.plans.filter((plan) => plan.is_active).length;
  const planText = activePlanCount === 1 ? "one active option" : `${activePlanCount} active options`;

  if (locale === "hi") {
    const localizedPrice = startingPlan ? startingPrice : "उपलब्ध कीमत";
    const optionText = activePlanCount === 1 ? "एक सक्रिय विकल्प" : `${activePlanCount} सक्रिय विकल्प`;
    return [
      `${product.name} के प्लान नेपाल में ${localizedPrice} से शुरू होते हैं और ${optionText} उपलब्ध हैं।`,
      "खरीदने से पहले प्लान की अवधि, सुविधाएं और मौजूदा स्टॉक स्थिति ध्यान से देखें।",
      "WhatsApp checkout से ऑर्डर की पुष्टि करें और नेपाल में सहायता पाएं।",
    ];
  }

  if (locale === "ne") {
    const localizedPrice = startingPlan ? startingPrice : "उपलब्ध मूल्य";
    const optionText = activePlanCount === 1 ? "एउटा सक्रिय विकल्प" : `${activePlanCount} सक्रिय विकल्प`;
    return [
      `${product.name} का प्लान नेपालमा ${localizedPrice} बाट सुरु हुन्छन् र ${optionText} उपलब्ध छन्।`,
      "किन्नुअघि प्लानको अवधि, सुविधाहरू र हालको स्टक अवस्था ध्यानपूर्वक हेर्नुहोस्।",
      "WhatsApp checkout बाट अर्डर पुष्टि गर्नुहोस् र नेपालमा सहयोग पाउनुहोस्।",
    ];
  }

  return [
    `${product.name} plans in Nepal start from ${startingPrice}, with ${planText} to choose from.`,
    `Review the current package details, stock status, and renewal support before checkout.`,
    "Ott Subscription Nepal keeps ordering simple with WhatsApp confirmation and local help.",
  ];
}

function productSeoDescriptionCacheKey(product: Product, locale: SiteLocale) {
  return `${AI_PRODUCT_SEO_DESCRIPTION_PREFIX}${locale}:${product.slug}:${productDigest(product)}`;
}

function productPageIntroCacheKey(product: Product, locale: SiteLocale) {
  return `${AI_PRODUCT_PAGE_INTRO_PREFIX}${locale}:${product.slug}:${productDigest(product)}`;
}

function productDigest(product: Product) {
  const digest = createHash("sha1")
    .update(
      JSON.stringify({
        name: product.name,
        slug: product.slug,
        category: product.category,
        description: product.description,
        stock_status: product.stock_status,
        plans: product.plans.map((plan) => ({
          name: plan.name,
          duration: plan.duration,
          real_price: plan.real_price,
          offer_price: plan.offer_price,
          stock_status: plan.stock_status,
          features: plan.features,
          is_active: plan.is_active,
        })),
      }),
    )
    .digest("hex")
    .slice(0, 16);

  return digest;
}

async function generateProductSeoDescription(product: Product, locale: SiteLocale) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const prompt = buildSeoPrompt(product, locale);
  const models = [
    process.env.GROQ_SEO_MODEL || "llama-3.3-70b-versatile",
    process.env.GROQ_MODEL || "openai/gpt-oss-20b",
    ...parseFallbackModels(process.env.GROQ_FALLBACK_MODELS),
  ].filter((model, index, list) => model && list.indexOf(model) === index);

  for (const model of models) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.25,
          max_completion_tokens: 220,
          messages: [
            {
              role: "system",
              content:
                "You write final product-specific ecommerce SEO meta descriptions for Ott Subscription Nepal. Return valid JSON only: {\"description\":\"...\"}. Never include analysis, reasoning, labels, markdown, or process notes. Use one complete sentence and follow the requested length strictly.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) continue;

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string | null } }>;
      };
      const description = normalizeSeoDescription(extractDescription(data.choices?.[0]?.message?.content));
      if (description) return description;
    } catch {
      // Try the next configured model, then fall back to deterministic copy.
    }
  }

  return null;
}

async function generateProductPageIntro(product: Product, locale: SiteLocale) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const prompt = buildPageIntroPrompt(product, locale);
  const models = [
    process.env.GROQ_SEO_MODEL || "llama-3.3-70b-versatile",
    process.env.GROQ_MODEL || "openai/gpt-oss-20b",
    ...parseFallbackModels(process.env.GROQ_FALLBACK_MODELS),
  ].filter((model, index, list) => model && list.indexOf(model) === index);

  for (const model of models) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          max_completion_tokens: 320,
          messages: [
            {
              role: "system",
              content:
                "You write final on-page ecommerce intro copy. Return valid JSON only: {\"lines\":[\"...\",\"...\",\"...\"]}. Never include analysis, markdown, labels, or process notes.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) continue;

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string | null } }>;
      };
      const introLines = normalizePageIntroLines(extractPageIntroLines(data.choices?.[0]?.message?.content));
      if (introLines) return introLines;
    } catch {
      // Try the next configured model, then fall back to deterministic page copy.
    }
  }

  return null;
}

function buildSeoPrompt(product: Product, locale: SiteLocale) {
  const activePlans = product.plans
    .filter((plan) => plan.is_active)
    .slice(0, 6)
    .map((plan) => {
      const price = formatPrice(getDisplayPrice(plan));
      const featureText = (plan.features ?? []).slice(0, 3).join(", ");
      return `- ${plan.name}${plan.duration ? ` (${plan.duration})` : ""}: ${price}; ${plan.stock_status}${featureText ? `; ${featureText}` : ""}`;
    })
    .join("\n");
  const languageInstruction: Record<SiteLocale, string> = {
    en: "Write in English.",
    hi: "Write in natural Hindi using Devanagari script for Nepal users; keep only product and brand names in English.",
    ne: "Write in natural Nepali using Devanagari script; keep only product and brand names in English.",
  };

  return [
    languageInstruction[locale],
    "Return only valid JSON. Shape: {\"description\":\"one natural description\"}.",
    `The description must be ${MIN_DESCRIPTION_LENGTH}-${MAX_DESCRIPTION_LENGTH} characters. Descriptions under ${MIN_DESCRIPTION_LENGTH} characters are invalid.`,
    "Write one product-specific shopper sentence, not a reusable template.",
    "Include the product name and Nepal once. Include the starting price and one concrete support/detail when useful.",
    "Avoid keyword stuffing and never claim official partnership, guaranteed delivery time, unavailable stock, or warranties.",
    "Do not use these phrases: compare packages, availability, WhatsApp checkout.",
    "",
    `Product: ${product.name}`,
    `Category: ${product.category}`,
    `Stock: ${product.stock_status}`,
    `Existing description: ${product.description || "No existing description."}`,
    "Plans:",
    activePlans || "- Current plan details unavailable",
  ].join("\n");
}

function buildPageIntroPrompt(product: Product, locale: SiteLocale) {
  const activePlans = product.plans
    .filter((plan) => plan.is_active)
    .slice(0, 6)
    .map((plan) => {
      const price = formatPrice(getDisplayPrice(plan));
      const featureText = (plan.features ?? []).slice(0, 3).join(", ");
      return `- ${plan.name}${plan.duration ? ` (${plan.duration})` : ""}: ${price}; ${plan.stock_status}${featureText ? `; ${featureText}` : ""}`;
    })
    .join("\n");
  const languageInstruction: Record<SiteLocale, string> = {
    en: "Write in English.",
    hi: "Write in natural Hindi using Devanagari script for Nepal users; keep only product and brand names in English.",
    ne: "Write in natural Nepali using Devanagari script; keep only product and brand names in English.",
  };

  return [
    languageInstruction[locale],
    `Return exactly ${PAGE_INTRO_LINE_COUNT} complete lines in JSON. Shape: {"lines":["line 1","line 2","line 3"]}.`,
    `Each line must be ${MIN_PAGE_INTRO_LINE_LENGTH}-${MAX_PAGE_INTRO_LINE_LENGTH} characters.`,
    "Write helpful on-page copy for shoppers, not a meta description, not a keyword list, and not a fill-in template.",
    "Line 1: mention the product, Nepal, and starting price when available.",
    "Line 2: mention a product-specific use, benefit, or plan choice based on the product details.",
    "Line 3: mention checkout or support naturally without overpromising.",
    "Use Rs. for Nepal pricing. Do not use ₹ or INR.",
    "Avoid generic phrasing like current package details, one active option, local help, or keeps ordering simple.",
    "Avoid overpromising words like instant access, guaranteed activation, immediate delivery, or official access.",
    "Avoid keyword stuffing and never claim official partnership, guaranteed delivery time, warranties, or unavailable stock.",
    "",
    `Product: ${product.name}`,
    `Category: ${product.category}`,
    `Stock: ${product.stock_status}`,
    `Existing description: ${product.description || "No existing description."}`,
    "Plans:",
    activePlans || "- Current plan details unavailable",
  ].join("\n");
}

function extractDescription(value?: string | null) {
  if (!value) return null;
  const cleaned = value
    .replace(/<think>[\s\S]*?<\/think>/gi, " ")
    .replace(/```(?:json)?|```/gi, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as { description?: unknown };
    return typeof parsed.description === "string" ? parsed.description : cleaned;
  } catch {
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        const parsed = JSON.parse(objectMatch[0]) as { description?: unknown };
        if (typeof parsed.description === "string") return parsed.description;
      } catch {
        // Fall through to free-text cleanup below.
      }
    }
    return cleaned;
  }
}

function extractPageIntroLines(value?: string | null) {
  if (!value) return null;
  const cleaned = value
    .replace(/<think>[\s\S]*?<\/think>/gi, " ")
    .replace(/```(?:json)?|```/gi, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as { lines?: unknown };
    return parsed.lines;
  } catch {
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        const parsed = JSON.parse(objectMatch[0]) as { lines?: unknown };
        return parsed.lines;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalizeSeoDescription(value?: string | null) {
  if (!value) return null;

  const cleaned = value
    .replace(/<think>[\s\S]*?<\/think>/gi, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (containsReasoningArtifact(cleaned)) return null;
  if (looksLikeTemplateFallback(cleaned)) return null;
  if (cleaned.length < MIN_DESCRIPTION_LENGTH) return null;
  if (cleaned.length <= MAX_DESCRIPTION_LENGTH) return cleaned;

  const truncated = cleaned.slice(0, MAX_DESCRIPTION_LENGTH + 1);
  const lastSpace = truncated.lastIndexOf(" ");
  const candidate = (lastSpace > MIN_DESCRIPTION_LENGTH ? truncated.slice(0, lastSpace) : cleaned.slice(0, MAX_DESCRIPTION_LENGTH))
    .replace(/[,\s.;:]+$/g, "")
    .trim();

  return `${candidate}.`;
}

function normalizePageIntroLines(value: unknown) {
  if (!Array.isArray(value)) return null;

  const lines = value
    .map((line) => (typeof line === "string" ? line : ""))
    .map(cleanGeneratedLine)
    .filter((line) => line.length >= MIN_PAGE_INTRO_LINE_LENGTH && line.length <= MAX_PAGE_INTRO_LINE_LENGTH)
    .filter((line) => !containsReasoningArtifact(line))
    .filter((line) => !containsOverpromise(line))
    .slice(0, PAGE_INTRO_LINE_COUNT);

  return lines.length === PAGE_INTRO_LINE_COUNT ? lines : null;
}

function cleanGeneratedLine(value: string) {
  return value
    .replace(/^[-*\d.)\s]+/, "")
    .replace(/₹\s*/g, "Rs. ")
    .replace(/<[^>]*>/g, " ")
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function containsOverpromise(value: string) {
  return /\b(?:instant access|guaranteed activation|immediate delivery|official access|official subscription)\b/i.test(value);
}

function looksLikeTemplateFallback(value: string) {
  const lower = value.toLowerCase();
  return (
    lower.includes("compare packages, availability, and whatsapp checkout") ||
    lower.includes("with current pricing, order confirmation, and support from ott subscription nepal")
  );
}

function containsReasoningArtifact(value: string) {
  const lower = value.toLowerCase();
  return [
    "thinking process",
    "okay, let's tackle",
    "let's tackle this",
    "the user wants",
    "key points to include",
    "ecommerce site",
    "site in nepal",
    "analyze user input",
    "user input",
    "**task**",
    "task:",
    "reasoning",
    "step-by-step",
    "i need to",
    "we need to",
    "final answer",
    "meta description:",
  ].some((artifact) => lower.includes(artifact));
}

function parseFallbackModels(value: string | undefined) {
  return (value ?? "openai/gpt-oss-120b,qwen/qwen3-32b,qwen/qwen3.6-27b,llama-3.3-70b-versatile")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);
}
