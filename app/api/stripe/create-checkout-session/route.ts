import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceSupabase, getSessionUser } from '@/app/lib/supabaseServer';

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('Missing STRIPE_SECRET_KEY');
  return new Stripe(secretKey, { apiVersion: '2026-04-22.dahlia' });
};

// Map package name → Stripe Price ID (set via env vars)
const getPriceId = (packageName: string): string | null => {
  const name = packageName?.toLowerCase() ?? '';
  if (name.includes('basic'))    return process.env.STRIPE_PRICE_BASIC    ?? null;
  if (name.includes('standard')) return process.env.STRIPE_PRICE_STANDARD ?? null;
  if (name.includes('premium'))  return process.env.STRIPE_PRICE_PREMIUM  ?? null;
  return null;
};

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });

  const supabase = createServiceSupabase();
  const { requestId } = await req.json();

  const { data: fix, error: fetchError } = await supabase
    .from('fix_requests')
    .select('id, title, price, status, payment_status, package_name, custom_payment_url')
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

  const origin = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    const stripe = getStripe();
    const priceId = getPriceId(fix.package_name ?? '');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // klarna støtter ikke manual capture
      mode: 'payment',
      customer_email: user.email || undefined,
      // Reserver kortet — trekkes kun når jobben er fullført (capture_method: manual)
      payment_intent_data: {
        capture_method: 'manual',
        metadata: { request_id: fix.id, user_id: user.id },
      },
      line_items: [
        priceId
          ? { price: priceId, quantity: 1 }
          : {
              price_data: {
                currency: 'nok',
                product_data: { name: fix.title, description: 'Betaling for CodeMedic oppdrag' },
                unit_amount: Math.round((fix.price || 0) * 100),
              },
              quantity: 1,
            },
      ],
      metadata: { request_id: fix.id, user_id: user.id },
      success_url: `${origin}/fix/${fix.id}?payment=success`,
      cancel_url: `${origin}/fix/${fix.id}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Stripe-feil';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
