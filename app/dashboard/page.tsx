import { createServerSupabase } from '../lib/supabaseServer';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { statusLabels, statusColors } from '../lib/fixOptions';

export const dynamic = 'force-dynamic';

const steps = [
  { key: 'pending_approval', label: 'Sendt inn' },
  { key: 'awaiting_payment', label: 'Godkjent' },
  { key: 'in_progress', label: 'Under arbeid' },
  { key: 'completed', label: 'Fullført' },
];

function StatusProgress({ status }: { status: string }) {
  const activeIdx = steps.findIndex(s => s.key === status);
  return (
    <div className="flex items-center gap-0 mt-4">
      {steps.map((s, i) => {
        const done = i <= activeIdx && status !== 'cancelled';
        const active = i === activeIdx && status !== 'cancelled';
        return (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                ${done ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-400'}
                ${active ? 'ring-4 ring-slate-200' : ''}`}>
                {done ? '✓' : i + 1}
              </div>
              <span className={`mt-1 text-[10px] font-medium whitespace-nowrap ${done ? 'text-slate-700' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 ${i < activeIdx && status !== 'cancelled' ? 'bg-slate-900' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: fixes } = await supabase
    .from('fix_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const counts = {
    active: fixes?.filter(f => !['completed', 'cancelled'].includes(f.status)).length ?? 0,
    completed: fixes?.filter(f => f.status === 'completed').length ?? 0,
    awaiting: fixes?.filter(f => f.status === 'awaiting_payment').length ?? 0,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Velkomst */}
        <div className="mb-10">
          <p className="text-sm text-slate-500 uppercase tracking-widest mb-1">Min portal</p>
          <h1 className="text-3xl font-semibold text-slate-900">Mine forespørsler</h1>
          <p className="mt-2 text-slate-500">Her følger du alle dine oppdrag fra bestilling til ferdig levering.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Aktive oppdrag</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{counts.active}</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Avventer betaling</p>
            <p className="mt-1 text-3xl font-bold text-blue-600">{counts.awaiting}</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Fullført</p>
            <p className="mt-1 text-3xl font-bold text-emerald-600">{counts.completed}</p>
          </div>
        </div>

        {/* Ny forespørsel */}
        <div className="mb-8">
          <Link
            href="/fix/new"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 transition-colors"
          >
            + Ny forespørsel
          </Link>
        </div>

        {/* Liste */}
        <div className="space-y-4">
          {fixes?.length === 0 && (
            <div className="rounded-3xl bg-white border border-slate-200 p-16 text-center shadow-sm">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-lg font-semibold text-slate-900 mb-2">Ingen forespørsler ennå</p>
              <p className="text-slate-500 mb-6 text-sm">Send inn din første forespørsel og få profesjonell hjelp innen 24–48 timer.</p>
              <Link href="/fix/new" className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
                Start ny forespørsel →
              </Link>
            </div>
          )}

          {fixes?.map(fix => {
            const sc = statusColors[fix.status] ?? statusColors.pending_approval;
            const needsPayment = fix.status === 'awaiting_payment' && fix.payment_status === 'unpaid';
            const needsAccess = fix.status === 'in_progress' && !fix.access_info;
            const needsOfferResponse = fix.status === 'awaiting_offer_approval';

            // Forventet levering: 24-48t etter siste oppdatering i in_progress
            const expectedDelivery = fix.status === 'in_progress' && fix.access_info
              ? (() => {
                  const base = new Date(fix.updated_at ?? fix.created_at);
                  const d1 = new Date(base); d1.setHours(d1.getHours() + 24);
                  const d2 = new Date(base); d2.setHours(d2.getHours() + 48);
                  return `${d1.toLocaleDateString('no-NO')}–${d2.toLocaleDateString('no-NO')}`;
                })()
              : null;

            return (
              <div key={fix.id} className={`rounded-3xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow border ${
                needsAccess ? 'border-amber-200' :
                needsOfferResponse ? 'border-purple-200' :
                needsPayment ? 'border-blue-200' :
                'border-slate-200'
              }`}>

                {/* Action banners */}
                {needsAccess && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 font-medium mb-3">
                    🔑 Arbeidet kan starte — del tilgangsinformasjon for å sette i gang
                  </div>
                )}
                {needsOfferResponse && (
                  <div className="rounded-xl bg-purple-50 border border-purple-200 px-3 py-2 text-xs text-purple-700 font-medium mb-3">
                    💬 Du har mottatt et custom tilbud — se og svar på det nå
                  </div>
                )}

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                        #{fix.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {statusLabels[fix.status] ?? fix.status}
                      </span>
                      {fix.package_name && (
                        <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                          {fix.package_name}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-semibold text-slate-900 truncate">{fix.title}</h2>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                      {fix.price != null && <span className="font-medium text-slate-600">{fix.price} kr</span>}
                      {expectedDelivery && (
                        <span className="text-emerald-600 font-medium">⏱ Forventet levering {expectedDelivery}</span>
                      )}
                      <span>{new Date(fix.created_at).toLocaleDateString('no-NO')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {needsPayment && (
                      <Link href={`/fix/${fix.id}`} className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
                        Betal nå →
                      </Link>
                    )}
                    {(needsAccess || needsOfferResponse) && (
                      <Link href={`/fix/${fix.id}`} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors">
                        Handle nå →
                      </Link>
                    )}
                    {!needsPayment && !needsAccess && !needsOfferResponse && (
                      <Link href={`/fix/${fix.id}`} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                        Se detaljer
                      </Link>
                    )}
                  </div>
                </div>

                <StatusProgress status={fix.status} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
