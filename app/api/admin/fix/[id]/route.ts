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
  }
  if (body.admin_note !== undefined)          updates.admin_note = body.admin_note;
  if (body.price !== undefined)               updates.price = body.price;
  if (body.custom_payment_url !== undefined)  updates.custom_payment_url = body.custom_payment_url;

  const { data: fixBefore } = await supabase.from('fix_requests').select('title, user_id').eq('id', id).single();

  const { error } = await supabase.from('fix_requests').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Send e-post til kunde ved statusendring
  if (body.status !== undefined && fixBefore) {
    const { data: profile } = await supabase.auth.admin.getUserById(fixBefore.user_id);
    const email = profile?.user?.email;
    if (email) {
      await sendStatusEmail({
        to: email,
        fixTitle: fixBefore.title,
        fixId: id,
        status: body.status,
        adminNote: body.admin_note,
      }).catch(() => null);
    }
  }

  return NextResponse.json({ success: true });
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
    payment_method_types: ['card', 'klarna'],
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'nok',
        product_data: { name: fix.title, description: 'Betaling for CodeMedic oppdrag' },
        unit_amount: Math.round((fix.price || 0) * 100),
      },
      quantity: 1,
    }],
    metadata: { request_id: fix.id, user_id: fix.user_id },
    success_url: `${origin}/dashboard?payment=success`,
    cancel_url: `${origin}/fix/${fix.id}`,
  });

  return NextResponse.json({ url: session.url });
}
