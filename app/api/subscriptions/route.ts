// //app/api/subscriptions/route.ts
// import { NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import { createClerkSupabaseClient } from "@/utils/supabaseClient";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-01-27.acacia",
// });

// export async function POST(request: Request) {
//   const { userId, getToken } = await auth();

//   if (!userId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { plan } = await request.json();
//   if (!plan || !["free", "premium"].includes(plan)) {
//     return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
//   }

//   const supabaseToken = await getToken({ template: "supabase" });
//   const supabase = await createClerkSupabaseClient({
//     getToken: async () => supabaseToken,
//   } as any);

//   // Sprawdź, czy subskrypcja już istnieje
//   const { data: existingSubscription } = await supabase
//     .from("subscriptions")
//     .select("*")
//     .eq("user_id", userId)
//     .single();

//   if (existingSubscription) {
//     return NextResponse.json(
//       { message: "Subscription already exists" },
//       { status: 200 }
//     );
//   }

//   if (plan === "free") {
//     // Tworzenie planu darmowego
//     const { data, error } = await supabase
//       .from("subscriptions")
//       .insert({
//         user_id: userId,
//         plan: "free",
//         status: "active",
//         job_offers_limit: 20,
//         cv_creator_limit: 3,
//       })
//       .select();

//     if (error) throw error;

//     return NextResponse.json({ success: true, data }, { status: 201 });
//   } else if (plan === "premium") {
//     // Inicjalizacja płatności Stripe dla planu premium
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price: process.env.STRIPE_PREMIUM_PRICE_ID, // ID ceny z Stripe Dashboard
//           quantity: 1,
//         },
//       ],
//       mode: "subscription",
//       success_url: `${request.headers.get("origin")}/success`,
//       cancel_url: `${request.headers.get("origin")}/welcome`,
//       metadata: { userId },
//       allow_promotion_codes: true,
//     });

//     return NextResponse.json({ sessionId: session.id }, { status: 200 });
//   }
// }


//app/api/subscriptions/route.ts
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
  if (!plan || !["free", "premium"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const supabaseToken = await getToken({ template: "supabase" });
  const supabase = await createClerkSupabaseClient({
    getToken: async () => supabaseToken,
  } as any);

  const currentDate = new Date().toISOString();

  if (plan === "free") {
    // Sprawdzenie, czy subskrypcja już istnieje
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

    if (existingSubscription) {
      return NextResponse.json(
        { message: "Already on Free plan", status: "active", plan: "free" },
        { status: 200 }
      );
    }

    // Tworzenie nowej subskrypcji Free
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan: "free",
        status: "active",
        start_date: currentDate,
        end_date: null, // Brak end_date dla Free
        current_offers: 0,
        total_offers: 0,
        current_limit: 10,
        total_limit: 20,
        cv_creator_limit: 3,
        cv_creator_used: 0,
        created_at: currentDate,
        updated_at: currentDate,
      })
      .select();

    if (error) {
      console.error("Błąd tworzenia darmowej subskrypcji:", error);
      return NextResponse.json(
        { error: "Failed to create free subscription", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data, status: "active", plan: "free" }, { status: 201 });
  } else if (plan === "premium") {
    // Sprawdzenie, czy subskrypcja już istnieje
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

    if (existingSubscription && existingSubscription.plan === "premium" && existingSubscription.status === "active") {
      return NextResponse.json(
        { message: "Already on Premium plan", status: "active", plan: "premium" },
        { status: 200 }
      );
    }

    // Inicjalizacja płatności Stripe dla planu Premium (bez tworzenia wpisu w subscriptions)
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
      cancel_url: `${request.headers.get("origin")}/welcome`,
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

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}