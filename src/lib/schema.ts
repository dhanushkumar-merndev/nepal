import type { Product, Review } from "@/lib/types";
import { OFFICIAL_SUPPORT_EMAIL } from "@/lib/contact";
import { defaultLocale, getLocaleFromPathname, localizePath, stripLocalePrefix, type SiteLocale } from "@/lib/locale";
import { getSiteCopy } from "@/lib/site-copy";
import { absoluteUrl } from "@/lib/site-url";

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
    url: absoluteUrl("/"),
    logo: logoUrl,
    image: logoUrl,
    description:
      "Premium OTT subscription activation and digital service support in Nepal with fast WhatsApp checkout.",
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
    name: "OTT subscription activation and digital service support",
    provider: { "@id": absoluteUrl("/#organization") },
    areaServed: {
      "@type": "Country",
      name: "Nepal",
    },
    serviceType: "Digital subscription activation and renewal support",
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
}: {
  pathname: string;
  product: Product;
  reviews?: Review[];
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
    description: product.description || `${product.name} subscription plans in Nepal.`,
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
