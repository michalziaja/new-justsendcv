import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/utils/supabaseClient";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(request: Request) {
  const authResult = await auth(); // Pobierz obiekt Auth
  const { userId, getToken } = authResult;

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

  // Pobierz email użytkownika z tabeli profiles w Supabase, używając userId z Clerk
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("email")
    .eq("user_id", userId)
    .single();

  if (profileError) {
    console.error("Błąd pobierania profilu użytkownika:", profileError);
    return NextResponse.json(
      { error: "Nie można pobrać profilu użytkownika", details: profileError.message },
      { status: 500 }
    );
  }

  if (!profile || !profile.email) {
    return NextResponse.json(
      { error: "Nie można pobrać adresu e-mail użytkownika z profilu" },
      { status: 400 }
    );
  }

  const customerEmail = profile.email; // Użyj email z tabeli profiles

  // Inicjalizacja płatności Stripe dla planu Premium z automatycznym wypełnieniem email
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
    customer_email: customerEmail, // Użyj email z profiles
    allow_promotion_codes: true,
  });

  return NextResponse.json({ sessionId: session.id }, { status: 200 });
}