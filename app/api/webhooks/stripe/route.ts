import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClerkSupabaseClient } from "@/utils/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("Brak podpisu Stripe w żądaniu webhook");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Błąd weryfikacji podpisu webhook:", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  const supabase = await createClerkSupabaseClient({
    getToken: async () => process.env.SUPABASE_SERVICE_ROLE_KEY!,
  } as any);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Pobierz subskrypcję po ID z sesji
      const subscriptionId = session.subscription as string;
      const subscription = subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : null;

      // Próba pobrania userId z różnych miejsc
      let userId = session.metadata?.userId || 
                  session.client_reference_id ||
                  subscription?.metadata?.userId;

      // Jeśli nadal brak userId, spróbuj pobrać z klienta
      if (!userId && session.customer) {
        const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
        if ('metadata' in customer) {
          userId = customer.metadata?.userId;
        }
      }

      if (!userId) {
        console.error("Brak userId w metadanych sesji i nie można go pobrać z customer");
        return new NextResponse(
          JSON.stringify({ error: "Missing userId in session metadata" }),
          { status: 400 }
        );
      }

      if (!subscriptionId) {
        console.error("Brak wymaganych danych w sesji Stripe:", { userId, subscriptionId });
        return new NextResponse(
          JSON.stringify({ error: "Missing required data in Stripe session" }),
          { status: 400 }
        );
      }

      // Pobieranie szczegółów subskrypcji ze Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
      const periodStart = new Date(stripeSubscription.current_period_start * 1000);
      const periodEnd = new Date(stripeSubscription.current_period_end * 1000);

      // Sprawdź aktualną subskrypcję przed upsert
      const { data: existingSubscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();

      // console.log("Istniejąca subskrypcja:", existingSubscription);
      console.log("Subskrybcja ulepszona do Premium")
      // Tworzenie lub aktualizacja subskrypcji w bazie danych
      const { error } = await supabase
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            plan: "premium",
            status: "active",
            stripe_subscription_id: subscriptionId,
            start_date: periodStart.toISOString(),
            end_date: periodEnd.toISOString(),
            current_limit: null,
            total_limit: null,
            current_offers: existingSubscription?.current_offers ?? 0,
            total_offers: existingSubscription?.total_offers ?? 0,
            cv_creator_limit: 50,
            cv_creator_used: existingSubscription?.cv_creator_used ?? 0,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
            ignoreDuplicates: false
          }
        );

      if (error) {
        console.error("Błąd aktualizacji/utworzenia subskrypcji:", error);
        console.error("Dane próby upsert:", {
          userId,
          subscriptionId,
          periodStart,
          periodEnd
        });
        return NextResponse.json(
          { error: "Failed to update/create subscription", details: error.message },
          { status: 500 }
        );
      }

      // Powiadomienie o aktywacji subskrypcji
      await supabase.rpc("notify_subscribers", {
        p_user_id: userId,
        p_notification_type: "subscription_activated",
        p_message: "Subskrypcja Premium aktywowana!",
      });
    } else if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;

      const { data: subscription, error: fetchError } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", subscriptionId)
        .single();

      let userId = subscription?.user_id;
      if (!userId && !fetchError) {
        console.warn("Brak userId w subskrypcji – próba pobrania z customer");
        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
        if (stripeSub.customer) {
          const customer = await stripe.customers.retrieve(stripeSub.customer as string) as Stripe.Customer;
          userId = customer.metadata?.userId;
        }
      }

      if (fetchError) {
        if (fetchError.code === 'PGRST116') { // Brak wierszy – ignoruj, jeśli subskrypcja nie istnieje
          console.warn("Nie znaleziono subskrypcji dla invoice.payment_failed – ignorowanie.");
          return NextResponse.json({ received: true }, { status: 200 });
        }
        console.error("Błąd pobierania subskrypcji dla invoice.payment_failed:", fetchError);
        return NextResponse.json(
          { error: "Failed to fetch subscription for failed payment", details: fetchError.message },
          { status: 500 }
        );
      }

      // Nie aktualizuj subskrypcji – cron zajmie się zmianą po end_date
      // Powiadomienie o nieudanej płatności
      await supabase.rpc("notify_subscribers", {
        p_user_id: userId,
        p_notification_type: "payment_failed",
        p_message: "Płatność subskrypcji Premium nie powiodła się. Subskrypcja pozostanie aktywna do końca okresu.",
      });
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      // if (!userId) {
      //   console.warn("Brak userId w metadanych subskrypcji – próba pobrania z customer");
      //   if (subscription.customer) {
      //     const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
      //     userId = customer.metadata?.userId;
      //   }
      // }

      // if (!userId) {
      //   console.error("Brak userId w metadanych subskrypcji ani customer");
      //   return NextResponse.json(
      //     { error: "Missing userId in subscription metadata or customer" },
      //     { status: 400 }
      //   );
      // }

      // Pobierz aktualną subskrypcję
      const { data: existingSubscription, error: fetchError } = await supabase
        .from("subscriptions")
        .select("stripe_subscription_id")
        .eq("user_id", userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Błąd pobierania subskrypcji:", fetchError);
        return NextResponse.json(
          { error: "Failed to fetch subscription", details: fetchError.message },
          { status: 500 }
        );
      }

      // Usuń stripe_subscription_id, pozostawiając plan Premium do końca end_date
      if (existingSubscription) {
        const { error } = await supabase
          .from("subscriptions")
          .update({
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (error) {
          console.error("Błąd aktualizacji subskrypcji po anulowaniu:", error);
          return NextResponse.json(
            { error: "Failed to update subscription after cancellation", details: error.message },
            { status: 500 }
          );
        }
      }

      // Powiadomienie o anulowaniu subskrypcji
      await supabase.rpc("notify_subscribers", {
        p_user_id: userId,
        p_notification_type: "subscription_cancelled",
        p_message: "Subskrypcja Premium została anulowana, ale pozostaje aktywna do końca okresu.",
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Błąd podczas przetwarzania webhooka:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}