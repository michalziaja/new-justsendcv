import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-24 space-y-8 md:py-32 max-w-7xl">
      <div className="flex flex-col items-center text-center gap-6">
        <span className="px-4 py-2 rounded-full bg-muted text-sm font-medium">
          Powered by AI
        </span>
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          Zmień sposób w jaki <br />
          <span className="text-primary">szukasz pracy</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px]">
          Kreator CV z wykorzystaniem sztucznej inteligencji. 
          Twórz, edytuj i wysyłaj swoje CV w prosty sposób.
        </p>
        <div className="flex gap-4">
          <Button size="lg">
            Stwórz CV za darmo
          </Button>
          <Button size="lg" variant="outline">
            Zobacz przykłady
          </Button>
        </div>
      </div>
    </section>
  )
}
