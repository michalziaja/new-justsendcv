'use client'

import { useState, useEffect } from 'react'
import { useUser, useSession } from '@clerk/nextjs'
import { UserProfile } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClerkSupabaseClient } from '@/utils/supabaseClient'
import { AppSidebar } from "@/components/app-sidebar"
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
import { Header } from "@/components/app-header"

export default function ProflPage() {

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <Header pageName="Profil" />
        <div className="flex flex-col gap-8 p-4">
          

          <div>
            <h2 className="text-2xl font-bold mb-4">Dodatkowe informacje</h2>
            
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
