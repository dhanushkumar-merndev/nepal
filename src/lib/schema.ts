import type { Product, Review } from "@/lib/types";
import { OFFICIAL_SUPPORT_EMAIL } from "@/lib/contact";
import { defaultLocale, getLocaleFromPathname, localizePath, stripLocalePrefix, type SiteLocale } from "@/lib/locale";
import { getSiteCopy } from "@/lib/site-copy";
import { absoluteUrl } from "@/lib/site-url";
import { formatPrice } from "@/lib/utils/format";
import { getDisplayPrice, getStartingPlan } from "@/lib/utils/pricing";

const organizationName = "Ott Subscription Nepal";
const logoUrl = absoluteUrl("/logo.png");
const defaultOgImage = absoluteUrl("/logo.png");
const instagramUrl = "https://www.instagram.com/ottsubscriptionnepal4?igsh=MWJjYzZ6bTR0aGxnMQ==";

export function schemaLocaleFromPath(pathname: string) {
  return getLocaleFromPathname(pathname || "/");
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: organizationName,
    alternateName: [
      "OttSubscriptionNepal",
      "ottsubscriptionnepal.shop",
      "OTT Nepal Subscription",
      "Premium OTT Subscription Nepal",
    ],
    url: absoluteUrl("/"),
    logo: logoUrl,
    image: logoUrl,
    description:
      "Premium OTT Subscription Nepal service for OTT subscriptions, digital service activation, and WhatsApp checkout in Nepal.",
    sameAs: [instagramUrl],
    email: OFFICIAL_SUPPORT_EMAIL,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+9779842901942",
        email: OFFICIAL_SUPPORT_EMAIL,
        contactType: "customer support",
        areaServed: "NP",
        availableLanguage: ["en", "hi", "ne"],
      },
    ],
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: organizationName,
    alternateName: [
      "OttSubscriptionNepal",
      "ottsubscriptionnepal.shop",
      "OTT Nepal Subscription",
      "Premium OTT Subscription Nepal",
    ],
    url: absoluteUrl("/"),
    publisher: { "@id": absoluteUrl("/#organization") },
    inLanguage: ["en", "hi", "ne"],
  };
}

export function buildServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": absoluteUrl("/#service"),
    name: "Premium OTT Subscription Nepal",
    provider: { "@id": absoluteUrl("/#organization") },
    areaServed: {
      "@type": "Country",
      name: "Nepal",
    },
    serviceType: "OTT Nepal subscription activation and digital subscription renewal support",
    availableLanguage: ["en", "hi", "ne"],
    url: absoluteUrl("/plans"),
  };
}

export function buildWebPageSchema({
  pathname,
  title,
  description,
}: {
  pathname: string;
  title: string;
  description: string;
}) {
  const url = absoluteUrl(pathname);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { "@id": absoluteUrl("/#website") },
    about: { "@id": absoluteUrl("/#organization") },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: defaultOgImage,
    },
    inLanguage: schemaLocaleFromPath(pathname),
  };
}

export function buildBreadcrumbSchema(pathname: string) {
  const locale = schemaLocaleFromPath(pathname);
  const publicPathname = stripLocalePrefix(pathname || "/");
  const segments = publicPathname.split("/").filter(Boolean);

  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: locale === defaultLocale ? "Home" : getSiteCopy(locale).nav.home,
      item: absoluteUrl(localizePath("/", locale)),
    },
  ];

  let cumulative = "";
  segments.forEach((segment, index) => {
    cumulative += `/${segment}`;
    items.push({
      "@type": "ListItem",
      position: index + 2,
      name: segmentToLabel(segment),
      item: absoluteUrl(localizePath(cumulative, locale)),
    });
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

export function buildHomeFaqSchema(locale: SiteLocale) {
  const copy = getSiteCopy(locale);
  return buildFaqSchema(copy.faq.items.map((item) => ({ question: item.question, answer: item.answer })));
}

export function buildFaqPageSchema(locale: SiteLocale) {
  const copy = getSiteCopy(locale);
  return buildFaqSchema(copy.faqPage.items.map((item) => ({ question: item.question, answer: item.answer })));
}

export function buildReviewsPageSchema({
  pathname,
  reviews,
}: {
  pathname: string;
  reviews: Review[];
}) {
  const locale = schemaLocaleFromPath(pathname);
  const url = absoluteUrl(pathname);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#reviews`,
    url,
    name: getSiteCopy(locale).reviewsPage.title,
    inLanguage: locale,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: reviews.map((review, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: buildReviewSchema(review),
      })),
    },
  };
}

export function buildProductSchema({
  pathname,
  product,
  reviews = [],
  description,
}: {
  pathname: string;
  product: Product;
  reviews?: Review[];
  description?: string;
}) {
  const url = absoluteUrl(pathname);
  const validOffers = product.plans
    .filter((plan) => plan.is_active)
    .map((plan) => ({
      "@type": "Offer",
      priceCurrency: "NPR",
      price: Number(plan.offer_price ?? plan.real_price),
      availability: stockToAvailability(plan.stock_status),
      url,
      seller: { "@id": absoluteUrl("/#organization") },
      itemCondition: "https://schema.org/NewCondition",
      category: product.category,
      name: `${product.name} ${plan.name}`,
      description: [plan.duration, ...(plan.features ?? [])].filter(Boolean).join(" • ") || product.description || undefined,
    }));

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    image: [product.image_url || defaultOgImage, product.logo_url || defaultOgImage].filter(Boolean),
    description: description || product.description || `${product.name} subscription plans in Nepal.`,
    brand: {
      "@type": "Brand",
      name: product.name,
    },
    category: product.category,
    sku: product.slug,
    url,
    offers: validOffers,
  };

  if ((product.review_count ?? 0) > 0 && product.rating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(product.rating.toFixed(1)),
      reviewCount: product.review_count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (reviews.length) {
    schema.review = reviews.slice(0, 3).map(buildReviewSchema);
  }

  return schema;
}

export function buildProductFaqItems(product: Product, locale: SiteLocale = defaultLocale) {
  const startingPlan = getStartingPlan(product);
  const startingPrice = startingPlan ? formatPrice(getDisplayPrice(startingPlan)) : null;
  const activePlanNames = product.plans
    .filter((plan) => plan.is_active)
    .slice(0, 4)
    .map((plan) => plan.name)
    .join(", ");

  if (locale === "hi") {
    return [
      {
        question: `नेपाल में ${product.name} की कीमत क्या है?`,
        answer: startingPrice
          ? `Ott Subscription Nepal पर ${product.name} के प्लान अभी ${startingPrice} से शुरू होते हैं। कीमत अवधि, ऑफर और उपलब्धता के अनुसार बदल सकती है।`
          : `${product.name} की कीमत चुने गए प्लान और Ott Subscription Nepal पर मौजूदा उपलब्धता पर निर्भर करती है।`,
      },
      {
        question: `${product.name} के कौन से प्लान उपलब्ध हैं?`,
        answer: activePlanNames
          ? `${product.name} के उपलब्ध विकल्पों में ${activePlanNames} शामिल हैं। मौजूदा अवधि, स्टॉक और ऑफर के लिए इस पेज के प्लान कार्ड देखें।`
          : `${product.name} प्लान की उपलब्धता समय के साथ बदलती है। checkout से पहले इस पेज पर सक्रिय विकल्प देखें।`,
      },
      {
        question: `नेपाल में ${product.name} कैसे खरीदें?`,
        answer:
          "प्लान चुनें, जरूरी मात्रा कार्ट में जोड़ें और WhatsApp checkout पर जाएं, ताकि Ott Subscription Nepal सक्रियण और सहायता की जानकारी की पुष्टि कर सके।",
      },
    ];
  }

  if (locale === "ne") {
    return [
      {
        question: `नेपालमा ${product.name} को मूल्य कति छ?`,
        answer: startingPrice
          ? `Ott Subscription Nepal मा ${product.name} का प्लान हाल ${startingPrice} बाट सुरु हुन्छन्। अवधि, अफर र उपलब्धताअनुसार मूल्य फरक हुन सक्छ।`
          : `${product.name} को मूल्य छानिएको प्लान र Ott Subscription Nepal मा हालको उपलब्धतामा निर्भर हुन्छ।`,
      },
      {
        question: `${product.name} का कुन प्लान उपलब्ध छन्?`,
        answer: activePlanNames
          ? `${product.name} का उपलब्ध विकल्पमा ${activePlanNames} समावेश छन्। हालको अवधि, स्टक र अफर हेर्न यस पृष्ठका प्लान कार्ड जाँच गर्नुहोस्।`
          : `${product.name} प्लानको उपलब्धता समयसँगै बदलिन्छ। checkout अघि यस पृष्ठमा सक्रिय विकल्प हेर्नुहोस्।`,
      },
      {
        question: `नेपालमा ${product.name} कसरी किन्ने?`,
        answer:
          "प्लान छान्नुहोस्, आवश्यक संख्या कार्टमा थप्नुहोस् र WhatsApp checkout मा जानुहोस्, ताकि Ott Subscription Nepal ले सक्रियता र सहयोगका विवरण पुष्टि गर्न सकोस्।",
      },
    ];
  }

  return [
    {
      question: `How much does ${product.name} cost in Nepal?`,
      answer: startingPrice
        ? `${product.name} plans currently start from ${startingPrice} on Ott Subscription Nepal. Prices can vary by duration, offer, and availability.`
        : `${product.name} pricing depends on the selected plan and current availability on Ott Subscription Nepal.`,
    },
    {
      question: `Which ${product.name} plans are available?`,
      answer: activePlanNames
        ? `Available ${product.name} options include ${activePlanNames}. Check the plan cards on this page for current duration, stock, and offer details.`
        : `${product.name} plan availability changes over time. Check this page for the latest active options before checkout.`,
    },
    {
      question: `How do I buy ${product.name} in Nepal?`,
      answer:
        "Choose a plan, add the quantity you need, and continue to WhatsApp checkout so Ott Subscription Nepal can confirm activation and support details.",
    },
  ];
}

export function buildProductFaqSchema(product: Product, locale: SiteLocale = defaultLocale) {
  return buildFaqSchema(buildProductFaqItems(product, locale));
}

function buildFaqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function buildReviewSchema(review: Review) {
  return {
    "@type": "Review",
    author: {
      "@type": "Person",
      name: review.customer_name,
    },
    reviewBody: review.comment,
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    itemReviewed: review.product_name
      ? {
          "@type": "Product",
          name: review.product_name,
        }
      : undefined,
    datePublished: review.created_at,
  };
}

function segmentToLabel(segment: string) {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function stockToAvailability(stock: string) {
  switch (stock) {
    case "In Stock":
    case "Low Stock":
      return "https://schema.org/InStock";
    case "Out of Stock":
      return "https://schema.org/OutOfStock";
    default:
      return "https://schema.org/PreOrder";
  }
}
