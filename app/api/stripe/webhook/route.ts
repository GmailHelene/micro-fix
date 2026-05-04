import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  return new Stripe(secretKey, {
    apiVersion: '2026-04-22.dahlia',
  });
};

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(url, serviceRoleKey);
};

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const requestId = session.metadata?.request_id as string | undefined;

    if (requestId) {
      const supabase = getSupabase();
      await supabase
        .from('fix_requests')
        .update({
          payment_status: 'paid',
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);
    }
  }

  return NextResponse.json({ received: true });
}
