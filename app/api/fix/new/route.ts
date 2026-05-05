import { NextResponse } from 'next/server';
import { createServiceSupabase, getSessionUser } from '@/app/lib/supabaseServer';
import { sendAdminNotificationEmail, sendStatusEmail } from '@/app/lib/email';

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });

  const supabase = createServiceSupabase();
  const { title, description, category, packageName, price } = await req.json();

  const { data: newFix, error } = await supabase
    .from('fix_requests')
    .insert({
      user_id: user.id,
      title,
      description,
      category,
      package_name: packageName,
      price,
      status: 'pending_approval',
      payment_status: 'unpaid',
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Varsle admin om ny forespørsel
  await sendAdminNotificationEmail({
    fixTitle: title,
    fixId: newFix.id,
    customerEmail: user.email ?? 'Ukjent',
    packageName,
    category,
  }).catch(() => null);

  // Bekreftelse til kunde
  if (user.email) {
    await sendStatusEmail({
      to: user.email,
      fixTitle: title,
      fixId: newFix.id,
      status: 'new_request',
    }).catch(() => null);
  }

  return NextResponse.json({ success: true, id: newFix.id });
}
