"use client"

import {
    Chrome,
    FileText,
    Mail,
    MessageSquare,
    TrendingUp,
    BarChart
  } from "lucide-react"
  
  const features = [
    {
      icon: Chrome,
      title: "Śledzenie Aplikacji",
      description: "Zapisuj oferty jednym kliknięciem z największych portali pracy. Monitoruj status aplikacji, dodawaj notatki i otrzymuj powiadomienia o zmianach. System dzięki swojej przejrzystości zapobiega duplikowaniu zgłoszeń."
    },
    {
      icon: FileText,
      title: "Inteligentny Kreator CV",
      description: "Twórz profesjonalne CV dopasowane do konkretnych ofert. AI analizuje wymagania i optymalizuje treść pod kątem słów kluczowych i standardów ATS, zwiększając Twoje szanse na sukces."
    },
    {
      icon: Mail,
      title: "Generator Korespondencji",
      description: "Błyskawicznie twórz spersonalizowane listy motywacyjne, wiadomości do HR, podziękowania czy propozycje negocjacji. AI pomoże Ci zachować profesjonalny ton i wyróżnić się na tle innych."
    },
    {
      icon: MessageSquare,
      title: "Trening Rozmów",
      description: "Przygotuj się do rozmowy kwalifikacyjnej z AI. System generuje spersonalizowane pytania bazując na Twoim doświadczeniu i wymaganiach pracodawcy. Otrzymuj feedback i wskazówki do poprawy."
    },
    {
      icon: TrendingUp,
      title: "Asystent Kariery",
      description: "Otrzymuj spersonalizowany plan rozwoju zawodowego. AI analizuje trendy rynkowe i Twoje cele, sugerując szkolenia i ścieżki rozwoju, które zwiększą Twoją wartość na rynku pracy."
    },
    {
      icon: BarChart,
      title: "Analityka Kariery",
      description: "Śledź swoją skuteczność w poszukiwaniu pracy dzięki zaawansowanym statystykom. Monitoruj współczynnik odpowiedzi, porównuj oferty i wykorzystuj kalkulator wynagrodzeń (UoP/B2B) do podejmowania świadomych decyzji."
    }
  ]
  
  const stats = [
    {
      value: "85%",
      description: "Większa szansa na zaproszenie na rozmowę dzięki AI-optymalizacji CV"
    },
    {
      value: "3x",
      description: "Szybsze przygotowanie aplikacji dzięki inteligentnym szablonom"
    },
    {
      value: "100+",
      description: "Spersonalizowanych pytań do przygotowania się do rozmowy"
    },
    {
      value: "24/7",
      description: "Dostęp do asystenta kariery napędzanego sztuczną inteligencją"
    }
  ]
  
  export function FeaturesSection() {
    return (
      <>
        <section className="container mx-auto py-12 px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Zaawansowane funkcje dla <span className="text-primary">każdego</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              JustSend.cv to nie tylko narzędzie do wysyłania CV. To kompleksowa platforma, która pomoże Ci 
              zoptymalizować cały proces poszukiwania pracy i rozwoju kariery.
            </p>
          </div>
  
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mt-4">{feature.title}</h3>
                <p className="text-muted-foreground mt-2">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
  
        <div className="container mx-auto px-4">
          <div className="h-px bg-border my-8" />
        </div>
  
        <section className="container mx-auto py-12 px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Zwiększ swoje <span className="text-primary">szanse na sukces</span>
            </h2>
            <p className="text-muted-foreground text-lg mt-4">
              JustSend.cv pomoże Ci zoptymalizować każdy aspekt poszukiwania pracy
            </p>
          </div>
  
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.value} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <p className="text-muted-foreground">{stat.description}</p>
              </div>
            ))}
          </div>
        </section>
      </>
    )
  }
  