import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabase } from '@/app/lib/supabaseServer';

// Beskytt endepunktet med en hemmelig nøkkel
const isAuthorized = (req: NextRequest) => {
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${process.env.CRON_SECRET}`;
};

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceSupabase();
  const now = new Date();
  const results: Record<string, number> = {};

  // 1. Auto-avbryt forespørsler som har ventet på godkjenning i over 14 dager
  const staleCutoff = new Date(now);
  staleCutoff.setDate(staleCutoff.getDate() - 14);

  const { data: stale, error: staleError } = await supabase
    .from('fix_requests')
    .update({
      status: 'cancelled',
      admin_note: 'Automatisk avbrutt etter 14 dager uten aktivitet.',
      updated_at: now.toISOString(),
    })
    .eq('status', 'pending_approval')
    .lt('created_at', staleCutoff.toISOString())
    .select('id');

  results.auto_cancelled = stale?.length ?? 0;
  if (staleError) console.error('[cron/cleanup] stale error:', staleError);

  // 2. Slett avbrutte og fullførte forespørsler eldre enn 60 dager
  const deleteCutoff = new Date(now);
  deleteCutoff.setDate(deleteCutoff.getDate() - 60);

  const { data: deleted, error: deleteError } = await supabase
    .from('fix_requests')
    .delete()
    .in('status', ['cancelled', 'completed'])
    .lt('updated_at', deleteCutoff.toISOString())
    .select('id');

  results.deleted = deleted?.length ?? 0;
  if (deleteError) console.error('[cron/cleanup] delete error:', deleteError);

  console.log('[cron/cleanup] Done:', results);
  return NextResponse.json({ ok: true, ...results });
}
