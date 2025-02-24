import { AppSidebar } from "@/components/app-sidebar"
import { Goal } from "@/components/dashboard/goal"
import { Checklist } from "@/components/dashboard/checklist"
import { Calendar } from "@/components/dashboard/calendar"
import { RecentOffers } from "@/components/dashboard/recent-offers"
import { News } from "@/components/dashboard/news"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ThemeToggle } from "@/components/mode-toggle"
import { Header } from "@/components/app-header"

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/");
  }

  return (
    <SidebarProvider
      defaultOpen={true}
    >
      <AppSidebar />
      <SidebarInset>
        <Header pageName="Home" />
        
        <div className="flex flex-col gap-4 p-4 min-h-[calc(100vh-4rem)] overflow-auto">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="min-h-[280px]">
              <Goal />
            </div>
            <div className="min-h-[280px]">
              <Checklist />
            </div>
            <div className="min-h-[280px]">
              <Calendar />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 flex-1 min-h-[500px]">
            <RecentOffers />
            <News />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
