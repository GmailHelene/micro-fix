import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServiceSupabase } from '../../lib/supabaseServer';
import { statusLabels, statusColors } from '../../lib/fixOptions';

export const dynamic = 'force-dynamic';

const filterOptions = [
  { key: 'all',               label: 'Alle' },
  { key: 'pending_approval',  label: 'Venter godkjenning' },
  { key: 'awaiting_changes',  label: 'Endringer ønsket' },
  { key: 'awaiting_payment',  label: 'Venter betaling' },
  { key: 'in_progress',       label: 'Under arbeid' },
  { key: 'completed',         label: 'Fullført' },
  { key: 'cancelled',         label: 'Avbrutt' },
];

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string; sort?: string }>;
}) {
  const supabase = await createServiceSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) redirect('/login');

  const { filter = 'all', q = '', sort = 'newest' } = await searchParams;

  const { data: allFixes } = await supabase
    .from('fix_requests')
    .select('*')
    .order('created_at', { ascending: false });

  const fixes = allFixes ?? [];

  const counts: Record<string, number> = { all: fixes.length };
  filterOptions.slice(1).forEach(opt => {
    counts[opt.key] = fixes.filter(f => f.status === opt.key).length;
  });

  let displayed = filter === 'all' ? fixes : fixes.filter(f => f.status === filter);
  if (q.trim()) {
    const query = q.toLowerCase();
    displayed = displayed.filter(f =>
      f.title?.toLowerCase().includes(query) ||
      f.description?.toLowerCase().includes(query) ||
      f.package_name?.toLowerCase().includes(query)
    );
  }

  if (sort === 'oldest') displayed = [...displayed].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  else if (sort === 'price-high') displayed = [...displayed].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  else if (sort === 'price-low')  displayed = [...displayed].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  else displayed = [...displayed].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-3xl font-semibold text-slate-900">Oppdragsoversikt</h1>
          <p className="mt-2 text-slate-500 text-sm">Administrer alle forespørsler, godkjenninger og betalinger.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Venter godkjenning', key: 'pending_approval', color: 'text-amber-600' },
            { label: 'Venter betaling',    key: 'awaiting_payment', color: 'text-blue-600' },
            { label: 'Under arbeid',       key: 'in_progress',      color: 'text-indigo-600' },
            { label: 'Fullført',           key: 'completed',        color: 'text-emerald-600' },
          ].map(s => (
            <div key={s.key} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">{s.label}</p>
              <p className={`mt-2 text-3xl font-bold ${s.color}`}>{counts[s.key] ?? 0}</p>
            </div>
          ))}
        </div>

        {/* Filter + Søk */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(opt => (
              <Link
                key={opt.key}
                href={`/admin/dashboard?filter=${opt.key}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  filter === opt.key
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {opt.label}
                {opt.key !== 'all' && counts[opt.key] > 0 && (
                  <span className={`ml-1.5 text-xs ${filter === opt.key ? 'text-slate-300' : 'text-slate-400'}`}>
                    ({counts[opt.key]})
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Sortering */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'newest',     label: 'Nyeste' },
              { key: 'oldest',     label: 'Eldste' },
              { key: 'price-high', label: 'Pris ↓' },
              { key: 'price-low',  label: 'Pris ↑' },
            ].map(s => (
              <Link
                key={s.key}
                href={`/admin/dashboard?filter=${filter}&sort=${s.key}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  sort === s.key
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>

          <form method="GET" action="/admin/dashboard" className="flex gap-2 max-w-md">
            <input type="hidden" name="filter" value={filter} />
            <input type="hidden" name="sort" value={sort} />
            <input
              name="q"
              defaultValue={q}
              placeholder="Søk på tittel, beskrivelse eller pakke..."
              className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            />
            <button type="submit" className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
              Søk
            </button>
            {q && (
              <Link href={`/admin/dashboard?filter=${filter}`} className="rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50 transition-colors">
                ✕
              </Link>
            )}
          </form>
        </div>

        {/* Liste */}
        <div className="space-y-3">
          {displayed.length === 0 && (
            <div className="rounded-3xl bg-white border border-slate-200 p-12 text-center shadow-sm">
              <p className="text-slate-400">{q ? `Ingen treff for "${q}".` : 'Ingen forespørsler i denne kategorien.'}</p>
            </div>
          )}
          {displayed.map(fix => {
            const sc = statusColors[fix.status] ?? statusColors.pending_approval;

            // Bestem om kortet trenger fremhevet styling
            const isReadyToStart = fix.status === 'in_progress' && fix.access_info;
            const isWaitingAccess = fix.status === 'in_progress' && !fix.access_info;
            const isOfferPending = fix.status === 'awaiting_offer_approval';

            return (
              <div key={fix.id} className={`rounded-3xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow border ${
                isReadyToStart ? 'border-emerald-300 ring-2 ring-emerald-100' :
                isOfferPending ? 'border-purple-200' :
                'border-slate-200'
              }`}>
                {isReadyToStart && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800 font-semibold mb-3">
                    🚀 Klar til start — kunden har delt tilgang!
                  </div>
                )}
                {isWaitingAccess && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 mb-3">
                    ⏳ Venter på tilgang fra kunde
                  </div>
                )}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs text-slate-400">#{fix.id.slice(0, 8).toUpperCase()}</span>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {statusLabels[fix.status] ?? fix.status}
                      </span>
                      {fix.payment_status === 'paid' && (
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold">✓ Betalt</span>
                      )}
                      {fix.payment_status === 'authorized' && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold">💳 Reservert</span>
                      )}
                      {fix.payment_status === 'capture_failed' && (
                        <span className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-semibold">⚠️ Capture feilet</span>
                      )}
                      {fix.access_info && (
                        <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-semibold">🔑 Tilgang delt</span>
                      )}
                    </div>
                    <h2 className="text-base font-semibold text-slate-900 truncate">{fix.title}</h2>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                      {fix.package_name && <span>{fix.package_name}</span>}
                      {fix.price != null && <span className="font-medium text-slate-700">{fix.price} kr</span>}
                      <span>{new Date(fix.created_at).toLocaleDateString('no-NO')}</span>
                    </div>
                  </div>
                  <Link
                    href={`/admin/fix/${fix.id}`}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                      isReadyToStart
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-900 text-white hover:bg-slate-700'
                    }`}
                  >
                    {isReadyToStart ? 'Start jobb →' : 'Behandle →'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
