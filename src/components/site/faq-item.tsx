"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="premium-card overflow-hidden p-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-[#159FD3]",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-[max-height,opacity] duration-150 ease-out lg:transition-all lg:duration-300",
          open ? "max-h-40 opacity-100 lg:grid-rows-[1fr]" : "max-h-0 opacity-0 lg:grid-rows-[0fr]",
          "lg:grid",
        )}
      >
        <div className="lg:overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-6 text-[#555]">{answer}</p>
        </div>
      </div>
    </div>
  );
}
