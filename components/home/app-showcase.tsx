import { Bot, FileText, Send } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI Asystent",
    description: "Wykorzystaj sztuczną inteligencję do tworzenia profesjonalnych opisów doświadczenia"
  },
  {
    icon: FileText,
    title: "Gotowe szablony",
    description: "Wybierz spośród wielu profesjonalnych szablonów CV dostosowanych do Twojej branży"
  },
  {
    icon: Send,
    title: "Szybkie wysyłanie",
    description: "Wysyłaj swoje CV bezpośrednio do pracodawców z poziomu aplikacji"
  }
]

export function AppShowcase() {
  return (
    <section className="container mx-auto px-4 py-16 space-y-12 max-w-7xl">
      <h2 className="text-3xl font-bold text-center">
        Wszystko czego potrzebujesz do stworzenia idealnego CV
      </h2>
      <div className="grid gap-8 md:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-lg border bg-card p-8">
            <feature.icon className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
