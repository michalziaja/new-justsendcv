"use client"

import { useState, useEffect } from "react"
import { Chrome, FileBox, Globe, ChevronsUpDown } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const EXTENSIONS = {
  chrome: "https://chromewebstore.google.com/detail/justsendcv/niokbopldaadogfkhbmlpkcfmhoeijfo",
  firefox: "https://addons.mozilla.org/firefox/addon/justsendcv",
  opera: "https://addons.opera.com/extensions/details/justsendcv",
}

export function NavSecondary() {
  const { user } = useUser()
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [isLoadingPlan, setIsLoadingPlan] = useState(true)
  const [isExtensionsOpen, setIsExtensionsOpen] = useState(false)

  useEffect(() => {
    if (user) {
      setIsLoadingPlan(true)
      fetch("/api/subscription-info", { method: "GET" })
        .then((res) => res.json())
        .then((data) => setCurrentPlan(data.subscription?.plan || "free"))
        .catch((err) => console.error("Error fetching subscription:", err))
        .finally(() => setIsLoadingPlan(false))
    }
  }, [user])

  const handleUpgrade = () => {
    router.push("/upgrade")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <SidebarMenu className="list-none mt-10">
          <SidebarMenuItem className="list-none">
            <Card className="shadow-none border-none">
              <CardHeader className="p-4">
                <div 
                  className="flex items-center gap-2 cursor-pointer min-h-[30px]"
                  onClick={() => setIsExtensionsOpen(!isExtensionsOpen)}
                >
                  <Globe className="h-5 w-5" />
                  <CardTitle className="text-sm flex-1">Pobierz wtyczkę</CardTitle>
                  <ChevronsUpDown 
                    className={`h-4 w-4 transition-transform ${isExtensionsOpen ? 'rotate-180' : ''}`} 
                  />
                </div>
                {isExtensionsOpen && (
                  <CardDescription className="mt-2">
                    Zainstaluj JustSend.cv w swojej przeglądarce.
                  </CardDescription>
                )}
              </CardHeader>
              {isExtensionsOpen && (
                <CardContent className="grid gap-1.5 p-4 pt-0">
                  <a 
                    href={EXTENSIONS.chrome}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  >
                    <Chrome className="h-4 w-4" />
                    <span>Chrome</span>
                  </a>
                  <a 
                    href={EXTENSIONS.firefox}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  >
                    <FileBox className="h-4 w-4" />
                    <span>Firefox</span>
                  </a>
                  <a 
                    href={EXTENSIONS.opera}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Opera</span>
                  </a>
                </CardContent>
              )}
            </Card>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>

      {!isLoadingPlan && currentPlan === "free" && (
        <div className="mt-auto mb-4">
          <SidebarMenu className="list-none">
            <SidebarMenuItem className="list-none">
              <button
                onClick={handleUpgrade}
                className="w-full text-left text-sm text-primary hover:underline px-4 py-2"
              >
                Aktywuj Premium
              </button>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      )}
    </div>
  )
} 

