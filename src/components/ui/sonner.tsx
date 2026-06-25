"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-left"
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "rgba(255,255,255,0.94)",
          "--normal-text": "#111111",
          "--normal-border": "rgba(0,0,0,0.10)",
          "--border-radius": "1.25rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast border border-black/10 bg-white/95 text-[#111] shadow-2xl backdrop-blur-xl",
          title: "font-semibold text-[#0B7FAE]",
          description: "text-[#111]",
          actionButton: "bg-transparent! text-[#159FD3]! font-semibold! hover:text-[#0B7FAE]!",
          cancelButton: "bg-transparent! text-[#159FD3]! font-semibold! hover:text-[#0B7FAE]!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
