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
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ fixId: string }> }
) {
  const { fixId } = await params;
  const supabase = await createSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });

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
  const supabase = await createSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });

  const { content, sender } = await req.json();

  if (!content?.trim()) return NextResponse.json({ error: 'Tom melding' }, { status: 400 });

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
