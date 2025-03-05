"use client";

import { useState, useEffect, useTransition } from "react"; // Dodano useTransition
import { useUser } from "@clerk/nextjs";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function UpgradePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition(); // Dodano useTransition

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user || !isLoaded) {
        setIsCheckingSubscription(false);
        setIsEligible(false); // Blokuj, jeśli użytkownik nie jest załadowany
        return;
      }

      startTransition(async () => { // Użycie useTransition do opóźnienia renderowania
        try {
          const response = await fetch(`/api/subscription-check`, {
            headers: { "Content-Type": "application/json" },
          });
          const data = await response.json();

          if (!response.ok) {
            console.error("Błąd pobierania subskrypcji:", data.error);
            setIsCheckingSubscription(false);
            setIsEligible(false); // Blokuj w przypadku błędu
            return;
          }

          // Użytkownik jest uprawniony tylko, jeśli ma plan "free"
          if (data.plan === "free")  {
            setIsEligible(true);
          } else {
            router.push("/dashboard"); // Przekieruj na /dashboard, jeśli plan nie jest Free
          }
        } catch (error) {
          console.error("Error checking subscription:", error);
          setIsEligible(false); // Blokuj w przypadku błędu
        } finally {
          setIsCheckingSubscription(false);
        }
      });
    };

    checkSubscription();
  }, [user, isLoaded, startTransition]); // Dodano startTransition do zależności

  const handleStripeCheckout = async () => {
    if (!isEligible) {
      alert("Nie możesz uaktualnić planu – posiadasz już plan Premium lub nie masz uprawnień.");
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch("/api/subscriptions-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          plan: "premium",
          userId: user?.id 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Nie udało się zainicjować ulepszenia do planu premium");
      }
      
      if (!data.sessionId) {
        throw new Error("Nie otrzymano identyfikatora sesji płatności");
      }
      
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Nie udało się załadować Stripe");
      
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Błąd podczas inicjowania płatności:", error);
      alert("Wystąpił błąd podczas inicjowania płatności. Spróbuj ponownie później.");
    } finally {
      setLoading(false);
    }
  };

  // Wyświetlaj spinner, dopóki isLoaded, isCheckingSubscription lub isPending są true
  if (!isLoaded || isCheckingSubscription || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Ładowanie...
      </div>
    );
  }

  if (!isEligible) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Brak uprawnień</h1>
          <p className="text-muted-foreground mb-6">
            Posiadasz już plan Premium lub nie masz uprawnień do uaktualnienia. Skontaktuj się z pomocą techniczną, jeśli potrzebujesz pomocy.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            Powrót do dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Jeśli użytkownik ma plan Free, wyświetl interfejs upgrade
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Przejdź na Premium!</h1>
        <p className="text-muted-foreground text-lg mb-2">
          Odblokuj pełen potencjał JustSend.cv
        </p>
      </div>

      <div className="max-w-lg w-full">
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Plan Premium</CardTitle>
            <CardDescription>Dla profesjonalistów</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-6">29 zł/msc</div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>100 zapisanych ofert pracy</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>50 szablonów CV</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Zaawansowane statystyki</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Nielimitowany dostęp do asystenta AI</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Priorytetowe wsparcie</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              variant="default" 
              onClick={handleStripeCheckout}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Przetwarzanie...
                </>
              ) : (
                "Ulepsz do Premium"
              )}
            </Button>
          </CardFooter>
        </Card>
        <div className="mt-4 flex justify-start">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót do dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}