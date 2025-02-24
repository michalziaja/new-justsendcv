"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function UpgradePage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "premium" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nie udało się aktywować planu premium");
      }

      if (!data.sessionId) {
        throw new Error("Nie otrzymano identyfikatora sesji płatności");
      }

      console.log("Otrzymano sessionId:", data.sessionId); // Dla debugowania

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Nie udało się załadować Stripe");

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (error) {
        throw error;
      }
      
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Wystąpił błąd podczas inicjowania płatności");
      }
    } finally {
      setLoading(false);
    }
  };

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
            <div className="text-3xl font-bold mb-6">39 zł/msc</div>
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
              onClick={handleUpgrade}
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