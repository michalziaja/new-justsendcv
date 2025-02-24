import { AppSidebar } from "@/components/app-sidebar"
import { SavedJobsTable } from "@/components/saved/saved-jobs-table"
import { SavedJobsSearch } from "@/components/saved/saved-jobs-search"
import { SavedJobsPagination } from "@/components/saved/saved-jobs-pagination"
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


export default async function SavedPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/");
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <Header pageName="Zapisane" />
        <div className="flex flex-col gap-4 p-4">
          <SavedJobsSearch />
          <SavedJobsTable />
          <SavedJobsPagination />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
