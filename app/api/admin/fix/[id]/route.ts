import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import Stripe from 'stripe';
import { sendStatusEmail } from '@/app/lib/email';

const createSupabase = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );
};

const isAdmin = (email?: string) => email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: 'Ingen tilgang' }, { status: 403 });

  const { data: fix, error } = await supabase.from('fix_requests').select('*').eq('id', id).single();
  if (error || !fix) return NextResponse.json({ error: 'Forespørsel ikke funnet' }, { status: 404 });
  return NextResponse.json(fix);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const supabase = await createSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: 'Ingen tilgang' }, { status: 403 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.status !== undefined) {
    updates.status = body.status;
    if (body.status === 'awaiting_payment') updates.payment_status = 'unpaid';
    if (body.status === 'completed') updates.access_info = null;
    // Custom offer: set new price + explanation
    if (body.status === 'awaiting_offer_approval') {
      if (body.price !== undefined)      updates.price = body.price;
      if (body.admin_note !== undefined) updates.admin_note = body.admin_note;
    }
  }
  if (body.admin_note !== undefined && body.status === undefined)  updates.admin_note = body.admin_note;
  if (body.price !== undefined && body.status !== 'awaiting_offer_approval') updates.price = body.price;
  if (body.custom_payment_url !== undefined)  updates.custom_payment_url = body.custom_payment_url;
  // Admin kan manuelt bekrefte betaling (brukt ved custom payment links)
  if (body.payment_status !== undefined)      updates.payment_status = body.payment_status;

  const { data: fixBefore } = await supabase
    .from('fix_requests').select('title, user_id, price, payment_intent_id').eq('id', id).single();

  // Capture betaling når jobben markeres fullført
  if (body.status === 'completed' && fixBefore?.payment_intent_id) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (secretKey) {
      const stripe = new Stripe(secretKey, { apiVersion: '2026-04-22.dahlia' });
      try {
        await stripe.paymentIntents.capture(fixBefore.payment_intent_id);
        updates.payment_status = 'paid';
      } catch {
        // Capture feilet (f.eks. utløpt) — admin må håndtere manuelt
        updates.payment_status = 'capture_failed';
      }
    }
  }

  const { error } = await supabase.from('fix_requests').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Send e-post til kunde ved statusendring
  if (body.status !== undefined && fixBefore) {
    const { data: profile } = await supabase.auth.admin.getUserById(fixBefore.user_id);
    const email = profile?.user?.email;
    if (email) {
      const priceForEmail = body.status === 'awaiting_offer_approval'
        ? (body.price ?? fixBefore.price)
        : undefined;
      await sendStatusEmail({
        to: email,
        fixTitle: fixBefore.title,
        fixId: id,
        status: body.status,
        adminNote: body.admin_note,
        price: priceForEmail,
      }).catch(() => null);
    }
  }

  return NextResponse.json({ success: true });
}

// PATCH /api/admin/fix/[id] — resend status-e-post til kunde
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: 'Ingen tilgang' }, { status: 403 });

  const { data: fix } = await supabase
    .from('fix_requests')
    .select('title, user_id, status, price, admin_note')
    .eq('id', id)
    .single();

  if (!fix) return NextResponse.json({ error: 'Forespørsel ikke funnet' }, { status: 404 });

  const { data: profile } = await supabase.auth.admin.getUserById(fix.user_id);
  const email = profile?.user?.email;
  if (!email) return NextResponse.json({ error: 'Kunde-e-post ikke funnet' }, { status: 400 });

  await sendStatusEmail({
    to: email,
    fixTitle: fix.title,
    fixId: id,
    status: fix.status,
    adminNote: fix.admin_note ?? undefined,
    price: fix.status === 'awaiting_offer_approval' ? fix.price ?? undefined : undefined,
  });

  return NextResponse.json({ success: true, sentTo: email });
}

// POST /api/admin/fix/[id] — generer Stripe checkout-URL
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: 'Ingen tilgang' }, { status: 403 });

  const { data: fix, error: fetchError } = await supabase
    .from('fix_requests')
    .select('id, title, price, status, payment_status, user_id')
    .eq('id', id)
    .single();

  if (fetchError || !fix) return NextResponse.json({ error: 'Forespørsel ikke funnet' }, { status: 404 });
  if (fix.status !== 'awaiting_payment') return NextResponse.json({ error: 'Forespørselen er ikke klar for betaling' }, { status: 400 });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return NextResponse.json({ error: 'Stripe ikke konfigurert' }, { status: 500 });

  const stripe = new Stripe(secretKey, { apiVersion: '2026-04-22.dahlia' });
  const origin = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'], // klarna støtter ikke manual capture

    mode: 'payment',
    // Reserver kortet — trekkes kun ved fullføring
    payment_intent_data: {
      capture_method: 'manual',
      metadata: { request_id: fix.id, user_id: fix.user_id },
    },
    line_items: [{
      price_data: {
        currency: 'nok',
        product_data: { name: fix.title, description: 'Betaling for CodeMedic oppdrag' },
        unit_amount: Math.round((fix.price || 0) * 100),
      },
      quantity: 1,
    }],
    metadata: { request_id: fix.id, user_id: fix.user_id },
    success_url: `${origin}/fix/${fix.id}?payment=success`,
    cancel_url: `${origin}/fix/${fix.id}`,
  });

  return NextResponse.json({ url: session.url });
}
