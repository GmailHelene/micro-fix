import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabase, getSessionUser } from '@/app/lib/supabaseServer';
import { sendMessageNotificationEmail } from '@/app/lib/email';

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

  // E-postvarsling til kunde når admin sender melding
  if (senderRole === 'admin') {
    const { data: fix } = await supabase
      .from('fix_requests')
      .select('title, user_id')
      .eq('id', fixId)
      .single();

    if (fix) {
      const { data: profile } = await supabase.auth.admin.getUserById(fix.user_id);
      const customerEmail = profile?.user?.email;
      if (customerEmail) {
        const preview = content.trim().slice(0, 200);
        await sendMessageNotificationEmail({
          to: customerEmail,
          fixTitle: fix.title,
          fixId,
          messagePreview: preview,
        }).catch(() => null);
      }
    }
  }

  return NextResponse.json({ success: true });
}
