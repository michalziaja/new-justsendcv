import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { ThemeToggle } from "@/components/mode-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between max-w-7xl">
        <div className="flex items-center gap-2">
          <Send className="h-6 w-6" />
          <span className="text-xl font-bold">JustSend.cv</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <a href="/sign-in">Zaloguj się</a>
          </Button>
          <Button asChild>
            <a href="/sign-up">Rozpocznij za darmo</a>
          </Button>
        </div>
      </div>
    </header>
  )
}
