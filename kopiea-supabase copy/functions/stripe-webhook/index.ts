// @deno-types="types/deno.d.ts"
//supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../../types/database'; // Upewnij się, że ścieżka pasuje
import Stripe from 'stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2025-01-27.acacia',
});

const supabase = createClient<Database>(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// Typy dla funkcji pomocniczych
interface WebhookHandlerContext {
  userId: string;
  event: Stripe.Event;
  supabase: ReturnType<typeof createClient<Database>>;
}

// Funkcje pomocnicze
async function extractUserId(event: Stripe.Event): Promise<string | null> {
  const data = event.data.object;
  
  if ('metadata' in data && data.metadata && 'userId' in data.metadata) {
    return (data.metadata as { userId: string }).userId;
  }
  
  if ('subscription' in data) {
    const subscriptionId = typeof data.subscription === 'string' ? data.subscription : 
                          'id' in data ? (data as { id: string }).id : null;

    if (subscriptionId) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscriptionId)
        .single();

      if (subscription) {
        return subscription.user_id;
      }
    }
  }
  
  return null;
}

async function isDuplicateRequest(event: Stripe.Event): Promise<boolean> {
  // Tutaj możesz dodać logikę sprawdzania duplikatów (np. po ID eventu w bazie)
  return false;
}

async function logWebhook(event: Stripe.Event, userId: string | null, error?: Error): Promise<void> {
  console.log(`Webhook ${event.type}:`, {
    userId,
    error: error?.message,
    data: event.data.object
  });
}

// Handlery dla różnych typów eventów
const handlers: Record<string, (context: WebhookHandlerContext) => Promise<void>> = {
  'checkout.session.completed': async ({ userId, event, supabase }) => {
    const session = event.data.object as Stripe.Checkout.Session;
    const subscriptionId = session.subscription as string;

    if (!subscriptionId) {
      throw new Error('Missing subscription ID');
    }

    const { error } = await supabase
      .from('subscriptions')
      .update({
        plan: 'premium',
        status: 'active',
        stripe_subscription_id: subscriptionId,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        current_limit: null,
        total_limit: null,
        current_offers: 0, // Nowa subskrypcja, więc 0 ofert
        total_offers: 0,   // Początkowo 0 ofert w historii
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('status', 'pending_upgrade');

    if (error) throw error;

    await supabase.rpc('notify_subscribers', {
      p_user_id: userId,
      p_notification_type: 'subscription_activated',
      p_message: 'Subskrypcja Premium aktywowana!'
    });
  },

  'invoice.paid': async ({ userId, event, supabase }) => {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription as string;

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) throw error;

    await supabase.rpc('notify_subscribers', {
      p_user_id: userId,
      p_notification_type: 'subscription_renewed',
      p_message: 'Subskrypcja Premium odnowiona'
    });
  },

  'customer.subscription.deleted': async ({ userId, event, supabase }) => {
    const subscription = event.data.object as Stripe.Subscription;

    const { error } = await supabase
      .from('subscriptions')
      .update({
        plan: 'free',
        status: 'active',
        current_limit: 10,
        total_limit: 20,
        current_offers: (await supabase
          .from('job_offers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)).count || 0,
        total_offers: (await supabase
          .from('job_offers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)).count || 0, // Zachowaj historię zapisów
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) throw error;

    await supabase.rpc('notify_subscribers', {
      p_user_id: userId,
      p_notification_type: 'subscription_ended',
      p_message: 'Subskrypcja Premium zakończona'
    });
  },

  'invoice.payment_failed': async ({ userId, event, supabase }) => {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription as string;

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'inactive',
        plan: 'free',
        current_limit: 10,
        total_limit: 20,
        current_offers: (await supabase
          .from('job_offers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)).count || 0,
        total_offers: (await supabase
          .from('job_offers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)).count || 0, // Zachowaj historię zapisów
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) throw error;

    await supabase.rpc('notify_subscribers', {
      p_user_id: userId,
      p_notification_type: 'subscription_expired',
      p_message: 'Twoja subskrypcja wygasła'
    });
  }
};

// Główna funkcja obsługująca webhook
serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('Missing Stripe signature', { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Webhook verification failed:', error);
      return new Response('Invalid Stripe webhook', { status: 400 });
    }

    const userId = await extractUserId(event);
    if (!userId) {
      console.error('No user_id found for Stripe event:', event.type);
      return new Response('User not found', { status: 400 });
    }

    if (await isDuplicateRequest(event)) {
      return new Response('Duplicate webhook request', { status: 200 });
    }

    await logWebhook(event, userId);

    const handler = handlers[event.type];
    if (handler) {
      await handler({ userId, event, supabase });
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
});