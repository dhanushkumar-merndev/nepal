import type { StockStatus } from "@/lib/types";
import type { SiteLocale } from "@/lib/locale";

type HomeFaqItem = {
  question: string;
  answer: string;
};

type SiteCopy = {
  nav: {
    home: string;
    plans: string;
    reviews: string;
    faq: string;
    contact: string;
    menu: string;
    language: string;
    closeMenu: string;
  };
  hero: {
    badge: string;
    heading: string;
    description: string;
    viewAllPlans: string;
    popularPlans: string;
    trust: string[];
    popularLabel: string;
    available: string;
    soon: string;
  };
  home: {
    popularEyebrow: string;
    popularHeading: string;
  };
  plansPage: {
    eyebrow: string;
    title: string;
    description: string;
    pressService: string;
    categories: {
      all: string;
    };
  };
  reviewsPage: {
    eyebrow: string;
    title: string;
    description: string;
    averageRating: string;
    totalReviews: string;
    showing: string;
    page: string;
    of: string;
    previous: string;
    next: string;
  };
  cartPage: {
    emptyTitle: string;
    emptyDescription: string;
    goBack: string;
    browsePlans: string;
    title: string;
    subtitle: string;
    items: string;
    qty: string;
    each: string;
    subTotal: string;
    clearAll: string;
    orderSummary: string;
    total: string;
    totalHint: string;
    namePlaceholder: string;
    checkoutWhatsapp: string;
    redirectHint: string;
    enterNameError: string;
    signInHint: string;
  };
  faqPage: {
    eyebrow: string;
    title: string;
    description: string;
    items: HomeFaqItem[];
  };
  productUi: {
    viewPlans: string;
    bestSeller: string;
    limited: string;
    from: string;
    save: string;
    plan: string;
    choosePlanAndQuantity: string;
    finalPrice: string;
    add: string;
    addToCart: string;
    addMore: string;
    inCart: string;
    notAvailable: string;
    qty: string;
    areYouSureQty: string;
    yes: string;
    no: string;
  };
  trustSection: {
    title: string;
    description: string;
  };
  reviews: {
    eyebrow: string;
    title: string;
    description: string;
    latestPicks: string;
    viewAll: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    viewAll: string;
    items: HomeFaqItem[];
  };
  footer: {
    brandDescription: string;
    navigate: string;
    connect: string;
    community: string;
    communityDescription: string;
    joinWhatsapp: string;
    communityGroup: string;
    rights: string;
    supportTagline: string;
    links: {
      plans: string;
      services: string;
      reviews: string;
      faq: string;
      contact: string;
      privacy: string;
    };
  };
};

const copy: Record<SiteLocale, SiteCopy> = {
  en: {
    nav: {
      home: "Home",
      plans: "Plans",
      reviews: "Reviews",
      faq: "FAQ",
      contact: "Contact",
      menu: "Menu",
      language: "Language",
      closeMenu: "Close menu",
    },
    hero: {
      badge: "Premium digital services in Nepal",
      heading: "Ott Subscription\nNepal",
      description:
        "Netflix, Spotify, Prime Video, YouTube Premium and more - easy activation, fast support, and simple WhatsApp checkout.",
      viewAllPlans: "View All Plans",
      popularPlans: "Popular OTT Plans",
      trust: ["Fast Activation", "Nepal Support", "Easy Renewal", "Secure Checkout"],
      popularLabel: "Popular",
      available: "Available",
      soon: "Soon",
    },
    home: {
      popularEyebrow: "Popular OTT plans",
      popularHeading: "Popular plans",
    },
    plansPage: {
      eyebrow: "All plans",
      title: "Browse every active OTT and digital service plan",
      description: "Compare prices, offers, stock status, and add plans to cart. Checkout will prepare the full WhatsApp order message automatically.",
      pressService: "Press a service to view plans",
      categories: {
        all: "All",
      },
    },
    reviewsPage: {
      eyebrow: "Website reviews",
      title: "Customer reviews",
      description: "Real reviews from real customers about our OTT and digital services.",
      averageRating: "Average rating",
      totalReviews: "Total reviews",
      showing: "Showing",
      page: "Page",
      of: "of",
      previous: "Previous",
      next: "Next",
    },
    cartPage: {
      emptyTitle: "Your cart is empty",
      emptyDescription: "Add plans from the chat or browse our plans page to get started.",
      goBack: "Go back",
      browsePlans: "Browse plans",
      title: "Checkout",
      subtitle: "Review your items and checkout on WhatsApp.",
      items: "Items",
      qty: "Qty",
      each: "each",
      subTotal: "Sub",
      clearAll: "Clear all items",
      orderSummary: "Order summary",
      total: "Total",
      totalHint: "Including all offers and discounts",
      namePlaceholder: "Your name *",
      checkoutWhatsapp: "Checkout on WhatsApp",
      redirectHint: "You will be redirected to WhatsApp to confirm your order.",
      enterNameError: "Please enter your name.",
      signInHint: "Please sign in with Google to continue checkout.",
    },
    faqPage: {
      eyebrow: "FAQ",
      title: "Frequently asked questions",
      description: "Everything you need to know about Ott Subscription Nepal.",
      items: [
        {
          question: "How do I activate my OTT subscription?",
          answer: "After you complete payment via WhatsApp, we will activate your subscription within 5–30 minutes. You will receive login credentials or setup instructions on WhatsApp.",
        },
        {
          question: "Which payment methods do you accept?",
          answer: "We accept eSewa, Khalti, Bank Transfer, and Manual Confirmation. All payments are coordinated through WhatsApp after you place an order.",
        },
        {
          question: "How does the WhatsApp checkout work?",
          answer: "Add plans to your cart, fill in your name on the checkout page, then click 'Checkout on WhatsApp'. You will be redirected to WhatsApp with a pre-filled order message. We will confirm and activate your plan.",
        },
        {
          question: "Can I get a refund?",
          answer: "Refunds are handled on a case-by-case basis. Please contact us on WhatsApp with your order details and we will assist you.",
        },
        {
          question: "How long does activation take?",
          answer: "Most subscriptions are activated within 5–30 minutes after payment confirmation. Some services may take up to 24 hours depending on the provider.",
        },
        {
          question: "Do you offer customer support?",
          answer: "Yes, you can reach us on WhatsApp for any questions about plans, activation, renewal, payment, or technical issues. Our response time is usually within a few minutes during business hours.",
        },
        {
          question: "Can I change my plan after purchase?",
          answer: "Plan changes depend on the service. Contact us on WhatsApp with your order details and we will check availability.",
        },
      ],
    },
    productUi: {
      viewPlans: "View plans",
      bestSeller: "Best Seller",
      limited: "Limited",
      from: "From",
      save: "Save",
      plan: "Plan",
      choosePlanAndQuantity: "Choose a plan and quantity.",
      finalPrice: "Final price",
      add: "Add",
      addToCart: "Add to cart",
      addMore: "Add more",
      inCart: "In cart",
      notAvailable: "This plan is not available.",
      qty: "Qty",
      areYouSureQty: "Are you sure you need quantity",
      yes: "Yes",
      no: "No",
    },
    trustSection: {
      title: "Secure, simple checkout",
      description:
        "Add your plans to cart, enter your details, and send a ready-made order message for quick confirmation.",
    },
    reviews: {
      eyebrow: "Top reviews",
      title: "Fresh customer reviews",
      description:
        "Recent customer stories and top-rated experiences from people who used our OTT and digital services.",
      latestPicks: "Latest and highest-rated picks",
      viewAll: "View all reviews",
      emptyTitle: "No approved reviews yet.",
      emptyDescription: "Customer highlights will appear here once reviews are available.",
    },
    faq: {
      eyebrow: "Have questions?",
      title: "FAQ",
      viewAll: "View all FAQ",
      items: [
        {
          question: "Are you an official partner?",
          answer:
            "No. All trademarks belong to their owners. We provide subscription activation and digital service support.",
        },
        {
          question: "How fast is activation?",
          answer: "Most available plans are handled quickly through WhatsApp after order confirmation.",
        },
        {
          question: "Can I renew later?",
          answer: "Yes. We support easy renewal assistance for active services.",
        },
      ],
    },
    footer: {
      brandDescription:
        "Premium digital subscription activation and renewal support. Fast WhatsApp checkout.",
      navigate: "Navigate",
      connect: "Connect",
      community: "Community",
      communityDescription: "Join our WhatsApp community for updates and support.",
      joinWhatsapp: "Join WhatsApp",
      communityGroup: "Community group",
      rights: "Ott Subscription Nepal. All rights reserved.",
      supportTagline: "Subscription activation & digital service support",
      links: {
        plans: "Plans",
        services: "Services",
        reviews: "Reviews",
        faq: "FAQ",
        contact: "Contact",
        privacy: "Privacy",
      },
    },
  },
  hi: {
    nav: {
      home: "मुख्य पृष्ठ",
      plans: "योजनाएँ",
      reviews: "समीक्षाएँ",
      faq: "सवाल",
      contact: "संपर्क",
      menu: "मेन्यू",
      language: "भाषा",
      closeMenu: "मेन्यू बंद करें",
    },
    hero: {
      badge: "नेपाल में प्रीमियम डिजिटल सेवाएं",
      heading: "नेपाल में\nप्रीमियम OTT\nसदस्यताएँ",
      description:
        "Netflix, Spotify, Prime Video, YouTube Premium और दूसरी सेवाएं - आसान सक्रियण, तेज सहायता और सरल WhatsApp checkout।",
      viewAllPlans: "सभी योजनाएँ देखें",
      popularPlans: "लोकप्रिय OTT योजनाएँ",
      trust: ["तेज सक्रियण", "नेपाल सहायता", "आसान नवीनीकरण", "सुरक्षित checkout"],
      popularLabel: "लोकप्रिय",
      available: "उपलब्ध",
      soon: "जल्द",
    },
    home: {
      popularEyebrow: "लोकप्रिय OTT योजनाएँ",
      popularHeading: "लोकप्रिय योजनाएँ",
    },
    plansPage: {
      eyebrow: "सभी योजनाएँ",
      title: "हर सक्रिय OTT और डिजिटल सेवा प्लान देखें",
      description: "कीमत, ऑफर और स्टॉक की तुलना करें, फिर योजना कार्ट में जोड़ें। Checkout पूरा WhatsApp order message अपने आप तैयार करेगा।",
      pressService: "प्लान देखने के लिए किसी सेवा पर दबाएं",
      categories: {
        all: "सभी",
      },
    },
    reviewsPage: {
      eyebrow: "वेबसाइट समीक्षाएँ",
      title: "ग्राहक समीक्षाएँ",
      description: "हमारी OTT और डिजिटल सेवाओं पर असली ग्राहकों की असली समीक्षाएँ।",
      averageRating: "औसत रेटिंग",
      totalReviews: "कुल समीक्षाएँ",
      showing: "दिखा रहे हैं",
      page: "पेज",
      of: "में से",
      previous: "पिछला",
      next: "अगला",
    },
    cartPage: {
      emptyTitle: "आपकी कार्ट खाली है",
      emptyDescription: "शुरू करने के लिए चैट से प्लान जोड़ें या हमारी योजनाएँ देखें।",
      goBack: "वापस जाएँ",
      browsePlans: "योजनाएँ देखें",
      title: "Checkout",
      subtitle: "अपने items देखें और WhatsApp पर checkout करें।",
      items: "आइटम",
      qty: "मात्रा",
      each: "प्रति",
      subTotal: "उप-योग",
      clearAll: "सभी items हटाएँ",
      orderSummary: "ऑर्डर सारांश",
      total: "कुल",
      totalHint: "सभी ऑफर और छूट शामिल हैं",
      namePlaceholder: "आपका नाम *",
      checkoutWhatsapp: "WhatsApp पर checkout",
      redirectHint: "ऑर्डर की पुष्टि के लिए आपको WhatsApp पर भेजा जाएगा।",
      enterNameError: "कृपया अपना नाम दर्ज करें।",
      signInHint: "checkout जारी रखने के लिए Google से sign in करें।",
    },
    faqPage: {
      eyebrow: "सवाल",
      title: "अक्सर पूछे जाने वाले सवाल",
      description: "Ott Subscription Nepal के बारे में जानने के लिए जरूरी बातें।",
      items: [
        {
          question: "मैं अपनी OTT subscription कैसे activate करूं?",
          answer: "WhatsApp के जरिए payment पूरा करने के बाद हम 5–30 मिनट के भीतर आपकी subscription activate कर देंगे। Login details या setup instructions WhatsApp पर भेजे जाएंगे।",
        },
        {
          question: "आप कौन-कौन से payment methods लेते हैं?",
          answer: "हम eSewa, Khalti, Bank Transfer और Manual Confirmation स्वीकार करते हैं। सभी payments order के बाद WhatsApp के जरिए coordinate किए जाते हैं।",
        },
        {
          question: "WhatsApp checkout कैसे काम करता है?",
          answer: "प्लान को cart में जोड़ें, checkout page पर अपना नाम भरें, फिर 'Checkout on WhatsApp' पर क्लिक करें। आपको पहले से भरे order message के साथ WhatsApp पर भेज दिया जाएगा।",
        },
        {
          question: "क्या मुझे refund मिल सकता है?",
          answer: "Refund case-by-case आधार पर संभाला जाता है। कृपया अपने order details के साथ WhatsApp पर संपर्क करें।",
        },
        {
          question: "Activation में कितना समय लगता है?",
          answer: "अधिकांश subscriptions payment confirmation के बाद 5–30 मिनट में activate हो जाते हैं। कुछ services provider के अनुसार 24 घंटे तक ले सकती हैं।",
        },
        {
          question: "क्या आप customer support देते हैं?",
          answer: "हाँ, plans, activation, renewal, payment या technical issue के लिए आप WhatsApp पर संपर्क कर सकते हैं। हम आमतौर पर business hours में कुछ ही मिनटों में जवाब देते हैं।",
        },
        {
          question: "क्या purchase के बाद मैं अपना plan बदल सकता हूँ?",
          answer: "Plan change service पर निर्भर करता है। अपने order details के साथ WhatsApp पर संपर्क करें, हम availability check करेंगे।",
        },
      ],
    },
    productUi: {
      viewPlans: "योजना देखें",
      bestSeller: "बेस्ट सेलर",
      limited: "सीमित",
      from: "से शुरू",
      save: "बचत",
      plan: "योजना",
      choosePlanAndQuantity: "योजना और संख्या चुनें।",
      finalPrice: "अंतिम कीमत",
      add: "जोड़ें",
      addToCart: "कार्ट में जोड़ें",
      addMore: "और जोड़ें",
      inCart: "कार्ट में",
      notAvailable: "यह प्लान उपलब्ध नहीं है।",
      qty: "मात्रा",
      areYouSureQty: "क्या आपको सच में यह संख्या चाहिए",
      yes: "हाँ",
      no: "नहीं",
    },
    trustSection: {
      title: "सुरक्षित, आसान checkout",
      description:
        "अपनी योजना कार्ट में जोड़ें, विवरण भरें, और तुरंत पुष्टि के लिए तैयार order message भेजें।",
    },
    reviews: {
      eyebrow: "टॉप समीक्षाएँ",
      title: "नई ग्राहक समीक्षाएँ",
      description:
        "हमारी OTT और डिजिटल सेवाओं का उपयोग करने वाले ग्राहकों के हालिया अनुभव और सबसे पसंद की गई समीक्षाएँ।",
      latestPicks: "नवीनतम और सबसे पसंदीदा चयन",
      viewAll: "सभी समीक्षाएँ देखें",
      emptyTitle: "अभी तक कोई स्वीकृत समीक्षा नहीं है।",
      emptyDescription: "समीक्षाएँ उपलब्ध होते ही ग्राहक हाइलाइट यहाँ दिखेंगी।",
    },
    faq: {
      eyebrow: "कोई सवाल है?",
      title: "सवाल",
      viewAll: "सभी सवाल देखें",
      items: [
        {
          question: "क्या आप आधिकारिक पार्टनर हैं?",
          answer:
            "नहीं। सभी ट्रेडमार्क उनके मालिकों के हैं। हम subscription activation और digital service support प्रदान करते हैं।",
        },
        {
          question: "एक्टिवेशन कितनी जल्दी होता है?",
          answer: "उपलब्ध प्लान आमतौर पर order confirmation के बाद WhatsApp पर जल्दी प्रोसेस होते हैं।",
        },
        {
          question: "क्या मैं बाद में नवीनीकरण कर सकता हूं?",
          answer: "हाँ। हम सक्रिय सेवाओं के लिए आसान नवीनीकरण सहायता देते हैं।",
        },
      ],
    },
    footer: {
      brandDescription:
        "प्रीमियम डिजिटल सदस्यता सक्रियण और नवीनीकरण सहायता। तेज WhatsApp checkout।",
      navigate: "नेविगेशन",
      connect: "जुड़ें",
      community: "कम्युनिटी",
      communityDescription: "अपडेट और सहायता के लिए हमारी WhatsApp community से जुड़ें।",
      joinWhatsapp: "WhatsApp जॉइन करें",
      communityGroup: "कम्युनिटी ग्रुप",
      rights: "Ott Subscription Nepal. सर्वाधिकार सुरक्षित।",
      supportTagline: "सदस्यता सक्रियण और डिजिटल सेवा सहायता",
      links: {
        plans: "योजनाएँ",
        services: "सेवाएं",
        reviews: "समीक्षाएँ",
        faq: "सवाल",
        contact: "संपर्क",
        privacy: "प्राइवेसी",
      },
    },
  },
  ne: {
    nav: {
      home: "होम",
      plans: "प्लान",
      reviews: "रिभ्यु",
      faq: "प्रश्न",
      contact: "सम्पर्क",
      menu: "मेनु",
      language: "भाषा",
      closeMenu: "मेनु बन्द गर्नुहोस्",
    },
    hero: {
      badge: "नेपालमा प्रिमियम डिजिटल सेवा",
      heading: "नेपालमा\nप्रिमियम OTT\nसब्सक्रिप्सन",
      description:
        "Netflix, Spotify, Prime Video, YouTube Premium र अन्य सेवाहरू - सजिलो activation, छिटो support, र सरल WhatsApp checkout।",
      viewAllPlans: "सबै प्लान हेर्नुहोस्",
      popularPlans: "लोकप्रिय OTT प्लान",
      trust: ["छिटो Activation", "नेपाल Support", "सजिलो Renewal", "सुरक्षित Checkout"],
      popularLabel: "लोकप्रिय",
      available: "उपलब्ध",
      soon: "छिट्टै",
    },
    home: {
      popularEyebrow: "लोकप्रिय OTT प्लान",
      popularHeading: "लोकप्रिय प्लान",
    },
    plansPage: {
      eyebrow: "सबै प्लान",
      title: "सबै सक्रिय OTT र डिजिटल सेवा प्लान हेर्नुहोस्",
      description: "मूल्य, अफर र स्टक स्थिति तुलना गर्नुहोस्, अनि प्लान cart मा थप्नुहोस्। Checkout ले पूरा WhatsApp order message आफैं तयार पार्छ।",
      pressService: "प्लान हेर्न सेवा थिच्नुहोस्",
      categories: {
        all: "सबै",
      },
    },
    reviewsPage: {
      eyebrow: "वेबसाइट रिभ्यु",
      title: "ग्राहक रिभ्यु",
      description: "हाम्रा OTT र डिजिटल सेवाबारे वास्तविक ग्राहकका वास्तविक रिभ्युहरू।",
      averageRating: "औसत रेटिङ",
      totalReviews: "कुल रिभ्यु",
      showing: "देखाइँदै",
      page: "पृष्ठ",
      of: "मध्ये",
      previous: "अघिल्लो",
      next: "अर्को",
    },
    cartPage: {
      emptyTitle: "तपाईंको कार्ट खाली छ",
      emptyDescription: "सुरु गर्न च्याटबाट प्लान थप्नुहोस् वा हाम्रा प्लानहरू हेर्नुहोस्।",
      goBack: "फिर्ता जानुहोस्",
      browsePlans: "प्लानहरू हेर्नुहोस्",
      title: "Checkout",
      subtitle: "आफ्ना items हेर्नुहोस् र WhatsApp मा checkout गर्नुहोस्।",
      items: "सामान",
      qty: "संख्या",
      each: "प्रति",
      subTotal: "उप-जम्मा",
      clearAll: "सबै items हटाउनुहोस्",
      orderSummary: "अर्डर सारांश",
      total: "जम्मा",
      totalHint: "सबै अफर र छुट समावेश छन्",
      namePlaceholder: "तपाईंको नाम *",
      checkoutWhatsapp: "WhatsApp मा checkout",
      redirectHint: "अर्डर पुष्टि गर्न तपाईंलाई WhatsApp मा पठाइनेछ।",
      enterNameError: "कृपया आफ्नो नाम लेख्नुहोस्।",
      signInHint: "checkout जारी राख्न Google बाट sign in गर्नुहोस्।",
    },
    faqPage: {
      eyebrow: "प्रश्न",
      title: "धेरै सोधिने प्रश्नहरू",
      description: "Ott Subscription Nepal बारे जान्नुपर्ने आवश्यक जानकारी।",
      items: [
        {
          question: "म मेरो OTT सदस्यता कसरी सक्रिय गर्छु?",
          answer: "WhatsApp मार्फत भुक्तानी पूरा भएपछि हामी 5–30 मिनेटभित्र तपाईंको सदस्यता सक्रिय गर्छौं। लगइन विवरण वा सेटअप निर्देशन WhatsApp मा पठाइनेछ।",
        },
        {
          question: "तपाईंहरू कुन भुक्तानी विधि स्वीकार गर्नुहुन्छ?",
          answer: "हामी eSewa, Khalti, Bank Transfer, र Manual Confirmation स्वीकार गर्छौं। सबै भुक्तानी अर्डरपछि WhatsApp मार्फत समन्वय गरिन्छ।",
        },
        {
          question: "WhatsApp मार्फत अर्डर प्रक्रिया कसरी काम गर्छ?",
          answer: "प्लान कार्टमा थप्नुहोस्, checkout पृष्ठमा आफ्नो नाम भर्नुहोस्, अनि 'Checkout on WhatsApp' थिच्नुहोस्। तपाईंलाई तयार अर्डर सन्देशसहित WhatsApp मा पठाइनेछ।",
        },
        {
          question: "के मैले फिर्ता रकम पाउन सक्छु?",
          answer: "फिर्ता रकम प्रत्येक अवस्थामा छुट्टाछुट्टै हेरिन्छ। कृपया आफ्नो अर्डर विवरणसहित WhatsApp मा सम्पर्क गर्नुहोस्।",
        },
        {
          question: "सक्रिय हुन कति समय लाग्छ?",
          answer: "धेरैजसो सदस्यताहरू भुक्तानी पुष्टि भएपछि 5–30 मिनेटभित्र सक्रिय हुन्छन्। केही सेवामा प्रदायकअनुसार 24 घण्टासम्म लाग्न सक्छ।",
        },
        {
          question: "के तपाईं ग्राहक सहायता दिनुहुन्छ?",
          answer: "हो, प्लान, सक्रियता, नवीकरण, भुक्तानी, वा प्राविधिक समस्याका लागि तपाईं WhatsApp मा सम्पर्क गर्न सक्नुहुन्छ। हामी सामान्यतया कार्यसमयमा केही मिनेटभित्र जवाफ दिन्छौं।",
        },
        {
          question: "खरिदपछि म प्लान परिवर्तन गर्न सक्छु?",
          answer: "प्लान परिवर्तन सेवा अनुसार फरक पर्छ। आफ्नो अर्डर विवरणसहित WhatsApp मा सम्पर्क गर्नुहोस्, हामी उपलब्धता जाँच गर्छौं।",
        },
      ],
    },
    productUi: {
      viewPlans: "प्लान हेर्नुहोस्",
      bestSeller: "बेस्ट सेलर",
      limited: "सीमित",
      from: "सुरु मूल्य",
      save: "बचत",
      plan: "प्लान",
      choosePlanAndQuantity: "प्लान र संख्या छान्नुहोस्।",
      finalPrice: "अन्तिम मूल्य",
      add: "थप्नुहोस्",
      addToCart: "कार्टमा थप्नुहोस्",
      addMore: "थप थप्नुहोस्",
      inCart: "कार्टमा",
      notAvailable: "यो प्लान उपलब्ध छैन।",
      qty: "मात्रा",
      areYouSureQty: "तपाईंलाई यो संख्या साँच्चै चाहिएको हो",
      yes: "हो",
      no: "होइन",
    },
    trustSection: {
      title: "सुरक्षित, सरल checkout",
      description:
        "आफ्नो प्लान कार्टमा थप्नुहोस्, विवरण भर्नुहोस्, र छिटो पुष्टि का लागि तयार अर्डर सन्देश पठाउनुहोस्।",
    },
    reviews: {
      eyebrow: "टप रिभ्यु",
      title: "नयाँ ग्राहक रिभ्यु",
      description:
        "हाम्रा OTT र डिजिटल सेवाहरू प्रयोग गर्ने ग्राहकहरूको हालैका अनुभव र उच्च मूल्याङ्कन भएका रिभ्युहरू।",
      latestPicks: "हालका र उच्च मूल्याङ्कित छनोट",
      viewAll: "सबै रिभ्यु हेर्नुहोस्",
      emptyTitle: "अहिलेसम्म कुनै स्वीकृत रिभ्यु छैन।",
      emptyDescription: "रिभ्यु उपलब्ध भएपछि ग्राहकका मुख्य झलकहरू यहाँ देखिनेछन्।",
    },
    faq: {
      eyebrow: "केही प्रश्न छन्?",
      title: "प्रश्न",
      viewAll: "सबै प्रश्न हेर्नुहोस्",
      items: [
        {
          question: "के तपाईं आधिकारिक साझेदार हुनुहुन्छ?",
          answer:
            "होइन। सबै ट्रेडमार्क तिनका मालिकहरूको हुन्। हामी सदस्यता सक्रियता र डिजिटल सेवा सहायता प्रदान गर्छौं।",
        },
        {
          question: "सक्रियता कति छिटो हुन्छ?",
          answer: "उपलब्ध प्लानहरू अर्डर पुष्टि भएपछि WhatsApp मार्फत छिट्टै प्रक्रिया गरिन्छ।",
        },
        {
          question: "के म पछि नवीकरण गर्न सक्छु?",
          answer: "हो। सक्रिय सेवाहरूका लागि हामी सजिलो नवीकरण सहायता दिन्छौं।",
        },
      ],
    },
    footer: {
      brandDescription:
        "प्रिमियम डिजिटल सदस्यता सक्रियता र नवीकरण सहायता। छिटो WhatsApp मार्फत अर्डर गर्नुहोस्।",
      navigate: "नेभिगेट",
      connect: "जडान",
      community: "कम्युनिटी",
      communityDescription: "अपडेट र सहायता का लागि हाम्रो WhatsApp समुदायमा जोडिनुहोस्।",
      joinWhatsapp: "WhatsApp मा जोडिनुहोस्",
      communityGroup: "समुदाय समूह",
      rights: "Ott Subscription Nepal. सबै अधिकार सुरक्षित।",
      supportTagline: "सदस्यता सक्रियता र डिजिटल सेवा सहायता",
      links: {
        plans: "प्लान",
        services: "सेवाहरू",
        reviews: "रिभ्यु",
        faq: "प्रश्न",
        contact: "सम्पर्क",
        privacy: "प्राइभेसी",
      },
    },
  },
};

export function getSiteCopy(locale: SiteLocale) {
  return copy[locale] ?? copy.en;
}

const stockStatusLabels: Record<SiteLocale, Record<StockStatus, string>> = {
  en: {
    "In Stock": "In Stock",
    "Low Stock": "Low Stock",
    "Out of Stock": "Out of Stock",
    "Coming Soon": "Coming Soon",
  },
  hi: {
    "In Stock": "स्टॉक में",
    "Low Stock": "कम स्टॉक",
    "Out of Stock": "स्टॉक खत्म",
    "Coming Soon": "जल्द आ रहा है",
  },
  ne: {
    "In Stock": "स्टकमा छ",
    "Low Stock": "कम स्टक",
    "Out of Stock": "स्टक सकियो",
    "Coming Soon": "छिट्टै आउँदै",
  },
};

const categoryLabels: Record<SiteLocale, Record<string, string>> = {
  en: {
    "OTT & Streaming": "OTT & Streaming",
  },
  hi: {
    "OTT & Streaming": "OTT और Streaming",
  },
  ne: {
    "OTT & Streaming": "OTT र Streaming",
  },
};

export function translateStockStatus(status: StockStatus, locale: SiteLocale) {
  return stockStatusLabels[locale]?.[status] ?? stockStatusLabels.en[status];
}

export function translateCategory(category: string, locale: SiteLocale) {
  return categoryLabels[locale]?.[category] ?? category;
}
