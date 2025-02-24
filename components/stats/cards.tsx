import {
  BookmarkIcon,
  SendIcon,
  PhoneCallIcon,
  UserIcon,
  XCircleIcon,
  CheckCircleIcon,
} from "lucide-react"

interface StatsCardsProps {
  saved: number
  sent: number
  contact: number
  interview: number
  rejected: number
  offer: number
}

export function StatsCards({ saved, sent, contact, interview, rejected, offer }: StatsCardsProps) {
  const stats = [
    {
      title: "ZAPISANE",
      value: saved,
      icon: BookmarkIcon,
      description: "Oczekujące na wysłanie"
    },
    {
      title: "WYSŁANE",
      value: sent,
      icon: SendIcon,
      description: "Wysłane aplikacje"
    },
    {
      title: "KONTAKT",
      value: contact,
      icon: PhoneCallIcon,
      description: "Odpowiedzi od pracodawców"
    },
    {
      title: "ROZMOWA",
      value: interview,
      icon: UserIcon,
      description: "Zaplanowane rozmowy"
    },
    {
      title: "ODMOWA",
      value: rejected,
      icon: XCircleIcon,
      description: "Odrzucone aplikacje"
    },
    {
      title: "OFERTA",
      value: offer,
      icon: CheckCircleIcon,
      description: "Otrzymane oferty"
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <div key={stat.title} className="rounded-xl border bg-card p-5">
          <div className="flex items-start justify-between">
            <span className="text-base font-medium truncate">{stat.title}</span>
            <stat.icon className="h-6 w-6 text-muted-foreground ml-2 shrink-0" />
          </div>
          <div className="mt-4 text-3xl font-bold text-center">{stat.value}</div>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{stat.description}</p>
        </div>
      ))}
    </div>
  )
}
