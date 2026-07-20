import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { LocaleLink } from "@/components/site/locale-link";
import { ProductArt } from "@/components/site/product-art";
import { ProductPlanCheckout } from "@/components/site/product-plan-checkout";
import { getProductBySlug, getProducts } from "@/lib/data/products";
import { getAiPlanFeatures } from "@/lib/ai/plan-features";
import { getProductPageIntroLines, getProductSeoDescription } from "@/lib/ai/product-seo";
import { localizePath, type SiteLocale } from "@/lib/locale";
import { buildProductMetadata, normalizeSiteLocale } from "@/lib/seo";
import { translateCategory, translateStockStatus } from "@/lib/site-copy";
import { buildBreadcrumbSchema, buildProductFaqItems, buildProductFaqSchema, buildProductSchema, buildWebPageSchema } from "@/lib/schema";
import { formatPrice } from "@/lib/utils/format";
import { getDisplayPrice, getStartingPlan } from "@/lib/utils/pricing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale?: string }>;
}): Promise<Metadata> {
  const { slug, locale: routeLocale } = await params;
  const locale = normalizeSiteLocale(routeLocale);
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Plan Not Found",
    };
  }

  const seoDescription = await getProductSeoDescription(product, locale);
  const startingPlan = getStartingPlan(product);

  return buildProductMetadata({
    locale,
    slug: product.slug,
    productName: product.name,
    description: seoDescription,
    category: product.category,
    imageUrl: product.image_url,
    logoUrl: product.logo_url,
    startingPrice: startingPlan ? getDisplayPrice(startingPlan) : null,
    stockStatus: product.stock_status,
  });
}

export default async function ProductPlansPage({
  params,
}: {
  params: Promise<{ slug: string; locale?: string }>;
}) {
  const { slug, locale: routeLocale } = await params;
  const locale = normalizeSiteLocale(routeLocale);
  const products = await getProducts();
  const product = products.find((candidate) => candidate.slug === slug);
  if (!product) notFound();
  const pathname = localizePath(`/plans/${product.slug}`, locale);
  const { getApprovedReviewsForProduct } = await import("@/lib/data/reviews");
  const [reviews, seoDescription, pageIntroLines, planFeatures] = await Promise.all([
    getApprovedReviewsForProduct(product.id),
    getProductSeoDescription(product, locale),
    getProductPageIntroLines(product, locale),
    getAiPlanFeatures(product, locale),
  ]);
  const pageCopy = getProductPageCopy(locale, product.name);
  const pageTitle = pageCopy.title;
  const startingPlan = getStartingPlan(product);
  const startingPrice = startingPlan ? formatPrice(getDisplayPrice(startingPlan)) : pageCopy.seePlans;
  const activePlanCount = product.plans.filter((plan) => plan.is_active).length;
  const faqItems = buildProductFaqItems(product, locale);
  const relatedProducts = [
    ...products.filter((candidate) => candidate.id !== product.id && candidate.category === product.category),
    ...products.filter((candidate) => candidate.id !== product.id && candidate.category !== product.category),
  ].slice(0, 4);
  const highlights = [
    { label: pageCopy.startingPrice, value: startingPrice, icon: Sparkles },
    { label: pageCopy.activePlans, value: `${activePlanCount}`, icon: CheckCircle2 },
    { label: pageCopy.checkout, value: "WhatsApp", icon: MessageCircle },
    { label: pageCopy.support, value: "Nepal", icon: ShieldCheck },
  ];

  return (
    <>
      <JsonLd
        data={[
          buildWebPageSchema({
            pathname,
            title: pageTitle,
            description: seoDescription,
          }),
          buildBreadcrumbSchema(pathname),
          buildProductSchema({ pathname, product, reviews, description: seoDescription }),
          buildProductFaqSchema(product, locale),
        ]}
      />
      <Header />
      <main className="flex-1">
        <section>
          <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
            <LocaleLink href="/plans" className="text-sm font-bold text-[#0B7FAE]">
              {pageCopy.backToPlans}
            </LocaleLink>
            <div className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-stretch">
              <div className="flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-[#0B7FAE] shadow-sm">
                    {translateCategory(product.category, locale)}
                  </span>
                  <span className="rounded-full border border-[#159FD3]/20 bg-[#E6F7FD] px-3 py-1 text-xs font-black text-[#0B7FAE]">
                    {translateStockStatus(product.stock_status, locale)}
                  </span>
                </div>
                <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-[#111] md:text-6xl">
                  {pageTitle}
                </h1>
                <div className="mt-4 max-w-3xl space-y-1.5 text-base leading-7 text-[#4B5563] md:text-lg">
                  {pageIntroLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 lg:max-w-3xl xl:grid-cols-4">
                  {highlights.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                        <Icon className="size-5 text-[#159FD3]" />
                        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#64748B]">{item.label}</p>
                        <p className="mt-1 text-base font-black text-[#111]">{item.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <aside className="overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
                <div className="h-64">
                  <ProductArt name={product.name} imageUrl={product.image_url} logoUrl={product.logo_url} />
                </div>
                <div className="grid grid-cols-2 gap-px bg-[#E2EEF4] text-sm">
                  <div className="bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">{pageCopy.bestFor}</p>
                    <p className="mt-1 font-black text-[#111]">{translateCategory(product.category, locale)}</p>
                  </div>
                  <div className="bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">{pageCopy.reviews}</p>
                    <p className="mt-1 font-black text-[#111]">{product.rating ?? 4.8}/5</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wide text-[#159FD3]">{pageCopy.choosePlan}</p>
            <h2 className="mt-2 text-3xl font-black text-[#111]">{pageCopy.currentOffers}</h2>
          </div>
          <ProductPlanCheckout product={product} generatedPlanFeatures={planFeatures} />
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12">
          <div className="rounded-[2rem] border border-[#159FD3]/15 bg-white p-5 shadow-sm md:p-7">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-wide text-[#159FD3]">{pageCopy.needToKnow}</p>
              <h2 className="mt-2 text-2xl font-black text-[#111]">{pageCopy.buyingInNepal}</h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {faqItems.map((item) => (
                <article key={item.question} className="rounded-2xl border border-black/10 bg-white p-4">
                  <h3 className="text-sm font-black text-[#111]">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#555]">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {relatedProducts.length ? (
          <section aria-labelledby="related-plans-heading" className="mx-auto max-w-7xl px-4 pb-12">
            <div className="rounded-[2rem] border border-black/10 bg-white/80 p-5 shadow-sm md:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-[#159FD3]">{pageCopy.exploreMore}</p>
                  <h2 id="related-plans-heading" className="mt-2 text-2xl font-black text-[#111]">
                    {pageCopy.relatedPlans}
                  </h2>
                </div>
                <LocaleLink href="/plans" className="text-sm font-bold text-[#0B7FAE] hover:text-[#159FD3]">
                  {pageCopy.viewAllPlans}
                </LocaleLink>
              </div>
              <nav aria-label={pageCopy.relatedPlans} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => {
                  const relatedStartingPlan = getStartingPlan(relatedProduct);

                  return (
                    <LocaleLink
                      key={relatedProduct.id}
                      href={`/plans/${relatedProduct.slug}`}
                      className="rounded-2xl border border-black/10 bg-white p-4 transition hover:border-[#159FD3]/30 hover:bg-[#F6FCFF]"
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">{translateCategory(relatedProduct.category, locale)}</p>
                      <h3 className="mt-2 font-black text-[#111]">{relatedProduct.name} {pageCopy.plansLabel}</h3>
                      {relatedStartingPlan ? (
                        <p className="mt-2 text-sm font-bold text-[#0B7FAE]">
                          {pageCopy.from} {formatPrice(getDisplayPrice(relatedStartingPlan))}
                        </p>
                      ) : null}
                    </LocaleLink>
                  );
                })}
              </nav>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}

function getProductPageCopy(locale: SiteLocale, productName: string) {
  if (locale === "hi") {
    return {
      title: `${productName} प्लान नेपाल में`,
      seePlans: "प्लान देखें",
      backToPlans: "सभी प्लान पर वापस जाएं",
      startingPrice: "शुरुआती कीमत",
      activePlans: "सक्रिय प्लान",
      checkout: "चेकआउट",
      support: "सहायता",
      bestFor: "सबसे उपयुक्त",
      reviews: "समीक्षाएं",
      choosePlan: "प्लान चुनें",
      currentOffers: `${productName} के मौजूदा ऑफर`,
      needToKnow: "ज़रूरी जानकारी",
      buyingInNepal: `नेपाल में ${productName} खरीदना`,
      exploreMore: "और विकल्प देखें",
      relatedPlans: "संबंधित सब्सक्रिप्शन प्लान",
      viewAllPlans: "सभी प्लान देखें",
      plansLabel: "प्लान",
      from: "से",
    };
  }

  if (locale === "ne") {
    return {
      title: `${productName} प्लान नेपालमा`,
      seePlans: "प्लान हेर्नुहोस्",
      backToPlans: "सबै प्लानमा फर्कनुहोस्",
      startingPrice: "सुरुआती मूल्य",
      activePlans: "सक्रिय प्लान",
      checkout: "चेकआउट",
      support: "सहयोग",
      bestFor: "उपयुक्त",
      reviews: "रिभ्यु",
      choosePlan: "प्लान छान्नुहोस्",
      currentOffers: `${productName} का हालका अफर`,
      needToKnow: "जान्नुपर्ने विवरण",
      buyingInNepal: `नेपालमा ${productName} किन्दा`,
      exploreMore: "थप विकल्प हेर्नुहोस्",
      relatedPlans: "सम्बन्धित सब्सक्रिप्सन प्लान",
      viewAllPlans: "सबै प्लान हेर्नुहोस्",
      plansLabel: "प्लान",
      from: "देखि",
    };
  }

  return {
    title: `${productName} Plans in Nepal`,
    seePlans: "See plans",
    backToPlans: "Back to all plans",
    startingPrice: "Starting price",
    activePlans: "Active plans",
    checkout: "Checkout",
    support: "Support",
    bestFor: "Best for",
    reviews: "Reviews",
    choosePlan: "Choose a plan",
    currentOffers: `Current ${productName} offers`,
    needToKnow: "Need-to-know details",
    buyingInNepal: `Buying ${productName} in Nepal`,
    exploreMore: "Explore more",
    relatedPlans: "Related subscription plans",
    viewAllPlans: "View all plans",
    plansLabel: "plans",
    from: "From",
  };
}
