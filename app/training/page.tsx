import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/app-header"
import { Construction } from "lucide-react"

export default async function TrainingPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/");
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <Header pageName="Trening" />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <Construction className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Trening w budowie</h1>
          <p className="text-muted-foreground">Ta funkcjonalność będzie dostępna wkrótce</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}