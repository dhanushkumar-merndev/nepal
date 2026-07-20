import { createHash } from "node:crypto";
import { cache } from "react";
import { defaultLocale, type SiteLocale } from "@/lib/locale";
import type { Plan, Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils/format";
import { getDisplayPrice } from "@/lib/utils/pricing";
import {
  AI_PRODUCT_PLAN_FEATURES_PREFIX,
  getRedis,
  ONE_MONTH_CACHE_TTL_SECONDS,
} from "@/lib/ai/cache";

export type PlanFeatureMap = Record<string, string[]>;

const FEATURE_COUNT = 3;

export const getAiPlanFeatures = cache(async (product: Product, locale: SiteLocale = defaultLocale) => {
  const plansNeedingFeatures = product.plans.filter((plan) => plan.is_active);
  if (!plansNeedingFeatures.length) return {} satisfies PlanFeatureMap;

  const fallback = Object.fromEntries(
    plansNeedingFeatures.map((plan) => [plan.id, buildFallbackPlanFeatures(product, plan, locale)]),
  ) as PlanFeatureMap;
  const redis = getRedis();
  const cacheKey = planFeaturesCacheKey(product, locale);

  if (redis) {
    const cached = normalizeFeatureMap(await redis.get<unknown>(cacheKey), plansNeedingFeatures, product);
    if (cached) return cached;
  }

  const generated = await generatePlanFeatures(product, plansNeedingFeatures, locale);
  const featureMap = { ...fallback, ...generated };

  if (redis) {
    const ttl = Number(process.env.AI_PRODUCT_PLAN_FEATURES_TTL_SECONDS ?? ONE_MONTH_CACHE_TTL_SECONDS);
    await redis.set(cacheKey, featureMap, { ex: ttl });
  }

  return featureMap;
});

export function getDisplayPlanFeatures(
  product: Product,
  plan: Plan,
  generatedFeatures?: PlanFeatureMap,
  locale: SiteLocale = defaultLocale,
) {
  const manualFeatures = normalizedManualFeatures(plan);
  if (generatedFeatures?.[plan.id]) return generatedFeatures[plan.id];
  if (manualFeatures.length) return manualFeatures.slice(0, FEATURE_COUNT);
  return buildFallbackPlanFeatures(product, plan, locale);
}

function normalizedManualFeatures(plan: Plan) {
  return (plan.features ?? []).map((feature) => feature.trim()).filter(Boolean);
}

function planFeaturesCacheKey(product: Product, locale: SiteLocale) {
  const digest = createHash("sha1")
    .update(
      JSON.stringify({
        slug: product.slug,
        name: product.name,
        category: product.category,
        plans: product.plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          duration: plan.duration,
          real_price: plan.real_price,
          offer_price: plan.offer_price,
          stock_status: plan.stock_status,
          features: normalizedManualFeatures(plan),
          is_active: plan.is_active,
        })),
      }),
    )
    .digest("hex")
    .slice(0, 16);

  return `${AI_PRODUCT_PLAN_FEATURES_PREFIX}${locale}:${product.slug}:${digest}`;
}

async function generatePlanFeatures(product: Product, plans: Plan[], locale: SiteLocale) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

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
          temperature: 0.35,
          max_completion_tokens: 420,
          messages: [
            {
              role: "system",
              content:
                "You write final ecommerce plan feature bullets. Return valid JSON only. Never include reasoning, markdown, labels outside JSON, or process notes. Make every bullet useful to a shopper and specific to the product or plan.",
            },
            {
              role: "user",
              content: buildPlanFeaturePrompt(product, plans, locale),
            },
          ],
        }),
      });

      if (!response.ok) continue;

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string | null } }>;
      };
      const normalized = normalizeFeatureMap(data.choices?.[0]?.message?.content, plans, product);
      if (normalized) return normalized;
    } catch {
      // Try the next model, then fall back to deterministic plan support text.
    }
  }

  return null;
}

function buildPlanFeaturePrompt(product: Product, plans: Plan[], locale: SiteLocale) {
  const languageInstruction: Record<SiteLocale, string> = {
    en: "Write in English.",
    hi: "Write in simple Hindi using Devanagari script for Nepal users; keep only product and plan names in English.",
    ne: "Write in natural Nepali using Devanagari script; keep only product and plan names in English.",
  };
  const isTopUp = isTopUpProduct(product);
  const categoryGuidance = isTopUp
    ? "For this gaming top-up product, mention safe details like top-up value, game credit, order confirmation, and Nepal support. Do not mention streaming, editing, account sharing, or subscriptions."
    : "Mention only safe benefits: plan duration, viewing/listening/editing use when relevant, checkout confirmation, renewal/setup support, Nepal support, and current offer value.";

  return [
    languageInstruction[locale],
    `Create exactly ${FEATURE_COUNT} short feature bullets for each plan.`,
    "Each bullet must be 3-8 words, natural, specific to the product and plan duration, and suitable for a product card.",
    categoryGuidance,
    "Avoid vague bullets like Flexible duration, WhatsApp confirmation, Nepal support, Fast activation, or Renewal assistance by themselves.",
    "Do not include prices, rupees, rounded amounts, or discounts inside bullets because the card already shows price separately.",
    "For top-up products, do not include numeric credit, diamond, coin, or voucher amounts unless that exact value is in the plan name.",
    "Do not claim official partnership, account sharing/private access, guaranteed delivery time, warranties, or unavailable benefits.",
    "Return JSON in this exact shape: { \"plans\": { \"PLAN_ID\": [\"feature\", \"feature\", \"feature\"] } }",
    "",
    `Product: ${product.name}`,
    `Category: ${product.category}`,
    `Product description: ${product.description || "No description provided."}`,
    "Plans:",
    ...plans.map((plan) => {
      const manual = normalizedManualFeatures(plan);
      return [
        `- ID: ${plan.id}`,
        `  Name: ${plan.name}`,
        `  Plan type: ${plan.duration || (isTopUp ? "Top-up credit" : "Flexible plan")}`,
        `  Price: ${formatPrice(getDisplayPrice(plan))}`,
        `  Stock: ${plan.stock_status}`,
        `  Existing weak features: ${manual.length ? manual.join(", ") : "None"}`,
      ].join("\n");
    }),
  ].join("\n");
}

function normalizeFeatureMap(value: unknown, expectedPlans: Plan[], product?: Product) {
  const parsed = typeof value === "string" ? parseFeatureJson(value) : value;
  if (!parsed || typeof parsed !== "object" || !("plans" in parsed)) return null;

  const plans = (parsed as { plans?: unknown }).plans;
  if (!plans || typeof plans !== "object") return null;

  const result: PlanFeatureMap = {};
  for (const plan of expectedPlans) {
    const raw = (plans as Record<string, unknown>)[plan.id];
    const features = normalizeFeatureList(raw, product);
    if (features.length === FEATURE_COUNT) result[plan.id] = features;
  }

  return Object.keys(result).length ? result : null;
}

function parseFeatureJson(value: string) {
  const cleaned = value
    .replace(/<think>[\s\S]*?<\/think>/gi, " ")
    .replace(/```(?:json)?|```/gi, "")
    .trim();

  if (containsReasoningArtifact(cleaned)) return null;

  try {
    return JSON.parse(cleaned);
  } catch {
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!objectMatch) return null;

    try {
      return JSON.parse(objectMatch[0]);
    } catch {
      return null;
    }
  }
}

function normalizeFeatureList(value: unknown, product?: Product) {
  if (!Array.isArray(value)) return [];

  return value
    .map((feature) => (typeof feature === "string" ? feature : ""))
    .map((feature) =>
      feature
        .replace(/^[-*]\s+/, "")
        .replace(/^\d+[.)]\s+/, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter((feature) => feature.length >= 8 && feature.length <= 70)
    .filter((feature) => {
      const wordCount = feature.split(/\s+/).filter(Boolean).length;
      return wordCount >= 3 && wordCount <= 8;
    })
    .filter((feature) => !containsReasoningArtifact(feature))
    .filter((feature) => !isWeakGenericFeature(feature))
    .filter((feature) => !containsPriceClaim(feature))
    .filter((feature) => !containsUnsupportedTopUpNumber(feature, product))
    .filter((feature) => !isCategoryMismatch(feature, product))
    .slice(0, FEATURE_COUNT);
}

function buildFallbackPlanFeatures(product: Product, plan: Plan, locale: SiteLocale) {
  if (locale === "hi") {
    if (isTopUpProduct(product)) {
      return [
        `${plan.name} गेम टॉप-अप विकल्प`,
        "WhatsApp पर ऑर्डर की पुष्टि",
        "नेपाल में रिचार्ज सहायता",
      ];
    }

    const isEditing = /edit|capcut/i.test(`${product.name} ${product.category}`);
    return isEditing
      ? [
          plan.duration ? `${plan.duration} क्रिएटिव प्लान` : `${product.name} क्रिएटर प्लान`,
          "WhatsApp पर सेटअप मार्गदर्शन",
          "नेपाल में क्रिएटर सहायता",
        ]
      : [
          plan.duration ? `${plan.duration} देखने का विकल्प` : `${product.name} ${plan.name} विकल्प`,
          "WhatsApp checkout की पुष्टि",
          "नेपाल में नवीनीकरण सहायता",
        ];
  }

  if (locale === "ne") {
    if (isTopUpProduct(product)) {
      return [
        `${plan.name} गेम टप-अप विकल्प`,
        "WhatsApp मा अर्डर पुष्टि",
        "नेपालमा रिचार्ज सहयोग",
      ];
    }

    const isEditing = /edit|capcut/i.test(`${product.name} ${product.category}`);
    return isEditing
      ? [
          plan.duration ? `${plan.duration} क्रिएटिभ प्लान` : `${product.name} क्रिएटर प्लान`,
          "WhatsApp मा सेटअप मार्गदर्शन",
          "नेपालमा क्रिएटर सहयोग",
        ]
      : [
          plan.duration ? `${plan.duration} हेर्ने विकल्प` : `${product.name} ${plan.name} विकल्प`,
          "WhatsApp checkout पुष्टि",
          "नेपालमा नवीकरण सहयोग",
        ];
  }

  if (isTopUpProduct(product)) {
    return [
      `${plan.name} game top-up option`,
      "WhatsApp order confirmation",
      "Nepal recharge support",
    ];
  }

  const isEditing = /edit|capcut/i.test(`${product.name} ${product.category}`);
  if (isEditing) {
    return [
      plan.duration ? `${plan.duration} creative plan` : `${product.name} creator plan`,
      "Setup guidance via WhatsApp",
      "Nepal creator support",
    ];
  }

  return [
    plan.duration ? `${plan.duration} viewing option` : `${product.name} ${plan.name} option`,
    "WhatsApp checkout confirmation",
    "Renewal support in Nepal",
  ];
}

function containsReasoningArtifact(value: string) {
  const lower = value.toLowerCase();
  return [
    "thinking process",
    "okay, let's tackle",
    "let's tackle this",
    "the user wants",
    "key points to include",
    "reasoning",
    "step-by-step",
    "i need to",
    "we need to",
    "final answer",
  ].some((artifact) => lower.includes(artifact));
}

function isCategoryMismatch(feature: string, product?: Product) {
  if (!product) return false;
  const lowerFeature = feature.toLowerCase();
  const lowerCategory = product.category.toLowerCase();
  const lowerName = product.name.toLowerCase();

  if (!lowerCategory.includes("editing") && !lowerName.includes("capcut")) {
    return /\b(edit|editing|editor|creator)\b/.test(lowerFeature);
  }

  if (!lowerCategory.includes("top") && !lowerName.includes("free fire")) {
    return /\b(diamond|diamonds|top[- ]?up|game credit)\b/.test(lowerFeature);
  }

  return false;
}

function isWeakGenericFeature(feature: string) {
  const lower = feature.toLowerCase();
  return [
    "flexible duration",
    "whatsapp confirmation",
    "nepal support",
    "fast activation",
    "renewal assistance",
    "renewal and setup support",
  ].includes(lower);
}

function containsPriceClaim(feature: string) {
  return /\b(?:rs\.?|npr|rupees?)\b|रु/i.test(feature);
}

function containsUnsupportedTopUpNumber(feature: string, product?: Product) {
  if (!product || !isTopUpProduct(product) || !/\d/.test(feature)) return false;
  const knownText = product.plans.map((plan) => `${plan.name} ${plan.duration ?? ""}`).join(" ");
  const numbers = feature.match(/\d+/g) ?? [];
  return numbers.some((number) => !new RegExp(`\\b${number}\\b`).test(knownText));
}

function isTopUpProduct(product: Product) {
  return /top|free fire|diamond|gaming/i.test(`${product.name} ${product.category}`);
}

function parseFallbackModels(value: string | undefined) {
  return (value ?? "openai/gpt-oss-120b,qwen/qwen3-32b,qwen/qwen3.6-27b,llama-3.3-70b-versatile")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);
}
