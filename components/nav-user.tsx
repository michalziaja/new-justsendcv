//components/nav-user.tsx
"use client"

import { UserCircle, LogOut, CreditCard, Loader2, ChevronsUpDown } from "lucide-react"
import { useClerk, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

export function NavUser() {
  const { signOut, openUserProfile } = useClerk()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscriptionClick = () => {
    router.push("/upgrade")
  }

  if (!isLoaded) {
    return (
      <SidebarMenuItem className="list-none">
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarFallback className="rounded-lg bg-muted animate-pulse" />
          </Avatar>
          <div className="grid flex-1 gap-1">
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="h-3 w-32 rounded bg-muted animate-pulse" />
          </div>
          <ChevronsUpDown className="ml-auto size-4 text-muted" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : '';

  return (
    <SidebarMenuItem className="list-none">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full"
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user?.imageUrl} alt={user?.firstName ?? ''} />
              <AvatarFallback className="rounded-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user?.emailAddresses[0]?.emailAddress}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          side="right" 
          align="start" 
          sideOffset={8}
          className="w-[--radix-dropdown-menu-trigger-width] min-w-[240px]"
        >
          <DropdownMenuLabel className="font-normal">
            <div className="px-2 py-1.5">
              <div className="grid gap-0.5">
                <span className="font-semibold">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.emailAddresses[0]?.emailAddress}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {/* <DropdownMenuItem 
              onClick={handleSubscriptionClick}
              className="flex items-center gap-2"
              disabled={isLoadingPortal}
            >
              <CreditCard className="h-4 w-4" />
              <span>Subskrypcja</span>
            </DropdownMenuItem> */}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem 
              onClick={() => openUserProfile()}
              className="flex items-center gap-2"
            >
              <UserCircle className="h-4 w-4" />
              <span>Konto</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="text-destructive flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Wyloguj</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
} 


