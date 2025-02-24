"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function SavedJobsSearch() {
  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Szukaj w zapisanych ofertach..." className="pl-8" />
    </div>
  )
} 