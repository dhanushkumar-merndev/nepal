"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      data-state={open ? "open" : "closed"}
      className="premium-card overflow-hidden p-0"
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-[#159FD3] transition-transform duration-220 ease-out lg:duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-220 ease-out will-change-[grid-template-rows] motion-reduce:transition-none lg:duration-500 lg:[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <p
            className={cn(
              "px-5 pb-5 text-sm leading-6 text-[#555] transition-opacity duration-100 ease-out motion-reduce:transition-none lg:duration-200",
              open ? "opacity-100 delay-0 lg:delay-150" : "opacity-0 delay-0",
            )}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
