import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Czy mogę wypróbować za darmo?",
    answer: "Tak, możesz korzystać z podstawowej wersji całkowicie za darmo. Nie wymagamy podania karty kredytowej."
  },
  {
    question: "Jak działa asystent AI?",
    answer: "Nasz asystent AI pomaga w tworzeniu profesjonalnych opisów doświadczenia zawodowego, sugeruje odpowiednie słownictwo i formatowanie."
  },
  {
    question: "Czy mogę eksportować CV do PDF?",
    answer: "Tak, wszystkie plany umożliwiają eksport CV do formatu PDF w wysokiej jakości."
  }
]

export function FAQSection() {
  return (
    <section className="container mx-auto px-4 py-16 space-y-8 max-w-7xl">
      <h2 className="text-3xl font-bold text-center">
        Często zadawane pytania
      </h2>
      <div className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible>
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
