import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { OFFICIAL_SUPPORT_EMAIL } from "@/lib/contact";
import type { SiteLocale } from "@/lib/locale";

export type LegalPageKey = "privacy" | "terms" | "refund";

type LegalParagraph =
  | { text: string }
  | { emailPrefix: string; emailSuffix: string };

type LegalSection = {
  title: string;
  paragraphs: LegalParagraph[];
};

type LegalPageCopy = {
  eyebrow: string;
  title: string;
  updated: string;
  sections: LegalSection[];
};

const legalPageCopy: Record<LegalPageKey, Record<SiteLocale, LegalPageCopy>> = {
  privacy: {
    en: {
      eyebrow: "Legal",
      title: "Privacy Policy",
      updated: "Last updated: June 2026",
      sections: [
        {
          title: "1. Information We Collect",
          paragraphs: [
            {
              text: "We collect only the information you provide when placing an order or submitting a review: your name, email address, and order details. If you sign in with Google, we receive your name, email, and avatar URL from your Google profile.",
            },
          ],
        },
        {
          title: "2. How We Use Your Information",
          paragraphs: [
            {
              text: "Your information is used solely to process your orders, communicate order status, display your reviews (name and avatar only), and improve our services. We do not sell, rent, or share your personal data with third parties.",
            },
          ],
        },
        {
          title: "3. Data Storage & Security",
          paragraphs: [
            {
              text: "Your data is stored securely in Supabase (PostgreSQL) with encryption in transit and at rest. We implement reasonable security measures to protect your personal information.",
            },
          ],
        },
        {
          title: "4. Third-Party Services",
          paragraphs: [
            {
              text: "We use the following third-party services: Supabase (database & authentication), Upstash Redis (caching), and WhatsApp (order communication). Each service has its own privacy policy governing data handling.",
            },
          ],
        },
        {
          title: "5. Cookies",
          paragraphs: [
            {
              text: "We use essential cookies for authentication (Supabase session) and cart persistence (localStorage). No tracking or advertising cookies are used.",
            },
          ],
        },
        {
          title: "6. Your Rights",
          paragraphs: [
            {
              text: "You may request access to, correction of, or deletion of your personal data at any time by contacting us via WhatsApp or email.",
            },
          ],
        },
        {
          title: "7. Contact",
          paragraphs: [
            {
              emailPrefix: "For privacy-related inquiries, reach out via WhatsApp or email us at",
              emailSuffix: ".",
            },
          ],
        },
        {
          title: "8. Trademark Notice",
          paragraphs: [
            {
              text: "Brand names, logos, and service marks shown on this website belong to their respective owners. We use them only to identify the relevant products or services offered to customers. Their presence does not by itself mean endorsement, sponsorship, or official partnership.",
            },
          ],
        },
      ],
    },
    hi: {
      eyebrow: "कानूनी",
      title: "गोपनीयता नीति",
      updated: "अंतिम बार अपडेट: जून 2026",
      sections: [
        {
          title: "1. हम कौन-सी जानकारी एकत्र करते हैं",
          paragraphs: [
            {
              text: "हम केवल वही जानकारी एकत्र करते हैं जो आप ऑर्डर करते समय या रिव्यू सबमिट करते समय देते हैं: आपका नाम, ईमेल पता और ऑर्डर का विवरण। यदि आप Google से साइन इन करते हैं, तो हमें आपकी Google प्रोफ़ाइल से आपका नाम, ईमेल और अवतार URL मिलता है।",
            },
          ],
        },
        {
          title: "2. हम आपकी जानकारी का उपयोग कैसे करते हैं",
          paragraphs: [
            {
              text: "आपकी जानकारी का उपयोग केवल आपके ऑर्डर प्रोसेस करने, ऑर्डर की स्थिति बताने, आपके रिव्यू दिखाने (केवल नाम और अवतार) और हमारी सेवाओं को बेहतर बनाने के लिए किया जाता है। हम आपका व्यक्तिगत डेटा तीसरे पक्ष को बेचते, किराए पर देते या साझा नहीं करते हैं।",
            },
          ],
        },
        {
          title: "3. डेटा स्टोरेज और सुरक्षा",
          paragraphs: [
            {
              text: "आपका डेटा Supabase (PostgreSQL) में सुरक्षित रूप से संग्रहित किया जाता है और ट्रांज़िट तथा संग्रहण, दोनों अवस्थाओं में एन्क्रिप्ट किया जाता है। हम आपकी व्यक्तिगत जानकारी की सुरक्षा के लिए उचित सुरक्षा उपाय लागू करते हैं।",
            },
          ],
        },
        {
          title: "4. तीसरे पक्ष की सेवाएं",
          paragraphs: [
            {
              text: "हम तीसरे पक्ष की इन सेवाओं का उपयोग करते हैं: Supabase (डेटाबेस और प्रमाणीकरण), Upstash Redis (कैशिंग) और WhatsApp (ऑर्डर संबंधी संचार)। डेटा प्रबंधन के लिए हर सेवा की अपनी गोपनीयता नीति है।",
            },
          ],
        },
        {
          title: "5. कुकीज़",
          paragraphs: [
            {
              text: "हम प्रमाणीकरण (Supabase सत्र) और कार्ट को बनाए रखने (localStorage) के लिए आवश्यक कुकीज़ का उपयोग करते हैं। किसी ट्रैकिंग या विज्ञापन कुकी का उपयोग नहीं किया जाता है।",
            },
          ],
        },
        {
          title: "6. आपके अधिकार",
          paragraphs: [
            {
              text: "आप WhatsApp या ईमेल के जरिए हमसे संपर्क करके किसी भी समय अपने व्यक्तिगत डेटा को देखने, उसमें सुधार कराने या उसे हटाने का अनुरोध कर सकते हैं।",
            },
          ],
        },
        {
          title: "7. संपर्क",
          paragraphs: [
            {
              emailPrefix: "गोपनीयता से जुड़े सवालों के लिए WhatsApp के जरिए संपर्क करें या हमें इस पते पर ईमेल करें:",
              emailSuffix: "।",
            },
          ],
        },
        {
          title: "8. ट्रेडमार्क सूचना",
          paragraphs: [
            {
              text: "इस वेबसाइट पर दिखाए गए ब्रांड नाम, लोगो और सर्विस मार्क उनके संबंधित मालिकों के हैं। हम उनका उपयोग केवल ग्राहकों को दिए जाने वाले संबंधित उत्पादों या सेवाओं की पहचान के लिए करते हैं। उनकी मौजूदगी अपने आप में समर्थन, प्रायोजन या आधिकारिक साझेदारी का संकेत नहीं है।",
            },
          ],
        },
      ],
    },
    ne: {
      eyebrow: "कानुनी",
      title: "गोपनीयता नीति",
      updated: "अन्तिम अद्यावधिक: जुन 2026",
      sections: [
        {
          title: "1. हामीले सङ्कलन गर्ने जानकारी",
          paragraphs: [
            {
              text: "हामी तपाईंले अर्डर गर्दा वा समीक्षा पेस गर्दा उपलब्ध गराउनुभएको जानकारी मात्र सङ्कलन गर्छौं: तपाईंको नाम, इमेल ठेगाना र अर्डर विवरण। तपाईंले Google मार्फत साइन इन गर्नुभयो भने, हामी तपाईंको Google प्रोफाइलबाट तपाईंको नाम, इमेल र अवतार URL प्राप्त गर्छौं।",
            },
          ],
        },
        {
          title: "2. हामी तपाईंको जानकारी कसरी प्रयोग गर्छौं",
          paragraphs: [
            {
              text: "तपाईंको जानकारी तपाईंका अर्डरहरू प्रक्रिया गर्न, अर्डरको स्थिति जानकारी गराउन, तपाईंका समीक्षाहरू (नाम र अवतार मात्र) देखाउन र हाम्रा सेवाहरू सुधार गर्न मात्र प्रयोग गरिन्छ। हामी तपाईंको व्यक्तिगत डेटा तेस्रो पक्षलाई बेच्दैनौँ, भाडामा दिँदैनौँ वा साझा गर्दैनौँ।",
            },
          ],
        },
        {
          title: "3. डेटा भण्डारण र सुरक्षा",
          paragraphs: [
            {
              text: "तपाईंको डेटा Supabase (PostgreSQL) मा सुरक्षित रूपमा भण्डारण गरिन्छ र प्रसारण तथा भण्डारण, दुवै अवस्थामा इन्क्रिप्ट गरिन्छ। हामी तपाईंको व्यक्तिगत जानकारी सुरक्षित गर्न उचित सुरक्षा उपायहरू लागू गर्छौं।",
            },
          ],
        },
        {
          title: "4. तेस्रो-पक्ष सेवाहरू",
          paragraphs: [
            {
              text: "हामी यी तेस्रो-पक्ष सेवाहरू प्रयोग गर्छौं: Supabase (डेटाबेस र प्रमाणीकरण), Upstash Redis (क्यासिङ) र WhatsApp (अर्डरसम्बन्धी सञ्चार)। डेटा व्यवस्थापनका लागि प्रत्येक सेवाको आफ्नै गोपनीयता नीति हुन्छ।",
            },
          ],
        },
        {
          title: "5. कुकीहरू",
          paragraphs: [
            {
              text: "हामी प्रमाणीकरण (Supabase सत्र) र कार्ट कायम राख्न (localStorage) आवश्यक कुकीहरू प्रयोग गर्छौं। ट्र्याकिङ वा विज्ञापनका कुकीहरू प्रयोग गरिँदैनन्।",
            },
          ],
        },
        {
          title: "6. तपाईंका अधिकारहरू",
          paragraphs: [
            {
              text: "तपाईं WhatsApp वा इमेलमार्फत हामीलाई सम्पर्क गरेर जुनसुकै बेला आफ्नो व्यक्तिगत डेटा हेर्न, सच्याउन वा मेटाउन अनुरोध गर्न सक्नुहुन्छ।",
            },
          ],
        },
        {
          title: "7. सम्पर्क",
          paragraphs: [
            {
              emailPrefix: "गोपनीयतासम्बन्धी जिज्ञासाका लागि WhatsApp मार्फत सम्पर्क गर्नुहोस् वा हामीलाई यस ठेगानामा इमेल गर्नुहोस्:",
              emailSuffix: "।",
            },
          ],
        },
        {
          title: "8. ट्रेडमार्क सूचना",
          paragraphs: [
            {
              text: "यस वेबसाइटमा देखाइएका ब्रान्डका नाम, लोगो र सेवा चिह्न तिनका सम्बन्धित मालिकका हुन्। हामी तिनलाई ग्राहकहरूलाई उपलब्ध गराइने सम्बन्धित उत्पादन वा सेवा पहिचान गर्न मात्र प्रयोग गर्छौं। तिनको उपस्थिति आफैँमा समर्थन, प्रायोजन वा आधिकारिक साझेदारीको अर्थ हुँदैन।",
            },
          ],
        },
      ],
    },
  },
  terms: {
    en: {
      eyebrow: "Legal",
      title: "Terms and Conditions",
      updated: "Last updated: June 2026",
      sections: [
        {
          title: "1. Service Scope",
          paragraphs: [
            {
              text: "Ott Subscription Nepal provides subscription activation, renewal assistance, and digital service support. Availability, pricing, and delivery times may change without notice.",
            },
          ],
        },
        {
          title: "2. Orders and Activation",
          paragraphs: [
            {
              text: "Orders are confirmed after payment verification. Activation times are estimates only, and some services may take longer depending on provider requirements or stock availability.",
            },
          ],
        },
        {
          title: "3. Refunds and Cancellations",
          paragraphs: [
            {
              text: "Because digital subscriptions are usually delivered quickly and may be consumed immediately, refunds are not guaranteed. We review refund or replacement requests case by case when there is a verified delivery problem, activation issue, or service mismatch.",
            },
          ],
        },
        {
          title: "4. Customer Responsibility",
          paragraphs: [
            {
              text: "You are responsible for providing correct order details and following any setup instructions we share. We are not responsible for issues caused by incorrect account details, device restrictions, third-party platform policy changes, or misuse of the service after delivery.",
            },
          ],
        },
        {
          title: "5. Brand Names, Logos, and Trademarks",
          paragraphs: [
            {
              text: "Names, logos, icons, and trademarks for services such as Netflix, Prime Video, Spotify, YouTube Premium, and similar brands remain the property of their respective owners. They are used on this website only to identify the relevant subscription or service.",
            },
            {
              text: "Unless explicitly stated, Ott Subscription Nepal is not affiliated with, endorsed by, sponsored by, or an official partner of those trademark owners. If any rights holder requests a correction, attribution change, or removal, we may update or remove the relevant branding content.",
            },
          ],
        },
        {
          title: "6. Website Content",
          paragraphs: [
            {
              text: "We may update product details, pricing, artwork, legal text, and availability at any time. Information on the site is provided for general commercial and informational use and may contain occasional errors or temporary inaccuracies.",
            },
          ],
        },
        {
          title: "7. Limitation of Liability",
          paragraphs: [
            {
              text: "To the maximum extent permitted by applicable law, our liability is limited to the amount paid for the affected order. We are not liable for indirect, incidental, platform-side, or consequential losses arising from third-party service interruptions or policy changes.",
            },
          ],
        },
        {
          title: "8. Contact",
          paragraphs: [
            {
              emailPrefix: "For order or legal inquiries, contact us via WhatsApp or email at",
              emailSuffix: ".",
            },
          ],
        },
      ],
    },
    hi: {
      eyebrow: "कानूनी",
      title: "नियम और शर्तें",
      updated: "अंतिम बार अपडेट: जून 2026",
      sections: [
        {
          title: "1. सेवा का दायरा",
          paragraphs: [
            {
              text: "Ott Subscription Nepal सब्सक्रिप्शन सक्रिय करने, नवीनीकरण में सहायता और डिजिटल सेवा सहायता प्रदान करता है। उपलब्धता, मूल्य और डिलीवरी का समय बिना सूचना बदल सकता है।",
            },
          ],
        },
        {
          title: "2. ऑर्डर और सक्रियण",
          paragraphs: [
            {
              text: "भुगतान का सत्यापन होने के बाद ऑर्डर की पुष्टि की जाती है। सक्रियण का बताया गया समय केवल अनुमान है और सेवा प्रदाता की आवश्यकताओं या स्टॉक की उपलब्धता के आधार पर कुछ सेवाओं में अधिक समय लग सकता है।",
            },
          ],
        },
        {
          title: "3. रिफंड और रद्दीकरण",
          paragraphs: [
            {
              text: "डिजिटल सब्सक्रिप्शन आम तौर पर जल्दी डिलीवर किए जाते हैं और उनका तुरंत उपयोग किया जा सकता है, इसलिए रिफंड की गारंटी नहीं है। डिलीवरी की सत्यापित समस्या, सक्रियण की समस्या या सेवा में असंगति होने पर हम रिफंड या रिप्लेसमेंट के अनुरोधों की हर मामले के आधार पर समीक्षा करते हैं।",
            },
          ],
        },
        {
          title: "4. ग्राहक की जिम्मेदारी",
          paragraphs: [
            {
              text: "ऑर्डर का सही विवरण देना और हमारे द्वारा साझा किए गए सेटअप निर्देशों का पालन करना आपकी जिम्मेदारी है। खाते का गलत विवरण, डिवाइस की पाबंदियां, तीसरे पक्ष के प्लेटफ़ॉर्म की नीति में बदलाव या डिलीवरी के बाद सेवा के गलत उपयोग से होने वाली समस्याओं के लिए हम जिम्मेदार नहीं हैं।",
            },
          ],
        },
        {
          title: "5. ब्रांड नाम, लोगो और ट्रेडमार्क",
          paragraphs: [
            {
              text: "Netflix, Prime Video, Spotify, YouTube Premium और इसी तरह के ब्रांड की सेवाओं के नाम, लोगो, आइकन और ट्रेडमार्क उनके संबंधित मालिकों की संपत्ति हैं। इस वेबसाइट पर उनका उपयोग केवल संबंधित सब्सक्रिप्शन या सेवा की पहचान के लिए किया जाता है।",
            },
            {
              text: "जब तक साफ तौर पर न कहा गया हो, Ott Subscription Nepal उन ट्रेडमार्क मालिकों से संबद्ध नहीं है, उनके द्वारा समर्थित या प्रायोजित नहीं है और उनका आधिकारिक साझेदार नहीं है। यदि कोई अधिकार धारक सुधार, श्रेय में बदलाव या सामग्री हटाने का अनुरोध करता है, तो हम संबंधित ब्रांडिंग सामग्री को अपडेट कर सकते हैं या हटा सकते हैं।",
            },
          ],
        },
        {
          title: "6. वेबसाइट की सामग्री",
          paragraphs: [
            {
              text: "हम किसी भी समय उत्पाद का विवरण, मूल्य, कलाकृति, कानूनी पाठ और उपलब्धता अपडेट कर सकते हैं। साइट पर जानकारी सामान्य व्यावसायिक और सूचनात्मक उपयोग के लिए दी जाती है और उसमें कभी-कभी गलतियां या अस्थायी अशुद्धियां हो सकती हैं।",
            },
          ],
        },
        {
          title: "7. दायित्व की सीमा",
          paragraphs: [
            {
              text: "लागू कानून द्वारा अनुमत अधिकतम सीमा तक, हमारा दायित्व प्रभावित ऑर्डर के लिए भुगतान की गई राशि तक सीमित है। तीसरे पक्ष की सेवा में रुकावट या नीति में बदलाव से होने वाली अप्रत्यक्ष, आकस्मिक, प्लेटफ़ॉर्म-पक्षीय या परिणामी हानियों के लिए हम उत्तरदायी नहीं हैं।",
            },
          ],
        },
        {
          title: "8. संपर्क",
          paragraphs: [
            {
              emailPrefix: "ऑर्डर या कानूनी सवालों के लिए WhatsApp के जरिए हमसे संपर्क करें या इस पते पर ईमेल करें:",
              emailSuffix: "।",
            },
          ],
        },
      ],
    },
    ne: {
      eyebrow: "कानुनी",
      title: "नियम तथा सर्तहरू",
      updated: "अन्तिम अद्यावधिक: जुन 2026",
      sections: [
        {
          title: "1. सेवाको दायरा",
          paragraphs: [
            {
              text: "Ott Subscription Nepal ले सदस्यता सक्रिय गर्ने, नवीकरणमा सहायता र डिजिटल सेवा सहायता प्रदान गर्छ। उपलब्धता, मूल्य र डेलिभरी समय पूर्वसूचनाविना परिवर्तन हुन सक्छ।",
            },
          ],
        },
        {
          title: "2. अर्डर र सक्रियता",
          paragraphs: [
            {
              text: "भुक्तानी प्रमाणीकरण भएपछि अर्डर पुष्टि गरिन्छ। सक्रियताका समयहरू अनुमान मात्र हुन् र सेवा प्रदायकका आवश्यकताहरू वा स्टक उपलब्धताका आधारमा केही सेवामा बढी समय लाग्न सक्छ।",
            },
          ],
        },
        {
          title: "3. रिफन्ड र रद्दीकरण",
          paragraphs: [
            {
              text: "डिजिटल सदस्यताहरू सामान्यतया छिट्टै डेलिभर गरिन्छन् र तुरुन्तै प्रयोग हुन सक्छन्, त्यसैले रिफन्डको ग्यारेन्टी हुँदैन। डेलिभरीको प्रमाणित समस्या, सक्रियताको समस्या वा सेवामा बेमेल हुँदा हामी रिफन्ड वा प्रतिस्थापन अनुरोधलाई प्रत्येक मामिलाका आधारमा समीक्षा गर्छौं।",
            },
          ],
        },
        {
          title: "4. ग्राहकको जिम्मेवारी",
          paragraphs: [
            {
              text: "अर्डरको सही विवरण उपलब्ध गराउनु र हामीले साझा गरेका सेटअप निर्देशनहरू पालना गर्नु तपाईंको जिम्मेवारी हो। खाताको गलत विवरण, उपकरणका प्रतिबन्ध, तेस्रो-पक्ष प्लेटफर्मको नीतिमा परिवर्तन वा डेलिभरीपछि सेवाको दुरुपयोगका कारण भएका समस्याका लागि हामी जिम्मेवार हुँदैनौँ।",
            },
          ],
        },
        {
          title: "5. ब्रान्डका नाम, लोगो र ट्रेडमार्क",
          paragraphs: [
            {
              text: "Netflix, Prime Video, Spotify, YouTube Premium र यस्तै ब्रान्डका सेवाका नाम, लोगो, आइकन र ट्रेडमार्क तिनका सम्बन्धित मालिकको सम्पत्ति हुन्। यस वेबसाइटमा तिनको प्रयोग सम्बन्धित सदस्यता वा सेवा पहिचान गर्न मात्र गरिन्छ।",
            },
            {
              text: "स्पष्ट रूपमा उल्लेख नगरिएसम्म, Ott Subscription Nepal ती ट्रेडमार्क मालिकहरूसँग आबद्ध छैन, उनीहरूबाट समर्थित वा प्रायोजित छैन र उनीहरूको आधिकारिक साझेदार होइन। कुनै अधिकारधारकले सुधार, श्रेयमा परिवर्तन वा सामग्री हटाउन अनुरोध गरेमा हामी सम्बन्धित ब्रान्डिङ सामग्री अद्यावधिक गर्न वा हटाउन सक्छौँ।",
            },
          ],
        },
        {
          title: "6. वेबसाइटको सामग्री",
          paragraphs: [
            {
              text: "हामी जुनसुकै बेला उत्पादन विवरण, मूल्य, कलाकृति, कानुनी पाठ र उपलब्धता अद्यावधिक गर्न सक्छौँ। साइटको जानकारी सामान्य व्यावसायिक र सूचनामूलक प्रयोगका लागि उपलब्ध गराइएको हो र त्यसमा कहिलेकाहीँ त्रुटि वा अस्थायी अशुद्धता हुन सक्छ।",
            },
          ],
        },
        {
          title: "7. दायित्वको सीमा",
          paragraphs: [
            {
              text: "लागू कानुनले अनुमति दिएको अधिकतम हदसम्म, हाम्रो दायित्व प्रभावित अर्डरका लागि तिरिएको रकममा सीमित हुन्छ। तेस्रो-पक्ष सेवाको अवरोध वा नीतिमा परिवर्तनबाट उत्पन्न अप्रत्यक्ष, आकस्मिक, प्लेटफर्मतर्फका वा परिणामी नोक्सानीका लागि हामी जिम्मेवार हुँदैनौँ।",
            },
          ],
        },
        {
          title: "8. सम्पर्क",
          paragraphs: [
            {
              emailPrefix: "अर्डर वा कानुनी जिज्ञासाका लागि WhatsApp मार्फत हामीलाई सम्पर्क गर्नुहोस् वा यस ठेगानामा इमेल गर्नुहोस्:",
              emailSuffix: "।",
            },
          ],
        },
      ],
    },
  },
  refund: {
    en: {
      eyebrow: "Legal",
      title: "Refund and Replacement Policy",
      updated: "Last updated: June 2026",
      sections: [
        {
          title: "1. Digital Service Nature",
          paragraphs: [
            {
              text: "Most of our products are digital subscriptions or activation services. Because delivery can happen quickly and access may begin immediately, refunds are not automatic after purchase.",
            },
          ],
        },
        {
          title: "2. When We Review Refund or Replacement Requests",
          paragraphs: [
            {
              text: "We review requests case by case when there is a verified activation problem, service mismatch, duplicate charge, or delivery issue caused on our side. Depending on the situation, we may provide support, replacement, store credit, or a refund.",
            },
          ],
        },
        {
          title: "3. Situations Usually Not Eligible",
          paragraphs: [
            {
              text: "Refunds or replacements are usually not available for customer mistakes, change of mind after delivery, unsupported device limitations, third-party platform policy changes, or misuse of an account after access has already been provided.",
            },
          ],
        },
        {
          title: "4. Shared and Private Access",
          paragraphs: [
            {
              text: "Some plans may be shared while others may be private. Customers should review the listed plan features and ask for confirmation on WhatsApp before payment if account type matters for the order.",
            },
          ],
        },
        {
          title: "5. How To Request Help",
          paragraphs: [
            {
              text: "If there is a problem, contact us as soon as possible with your order details, the affected service, and a clear explanation of the issue. Faster reporting helps us verify and resolve the case more easily.",
            },
          ],
        },
        {
          title: "6. Resolution Timing",
          paragraphs: [
            {
              text: "We aim to review valid cases quickly during support hours. Resolution time can vary depending on the provider, order status, and the information available for verification.",
            },
          ],
        },
        {
          title: "7. Contact",
          paragraphs: [
            {
              emailPrefix: "For refund, replacement, or order-related questions, contact us via WhatsApp or email at",
              emailSuffix: ".",
            },
          ],
        },
      ],
    },
    hi: {
      eyebrow: "कानूनी",
      title: "रिफंड और रिप्लेसमेंट नीति",
      updated: "अंतिम बार अपडेट: जून 2026",
      sections: [
        {
          title: "1. डिजिटल सेवा की प्रकृति",
          paragraphs: [
            {
              text: "हमारे अधिकांश उत्पाद डिजिटल सब्सक्रिप्शन या सक्रियण सेवाएं हैं। डिलीवरी जल्दी हो सकती है और एक्सेस तुरंत शुरू हो सकता है, इसलिए खरीद के बाद रिफंड अपने आप नहीं मिलता है।",
            },
          ],
        },
        {
          title: "2. हम रिफंड या रिप्लेसमेंट अनुरोधों की समीक्षा कब करते हैं",
          paragraphs: [
            {
              text: "सक्रियण की सत्यापित समस्या, सेवा में असंगति, दोहरा शुल्क या हमारी तरफ से हुई डिलीवरी की समस्या होने पर हम हर अनुरोध की अलग-अलग समीक्षा करते हैं। स्थिति के अनुसार हम सहायता, रिप्लेसमेंट, स्टोर क्रेडिट या रिफंड दे सकते हैं।",
            },
          ],
        },
        {
          title: "3. आम तौर पर पात्र नहीं होने वाली स्थितियां",
          paragraphs: [
            {
              text: "ग्राहक की गलती, डिलीवरी के बाद मन बदलने, असमर्थित डिवाइस की सीमाओं, तीसरे पक्ष के प्लेटफ़ॉर्म की नीति में बदलाव या एक्सेस दिए जाने के बाद खाते के गलत उपयोग के लिए आम तौर पर रिफंड या रिप्लेसमेंट उपलब्ध नहीं होता है।",
            },
          ],
        },
        {
          title: "4. साझा और निजी एक्सेस",
          paragraphs: [
            {
              text: "कुछ प्लान साझा हो सकते हैं, जबकि कुछ निजी हो सकते हैं। यदि ऑर्डर के लिए खाते का प्रकार महत्वपूर्ण है, तो ग्राहकों को सूचीबद्ध प्लान की विशेषताएं देखनी चाहिए और भुगतान से पहले WhatsApp पर पुष्टि मांगनी चाहिए।",
            },
          ],
        },
        {
          title: "5. सहायता का अनुरोध कैसे करें",
          paragraphs: [
            {
              text: "कोई समस्या होने पर अपने ऑर्डर का विवरण, प्रभावित सेवा और समस्या की स्पष्ट जानकारी के साथ जल्द से जल्द हमसे संपर्क करें। जल्दी सूचना देने से हमें मामले का सत्यापन और समाधान अधिक आसानी से करने में मदद मिलती है।",
            },
          ],
        },
        {
          title: "6. समाधान का समय",
          paragraphs: [
            {
              text: "हम सहायता के समय के दौरान वैध मामलों की जल्दी समीक्षा करने का प्रयास करते हैं। समाधान का समय सेवा प्रदाता, ऑर्डर की स्थिति और सत्यापन के लिए उपलब्ध जानकारी के आधार पर अलग हो सकता है।",
            },
          ],
        },
        {
          title: "7. संपर्क",
          paragraphs: [
            {
              emailPrefix: "रिफंड, रिप्लेसमेंट या ऑर्डर से जुड़े सवालों के लिए WhatsApp के जरिए हमसे संपर्क करें या इस पते पर ईमेल करें:",
              emailSuffix: "।",
            },
          ],
        },
      ],
    },
    ne: {
      eyebrow: "कानुनी",
      title: "रिफन्ड र प्रतिस्थापन नीति",
      updated: "अन्तिम अद्यावधिक: जुन 2026",
      sections: [
        {
          title: "1. डिजिटल सेवाको प्रकृति",
          paragraphs: [
            {
              text: "हाम्रा अधिकांश उत्पादन डिजिटल सदस्यता वा सक्रियता सेवा हुन्। डेलिभरी छिटो हुन सक्छ र पहुँच तुरुन्तै सुरु हुन सक्छ, त्यसैले खरिदपछि रिफन्ड स्वतः हुँदैन।",
            },
          ],
        },
        {
          title: "2. हामी रिफन्ड वा प्रतिस्थापन अनुरोधको समीक्षा कहिले गर्छौं",
          paragraphs: [
            {
              text: "सक्रियतामा प्रमाणित समस्या, सेवामा बेमेल, दोहोरो शुल्क वा हाम्रोतर्फबाट भएको डेलिभरी समस्या हुँदा हामी प्रत्येक अनुरोधलाई मामिलाका आधारमा समीक्षा गर्छौं। परिस्थितिअनुसार हामी सहायता, प्रतिस्थापन, स्टोर क्रेडिट वा रिफन्ड दिन सक्छौँ।",
            },
          ],
        },
        {
          title: "3. सामान्यतया योग्य नहुने अवस्थाहरू",
          paragraphs: [
            {
              text: "ग्राहकको गल्ती, डेलिभरीपछि मन परिवर्तन, समर्थन नभएका उपकरणका सीमाहरू, तेस्रो-पक्ष प्लेटफर्मको नीतिमा परिवर्तन वा पहुँच दिइसकेपछि खाताको दुरुपयोगका लागि सामान्यतया रिफन्ड वा प्रतिस्थापन उपलब्ध हुँदैन।",
            },
          ],
        },
        {
          title: "4. साझा र निजी पहुँच",
          paragraphs: [
            {
              text: "केही प्लान साझा हुन सक्छन् भने अरू निजी हुन सक्छन्। अर्डरका लागि खाताको प्रकार महत्त्वपूर्ण भए ग्राहकहरूले सूचीबद्ध प्लानका विशेषताहरू हेर्नुपर्छ र भुक्तानीअघि WhatsApp मा पुष्टि माग्नुपर्छ।",
            },
          ],
        },
        {
          title: "5. सहायता कसरी अनुरोध गर्ने",
          paragraphs: [
            {
              text: "समस्या भएमा आफ्नो अर्डर विवरण, प्रभावित सेवा र समस्याको स्पष्ट व्याख्यासहित सकेसम्म चाँडो हामीलाई सम्पर्क गर्नुहोस्। छिटो जानकारी दिँदा हामीलाई मामिला अझ सजिलै प्रमाणित र समाधान गर्न मद्दत हुन्छ।",
            },
          ],
        },
        {
          title: "6. समाधानको समय",
          paragraphs: [
            {
              text: "हामी सहायता उपलब्ध हुने समयमा मान्य मामिलाहरूको छिटो समीक्षा गर्ने लक्ष्य राख्छौं। समाधानको समय सेवा प्रदायक, अर्डरको स्थिति र प्रमाणीकरणका लागि उपलब्ध जानकारीका आधारमा फरक हुन सक्छ।",
            },
          ],
        },
        {
          title: "7. सम्पर्क",
          paragraphs: [
            {
              emailPrefix: "रिफन्ड, प्रतिस्थापन वा अर्डरसम्बन्धी प्रश्नका लागि WhatsApp मार्फत हामीलाई सम्पर्क गर्नुहोस् वा यस ठेगानामा इमेल गर्नुहोस्:",
              emailSuffix: "।",
            },
          ],
        },
      ],
    },
  },
};

export function LegalPage({
  page,
  locale,
}: {
  page: LegalPageKey;
  locale: SiteLocale;
}) {
  const copy = legalPageCopy[page][locale];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-16">
        <p className="text-xs font-bold uppercase tracking-wide text-[#159FD3]">{copy.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black">{copy.title}</h1>
        <p className="mt-1 text-sm text-[#555]">{copy.updated}</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#555]">
          {copy.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold text-[#111]">{section.title}</h2>
              {section.paragraphs.map((paragraph, index) => (
                <p className="mt-2" key={index}>
                  {"text" in paragraph ? (
                    paragraph.text
                  ) : (
                    <>
                      {paragraph.emailPrefix}{" "}
                      <a
                        href={`mailto:${OFFICIAL_SUPPORT_EMAIL}`}
                        className="text-[#159FD3] hover:underline"
                      >
                        {OFFICIAL_SUPPORT_EMAIL}
                      </a>
                      {paragraph.emailSuffix}
                    </>
                  )}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
