"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangleIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfirmDialog({
  confirmLabel = "Confirm",
  description,
  disabled,
  onConfirm,
  onOpenChange,
  open,
  title,
  tone = "default",
}: {
  confirmLabel?: string;
  description: string;
  disabled?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
  tone?: "default" | "danger";
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[10000] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/45 bg-white/92 shadow-2xl backdrop-blur-xl focus-visible:outline-none">
          <div className="flex items-start gap-3 border-b border-black/5 bg-white/70 p-5">
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full",
                tone === "danger" ? "bg-rose-50 text-rose-600" : "bg-[#E6F7FD] text-[#0B7FAE]"
              )}
            >
              <AlertTriangleIcon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-base font-black text-[#111]">{title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm leading-5 text-[#555]">{description}</Dialog.Description>
            </div>
            <Dialog.Close className="grid size-8 shrink-0 place-items-center rounded-full bg-black/5 text-[#555] transition hover:bg-black/10" aria-label="Close dialog">
              <XIcon className="size-4" />
            </Dialog.Close>
          </div>
          <div className="flex flex-wrap justify-end gap-2 p-5">
            <Button type="button" variant="outline" disabled={disabled} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={disabled}
              className={cn(tone === "danger" && "bg-rose-600 text-white hover:bg-rose-700")}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
