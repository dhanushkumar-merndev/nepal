"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchIcon, ImageIcon, Trash2Icon, RefreshCcwIcon } from "lucide-react";
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

  const filteredProducts = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return products;
    return products.filter((product) =>
      [product.name, product.slug, product.category].some((value) => value?.toLowerCase().includes(normalized))
    );
  }, [products, query]);

  async function handleRestore(id: string) {
    if (!confirm("Are you sure you want to restore this product?")) return;
    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/products/restore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!response.ok) throw new Error((await response.json()).error);
        toast.success("Product restored");
        router.refresh();
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  }

  async function handleHardDelete(id: string) {
    if (!confirm("Are you sure you want to PERMANENTLY delete this product? This action cannot be undone.")) return;
    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/products/hard-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!response.ok) throw new Error((await response.json()).error);
        toast.success("Product permanently deleted");
        router.refresh();
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="relative z-20 grid items-center gap-3 rounded-xl border border-white/40 bg-white/15 p-3 shadow-sm backdrop-blur-md md:grid-cols-[minmax(260px,1fr)_auto]">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#159FD3]" />
          <Input
            className="h-9 rounded-lg border-white/40 bg-white/20 pl-9 shadow-sm backdrop-blur-md transition-all placeholder:text-muted-foreground/70 focus:border-[#159FD3]/50 focus:bg-white/30 focus:ring-2 focus:ring-[#159FD3]/20"
            placeholder="Search deleted products..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deleted Products</CardTitle>
          <CardDescription>
            {products.length} deleted products. Products are automatically permanently deleted after 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col gap-3 rounded-xl border border-red-500/35 bg-red-500/5 p-4 shadow-sm backdrop-blur-md transition hover:bg-red-500/10"
              >
                <div className="flex items-center gap-4">
                  <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/50 bg-white/75 shadow-sm">
                    {product.logo_url ? (
                      <Image src={product.logo_url} alt={product.name} width={56} height={56} className="size-12 object-contain grayscale" />
                    ) : (
                      <ImageIcon className="size-6 text-muted-foreground grayscale" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-semibold leading-5 text-red-900 dark:text-red-300">{product.name}</span>
                    <span className="mt-1 block text-xs text-red-700/70 dark:text-red-400/70">Deleted</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="w-full bg-white/50" disabled={isPending} onClick={() => handleRestore(product.id)}>
                    <RefreshCcwIcon className="mr-2 size-3" /> Restore
                  </Button>
                  <Button variant="destructive" size="sm" className="w-full" disabled={isPending} onClick={() => handleHardDelete(product.id)}>
                    <Trash2Icon className="mr-2 size-3" /> Delete Now
                  </Button>
                </div>
              </div>
            ))}
            {!filteredProducts.length ? (
              <div className="col-span-full rounded-xl border border-white/35 bg-white/15 p-6 text-sm text-muted-foreground">
                No deleted products found.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
