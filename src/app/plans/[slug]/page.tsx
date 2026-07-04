import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { LocaleLink } from "@/components/site/locale-link";
import { ProductArt } from "@/components/site/product-art";
import { ProductPlanCheckout } from "@/components/site/product-plan-checkout";
import { getProductBySlug } from "@/lib/data/products";
import { getAiPlanFeatures } from "@/lib/ai/plan-features";
import { getProductPageIntroLines, getProductSeoDescription } from "@/lib/ai/product-seo";
import { localizePath } from "@/lib/locale";
import { buildProductMetadata, normalizeSiteLocale } from "@/lib/seo";
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
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const pathname = localizePath(`/plans/${product.slug}`, locale);
  const { getApprovedReviewsForProduct } = await import("@/lib/data/reviews");
  const [reviews, seoDescription, pageIntroLines, planFeatures] = await Promise.all([
    getApprovedReviewsForProduct(product.id),
    getProductSeoDescription(product, locale),
    getProductPageIntroLines(product, locale),
    getAiPlanFeatures(product, locale),
  ]);
  const pageTitle = `${product.name} Plans in Nepal`;
  const startingPlan = getStartingPlan(product);
  const startingPrice = startingPlan ? formatPrice(getDisplayPrice(startingPlan)) : "See plans";
  const activePlanCount = product.plans.filter((plan) => plan.is_active).length;
  const faqItems = buildProductFaqItems(product);
  const highlights = [
    { label: "Starting price", value: startingPrice, icon: Sparkles },
    { label: "Active plans", value: `${activePlanCount}`, icon: CheckCircle2 },
    { label: "Checkout", value: "WhatsApp", icon: MessageCircle },
    { label: "Support", value: "Nepal", icon: ShieldCheck },
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
          buildProductFaqSchema(product),
        ]}
      />
      <Header />
      <main className="flex-1">
        <section>
          <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
            <LocaleLink href="/plans" className="text-sm font-bold text-[#0B7FAE]">
              Back to all plans
            </LocaleLink>
            <div className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-stretch">
              <div className="flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-[#0B7FAE] shadow-sm">
                    {product.category}
                  </span>
                  <span className="rounded-full border border-[#159FD3]/20 bg-[#E6F7FD] px-3 py-1 text-xs font-black text-[#0B7FAE]">
                    {product.stock_status}
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
                    <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">Best for</p>
                    <p className="mt-1 font-black text-[#111]">{product.category}</p>
                  </div>
                  <div className="bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">Reviews</p>
                    <p className="mt-1 font-black text-[#111]">{product.rating ?? 4.8}/5</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wide text-[#159FD3]">Choose a plan</p>
            <h2 className="mt-2 text-3xl font-black text-[#111]">Current {product.name} offers</h2>
          </div>
          <ProductPlanCheckout product={product} generatedPlanFeatures={planFeatures} />
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12">
          <div className="rounded-[2rem] border border-[#159FD3]/15 bg-white p-5 shadow-sm md:p-7">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-wide text-[#159FD3]">Need-to-know details</p>
              <h2 className="mt-2 text-2xl font-black text-[#111]">Buying {product.name} in Nepal</h2>
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
      </main>
      <Footer />
    </>
  );
}
