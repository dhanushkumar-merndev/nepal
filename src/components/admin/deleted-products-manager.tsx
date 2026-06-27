"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { SearchIcon, ImageIcon, Trash2Icon, RefreshCcwIcon, ArchiveXIcon, FolderIcon } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeletedProductListManager({ products }: { products: Product[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<{
    type: "restore" | "delete";
    product: Product;
  } | null>(null);
  const deletedCount = products.length;

  const filteredProducts = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return products;
    return products.filter((product) =>
      [product.name, product.slug, product.category].some((value) => value?.toLowerCase().includes(normalized))
    );
  }, [products, query]);

  async function handleRestore(id: string) {
    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/products/restore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!response.ok) throw new Error((await response.json()).error);
        toast.success("Product restored");
        setPendingAction(null);
        router.refresh();
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Unable to restore product.");
      }
    });
  }

  async function handleHardDelete(id: string) {
    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/products/hard-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!response.ok) throw new Error((await response.json()).error);
        toast.success("Product permanently deleted");
        setPendingAction(null);
        router.refresh();
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Unable to permanently delete product.");
      }
    });
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="grid gap-4 rounded-[28px] border border-white/45 bg-white/20 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-md md:grid-cols-[minmax(280px,1fr)_auto] md:items-center">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#159FD3]" />
          <Input
            className="h-11 rounded-2xl border-white/50 bg-white/55 pl-10 shadow-sm transition-all placeholder:text-muted-foreground/70 focus:border-[#159FD3]/50 focus:bg-white focus:ring-2 focus:ring-[#159FD3]/20"
            placeholder="Search deleted products..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            <ArchiveXIcon className="size-4" />
            {deletedCount} deleted
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/75 px-3 py-2 text-sm font-medium text-slate-600">
            <FolderIcon className="size-4" />
            {filteredProducts.length} shown
          </div>
        </div>
      </div>

      <Card className="overflow-hidden rounded-[30px] border border-white/50 bg-white/70 shadow-[0_30px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <CardHeader className="border-b border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(248,250,252,0.7))]">
          <CardTitle>Deleted Products</CardTitle>
          <CardDescription>
            {deletedCount} deleted products. Products are automatically permanently deleted after 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group flex h-full flex-col gap-4 rounded-[24px] border border-red-200/80 bg-[linear-gradient(180deg,rgba(255,244,244,0.96),rgba(255,249,249,0.92))] p-4 shadow-[0_16px_40px_rgba(239,68,68,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(239,68,68,0.12)]"
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/70 bg-white shadow-sm ring-1 ring-red-100">
                    {product.logo_url ? (
                      <Image src={product.logo_url} alt={product.name} width={56} height={56} className="size-12 object-contain grayscale" />
                    ) : (
                      <ImageIcon className="size-6 text-muted-foreground grayscale" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-700">
                        Deleted
                      </span>
                      <span className="inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-base font-bold leading-5 text-slate-900">{product.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">/{product.slug}</p>
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">
                      {product.description?.trim() || "This product is in the recycle bin and can still be restored."}
                    </p>
                  </div>
                </div>
                <div className="mt-auto grid gap-2 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 rounded-full border-slate-200 bg-white/85 text-slate-700 shadow-sm hover:bg-white"
                    disabled={isPending}
                    onClick={() => setPendingAction({ type: "restore", product })}
                  >
                    <RefreshCcwIcon className="mr-2 size-3" /> Restore
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-10 rounded-full bg-[#E62828] shadow-[0_10px_25px_rgba(230,40,40,0.22)] hover:bg-[#D61F1F]"
                    disabled={isPending}
                    onClick={() => setPendingAction({ type: "delete", product })}
                  >
                    <Trash2Icon className="mr-2 size-3" /> Delete Now
                  </Button>
                </div>
              </div>
            ))}
            {!filteredProducts.length ? (
              <div className="col-span-full rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-full bg-white shadow-sm">
                  <ArchiveXIcon className="size-6 text-slate-400" />
                </div>
                <p className="mt-4 text-base font-semibold text-slate-700">No deleted products found</p>
                <p className="mt-1 text-sm text-slate-500">
                  Try another search term or restore products from this list when they appear here.
                </p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
        title={
          pendingAction?.type === "delete"
            ? "Delete product permanently?"
            : "Restore deleted product?"
        }
        description={
          pendingAction?.type === "delete"
            ? `This will permanently remove ${pendingAction.product.name} and it cannot be undone.`
            : pendingAction
              ? `${pendingAction.product.name} will be moved back into the active product list.`
              : ""
        }
        confirmLabel={pendingAction?.type === "delete" ? "Delete permanently" : "Restore product"}
        tone={pendingAction?.type === "delete" ? "danger" : "default"}
        disabled={isPending}
        onConfirm={() => {
          if (!pendingAction) return;
          if (pendingAction.type === "delete") {
            handleHardDelete(pendingAction.product.id);
            return;
          }
          handleRestore(pendingAction.product.id);
        }}
      />
    </div>
  );
}
