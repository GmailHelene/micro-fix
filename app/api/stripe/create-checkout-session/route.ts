import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceSupabase, getSessionUser } from '@/app/lib/supabaseServer';

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });

  const supabase = createServiceSupabase();
  const { requestId } = await req.json();

  const { data: fix, error: fetchError } = await supabase
    .from('fix_requests')
    .select('id, title, price, status, payment_status, custom_payment_url')
    .eq('id', requestId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !fix) return NextResponse.json({ error: 'Forespørsel ikke funnet' }, { status: 404 });
  if (fix.status !== 'awaiting_payment' || fix.payment_status !== 'unpaid') {
    return NextResponse.json({ error: 'Betaling kan ikke gjennomføres nå.' }, { status: 400 });
  }

  // Hvis admin har limt inn en custom Stripe-lenke, returner den direkte
  if (fix.custom_payment_url) {
    return NextResponse.json({ url: fix.custom_payment_url });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return NextResponse.json({ error: 'Stripe ikke konfigurert' }, { status: 500 });

  const origin = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const unitAmount = Math.round((fix.price || 0) * 100);
  console.log('[stripe-checkout] Creating session', {
    fixId: fix.id,
    title: fix.title,
    price: fix.price,
    unitAmount,
    origin,
  });

  try {
    const stripe = new Stripe(secretKey, { apiVersion: '2026-04-22.dahlia' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email || undefined,
      payment_intent_data: {
        capture_method: 'manual',
        metadata: { request_id: fix.id, user_id: user.id },
      },
      line_items: [{
        price_data: {
          currency: 'nok',
          product_data: {
            name: fix.title,
            description: 'Betaling for CodeMedic oppdrag',
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      }],
      metadata: { request_id: fix.id, user_id: user.id },
      success_url: `${origin}/fix/${fix.id}?payment=success`,
      cancel_url: `${origin}/fix/${fix.id}`,
    });

    console.log('[stripe-checkout] Session created:', session.id);
    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    // Log full error server-side for Vercel logs
    console.error('[stripe-checkout] ERROR:', err);
    const message = err instanceof Error ? err.message : 'Ukjent Stripe-feil';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
