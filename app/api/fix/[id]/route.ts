import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

const createSupabase = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
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

  // Tillatte felt kunden kan oppdatere
  const allowed: Record<string, unknown> = {};
  if (body.title !== undefined)       allowed.title = body.title;
  if (body.description !== undefined) allowed.description = body.description;
  if (body.access_info !== undefined) allowed.access_info = body.access_info;

  const { error } = await supabase
    .from('fix_requests')
    .update({ ...allowed, updated_at: new Date().toISOString() })
    .eq('id', id).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

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
