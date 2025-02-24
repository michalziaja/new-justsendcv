"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatyczne przekierowanie po 5 sekundach
    const timeout = setTimeout(() => {
      router.push("/dashboard");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-4">
          Subskrypcja Premium Aktywowana!
        </h1>
        
        <p className="text-muted-foreground mb-8">
          Dziękujemy za wybór planu Premium. Twoje konto zostało zaktualizowane i masz teraz dostęp do wszystkich funkcji premium.
        </p>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Za chwilę zostaniesz przekierowany do panelu głównego...
          </p>
          
          <Button 
            className="w-full"
            onClick={() => router.push("/dashboard")}
          >
            Przejdź do panelu
          </Button>
        </div>
      </Card>
    </div>
  );
} 