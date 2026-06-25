"use client";

import type * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardListIcon,
  GaugeIcon,
  PackageIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: GaugeIcon },
  { title: "Products", url: "/admin/products", icon: PackageIcon },
  { title: "Deleted Products", url: "/admin/deleted-products", icon: Trash2Icon },
  { title: "Orders", url: "/admin/orders", icon: ClipboardListIcon },
  { title: "Reviews", url: "/admin/reviews", icon: StarIcon },
];

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const pathname = usePathname();
  const firstName = user.name.split(" ")[0] || "Admin";

  return (
    <Sidebar collapsible="offcanvas" className="admin-glass-sidebar" {...props}>
      <SidebarHeader className="px-4 py-4">
        <Link href="/admin" className="flex items-center gap-3 rounded-2xl bg-white/30 p-3 shadow-sm backdrop-blur-xl transition hover:bg-white/45">
          <span className="grid size-11 place-items-center overflow-hidden rounded-2xl bg-white/75 ring-1 ring-white/70">
            <Image src="/header-logo.png" alt="OTT Subscription Nepal" width={36} height={36} className="size-8 object-contain" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-black text-[#12212b]">Welcome, {firstName}</span>
            <span className="block text-xs text-[#52606a]">Admin dashboard</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wide text-[#52606a]">
            Manage
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.url === "/admin" ? pathname === item.url : pathname === item.url || pathname.startsWith(`${item.url}/`);

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.title}
                      className={[
                        "h-10 rounded-xl px-3 font-medium text-[#22313c] transition-all",
                        "hover:bg-white/35 hover:text-[#22313c] hover:shadow-sm hover:backdrop-blur-xl",
                        "data-active:bg-white/45 data-active:text-[#0B7FAE] data-active:backdrop-blur-xl",
                        "data-active:shadow-sm data-active:ring-1 data-active:ring-white/55",
                      ].join(" ")}
                      render={<Link href={item.url} />}
                    >
                      <Icon className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
