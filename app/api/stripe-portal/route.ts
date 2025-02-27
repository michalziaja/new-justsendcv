import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(request: Request) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId: requestUserId } = await request.json();
  if (userId !== requestUserId) {
    return NextResponse.json({ error: "User ID mismatch" }, { status: 403 });
  }

  try {
    // Pobierz lub utwórz klienta w Stripe na podstawie userId
    const customers = await stripe.customers.list({ limit: 1, email: user?.primaryEmailAddress?.emailAddress });
    let customer;

    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: user?.primaryEmailAddress?.emailAddress,
        metadata: { clerkUserId: userId },
      });
    }

    // Wygeneruj URL do Customer Portal
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${request.headers.get("origin")}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url }, { status: 200 });
  } catch (error) {
    console.error("Error creating Stripe portal session:", error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}