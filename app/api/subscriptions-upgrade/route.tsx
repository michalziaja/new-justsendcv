//app/api/subscriptions-upgrade/route.tsx

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/utils/supabaseClient";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(request: Request) {
  const { userId, getToken } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await request.json();
  if (!plan || !["premium"].includes(plan)) { // Ograniczone do Premium, bo upgrade dotyczy tylko tego planu
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const supabaseToken = await getToken({ template: "supabase" });
  const supabase = await createClerkSupabaseClient({
    getToken: async () => supabaseToken,
  } as any);

  // Sprawdzenie istniejącej subskrypcji (opcjonalne, ale przydatne do weryfikacji)
  const { data: existingSubscription, error: fetchError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 to "no rows found"
    console.error("Błąd sprawdzania subskrypcji:", fetchError);
    return NextResponse.json(
      { error: "Failed to check subscription", details: fetchError.message },
      { status: 500 }
    );
  }

  // Jeśli subskrypcja istnieje i jest już Premium z statusem "active", zwróć komunikat
  if (existingSubscription && existingSubscription.plan === "premium" && existingSubscription.status === "active") {
    return NextResponse.json(
      { message: "Already on Premium plan", status: "active", plan: "premium" },
      { status: 200 }
    );
  }

  // Inicjalizacja płatności Stripe dla planu Premium (bez zmiany subskrypcji)
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: process.env.STRIPE_PREMIUM_PRICE_ID!,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${request.headers.get("origin")}/success`,
    cancel_url: `${request.headers.get("origin")}/upgrade`,
    metadata: {
      userId: userId
    },
    subscription_data: {
      metadata: {
        userId: userId
      }
    },
    client_reference_id: userId,
    customer_email: (await auth()).sessionClaims?.email as string,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ sessionId: session.id }, { status: 200 });
}