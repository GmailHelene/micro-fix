'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { statusLabels, statusColors, progressSteps } from '@/app/lib/fixOptions';

interface Fix {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  category?: string;
  package_name?: string;
  price?: number;
  estimated_time?: string;
  payment_status?: string;
  access_info?: string;
  admin_note?: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'customer' | 'admin';
  created_at: string;
}

function StatusProgress({ status }: { status: string }) {
  const activeIdx = progressSteps.findIndex(s => s.key === status);
  if (status === 'cancelled') {
    return <div className="mt-4 text-xs text-slate-400 italic">Forespørselen ble avbrutt.</div>;
  }
  if (status === 'awaiting_changes') {
    return (
      <div className="mt-4 rounded-xl bg-orange-50 border border-orange-200 px-4 py-2.5 text-sm text-orange-700 font-medium">
        Endringer ønsket — se melding fra CodeMedic nedenfor og oppdater forespørselen.
      </div>
    );
  }
  return (
    <div className="flex items-center mt-4">
      {progressSteps.map((s, i) => {
        const done = i <= activeIdx;
        const active = i === activeIdx;
        return (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                ${done ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-400'}
                ${active ? 'ring-4 ring-slate-200' : ''}`}>
                {done && !active ? '✓' : i + 1}
              </div>
              <span className={`mt-1 text-[10px] font-medium whitespace-nowrap ${done ? 'text-slate-700' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
            {i < progressSteps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 ${i < activeIdx ? 'bg-slate-900' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FixDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fix, setFix] = useState<Fix | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [accessInfo, setAccessInfo] = useState('');
  const [savingAccess, setSavingAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchFix = useCallback(async () => {
    const res = await fetch(`/api/fix/${id}`);
    const data = await res.json();
    if (!data.error) {
      setFix(data);
      setAccessInfo(data.access_info ?? '');
    }
    setLoading(false);
  }, [id]);

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/messages/${id}`);
    if (res.ok) setMessages(await res.json());
  }, [id]);

  useEffect(() => {
    fetchFix();
    fetchMessages();
    if (searchParams.get('payment') === 'success') {
      showToast('Betaling mottatt! Arbeidet starter snart.');
    }
  }, [fetchFix, fetchMessages, searchParams]);

  const handlePay = async () => {
    if (!fix) return;
    setPaying(true);
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: id }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      showToast(data.error || 'Noe gikk galt. Prøv igjen.');
      setPaying(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSendingMsg(true);
    const res = await fetch(`/api/messages/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage, sender: 'customer' }),
    });
    if (res.ok) { setNewMessage(''); fetchMessages(); }
    setSendingMsg(false);
  };

  const handleSaveAccessInfo = async () => {
    setSavingAccess(true);
    const res = await fetch(`/api/fix/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_info: accessInfo }),
    });
    setSavingAccess(false);
    if (res.ok) showToast('Tilgangsinformasjon lagret!');
    else showToast('Noe gikk galt. Prøv igjen.');
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Laster...</div>;

  if (!fix) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-500 mb-4">Forespørsel ikke funnet.</p>
        <button onClick={() => router.push('/dashboard')} className="text-blue-600 text-sm hover:underline">← Mine forespørsler</button>
      </div>
    </div>
  );

  const sc = statusColors[fix.status] ?? statusColors.pending_approval;
  const needsPayment = fix.status === 'awaiting_payment' && fix.payment_status === 'unpaid';
  const showAccessSection = ['awaiting_payment', 'in_progress', 'completed'].includes(fix.status);

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg animate-in fade-in">
          {toast}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-12">
        <button onClick={() => router.push('/dashboard')} className="text-sm text-slate-500 hover:text-slate-800 mb-8 inline-flex items-center gap-1">
          ← Mine forespørsler
        </button>

        {/* Betalingsbanner */}
        {needsPayment && (
          <div className="rounded-2xl bg-blue-600 text-white p-6 mb-6 flex items-center justify-between gap-4 shadow-lg flex-wrap">
            <div>
              <p className="font-bold text-lg">Jobben er godkjent — klar til betaling</p>
              <p className="text-blue-100 text-sm mt-1">Arbeidet starter umiddelbart etter betaling. Trygt via Stripe.</p>
            </div>
            <button
              onClick={handlePay}
              disabled={paying}
              className="shrink-0 rounded-full bg-white text-blue-700 font-bold px-6 py-3 hover:bg-blue-50 transition-colors disabled:opacity-60"
            >
              {paying ? 'Venter...' : `Betal ${fix.price} kr`}
            </button>
          </div>
        )}

        {/* Endringer ønsket */}
        {fix.status === 'awaiting_changes' && fix.admin_note && (
          <div className="rounded-2xl bg-orange-50 border border-orange-200 p-5 mb-6">
            <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-2">CodeMedic ber om endringer</p>
            <p className="text-sm text-orange-900">{fix.admin_note}</p>
            <p className="text-xs text-orange-600 mt-2">Svar via meldingsfeltet nedenfor eller oppdater forespørselen din.</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-5">

            {/* Forespørsel */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                <div>
                  <span className="font-mono text-xs text-slate-400">#{fix.id.slice(0, 8).toUpperCase()}</span>
                  <h1 className="mt-1 text-xl font-semibold text-slate-900">{fix.title}</h1>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mt-2 ${sc.bg} ${sc.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{statusLabels[fix.status] ?? fix.status}
                  </span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {fix.description}
              </div>
              <StatusProgress status={fix.status} />
            </div>

            {/* Tilgangsinfo — vises kun etter godkjenning */}
            {showAccessSection && (
              <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-lg shrink-0">🔑</div>
                  <div>
                    <h2 className="font-semibold text-slate-900">Tilgangsinformasjon</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {fix.status === 'awaiting_payment'
                        ? 'Del WP-admin, FTP eller annen tilgang her etter betaling — aldri før.'
                        : 'WP-admin eller FTP-tilgang for å utføre arbeidet.'}
                    </p>
                  </div>
                </div>
                {fix.status === 'awaiting_payment' ? (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                    Betal for å låse opp tilgangsdeling. Tilgangsinformasjon deles kun til bekreftet betaling.
                  </div>
                ) : (
                  <>
                    <textarea
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300 mb-3"
                      placeholder="F.eks: WP-admin: https://nettside.no/wp-admin | Bruker: admin | Passord: xxxxx&#10;FTP: ftp.nettside.no | Bruker: ftpuser | Passord: xxxxx&#10;&#10;Merk: informasjon slettes etter fullføring."
                      value={accessInfo}
                      onChange={e => setAccessInfo(e.target.value)}
                      rows={4}
                    />
                    <button
                      onClick={handleSaveAccessInfo}
                      disabled={savingAccess}
                      className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
                    >
                      {savingAccess ? 'Lagrer...' : 'Lagre tilgangsinfo'}
                    </button>
                    <p className="text-xs text-slate-400 mt-2">Tilgangsinformasjon er kryptert og slettes etter at jobben er fullført.</p>
                  </>
                )}
              </div>
            )}

            {/* Meldinger */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">Meldinger</h2>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {messages.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-6">Ingen meldinger ennå. Har du spørsmål? Skriv her.</p>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm
                      ${msg.sender === 'customer' ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                      {msg.sender === 'admin' && <p className="text-xs font-semibold text-slate-500 mb-1">CodeMedic</p>}
                      <p>{msg.content}</p>
                      <p className="text-xs mt-1 text-slate-400">
                        {new Date(msg.created_at).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Skriv en melding..."
                  className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                />
                <button type="submit" disabled={sendingMsg || !newMessage.trim()}
                  className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40 transition-colors">
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Detaljer</h3>
              <div className="space-y-2 text-sm">
                {fix.package_name && (
                  <div className="flex justify-between"><span className="text-slate-500">Pakke</span><span className="font-medium text-slate-800">{fix.package_name}</span></div>
                )}
                {fix.price != null && (
                  <div className="flex justify-between"><span className="text-slate-500">Pris</span><span className="font-bold text-blue-600">{fix.price} kr</span></div>
                )}
                {fix.estimated_time && (
                  <div className="flex justify-between"><span className="text-slate-500">Tid</span><span className="font-medium text-slate-800">{fix.estimated_time}</span></div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Betaling</span>
                  <span className={`font-medium ${fix.payment_status === 'paid' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {fix.payment_status === 'paid' ? 'Betalt' : fix.payment_status ?? 'Ikke betalt'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sendt</span>
                  <span className="font-medium text-slate-800">{new Date(fix.created_at).toLocaleDateString('no-NO')}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Garanti</p>
              <p className="text-sm text-slate-600">Du betaler kun etter godkjenning. Full refusjon hvis problemet ikke løses.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FixDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <FixDetailContent />
    </Suspense>
  );
}
