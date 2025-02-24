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
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const subscriptionId = session.subscription as string;

    if (!userId || !subscriptionId) {
      return NextResponse.json({ error: "Missing userId or subscriptionId" }, { status: 400 });
    }

    const supabase = await createClerkSupabaseClient({
      getToken: async () => process.env.SUPABASE_SERVICE_ROLE_KEY!, // Użyj klucza service_role
    } as any);

    const { data, error } = await supabase
      .from("subscriptions")
      .upsert({
        user_id: userId,
        plan: "premium",
        status: "active",
        stripe_subscription_id: subscriptionId,
        job_offers_limit: 100, // Przykładowy limit dla premium
        cv_creator_limit: 50,  // Przykładowy limit dla premium
      })
      .select();

    if (error) {
      console.error("Error updating subscription:", error);
      throw error;
    }

    console.log("Subscription updated:", data);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}