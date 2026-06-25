"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { signOut } from "@/lib/auth/sign-out"
import { EllipsisVerticalIcon, LogOutIcon, Trash2Icon } from "lucide-react"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const firstName = user.name.split(" ")[0] || "Admin"

  async function handleSignOut() {
    await signOut()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="h-14 rounded-2xl border border-white/45 bg-white/35 px-2 shadow-sm backdrop-blur-xl hover:bg-white/55 aria-expanded:bg-white/60"
              />
            }
            >
              <Avatar className="size-9 rounded-xl ring-2 ring-white/70">
                <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-xl bg-[#159FD3] font-bold text-white">
                {initials || "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-[#12212b]">{firstName}</span>
              <span className="truncate text-xs text-[#52606a]">{user.email}</span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4 text-[#52606a]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 border border-black/10 bg-white text-[#111] shadow-xl backdrop-blur-none"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-9 rounded-xl ring-2 ring-white/70">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-xl bg-[#159FD3] font-bold text-white">
                      {initials || "AD"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{firstName}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/admin/deleted-products" />}>
              <Trash2Icon />
              Deleted Products
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
