import { Send } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 w-full">
      <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-4 max-w-7xl">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Send className="h-5 w-5" />
            <span className="font-bold">JustSend.cv</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Twórz profesjonalne CV z pomocą sztucznej inteligencji
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Produkt</h3>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="text-muted-foreground hover:text-foreground">Kreator CV</a></li>
            <li><a href="#" className="text-muted-foreground hover:text-foreground">Szablony</a></li>
            <li><a href="#" className="text-muted-foreground hover:text-foreground">Cennik</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Firma</h3>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="text-muted-foreground hover:text-foreground">O nas</a></li>
            <li><a href="#" className="text-muted-foreground hover:text-foreground">Blog</a></li>
            <li><a href="#" className="text-muted-foreground hover:text-foreground">Kontakt</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Pomoc</h3>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="text-muted-foreground hover:text-foreground">FAQ</a></li>
            <li><a href="#" className="text-muted-foreground hover:text-foreground">Wsparcie</a></li>
            <li><a href="#" className="text-muted-foreground hover:text-foreground">Dokumentacja</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center text-sm text-muted-foreground max-w-7xl">
          <span>© 2024 JustSend.cv. Wszelkie prawa zastrzeżone.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Polityka prywatności</a>
            <a href="#" className="hover:text-foreground">Regulamin</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
