import type * as React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { requireAdmin } from "@/lib/auth/admin";

export function AdminShell({
  user,
  title,
  children,
}: {
  user: Awaited<ReturnType<typeof requireAdmin>>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      className="admin-glass-shell"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        user={{
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Admin",
          email: user.email || "admin",
          avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
        }}
      />
      <SidebarInset>
        <div className="admin-glass-main">
          <SiteHeader title={title} />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
