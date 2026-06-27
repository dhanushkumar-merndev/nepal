import type { Metadata } from "next";
import { defaultLocale, isSupportedLocale, locales, localizePath, type SiteLocale } from "@/lib/locale";

type StaticPageKey = "home" | "about" | "plans" | "reviews" | "faq" | "privacy" | "terms";

type LocalizedSeoCopy = {
  title: string;
  description: string;
};

const ogLocaleBySiteLocale: Record<SiteLocale, string> = {
  en: "en_US",
  hi: "hi_IN",
  ne: "ne_NP",
};

const staticPageSeo: Record<StaticPageKey, Record<SiteLocale, LocalizedSeoCopy>> = {
  home: {
    en: {
      title: "Premium OTT Subscriptions in Nepal",
      description:
        "Shop Netflix, Spotify, Prime Video, YouTube Premium and more in Nepal with fast activation, real customer reviews, and WhatsApp checkout.",
    },
    hi: {
      title: "नेपाल में प्रीमियम OTT सब्सक्रिप्शन",
      description:
        "नेपाल में Netflix, Spotify, Prime Video, YouTube Premium और अन्य डिजिटल सेवाएं तेज activation, असली reviews और WhatsApp checkout के साथ खरीदें।",
    },
    ne: {
      title: "नेपालमा प्रिमियम OTT सदस्यता",
      description:
        "नेपालमा Netflix, Spotify, Prime Video, YouTube Premium र अन्य डिजिटल सेवाहरू छिटो activation, वास्तविक reviews र WhatsApp checkout सहित किन्नुहोस्।",
    },
  },
  about: {
    en: {
      title: "About Us",
      description:
        "Learn more about Ott Subscription Nepal, our service, customer support, and mission to make digital subscriptions accessible in Nepal.",
    },
    hi: {
      title: "हमारे बारे में",
      description:
        "Ott Subscription Nepal, हमारी सेवा, customer support और नेपाल में digital subscriptions को आसान बनाने के मिशन के बारे में जानें।",
    },
    ne: {
      title: "हाम्रो बारेमा",
      description:
        "Ott Subscription Nepal, हाम्रो सेवा, customer support र नेपालमा digital subscriptions सजिलो बनाउने हाम्रो उद्देश्यबारे जान्नुहोस्।",
    },
  },
  plans: {
    en: {
      title: "OTT Plans and Digital Services",
      description:
        "Browse active OTT and digital service plans in Nepal, compare prices and offers, and checkout through WhatsApp.",
    },
    hi: {
      title: "OTT प्लान और डिजिटल सेवाएं",
      description:
        "नेपाल में उपलब्ध OTT और digital service plans देखें, कीमत और offers compare करें, और WhatsApp के जरिए checkout करें।",
    },
    ne: {
      title: "OTT प्लान र डिजिटल सेवाहरू",
      description:
        "नेपालमा उपलब्ध OTT र digital service plans हेर्नुहोस्, मूल्य र offers तुलना गर्नुहोस्, अनि WhatsApp मार्फत checkout गर्नुहोस्।",
    },
  },
  reviews: {
    en: {
      title: "Customer Reviews",
      description:
        "Read real customer reviews about Ott Subscription Nepal and our OTT and digital service support.",
    },
    hi: {
      title: "ग्राहक रिव्यू",
      description:
        "Ott Subscription Nepal र हाम्रो OTT तथा digital service support बारे वास्तविक ग्राहक reviews पढ्नुहोस्।",
    },
    ne: {
      title: "ग्राहक रिभ्यु",
      description:
        "Ott Subscription Nepal र हाम्रो OTT तथा digital service support बारे वास्तविक ग्राहक रिभ्युहरू पढ्नुहोस्।",
    },
  },
  faq: {
    en: {
      title: "FAQ",
      description:
        "Find answers about activation, renewals, support, and how Ott Subscription Nepal works.",
    },
    hi: {
      title: "अक्सर पूछे जाने वाले सवाल",
      description:
        "Activation, renewal, support और Ott Subscription Nepal कैसे काम करता है, इसके जवाब यहां पाएं।",
    },
    ne: {
      title: "धेरै सोधिने प्रश्नहरू",
      description:
        "Activation, renewal, support र Ott Subscription Nepal कसरी काम गर्छ भन्ने उत्तर यहाँ पाउनुहोस्।",
    },
  },
  privacy: {
    en: {
      title: "Privacy Policy",
      description:
        "Read the privacy policy for Ott Subscription Nepal, including what data we collect and how we use it.",
    },
    hi: {
      title: "प्राइवेसी पॉलिसी",
      description:
        "Ott Subscription Nepal की privacy policy पढ़ें, जिसमें यह बताया गया है कि हम कौन सा data collect करते हैं और उसका कैसे उपयोग करते हैं।",
    },
    ne: {
      title: "गोपनीयता नीति",
      description:
        "Ott Subscription Nepal को गोपनीयता नीति पढ्नुहोस्, जसमा हामीले कुन data सङ्कलन गर्छौं र त्यसलाई कसरी प्रयोग गर्छौं भन्ने विवरण छ।",
    },
  },
  terms: {
    en: {
      title: "Terms and Conditions",
      description:
        "Read the terms and conditions for orders, activation, refunds, trademarks, and website use on Ott Subscription Nepal.",
    },
    hi: {
      title: "नियम और शर्तें",
      description:
        "Ott Subscription Nepal पर orders, activation, refunds, trademarks और website use से जुड़े नियम और शर्तें पढ़ें।",
    },
    ne: {
      title: "नियम तथा सर्तहरू",
      description:
        "Ott Subscription Nepal मा orders, activation, refunds, trademarks र website use सम्बन्धी नियम तथा सर्तहरू पढ्नुहोस्।",
    },
  },
};

const staticPagePaths: Record<StaticPageKey, string> = {
  home: "/",
  about: "/about",
  plans: "/plans",
  reviews: "/reviews",
  faq: "/faq",
  privacy: "/privacy",
  terms: "/terms",
};

export function normalizeSiteLocale(locale?: string): SiteLocale {
  if (locale && isSupportedLocale(locale)) return locale;
  return defaultLocale;
}

export function buildLanguageAlternates(path: string) {
  return Object.fromEntries(
    locales.map((locale) => [locale, localizePath(path, locale)]),
  ) as Record<SiteLocale, string>;
}

export function buildAlternates(path: string, locale: SiteLocale) {
  return {
    canonical: localizePath(path, locale),
    languages: {
      ...buildLanguageAlternates(path),
      "x-default": localizePath(path, defaultLocale),
    },
  } satisfies NonNullable<Metadata["alternates"]>;
}

export function buildStaticPageMetadata(page: StaticPageKey, locale: SiteLocale = defaultLocale): Metadata {
  const copy = staticPageSeo[page][locale];
  const path = staticPagePaths[page];
  const localizedPath = localizePath(path, locale);

  return {
    title: copy.title,
    description: copy.description,
    alternates: buildAlternates(path, locale),
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: localizedPath,
      locale: ogLocaleBySiteLocale[locale],
    },
    twitter: {
      title: copy.title,
      description: copy.description,
    },
  };
}

export function buildProductMetadata({
  locale = defaultLocale,
  slug,
  productName,
  description,
}: {
  locale?: SiteLocale;
  slug: string;
  productName: string;
  description?: string | null;
}): Metadata {
  const resolvedLocale = normalizeSiteLocale(locale);
  const path = `/plans/${slug}`;
  const titleByLocale: Record<SiteLocale, string> = {
    en: `${productName} Plans`,
    hi: `${productName} प्लान`,
    ne: `${productName} प्लानहरू`,
  };
  const fallbackDescriptionByLocale: Record<SiteLocale, string> = {
    en: `View ${productName} plans, pricing, and checkout details on Ott Subscription Nepal.`,
    hi: `Ott Subscription Nepal पर ${productName} के plans, pricing और checkout details देखें।`,
    ne: `Ott Subscription Nepal मा ${productName} का plans, pricing र checkout details हेर्नुहोस्।`,
  };
  const localizedPath = localizePath(path, resolvedLocale);
  const resolvedDescription = description ?? fallbackDescriptionByLocale[resolvedLocale];
  const title = titleByLocale[resolvedLocale];

  return {
    title,
    description: resolvedDescription,
    alternates: buildAlternates(path, resolvedLocale),
    openGraph: {
      title,
      description: resolvedDescription,
      url: localizedPath,
      locale: ogLocaleBySiteLocale[resolvedLocale],
    },
    twitter: {
      title,
      description: resolvedDescription,
    },
  };
}
