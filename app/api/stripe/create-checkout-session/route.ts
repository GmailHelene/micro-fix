import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('Missing STRIPE_SECRET_KEY');
  return new Stripe(secretKey, { apiVersion: '2026-04-22.dahlia' });
};

const createSupabase = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};

export async function POST(req: NextRequest) {
  const supabase = await createSupabase();
  const { requestId } = await req.json();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });

  const { data: fix, error: fetchError } = await supabase
    .from('fix_requests')
    .select('id, title, price, status, payment_status')
    .eq('id', requestId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !fix) return NextResponse.json({ error: 'Forespørsel ikke funnet' }, { status: 404 });

  if (fix.status !== 'awaiting_payment' || fix.payment_status !== 'unpaid') {
    return NextResponse.json({ error: 'Betaling kan ikke gjennomføres nå.' }, { status: 400 });
  }

  const origin = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'klarna'],
    mode: 'payment',
    customer_email: user.email || undefined,
    line_items: [
      {
        price_data: {
          currency: 'nok',
          product_data: {
            name: fix.title,
            description: 'Betaling for CodeMedic oppdrag',
          },
          unit_amount: Math.round((fix.price || 0) * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      request_id: fix.id,
      user_id: user.id,
    },
    success_url: `${origin}/dashboard?payment=success`,
    cancel_url: `${origin}/fix/${fix.id}`,
  });

  return NextResponse.json({ url: session.url });
}
