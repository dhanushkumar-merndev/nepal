import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-sm font-semibold transition outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#159FD3] text-white shadow-sm hover:bg-[#0B7FAE]",
        primary: "bg-[#159FD3] text-white shadow-sm hover:bg-[#0B7FAE]",
        secondary: "border border-black/10 bg-white/86 text-[#111] shadow-sm backdrop-blur-xl hover:bg-[#E6F7FD]",
        outline: "border border-black/10 bg-white/72 text-[#111] shadow-sm backdrop-blur-xl hover:bg-[#E6F7FD]",
        ghost: "text-[#111] hover:bg-black/5",
        destructive: "bg-[#DC2626] text-white shadow-sm hover:bg-red-700",
        danger: "bg-[#DC2626] text-white shadow-sm hover:bg-red-700",
        link: "rounded-none px-0 text-[#159FD3] underline-offset-4 shadow-none hover:underline",
      },
      size: {
        default: "h-10 px-5",
        xs: "h-7 px-3 text-xs",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "size-10 p-0",
        "icon-xs": "size-7 p-0",
        "icon-sm": "size-8 p-0",
        "icon-lg": "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  children,
  disabled,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
  }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2Icon className="animate-spin" /> : null}
      {children}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
