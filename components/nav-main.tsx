"use client"

import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Bot,
  BookmarkIcon,
  FileText,
  BarChart2,
  UserCircle,
  PenTool,
  BrainCircuit,
  Calculator,
} from "lucide-react"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Home",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Zapisane",
    url: "/saved",
    icon: BookmarkIcon,
  },
  {
    title: "Kreator CV",
    url: "/creator",
    icon: PenTool,
  },
  {
    title: "Twoje CV",
    url: "/cv",
    icon: FileText,
  },
  {
    title: "Kalkulator",
    url: "/calculator",
    icon: Calculator,
  },
  {
    title: "Trening",
    url: "/training",
    icon: BrainCircuit,
  },
  {
    title: "Asystent AI",
    url: "/ai_assistant",
    icon: Bot,
  },
  {
    title: "Statystyki",
    url: "/stats",
    icon: BarChart2,
  },
  {
    title: "Profil",
    url: "/profile",
    icon: UserCircle,
  },
]

export function NavMain() {
  const pathname = usePathname()

  return (
    <SidebarMenu className="list-none mt-2">
      {navItems.map((item) => (
        <SidebarMenuItem key={item.title} className="list-none">
          <SidebarMenuButton 
            asChild 
            isActive={pathname === item.url}
          >
            <a href={item.url} className="flex items-center gap-2">
              <item.icon className="h-5 w-5" />
              <span className="text-base font-medium">{item.title}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
} 