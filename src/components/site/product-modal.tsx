"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductPlansPanel } from "@/components/site/product-plans-panel";

export function ProductModal({
  product,
  open,
  onOpenChange,
  showTrigger = true,
}: {
  product: Product;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.dataset.drawerOpen = "true";
      return () => {
        document.body.style.overflow = "";
        delete document.body.dataset.drawerOpen;
      };
    }
  }, [isOpen]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      {showTrigger ? (
        <Dialog.Trigger className="inline-flex w-full items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-[#E6F7FD]">
          View plans
        </Dialog.Trigger>
      ) : null}
      <Dialog.Portal>
        <Dialog.Overlay className="plan-drawer-overlay fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm" />
        <Dialog.Content data-lenis-prevent className="plan-drawer-content fixed inset-x-0 bottom-0 z-[999] max-h-[86dvh] overflow-hidden rounded-t-3xl border border-white/40 bg-white/86 shadow-2xl backdrop-blur-xl lg:inset-y-0 lg:right-auto lg:left-0 lg:max-h-none lg:w-[420px] lg:rounded-none lg:rounded-r-3xl">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/50 bg-white/72 px-4 py-4 shadow-sm backdrop-blur-xl">
            <div>
              <Dialog.Title className="text-base font-black lg:text-lg">{product.name}</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-[#555] lg:text-sm">
                Choose a plan and quantity.
              </Dialog.Description>
            </div>
            <Dialog.Close className="grid size-9 shrink-0 place-items-center rounded-full bg-[#E6F7FD] text-[#0B7FAE]" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <div data-lenis-prevent className="max-h-[calc(86dvh-5.5rem)] touch-pan-y overflow-y-auto overscroll-contain px-4 py-4">
            <ProductPlansPanel product={product} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
