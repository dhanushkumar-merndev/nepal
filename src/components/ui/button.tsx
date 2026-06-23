import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-[#159FD3] text-white hover:bg-[#0B7FAE]",
        variant === "secondary" && "border border-black/10 bg-white text-black hover:bg-[#E6F7FD]",
        variant === "ghost" && "text-[#111] hover:bg-black/5",
        variant === "danger" && "bg-[#DC2626] text-white hover:bg-red-700",
        className,
      )}
      {...props}
    />
  );
}
