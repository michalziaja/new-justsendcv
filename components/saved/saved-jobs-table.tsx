"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

type StatusType = 
  | "saved"
  | "sent"
  | "contact"
  | "interview"
  | "offer"
  | "rejected"

const statusConfig = {
  saved: {
    label: "Zapisana",
    color: "text-blue-500 bg-blue-50 dark:bg-blue-950",
  },
  sent: {
    label: "Wysłana",
    color: "text-purple-500 bg-purple-50 dark:bg-purple-950",
  },
  contact: {
    label: "Kontakt",
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950",
  },
  interview: {
    label: "Rozmowa",
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950",
  },
  offer: {
    label: "Oferta",
    color: "text-green-500 bg-green-50 dark:bg-green-950",
  },
  rejected: {
    label: "Odmowa",
    color: "text-red-500 bg-red-50 dark:bg-red-950",
  },
}

function StatusCell({ status }: { status: StatusType }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`w-full justify-between ${statusConfig[status].color} hover:${statusConfig[status].color}`}
        >
          {statusConfig[status].label}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(statusConfig).map(([key, value]) => (
          <DropdownMenuItem 
            key={key}
            className={value.color}
          >
            {value.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const columns = [
  { key: "title", label: "Stanowisko" },
  { key: "link", label: "Link" },
  { key: "company", label: "Firma" },
  { key: "status", label: "Status" },
  { key: "date", label: "Data dodania" },
  { key: "info", label: "Info" },
  { key: "priority", label: "Priorytet" },
  { key: "edit", label: "Edytuj" },
  { key: "delete", label: "Usuń" }
]

export function SavedJobsTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Frontend Developer</TableCell>
            <TableCell>nofluffjobs.com</TableCell>
            <TableCell>Example Corp</TableCell>
            <TableCell>
              <StatusCell status="saved" />
            </TableCell>
            <TableCell>2024-03-15</TableCell>
            <TableCell>...</TableCell>
            <TableCell>Wysoki</TableCell>
            <TableCell>...</TableCell>
            <TableCell>...</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
} 