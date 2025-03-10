// "use client";

// import { useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { loadStripe } from "@stripe/stripe-js";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Check, Loader2 } from "lucide-react";
// import { useRouter } from "next/navigation";

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);


// export default function WelcomePage() {
//   const { user, isLoaded } = useUser();
//   const router = useRouter();
//   const [loading, setLoading] = useState<string | null>(null);

//   const handlePlanSelect = async (plan: "free" | "premium") => {
//     setLoading(plan);
//     try {
//       const response = await fetch("/api/subscriptions", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ plan }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Nie udało się aktywować planu");
//       }

//       if (plan === "free") {
//         router.push("/dashboard"); // Przekierowanie na /dashboard po darmowym planie
//       } else if (plan === "premium") {
//         const stripe = await stripePromise;
//         if (!stripe) throw new Error("Nie udało się załadować Stripe");
//         await stripe.redirectToCheckout({ sessionId: data.sessionId });
//         // Po sukcesie Stripe Checkout webhook przekieruje na /success, a potem /dashboard
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       if (error instanceof Error) {
//         alert(error.message);
//       } else {
//         alert("Wystąpił błąd");
//       }
//     } finally {
//       setLoading(null);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
//       <div className="text-center mb-12">
//         <h1 className="text-4xl font-bold mb-4">Witaj w JustSend.cv!</h1>
//         <p className="text-muted-foreground text-lg mb-2">
//           Wybierz plan, który najlepiej odpowiada Twoim potrzebom
//         </p>
//         <p className="text-muted-foreground">
//           Możesz zmienić plan w dowolnym momencie w ustawieniach konta
//         </p>
//       </div>

//       <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
//         {/* Plan Darmowy */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Plan Darmowy</CardTitle>
//             <CardDescription>Idealny na start</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold mb-6">0 zł</div>
//             <ul className="space-y-2">
//               <li className="flex items-center gap-2">
//                 <Check className="h-5 w-5 text-green-500" />
//                 <span>20 zapisanych ofert pracy</span>
//               </li>
//               <li className="flex items-center gap-2">
//                 <Check className="h-5 w-5 text-green-500" />
//                 <span>3 szablony CV</span>
//               </li>
//               <li className="flex items-center gap-2">
//                 <Check className="h-5 w-5 text-green-500" />
//                 <span>Podstawowe statystyki</span>
//               </li>
//               <li className="flex items-center gap-2">
//                 <Check className="h-5 w-5 text-green-500" />
//                 <span>Dostęp do asystenta AI (limit)</span>
//               </li>
//             </ul>
//           </CardContent>
//           <CardFooter>
//             <Button 
//               className="w-full"
//               onClick={() => handlePlanSelect("free")}
//               disabled={loading === "free"}
//             >
//               {loading === "free" ? (
//                 <Loader2 className="h-4 w-4 animate-spin mr-2" />
//               ) : null}
//               Rozpocznij za darmo
//             </Button>
//           </CardFooter>
//         </Card>

//         {/* Plan Premium */}
//         <Card className="border-2 border-primary">
//           <CardHeader>
//             <CardTitle>Plan Premium</CardTitle>
//             <CardDescription>Dla profesjonalistów</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold mb-6">29 zł/msc</div>
//             <ul className="space-y-2">
//               <li className="flex items-center gap-2">
//                 <Check className="h-5 w-5 text-green-500" />
//                 <span>100 zapisanych ofert pracy</span>
//               </li>
//               <li className="flex items-center gap-2">
//                 <Check className="h-5 w-5 text-green-500" />
//                 <span>50 szablonów CV</span>
//               </li>
//               <li className="flex items-center gap-2">
//                 <Check className="h-5 w-5 text-green-500" />
//                 <span>Zaawansowane statystyki</span>
//               </li>
//               <li className="flex items-center gap-2">
//                 <Check className="h-5 w-5 text-green-500" />
//                 <span>Nielimitowany dostęp do asystenta AI</span>
//               </li>
//               <li className="flex items-center gap-2">
//                 <Check className="h-5 w-5 text-green-500" />
//                 <span>Priorytetowe wsparcie</span>
//               </li>
//             </ul>
//           </CardContent>
//           <CardFooter>
//             <Button 
//               className="w-full"
//               variant="default"
//               onClick={() => handlePlanSelect("premium")}
//               disabled={loading === "premium"}
//             >
//               {loading === "premium" ? (
//                 <Loader2 className="h-4 w-4 animate-spin mr-2" />
//               ) : null}
//               Wybierz Plan Premium
//             </Button>
//           </CardFooter>
//         </Card>
//       </div>
//     </div>
//   );
// }

//app/welcome/page.tsx

"use client";

import { useState, useEffect, useTransition } from "react"; // Dodano useTransition
import { useUser } from "@clerk/nextjs";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function WelcomePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [isPending, startTransition] = useTransition(); // Dodano useTransition

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user || !isLoaded) {
        setIsCheckingSubscription(false);
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
            return;
          }

          if (data.status !== null || data.plan !== null) {
            router.push("/dashboard");
            return;
          }

          setSubscriptionStatus(data.status);
          setSubscriptionPlan(data.plan);
        } catch (error) {
          console.error("Error fetching subscription:", error);
        } finally {
          setIsCheckingSubscription(false);
        }
      });
    };

    fetchSubscription();
  }, [user, isLoaded, startTransition]); // Dodano startTransition do zależności

  const handlePlanSelect = async (plan: "free" | "premium") => {
    if (!user || !isLoaded) return;

    setLoading(plan);
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId: user.id }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Nieprawidłowy JSON w odpowiedzi:", jsonError);
        throw new Error("Serwer zwrócił nieprawidłową odpowiedź");
      }

      if (!response.ok) {
        throw new Error(data.error || "Nie udało się aktywować planu");
      }

      if (plan === "free") {
        const { status, plan: serverPlan } = data;
        if (status === "active" && serverPlan === "free") {
          router.push("/dashboard");
        } else {
          alert("Twoja subskrypcja nie jest jeszcze aktywna. Zakończ płatność lub poczekaj na potwierdzenie.");
        }
      } else if (plan === "premium") {
        const stripe = await stripePromise;
        if (!stripe) throw new Error("Nie udało się załadować Stripe");
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Wystąpił błąd");
    } finally {
      setLoading(null);
    }
  };

  // Wyświetlaj spinner, dopóki isLoaded i isCheckingSubscription są true, lub jeśli jest pending transition
  if (!isLoaded || isCheckingSubscription || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Ładowanie...
      </div>
    );
  }

  // Jeśli nie ma subskrypcji, wyświetl interfejs wyboru planu
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Witaj w JustSend.cv!</h1>
        <p className="text-muted-foreground text-lg mb-2">
          Wybierz plan, który najlepiej odpowiada Twoim potrzebom
        </p>
        <p className="text-muted-foreground">
          Możesz zmienić plan w dowolnym momencie w ustawieniach konta
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Card>
          <CardHeader>
            <CardTitle>Plan Darmowy</CardTitle>
            <CardDescription>Idealny na start</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-6">0 zł</div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Bez podawania karty kredytowej</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>10 zapisanych ofert pracy</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>3 szablony CV</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Podstawowe statystyki</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Dostęp do asystenta AI (limit)</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handlePlanSelect("free")}
              disabled={loading === "free" || !isLoaded}
            >
              {loading === "free" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Rozpocznij za darmo
            </Button>
          </CardFooter>
        </Card>

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
              onClick={() => handlePlanSelect("premium")}
              disabled={loading === "premium" || !isLoaded}
            >
              {loading === "premium" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Wybierz Plan Premium
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}