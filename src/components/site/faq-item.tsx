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
            "size-5 shrink-0 text-[#159FD3] transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-6 text-[#555]">{answer}</p>
        </div>
      </div>
    </div>
  );
}
