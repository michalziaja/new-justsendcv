import { AppSidebar } from "@/components/app-sidebar"
import { StatsCards } from "@/components/stats/cards"
import { PieChart } from "@/components/stats/pie-chart"
import { BarChart } from "@/components/stats/bar-chart"
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
import { Header } from "@/components/app-header"

export default async function StatsPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/");
  }

  // Przykładowe dane
  const statsData = {
    saved: 12,
    sent: 8,
    contact: 4,
    interview: 2,
    rejected: 3,
    offer: 1
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <Header pageName="Statystyki" />
        <div className="flex flex-col gap-4 p-4 min-h-[calc(100vh-4rem)] overflow-auto">
          {/* Górna sekcja z kartami statystyk */}
          <StatsCards {...statsData} />
          
          {/* Dolna sekcja z wykresami - zmodyfikowany układ */}
          <div className="grid gap-4 md:grid-cols-3 flex-1">
            <div className="md:col-span-2 min-h-[400px]">
              <BarChart />
            </div>
            <div className="min-h-[400px]">
              <PieChart />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
