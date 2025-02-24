import { Header } from "@/components/home/header"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { PricingSection } from "@/components/home/pricing-sections"
import { FAQSection } from "@/components/home/faq-section"
import { Footer } from "@/components/home/footer"
import { AppShowcase } from "@/components/home/app-showcase"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-screen-2xl mx-auto w-full">
        <HeroSection />
        <AppShowcase />
        <FeaturesSection />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}
