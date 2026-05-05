import { NextRequest, NextResponse } from 'next/server';
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

  console.log('[stripe-checkout] Creating session via fetch', { fixId: fix.id, unitAmount });

  try {
    // Direkte REST-kall til Stripe — omgår SDK og Next.js fetch-patching
    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('payment_method_types[]', 'card');
    if (user.email) params.append('customer_email', user.email);
    params.append('payment_intent_data[capture_method]', 'manual');
    params.append('payment_intent_data[metadata][request_id]', fix.id);
    params.append('payment_intent_data[metadata][user_id]', user.id);
    params.append('line_items[0][quantity]', '1');
    params.append('line_items[0][price_data][currency]', 'nok');
    params.append('line_items[0][price_data][unit_amount]', String(unitAmount));
    params.append('line_items[0][price_data][product_data][name]', fix.title);
    params.append('line_items[0][price_data][product_data][description]', 'Betaling for CodeMedic oppdrag');
    params.append('metadata[request_id]', fix.id);
    params.append('metadata[user_id]', user.id);
    params.append('success_url', `${origin}/fix/${fix.id}?payment=success`);
    params.append('cancel_url', `${origin}/fix/${fix.id}`);

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      cache: 'no-store',
    });

    const stripeData = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error('[stripe-checkout] Stripe API error:', stripeData);
      return NextResponse.json(
        { error: stripeData?.error?.message || 'Stripe-feil' },
        { status: 500 }
      );
    }

    console.log('[stripe-checkout] Session created:', stripeData.id);
    return NextResponse.json({ url: stripeData.url });
  } catch (err: unknown) {
    console.error('[stripe-checkout] Fetch error:', err);
    const message = err instanceof Error ? err.message : 'Nettverksfeil mot Stripe';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
