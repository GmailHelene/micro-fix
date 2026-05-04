import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

const createSupabase = async (req: NextRequest) => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: cookieStore }
  );
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabase(req);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Ingen tilgang' }, { status: 403 });
  }

  const { data: fix, error } = await supabase
    .from('fix_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !fix) {
    return NextResponse.json({ error: 'Forespørsel ikke funnet' }, { status: 404 });
  }

  return NextResponse.json(fix);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await req.json();
  const supabase = await createSupabase(req);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Ingen tilgang' }, { status: 403 });
  }

  const updates: Record<string, string | boolean> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'awaiting_payment') {
    updates.payment_status = 'unpaid';
  }

  const { error } = await supabase
    .from('fix_requests')
    .update(updates)
    .eq('id', id);

  if (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}