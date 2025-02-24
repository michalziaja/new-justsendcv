"use client"

import * as React from "react"
import Image from "next/image"
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { Separator } from "@/components/ui/separator"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-center p-4">
          <a href="/" className="flex flex-col items-center">
            <Image
              src="/logo.png"
              alt="JustSend.cv Logo"
              width={96}
              height={96}
              className="mb-2"
            />
            <div className="text-center">
              <div className="font-bold text-lg">JustSend.cv</div>
            </div>
          </a>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-2">
        <NavMain />
        <NavSecondary />
        <div className="mt-auto">
          <Separator className="mb-2" />
          <NavUser />
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}