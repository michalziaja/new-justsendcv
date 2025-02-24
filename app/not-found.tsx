"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Przekierowanie po 3 sekundach
    const timeout = setTimeout(() => {
      router.push("/dashboard");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Image
        src="/logo.png"
        alt="JustSend.cv Logo"
        width={120}
        height={120}
        className="mb-8"
      />
      <h1 className="text-4xl font-bold mb-4">Ups! Nic tu nie ma</h1>
      <p className="text-muted-foreground text-lg mb-8">
        Za chwilę przekierujemy Cię na stronę główną...
      </p>
      <div className="animate-pulse text-primary">
        Przekierowywanie...
      </div>
    </div>
  );
} 