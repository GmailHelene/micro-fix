import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendStatusEmail, sendAdminEventEmail } from '@/app/lib/email';

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  return new Stripe(secretKey, { apiVersion: '2026-04-22.dahlia' });
};

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error('Missing Supabase environment variables');
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

      // Lagre payment_intent_id for capture ved fullføring
      const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

      // Sett status til in_progress og payment_status til 'authorized' (reservert, ikke trukket)
      await supabase
        .from('fix_requests')
        .update({
          payment_status: 'authorized',
          payment_intent_id: paymentIntentId,
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      // Hent fix-tittel og kundens e-post for å sende statusvarsel
      const { data: fix } = await supabase
        .from('fix_requests')
        .select('title, user_id, price')
        .eq('id', requestId)
        .single();

      if (fix) {
        const { data: profile } = await supabase.auth.admin.getUserById(fix.user_id);
        const customerEmail = profile?.user?.email;

        // E-post til kunde: bekreft betaling + be om tilgang
        if (customerEmail) {
          await sendStatusEmail({
            to: customerEmail,
            fixTitle: fix.title,
            fixId: requestId,
            status: 'in_progress',
          }).catch(() => null);
        }

        // E-post til admin: betaling mottatt, jobb klar
        await sendAdminEventEmail({
          event: 'payment_authorized',
          fixTitle: fix.title,
          fixId: requestId,
          customerEmail: customerEmail ?? undefined,
          price: fix.price ?? undefined,
        }).catch(() => null);
      }
    }
  }

  return NextResponse.json({ received: true });
}
