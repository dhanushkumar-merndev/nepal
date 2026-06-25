/* eslint-disable @next/next/no-img-element */
"use client";

import type * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { ArrowLeftIcon, ClipboardCopyIcon, ImageIcon, PlusIcon, SaveIcon, SearchIcon, Trash2Icon, UploadIcon, WandSparklesIcon, XIcon } from "lucide-react";
import slugifyPackage from "slugify";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { CustomDropdown } from "@/components/admin/custom-dropdown";
import { ProductPlansPanel } from "@/components/site/product-plans-panel";
import { ServiceCard } from "@/components/site/service-card";
import type { Plan, Product, StockStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils/format";

const stockOptions = ["In Stock", "Low Stock", "Out of Stock", "Coming Soon"];
const BANNER_WIDTH = 1200;
const BANNER_HEIGHT = 720;
const LOGO_FORMAT_REFERENCE_URL = "https://tyesozntactxumlolgwv.supabase.co/storage/v1/object/public/product-images/products/_references/logo-format-reference.svg";
const adminInputClass =
  "h-10 rounded-lg border-white/40 bg-white/20 shadow-sm backdrop-blur-md transition-all placeholder:text-muted-foreground/70 focus:border-[#159FD3]/50 focus:bg-white/30 focus:ring-2 focus:ring-[#159FD3]/20 disabled:bg-white/10 disabled:text-muted-foreground";

type ProductDraft = {
  id?: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  logo_url: string;
  image_url: string;
  stock_status: string;
  is_best_seller: boolean;
  is_limited: boolean;
  is_active: boolean;
};

type PlanDraft = {
  id?: string;
  product_id: string;
  name: string;
  duration: string;
  real_price: string;
  offer_price: string;
  actual_price: string;
  stock_status: string;
  features: string;
  is_active: boolean;
};

const emptyProduct: ProductDraft = {
  name: "",
  slug: "",
  category: "",
  description: "",
  logo_url: "",
  image_url: "",
  stock_status: "In Stock",
  is_best_seller: false,
  is_limited: false,
  is_active: true,
};

function emptyPlan(productId = ""): PlanDraft {
  return {
    product_id: productId,
    name: "",
    duration: "",
    real_price: "",
    offer_price: "",
    actual_price: "",
    stock_status: "In Stock",
    features: "",
    is_active: true,
  };
}

function productToDraft(product: Product): ProductDraft {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    description: product.description ?? "",
    logo_url: product.logo_url ?? "",
    image_url: product.image_url ?? "",
    stock_status: product.stock_status,
    is_best_seller: product.is_best_seller,
    is_limited: Boolean(product.is_limited),
    is_active: product.is_active,
  };
}

function planToDraft(plan: Plan): PlanDraft {
  return {
    id: plan.id,
    product_id: plan.product_id,
    name: plan.name,
    duration: plan.duration ?? "",
    real_price: String(plan.real_price),
    offer_price: plan.offer_price != null ? String(plan.offer_price) : "",
    actual_price: plan.actual_price != null ? String(plan.actual_price) : "",
    stock_status: plan.stock_status,
    features: (plan.features ?? []).join(", "),
    is_active: plan.is_active,
  };
}

function toSlug(value: string) {
  return slugifyPackage(value, { lower: true, strict: true, trim: true });
}

function toPrice(value: string, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function featuresFromDraft(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function getImageDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      const dimensions = { width: image.naturalWidth, height: image.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dimensions);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read image dimensions."));
    };
    image.src = url;
  });
}

function ProductToggleCard({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex min-h-20 items-start justify-between gap-3 rounded-xl border p-3 text-left shadow-sm backdrop-blur-md transition",
        checked
          ? "border-[#159FD3]/45 bg-[#E6F7FD]/70 ring-2 ring-[#159FD3]/15"
          : "border-white/35 bg-white/10 hover:bg-white/25"
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-bold text-[#111]">{label}</span>
        <span className="mt-1 block text-xs leading-4 text-muted-foreground">{description}</span>
      </span>
      <span
        className={cn(
          "mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition",
          checked ? "bg-[#159FD3]" : "bg-black/15"
        )}
      >
        <span className={cn("size-5 rounded-full bg-white shadow-sm transition", checked && "translate-x-5")} />
      </span>
    </button>
  );
}

// ─── Plans Drag-to-Reorder List ───────────────────────────────────────────────
function PlansDragList({
  plans,
  planDraftId,
  isPending,
  productSaved,
  onSelect,
  onRemove,
  onReorder,
}: {
  plans: Plan[];
  planDraftId?: string;
  isPending: boolean;
  productSaved: boolean;
  onSelect: (plan: Plan) => void;
  onRemove: (id: string) => void;
  onReorder: (plans: Plan[]) => void;
}) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragSrcId, setDragSrcId] = useState<string | null>(null);

  const handleDragStart = useCallback((id: string, event: React.DragEvent) => {
    setDragSrcId(id);
    event.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((id: string, event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverId(id);
  }, []);

  const handleDrop = useCallback(
    (targetId: string) => {
      if (!dragSrcId || dragSrcId === targetId) { setDragOverId(null); return; }
      const next = [...plans];
      const srcIdx = next.findIndex((p) => p.id === dragSrcId);
      const tgtIdx = next.findIndex((p) => p.id === targetId);
      const [moved] = next.splice(srcIdx, 1);
      next.splice(tgtIdx, 0, moved);
      onReorder(next);
      setDragSrcId(null);
      setDragOverId(null);
    },
    [dragSrcId, plans, onReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDragSrcId(null);
    setDragOverId(null);
  }, []);

  // Horizontal scroll when many plans, fixed-width cards
  const isOverflow = plans.length > 3;

  if (!productSaved && !plans.length) {
    return (
      <div className="rounded-xl border border-white/35 bg-white/15 p-4 text-sm text-muted-foreground">
        Save the product first to add plans.
      </div>
    );
  }

  if (productSaved && !plans.length) {
    return (
      <div className="rounded-xl border border-white/35 bg-white/15 p-4 text-sm text-muted-foreground">
        No plans yet.
      </div>
    );
  }

  return (
    /* horizontal scroll container */
    <div
      className={cn(
        "flex gap-3",
        isOverflow
          ? "overflow-x-auto pb-2 [scrollbar-width:thin]"
          : "flex-wrap"
      )}
    >
      {plans.map((plan) => (
        <div
          key={plan.id}
          draggable
          onDragStart={(e) => handleDragStart(plan.id, e)}
          onDragOver={(e) => handleDragOver(plan.id, e)}
          onDrop={() => handleDrop(plan.id)}
          onDragEnd={handleDragEnd}
          className={cn(
            "relative shrink-0 rounded-xl border bg-white/15 shadow-sm backdrop-blur-md transition",
            isOverflow ? "w-44" : "w-full sm:w-[calc(50%-6px)] xl:w-[calc(33.333%-8px)]",
            planDraftId === plan.id
              ? "border-[#159FD3]/70 bg-[#159FD3]/10 ring-2 ring-[#159FD3]/15"
              : "border-white/35 hover:bg-neutral-200/40",
            dragOverId === plan.id && dragSrcId !== plan.id
              ? "border-[#159FD3] ring-2 ring-[#159FD3]/30 scale-[1.02]"
              : ""
          )}
        >
          <button
            type="button"
            onClick={() => onSelect(plan)}
            className="h-full min-h-28 w-full p-4 pr-12 text-left"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{plan.name}</div>
                <div className="mt-1 truncate text-xs text-muted-foreground">{plan.duration || "No duration"}</div>
              </div>
              <span className="mr-8 shrink-0 rounded-full border border-white/40 bg-white/30 px-2 py-0.5 text-[11px] font-semibold">
                {plan.stock_status}
              </span>
            </div>
            <div className="mt-4 text-lg font-bold">{formatPrice(Number(plan.offer_price ?? plan.real_price))}</div>
          </button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isPending}
            className="absolute right-2 top-2 bg-white/35 hover:bg-rose-50 hover:text-rose-600"
            onClick={() => onRemove(plan.id)}
          >
            <Trash2Icon />
          </Button>
        </div>
      ))}
    </div>
  );
}

export function ProductListManager({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const filteredProducts = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return products;
    return products.filter((product) =>
      [product.name, product.slug, product.category].some((value) => value?.toLowerCase().includes(normalized))
    );
  }, [products, query]);

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="relative z-20 grid items-center gap-3 rounded-xl border border-white/40 bg-white/15 p-3 shadow-sm backdrop-blur-md md:grid-cols-[minmax(260px,1fr)_auto]">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#159FD3]" />
          <Input
            className="h-9 rounded-lg border-white/40 bg-white/20 pl-9 shadow-sm backdrop-blur-md transition-all placeholder:text-muted-foreground/70 focus:border-[#159FD3]/50 focus:bg-white/30 focus:ring-2 focus:ring-[#159FD3]/20"
            placeholder="Search products..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Link href="/admin/products/new" className={buttonVariants()}>
          <PlusIcon /> Create product
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>{products.length} products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                className="group flex min-h-36 flex-col items-center justify-center gap-3 rounded-xl border border-white/35 bg-white/15 p-4 text-center shadow-sm backdrop-blur-md transition hover:bg-neutral-200/40"
              >
                <span className="grid size-16 place-items-center overflow-hidden rounded-2xl border border-white/50 bg-white/75 shadow-sm">
                  {product.logo_url ? (
                    <Image src={product.logo_url} alt={product.name} width={56} height={56} className="size-12 object-contain" />
                  ) : (
                    <ImageIcon className="size-6 text-muted-foreground" />
                  )}
                </span>
                <span className="line-clamp-2 text-sm font-semibold leading-5">{product.name}</span>
              </Link>
            ))}
            {!filteredProducts.length ? (
              <div className="col-span-full rounded-xl border border-white/35 bg-white/15 p-6 text-sm text-muted-foreground">
                No products found.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ProductDetailManager({ product, categories }: { product: Product | null; categories: string[] }) {
  const router = useRouter();
  const [productDraft, setProductDraft] = useState<ProductDraft>(product ? productToDraft(product) : emptyProduct);
  const [plans, setPlans] = useState<Plan[]>(product?.plans ?? []);
  const [planDraft, setPlanDraft] = useState<PlanDraft>(product?.plans?.[0] ? planToDraft(product.plans[0]) : emptyPlan(product?.id ?? ""));
  const [bannerPrimary, setBannerPrimary] = useState("#159FD3");
  const [bannerSecondary, setBannerSecondary] = useState("#16A34A");
  const [showLogoUploadDialog, setShowLogoUploadDialog] = useState(false);
  const [showBannerUploadDialog, setShowBannerUploadDialog] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ kind: "products" | "plans"; id: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const logoStyle = productDraft.logo_url ? { backgroundImage: `url("${productDraft.logo_url}")` } : undefined;
  const bannerStyle = productDraft.image_url ? { backgroundImage: `url("${productDraft.image_url}")` } : undefined;
  const categoryOptions = useMemo(() => {
    const values = new Set(categories.filter(Boolean));
    if (productDraft.category) values.add(productDraft.category);
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [categories, productDraft.category]);
  const previewProduct = useMemo<Product>(() => {
    const previewPlan: Plan | null =
      planDraft.name.trim() || planDraft.real_price.trim() || planDraft.offer_price.trim() || planDraft.features.trim()
        ? {
            id: planDraft.id ?? "preview-plan",
            product_id: productDraft.id ?? "preview-product",
            name: planDraft.name || "Preview plan",
            duration: planDraft.duration || null,
            real_price: toPrice(planDraft.real_price),
            offer_price: planDraft.offer_price ? toPrice(planDraft.offer_price) : null,
            actual_price: planDraft.actual_price ? toPrice(planDraft.actual_price) : null,
            features: featuresFromDraft(planDraft.features),
            stock_status: planDraft.stock_status as StockStatus,
            is_active: planDraft.is_active,
            sort_order: planDraft.id ? plans.find((plan) => plan.id === planDraft.id)?.sort_order ?? 0 : -1,
          }
        : null;

    // For the plan preview panel — all plans with the draft merged in
    const previewPlansAll = previewPlan
      ? planDraft.id
        ? plans.map((plan) => (plan.id === planDraft.id ? previewPlan : plan))
        : [previewPlan, ...plans]
      : plans;

    // For the production preview (ServiceCard) — only the selected/draft plan
    const previewPlansSingle = previewPlan ? [previewPlan] : plans.length ? [plans[0]] : [];

    return {
      id: productDraft.id ?? "preview-product",
      name: productDraft.name || "New product",
      slug: productDraft.slug || "new-product",
      category: productDraft.category || "Category",
      description: productDraft.description || "Product description will appear here.",
      logo_url: productDraft.logo_url || null,
      image_url: productDraft.image_url || null,
      stock_status: productDraft.stock_status as StockStatus,
      is_best_seller: productDraft.is_best_seller,
      is_limited: productDraft.is_limited,
      is_active: productDraft.is_active,
      sort_order: product?.sort_order ?? 0,
      rating: product?.rating ?? 4.8,
      review_count: product?.review_count ?? 128,
      plans: previewPlansAll,
      _singlePlanPreview: previewPlansSingle,
    } as Product & { _singlePlanPreview: Plan[] };
  }, [planDraft, plans, product, productDraft]);

  async function refreshProduct(productId = productDraft.id) {
    if (!productId) return;
    const [productsResponse, plansResponse] = await Promise.all([
      fetch("/api/admin/products"),
      fetch("/api/admin/plans"),
    ]);
    const productsPayload = await productsResponse.json();
    const plansPayload = await plansResponse.json();
    if (!productsResponse.ok) throw new Error(productsPayload.error || "Unable to refresh product.");
    if (!plansResponse.ok) throw new Error(plansPayload.error || "Unable to refresh plans.");

    const nextProduct = productsPayload.data.find((item: Product) => item.id === productId);
    if (!nextProduct) return;
    const nextPlans = plansPayload.data.filter((item: Plan) => item.product_id === productId);
    setProductDraft(productToDraft({ ...nextProduct, plans: nextPlans }));
    setPlans(nextPlans);
  }

  async function saveProductDraft(overrides: Partial<ProductDraft> = {}) {
    const method = productDraft.id ? "PATCH" : "POST";
    const draft = { ...productDraft, ...overrides };
    const response = await fetch("/api/admin/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...draft,
        description: draft.description || null,
        logo_url: draft.logo_url || null,
        image_url: draft.image_url || null,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      const errPayload = payload.error;
      let errorMessage = "Unable to save product.";
      if (typeof errPayload === "string") {
        errorMessage = errPayload;
      } else if (errPayload?.formErrors?.[0]) {
        errorMessage = errPayload.formErrors[0];
      } else if (errPayload?.fieldErrors) {
        const firstField = Object.keys(errPayload.fieldErrors)[0];
        if (firstField && errPayload.fieldErrors[firstField]?.[0]) {
          errorMessage = `${firstField}: ${errPayload.fieldErrors[firstField][0]}`;
        }
      }
      throw new Error(errorMessage);
    }
    setProductDraft(productToDraft({ ...payload.data, plans }));
    return payload.data as Product;
  }

  async function submitProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      try {
        const savedProduct = await saveProductDraft();
        toast.success(productDraft.id ? "Product updated" : "Product created");
        if (!productDraft.id) router.replace(`/admin/products/${savedProduct.id}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to save product.");
      }
    });
  }

  async function submitPlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!productDraft.id) {
      toast.error("Save the product before adding plans.");
      return;
    }

    startTransition(async () => {
      try {
        const method = planDraft.id ? "PATCH" : "POST";
        const response = await fetch("/api/admin/plans", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...planDraft,
            product_id: productDraft.id,
            duration: planDraft.duration || null,
            offer_price: planDraft.offer_price || null,
            actual_price: planDraft.actual_price || 0,
            features: planDraft.features.split(",").map((item) => item.trim()).filter(Boolean),
          }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.formErrors?.[0] || payload.error || "Unable to save plan.");
        await refreshProduct(productDraft.id);
        setPlanDraft(emptyPlan(productDraft.id));
        toast.success(planDraft.id ? "Plan updated" : "Plan added");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to save plan.");
      }
    });
  }

  function remove(kind: "products" | "plans", id: string) {
    setPendingDelete({ kind, id });
  }

  async function confirmRemove() {
    if (!pendingDelete) return;
    const { kind, id } = pendingDelete;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/${kind}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to delete.");
        toast.success(kind === "products" ? "Product deleted" : "Plan deleted");
        setPendingDelete(null);
        if (kind === "products") {
          router.replace("/admin/products");
        } else {
          await refreshProduct(productDraft.id);
          setPlanDraft(emptyPlan(productDraft.id));
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to delete.");
      }
    });
  }

  async function uploadProductImage(file: File | undefined, assetType: "logo" | "banner") {
    if (!file) return;
    if (!productDraft.name.trim() || !productDraft.slug.trim()) {
      toast.error("Enter a product name before uploading.");
      return;
    }

    startTransition(async () => {
      try {
        const savedProduct = productDraft.id ? null : await saveProductDraft({ category: productDraft.category || "Uncategorized" });
        const productId = productDraft.id ?? savedProduct?.id;
        if (!productId) throw new Error("Unable to save product before upload.");

        const formData = new FormData();
        formData.set("productId", productId);
        formData.set("slug", productDraft.slug);
        formData.set("assetType", assetType);
        formData.set("file", file);
        const response = await fetch("/api/admin/products/upload", { method: "POST", body: formData });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to upload image.");
        await refreshProduct(productId);
        toast.success(assetType === "logo" ? "Logo replaced" : "Banner replaced");
        if (!productDraft.id) router.replace(`/admin/products/${productId}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to upload image.");
      }
    });
  }

  async function handleBannerFileSelected(file: File | undefined) {
    if (!file) return;
    try {
      const dimensions = await getImageDimensions(file);
      if (dimensions.width !== BANNER_WIDTH || dimensions.height !== BANNER_HEIGHT) {
        toast.error(`Banner must be ${BANNER_WIDTH} x ${BANNER_HEIGHT}px. Your file is ${dimensions.width} x ${dimensions.height}px.`);
        if (bannerInputRef.current) bannerInputRef.current.value = "";
        return;
      }
      setShowBannerUploadDialog(false);
      await uploadProductImage(file, "banner");
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    } catch {
      toast.error("Unable to read banner size. Please upload a valid image.");
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  }

  async function generateBanner() {
    if (!productDraft.name.trim() || !productDraft.slug.trim()) {
      toast.error("Enter a product name before generating a banner.");
      return;
    }

    startTransition(async () => {
      try {
        const savedProduct = productDraft.id ? null : await saveProductDraft({ category: productDraft.category || "Uncategorized" });
        const productId = productDraft.id ?? savedProduct?.id;
        if (!productId) throw new Error("Unable to save product before banner generation.");

        const response = await fetch("/api/admin/products/banner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            slug: productDraft.slug,
            name: productDraft.name,
            primaryColor: bannerPrimary,
            secondaryColor: bannerSecondary,
          }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to generate banner.");
        await refreshProduct(productId);
        toast.success("Banner generated");
        if (!productDraft.id) router.replace(`/admin/products/${productId}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to generate banner.");
      }
    });
  }

  async function copyImagePrompt() {
    if (!productDraft.name.trim()) {
      toast.error("Enter a product name first.");
      return;
    }

    const prompt = [
      `Create a square app-style logo for "${productDraft.name || "the product"}".`,
      `Format: square canvas, rounded square app icon shape, thick clean white outer border/frame, and a centered filled logo mark. Use the attached reference image for the exact format.`,
      `Use the product's real logo/brand mark if known, but recreate it as a clean original app-style icon in the same format as the reference.`,
      `The main mark must be large, centered, bold, high contrast, and easy to recognize at small size.`,
      `Keep the icon background simple with the brand color or a smooth subtle gradient. Use these colors if helpful: primary ${bannerPrimary}, accent ${bannerSecondary}.`,
      `No banner layout, no wide composition, no product name text, no extra labels, no mockup, no 3D scene, no busy details.`,
      `Final image must be a square logo icon only, with rounded corners, white border/frame, and the centered filled logo mark.`,
    ].join(" ");

    try {
      await navigator.clipboard.writeText(prompt);
      toast.success("Image prompt copied");
    } catch {
      toast.error("Unable to copy prompt.");
    }
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin/products" className={buttonVariants({ variant: "outline" })}>
          <ArrowLeftIcon /> Products
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="grid min-w-0 gap-4">
        <Card className="overflow-hidden border-white/35 bg-white/20 shadow-xl backdrop-blur-xl">
          <CardHeader className="border-b border-white/35 bg-white/10 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{productDraft.id ? productDraft.name || "Product detail" : "Create product"}</CardTitle>
                <CardDescription>{productDraft.category || "Product detail"}</CardDescription>
              </div>
              {productDraft.id ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  className="border-rose-500/20 bg-rose-500/10 text-rose-600 hover:bg-rose-500/15"
                  onClick={() => remove("products", productDraft.id!)}
                >
                  <Trash2Icon /> Delete
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            <div className="relative min-h-56 overflow-hidden rounded-xl border border-white/45 bg-white/15 bg-cover bg-center shadow-sm" style={bannerStyle}>
              {!productDraft.image_url ? (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `
                      radial-gradient(circle at 79% 17%, ${bannerPrimary}42 0, transparent 22%),
                      radial-gradient(circle at 14% 88%, ${bannerSecondary}1f 0, transparent 24%),
                      radial-gradient(circle at 87% 85%, ${bannerPrimary}1a 0, transparent 16%),
                      linear-gradient(135deg, #ffffff 0%, #E6F7FD 100%)
                    `,
                  }}
                />
              ) : null}
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative flex h-full min-h-48 items-end gap-4 p-5 text-white">
                <div className="grid size-20 place-items-center rounded-2xl border border-white/45 bg-white/85 bg-cover bg-center shadow-lg" style={logoStyle}>
                  {!productDraft.logo_url ? <ImageIcon className="size-7 text-muted-foreground" /> : null}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-2xl font-bold">{productDraft.name || "New product"}</div>
                </div>
              </div>
            </div>
            <form id="product-form" className="grid gap-4" onSubmit={submitProduct}>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  className={adminInputClass}
                  placeholder="Name"
	                  value={productDraft.name}
	                  onChange={(event) => {
	                    const name = event.target.value;
	                    setProductDraft((current) => ({ ...current, name, slug: toSlug(name) }));
	                  }}
	                  required
	                />
	                <Input className={adminInputClass} placeholder="Slug" value={productDraft.slug} readOnly required />
                <CustomDropdown
                  allowCustom
                  value={productDraft.category}
                  onChange={(value) => setProductDraft({ ...productDraft, category: value })}
                  options={categoryOptions}
                  placeholder="Category"
                />
                <CustomDropdown className="h-10" value={productDraft.stock_status} onChange={(value) => setProductDraft({ ...productDraft, stock_status: value })} options={stockOptions} />
              </div>
              <Input className={adminInputClass} placeholder="Description" value={productDraft.description} onChange={(event) => setProductDraft({ ...productDraft, description: event.target.value })} />
            </form>
            {showLogoUploadDialog ? (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 px-4">
                <div className="w-full max-w-md rounded-2xl border border-white/40 bg-white p-5 shadow-2xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-bold">Upload logo</p>
                      <p className="mt-1 text-sm text-[#555]">
                        Copy the prompt, then attach the reference image below when asking the AI to generate your logo.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-[#E6F7FD] text-[#0B7FAE]"
                      onClick={() => setShowLogoUploadDialog(false)}
                      aria-label="Close logo upload dialog"
                    >
                      <XIcon className="size-4" />
                    </button>
                  </div>
                  {/* Reference image — download and attach to your AI prompt */}
                  <div className="mt-4 rounded-xl border border-black/10 bg-[#F6FCFF] p-3">
                    <p className="text-xs font-semibold text-[#111]">Reference format — attach this to your AI prompt</p>
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={LOGO_FORMAT_REFERENCE_URL}
                        alt="Logo format reference"
                        className="h-20 w-20 shrink-0 rounded-xl border border-black/10 bg-white object-contain p-1 shadow-sm"
                      />
                      <div className="min-w-0 text-xs text-[#555]">
                        <p>Square canvas · rounded app icon shape · thick white border/frame · centered filled logo mark.</p>
                        <p className="mt-1.5 text-[#777]">Copy the URL and paste it into your AI tool alongside the prompt.</p>
                        <button
                          type="button"
                          className="mt-2 inline-flex items-center gap-1 font-semibold text-[#0B7FAE] underline-offset-2 hover:underline"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(LOGO_FORMAT_REFERENCE_URL);
                              toast.success("Reference image URL copied");
                            } catch {
                              toast.error("Unable to copy URL.");
                            }
                          }}
                        >
                          <ClipboardCopyIcon className="size-3" /> Copy image URL
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap justify-end gap-2">
                    <Button type="button" variant="outline" onClick={copyImagePrompt} disabled={!productDraft.name.trim()}>
                      <ClipboardCopyIcon /> Copy prompt
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowLogoUploadDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        setShowLogoUploadDialog(false);
                        logoInputRef.current?.click();
                      }}
                    >
                      <UploadIcon /> Choose logo
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
            {showBannerUploadDialog ? (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 px-4">
                <div className="w-full max-w-md rounded-2xl border border-white/40 bg-white p-5 shadow-2xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-bold">Upload banner</p>
                      <p className="mt-1 text-sm text-[#555]">
                        Banner image must be exactly {BANNER_WIDTH} x {BANNER_HEIGHT}px, the same size as generated banners.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-[#E6F7FD] text-[#0B7FAE]"
                      onClick={() => setShowBannerUploadDialog(false)}
                      aria-label="Close banner upload dialog"
                    >
                      <XIcon className="size-4" />
                    </button>
                  </div>
                  <div className="mt-4 rounded-xl border border-black/10 bg-[#F6FCFF] p-3 text-sm text-[#555]">
                    <p className="font-semibold text-[#111]">Required size</p>
                    <p>{BANNER_WIDTH}px wide x {BANNER_HEIGHT}px high</p>
                    <p className="mt-2 text-xs">Accepted: PNG, JPEG, WebP, SVG</p>
                  </div>
                  <div className="mt-5 flex flex-wrap justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowBannerUploadDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="button" disabled={isPending} onClick={() => bannerInputRef.current?.click()}>
                      <UploadIcon /> Choose banner
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {productDraft.id && (
          <Card className="overflow-hidden border-white/35 bg-white/20 shadow-xl backdrop-blur-xl">
            <CardHeader className="border-b border-white/35 bg-white/10 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Plans</CardTitle>
                <CardDescription>{productDraft.id ? `${plans.length} plans` : "Save product first"}</CardDescription>
              </div>
              <Button type="button" size="sm" onClick={() => setPlanDraft(emptyPlan(productDraft.id ?? ""))} disabled={!productDraft.id}>
                <PlusIcon /> Add plan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            <PlansDragList
              plans={plans}
              planDraftId={planDraft.id}
              isPending={isPending}
              onSelect={(plan) => setPlanDraft(planToDraft(plan))}
              onRemove={(id) => remove("plans", id)}
              onReorder={(reordered) => {
                const updated = reordered.map((p, i) => ({ ...p, sort_order: i }));
                setPlans(updated);
                startTransition(async () => {
                  try {
                    await fetch("/api/admin/plans/reorder", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(
                        updated.map((p) => ({ id: p.id, sort_order: p.sort_order }))
                      ),
                    });
                  } catch {
                    // silent – visual order already updated
                  }
                });
              }}
              productSaved={Boolean(productDraft.id)}
            />

            <form className="grid gap-3 rounded-xl border border-white/35 bg-white/10 p-4" onSubmit={submitPlan}>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold">{planDraft.id ? "Edit plan" : "Create plan"}</p>
                <p className="text-xs text-muted-foreground">{productDraft.id ? "Select a card above to edit an existing plan." : "Save the product before adding plans."}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Input className={adminInputClass} placeholder="Plan name" value={planDraft.name} onChange={(event) => setPlanDraft({ ...planDraft, name: event.target.value })} required />
                <Input className={adminInputClass} placeholder="Duration" value={planDraft.duration} onChange={(event) => setPlanDraft({ ...planDraft, duration: event.target.value })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Input className={adminInputClass} placeholder="Price" type="number" value={planDraft.real_price} onChange={(event) => setPlanDraft({ ...planDraft, real_price: event.target.value })} required />
                <Input className={adminInputClass} placeholder="Offer" type="number" value={planDraft.offer_price} onChange={(event) => setPlanDraft({ ...planDraft, offer_price: event.target.value })} />
                <Input className={adminInputClass} placeholder="Actual" type="number" value={planDraft.actual_price} onChange={(event) => setPlanDraft({ ...planDraft, actual_price: event.target.value })} />
              </div>
              <CustomDropdown value={planDraft.stock_status} onChange={(value) => setPlanDraft({ ...planDraft, stock_status: value })} options={stockOptions} />
              <Input className={adminInputClass} placeholder="Features separated by commas" value={planDraft.features} onChange={(event) => setPlanDraft({ ...planDraft, features: event.target.value })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={planDraft.is_active} onChange={(event) => setPlanDraft({ ...planDraft, is_active: event.target.checked })} />
                Active
              </label>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={isPending || !productDraft.id}>
                  <SaveIcon /> {planDraft.id ? "Save plan" : "Create plan"}
                </Button>
                {planDraft.id ? (
                  <Button type="button" variant="outline" disabled={isPending} onClick={() => remove("plans", planDraft.id!)}>
                    <Trash2Icon /> Delete
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>
        )}
        </div>
        <aside className="grid min-w-0 gap-4 xl:sticky xl:top-6 xl:self-start">
          <Card className="overflow-hidden border-white/35 bg-white/20 shadow-xl backdrop-blur-xl">
            <CardHeader className="border-b border-white/35 bg-white/10 px-5 py-4">
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 p-5">
              <div className="grid gap-3">
                <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={(event) => uploadProductImage(event.target.files?.[0], "logo")} />
                <input ref={bannerInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={(event) => handleBannerFileSelected(event.target.files?.[0])} />
                
                <div className="flex flex-col gap-2">
                  <Button type="button" variant="outline" className="w-full justify-start" disabled={!productDraft.name.trim() || !productDraft.slug.trim() || isPending} onClick={() => setShowLogoUploadDialog(true)}>
                    <UploadIcon /> Upload logo
                  </Button>
                  <Button type="button" variant="outline" className="w-full justify-start" disabled={!productDraft.name.trim() || !productDraft.slug.trim() || isPending} onClick={() => setShowBannerUploadDialog(true)}>
                    <UploadIcon /> Upload banner
                  </Button>
                  <Button type="button" variant="outline" className="w-full justify-start" disabled={!productDraft.name.trim() || !productDraft.slug.trim() || isPending} onClick={generateBanner}>
                    <WandSparklesIcon /> Generate banner
                  </Button>
                </div>
                
                <label className="mt-2 flex h-10 items-center justify-between rounded-lg border border-white/35 bg-white/20 px-3 text-sm shadow-sm backdrop-blur-md">
                  <span>Banner Colors</span>
                  <div className="flex items-center gap-1">
                    <input type="color" className="size-6 cursor-pointer" value={bannerPrimary} onChange={(event) => setBannerPrimary(event.target.value)} />
                    <input type="color" className="size-6 cursor-pointer" value={bannerSecondary} onChange={(event) => setBannerSecondary(event.target.value)} />
                  </div>
                </label>
              </div>

              <div className="grid gap-3">
                <ProductToggleCard
                  label="Best seller"
                  description="Highlight this product."
                  checked={productDraft.is_best_seller}
                  onChange={(checked) => setProductDraft({ ...productDraft, is_best_seller: checked })}
                />
                <ProductToggleCard
                  label="Limited"
                  description="Limited availability."
                  checked={productDraft.is_limited}
                  onChange={(checked) => setProductDraft({ ...productDraft, is_limited: checked })}
                />
                <ProductToggleCard
                  label="Active"
                  description="Visible to customers."
                  checked={productDraft.is_active}
                  onChange={(checked) => setProductDraft({ ...productDraft, is_active: checked })}
                />
              </div>

              <Button type="submit" form="product-form" className="w-full" disabled={isPending}>
                <SaveIcon /> Save product
              </Button>
            </CardContent>
          </Card>

          {productDraft.id && (
            <>
              <div className="overflow-hidden rounded-xl border border-white/35 bg-white/20 shadow-xl backdrop-blur-xl">
            <div className="border-b border-white/35 bg-white/10 px-5 py-4">
              <p className="text-base font-semibold leading-none">Production preview</p>
              <p className="mt-1 text-sm text-muted-foreground">Updates as you type</p>
            </div>
            {/* overflow-y-auto + overscroll-contain: scrollable internally, cursor wheel won't leak to page */}
            <div
              className="overflow-y-auto overscroll-contain"
              style={{ maxHeight: "min(704px, 80svh)" }}
            >
              <div className="flex min-h-[500px] items-center justify-center p-4">
                <div className="w-full max-w-[302px]">
                  <ServiceCard product={{ ...previewProduct, plans: (previewProduct as Product & { _singlePlanPreview: Plan[] })._singlePlanPreview }} />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/35 bg-white/20 shadow-xl backdrop-blur-xl">
            <div className="border-b border-white/35 bg-white/10 px-5 py-4">
              <p className="text-base font-semibold leading-none">Plan preview</p>
              <p className="mt-1 text-sm text-muted-foreground">Matches the checkout drawer</p>
            </div>
            {/* overflow-y-auto + overscroll-contain: independent scroll, no bleed */}
            <div
              className="overflow-y-auto overscroll-contain"
              style={{ maxHeight: "min(596px, 80svh)" }}
            >
              <div className="flex items-center justify-center p-4">
                <div className="mx-auto w-full max-w-[420px] rounded-2xl border border-black/10 bg-white/80 p-3 shadow-sm">
                  <div className="mb-3">
                    <p className="text-sm font-black">{previewProduct.name}</p>
                    <p className="mt-0.5 text-xs text-[#555]">Choose a plan and quantity.</p>
                  </div>
                  {previewProduct.plans.length ? (
                    <ProductPlansPanel product={previewProduct} />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-black/10 bg-white p-4 text-sm text-muted-foreground">
                      Add a plan to preview plan cards.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
            </>
          )}
        </aside>
      </div>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={pendingDelete?.kind === "products" ? "Delete product?" : "Delete plan?"}
        description={
          pendingDelete?.kind === "products"
            ? "This will delete the product, its plans, and stored product images. This cannot be undone."
            : "This will delete the selected plan. This cannot be undone."
        }
        confirmLabel={pendingDelete?.kind === "products" ? "Delete product" : "Delete plan"}
        tone="danger"
        disabled={isPending}
        onConfirm={confirmRemove}
      />
    </div>
  );
}
