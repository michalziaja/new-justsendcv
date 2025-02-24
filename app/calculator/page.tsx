import { AppSidebar } from "@/components/app-sidebar"
import { UopCalculator } from "@/components/calculator/uop-calculator"
import { B2bCalculator } from "@/components/calculator/b2b-calculator"
import { RateCalculator } from "@/components/calculator/rate-calculator"
import { TaxCalculator } from "@/components/calculator/tax-calculator"
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



export default async function CalculatorPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar collapsible="offcanvas" />
      <SidebarInset>
        <Header pageName="Kalkulator" />
        <div className="flex flex-col gap-4 p-4 min-h-[calc(100vh-4rem)] overflow-auto">
          <div className="grid gap-4 md:grid-cols-2 h-full">
            <div className="min-h-[280px]">
              <UopCalculator />
            </div>
            <div className="min-h-[280px]">
              <B2bCalculator />
            </div>
            <div className="min-h-[280px]">
              <RateCalculator />
            </div>
            <div className="min-h-[280px]">
              <TaxCalculator />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
