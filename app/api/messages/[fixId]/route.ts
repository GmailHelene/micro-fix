import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabase, getSessionUser } from '@/app/lib/supabaseServer';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ fixId: string }> }
) {
  const { fixId } = await params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });

  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from('fix_messages')
    .select('*')
    .eq('fix_request_id', fixId)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ fixId: string }> }
) {
  const { fixId } = await params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });

  const { content, sender } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: 'Tom melding' }, { status: 400 });

  const supabase = createServiceSupabase();

  const isAdmin = user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const senderRole: 'admin' | 'customer' = isAdmin ? 'admin' : 'customer';

  if (sender && sender !== senderRole) {
    return NextResponse.json({ error: 'Ugyldig avsender' }, { status: 403 });
  }

  const { error } = await supabase.from('fix_messages').insert({
    fix_request_id: fixId,
    content: content.trim(),
    sender: senderRole,
    user_id: user.id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
