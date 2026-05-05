import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { sendAdminEventEmail } from '@/app/lib/email';

const createSupabase = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
      global: {
        fetch: (url: RequestInfo | URL, init?: RequestInit) =>
          fetch(url, { ...init, cache: 'no-store' }),
      },
    }
  );
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });

  const { data: fix, error } = await supabase
    .from('fix_requests').select('*').eq('id', id).eq('user_id', user.id).single();
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
  if (!user) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });

  // Hent nåværende fix for kontekst (tittel, pris, status)
  const { data: currentFix } = await supabase
    .from('fix_requests')
    .select('title, price, status, access_info')
    .eq('id', id).eq('user_id', user.id).single();

  if (!currentFix) return NextResponse.json({ error: 'Forespørsel ikke funnet' }, { status: 404 });

  // Tillatte felt kunden kan oppdatere
  const allowed: Record<string, unknown> = {};
  if (body.title !== undefined)       allowed.title = body.title;
  if (body.description !== undefined) allowed.description = body.description;
  if (body.access_info !== undefined) allowed.access_info = body.access_info;

  // Kunde godtar eller avslår custom tilbud
  if (body.accept_offer === true || body.decline_offer === true) {
    if (currentFix.status === 'awaiting_offer_approval') {
      allowed.status = body.accept_offer ? 'awaiting_payment' : 'cancelled';
    } else {
      return NextResponse.json({ error: 'Ingen aktiv tilbudsforespørsel' }, { status: 400 });
    }
  }

  const { error } = await supabase
    .from('fix_requests')
    .update({ ...allowed, updated_at: new Date().toISOString() })
    .eq('id', id).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // ── Admin-varsler ────────────────────────────────────────────────────────

  // 1. Kunde godtok tilbud → varsle admin
  if (body.accept_offer === true) {
    await sendAdminEventEmail({
      event: 'offer_accepted',
      fixTitle: currentFix.title,
      fixId: id,
      customerEmail: user.email ?? undefined,
      price: currentFix.price ?? undefined,
    }).catch(() => null);
  }

  // 2. Kunde delte tilgangsinformasjon → varsle admin (kun når ny info legges inn)
  if (body.access_info && !currentFix.access_info) {
    await sendAdminEventEmail({
      event: 'access_info_shared',
      fixTitle: currentFix.title,
      fixId: id,
      customerEmail: user.email ?? undefined,
    }).catch(() => null);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });

  const { error } = await supabase
    .from('fix_requests').delete().eq('id', id).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
