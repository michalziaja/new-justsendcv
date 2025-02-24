import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Darmowy",
    price: "0 zł",
    description: "Wszystko czego potrzebujesz na start",
    features: [
      "1 szablon CV",
      "Podstawowy edytor",
      "Eksport do PDF",
      "Pomoc AI (limit)"
    ]
  },
  {
    name: "Premium",
    price: "29 zł",
    period: "/ miesiąc",
    description: "Idealne rozwiązanie dla profesjonalistów",
    features: [
      "Wszystkie szablony CV",
      "Zaawansowany edytor",
      "Nielimitowane CV",
      "Pełne wsparcie AI",
      "Priorytetowe wsparcie"
    ],
    popular: true
  }
]

export function PricingSection() {
  return (
    <section className="container mx-auto px-4 py-16 space-y-8 max-w-7xl">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Proste i przejrzyste ceny</h2>
        <p className="text-muted-foreground">Wybierz plan dopasowany do Twoich potrzeb</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.name} 
            className={`rounded-xl border p-8 ${plan.popular ? 'border-primary' : ''}`}
          >
            {plan.popular && (
              <span className="text-sm font-medium text-primary mb-2 block">
                Najpopularniejszy wybór
              </span>
            )}
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground ml-1">{plan.period}</span>
            </div>
            <p className="mt-2 text-muted-foreground">{plan.description}</p>
            <ul className="mt-8 space-y-4">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full mt-8" variant={plan.popular ? "default" : "outline"}>
              Wybierz plan
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}
