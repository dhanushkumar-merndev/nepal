"use client";

import { useState, useRef, useEffect } from "react";

export interface SelectOption {
  value: string;
  label: string;
  imageUrl?: string | null;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: SelectOption[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#159FD3]"
      >
        <span className="flex items-center gap-2">
          {selected?.imageUrl && (
            <img src={selected.imageUrl} alt="" className="size-5 rounded object-contain" />
          )}
          <span className={selected ? "" : "text-gray-400"}>{selected ? selected.label : placeholder}</span>
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-black/10 bg-white py-1 shadow-lg" data-lenis-prevent>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                opt.value === value ? "font-bold text-[#159FD3]" : "text-gray-700"
              }`}
            >
              {opt.imageUrl && (
                <img src={opt.imageUrl} alt="" className="size-6 rounded object-contain" />
              )}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
