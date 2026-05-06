'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { statusLabels, statusColors, progressSteps } from '@/app/lib/fixOptions';
import { Check, ArrowLeft, RefreshCw, Key, AlertTriangle, Star } from 'lucide-react';

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
  rating?: number;
  feedback_text?: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'customer' | 'admin';
  created_at: string;
}

function StatusProgress({ status }: { status: string }) {
  // Map special statuses to nearest progress step for the bar
  const barStatus = status === 'awaiting_offer_approval' ? 'pending_approval'
    : status === 'awaiting_changes' ? 'pending_approval'
    : status;
  const activeIdx = progressSteps.findIndex(s => s.key === barStatus);

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
  if (status === 'awaiting_offer_approval') {
    return (
      <div className="mt-4 rounded-xl bg-purple-50 border border-purple-200 px-4 py-2.5 text-sm text-purple-700 font-medium">
        Custom tilbud sendt — se tilbudet nedenfor og godta eller avslå.
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
                {done && !active ? <Check className="w-3.5 h-3.5" /> : i + 1}
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
  const [payError, setPayError] = useState<string | null>(null);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [respondingOffer, setRespondingOffer] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string, duration = 6000) => {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
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

  // Auto-refresh hvert 30. sekund så kunden ser oppdatert status uten å laste siden
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFix();
      fetchMessages();
    }, 30_000);
    return () => clearInterval(interval);
  }, [fetchFix, fetchMessages]);

  const handlePay = async () => {
    if (!fix) return;
    setPaying(true);
    setPayError(null);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPayError(data.error || 'Noe gikk galt. Prøv igjen.');
        setPaying(false);
      }
    } catch {
      setPayError('Nettverksfeil — sjekk internettforbindelsen og prøv igjen.');
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

  const handleOfferResponse = async (accept: boolean) => {
    setRespondingOffer(true);
    const res = await fetch(`/api/fix/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accept ? { accept_offer: true } : { decline_offer: true }),
    });
    if (res.ok) {
      showToast(accept ? 'Tilbud godtatt! Du kan nå betale.' : 'Tilbud avslått.');
      fetchFix();
    } else {
      showToast('Noe gikk galt. Prøv igjen.');
    }
    setRespondingOffer(false);
  };

  const handleCancel = async () => {
    if (!confirm('Er du sikker på at du vil trekke tilbake forespørselen?')) return;
    setCancelling(true);
    const res = await fetch(`/api/fix/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancel_request: true }),
    });
    setCancelling(false);
    if (res.ok) {
      showToast('Forespørselen er trukket tilbake.');
      fetchFix();
    } else {
      showToast('Noe gikk galt. Prøv igjen.');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackRating) return;
    setSubmittingFeedback(true);
    const res = await fetch(`/api/fix/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: feedbackRating, feedback_text: feedbackText }),
    });
    setSubmittingFeedback(false);
    if (res.ok) {
      setFeedbackDone(true);
      showToast('Takk for tilbakemeldingen!');
      fetchFix();
    } else {
      showToast('Noe gikk galt. Prøv igjen.');
    }
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
        <button onClick={() => router.push('/dashboard')} className="text-blue-600 text-sm hover:underline inline-flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Mine forespørsler</button>
      </div>
    </div>
  );

  const sc = statusColors[fix.status] ?? statusColors.pending_approval;
  const needsPayment = fix.status === 'awaiting_payment' && fix.payment_status === 'unpaid';
  const hasOffer = fix.status === 'awaiting_offer_approval';
  const isPaid = fix.payment_status === 'paid' || fix.payment_status === 'authorized';
  const showFeedback = fix.status === 'completed' && !fix.rating && !feedbackDone;
  const showAccessSection = ['awaiting_payment', 'in_progress', 'completed'].includes(fix.status);
  const canCancel = fix.status === 'pending_approval';

  const paymentStatusLabel =
    fix.payment_status === 'paid'       ? 'Betalt' :
    fix.payment_status === 'authorized' ? 'Reservert (trekkes ved fullføring)' :
    fix.payment_status === 'unpaid'     ? 'Ikke betalt' :
    (fix.payment_status ?? '—');
  const paymentStatusColor =
    fix.payment_status === 'paid'       ? 'text-emerald-600' :
    fix.payment_status === 'authorized' ? 'text-blue-600' :
    'text-slate-800';

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg animate-in fade-in">
          {toast}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.push('/dashboard')} className="text-sm text-slate-500 hover:text-slate-800 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Mine forespørsler
          </button>
          <button
            onClick={() => { fetchFix(); fetchMessages(); showToast('Oppdatert!'); }}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Oppdater
          </button>
        </div>

        {/* Betalingsbanner */}
        {needsPayment && (
          <>
            <div className="rounded-2xl bg-blue-600 text-white p-6 mb-3 flex items-center justify-between gap-4 shadow-lg flex-wrap">
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
            {payError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 mb-4 text-sm text-red-800 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> Feil: {payError}
              </div>
            )}
          </>
        )}

        {/* Endringer ønsket */}
        {fix.status === 'awaiting_changes' && fix.admin_note && (
          <div className="rounded-2xl bg-orange-50 border border-orange-200 p-5 mb-6">
            <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-2">CodeMedic ber om endringer</p>
            <p className="text-sm text-orange-900">{fix.admin_note}</p>
            <p className="text-xs text-orange-600 mt-2">Svar via meldingsfeltet nedenfor eller oppdater forespørselen din.</p>
          </div>
        )}

        {/* Custom tilbud — kunde godkjenner eller avslår */}
        {hasOffer && (
          <div className="rounded-2xl bg-purple-50 border border-purple-200 p-6 mb-6 shadow-sm">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-3">Custom tilbud fra CodeMedic</p>
            {fix.admin_note && (
              <p className="text-sm text-purple-900 mb-4 leading-relaxed">{fix.admin_note}</p>
            )}
            {fix.price != null && (
              <div className="rounded-xl bg-white border border-purple-200 px-4 py-3 mb-4 inline-block">
                <span className="text-xs text-purple-500 block mb-0.5">Tilbudspris</span>
                <span className="text-2xl font-bold text-purple-700">{fix.price} kr</span>
              </div>
            )}
            <p className="text-xs text-purple-600 mb-4">
              Kortet reserveres nå og trekkes først når jobben er fullført og godkjent av deg.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => handleOfferResponse(true)}
                disabled={respondingOffer}
                className="rounded-full bg-purple-700 text-white px-6 py-2.5 text-sm font-bold hover:bg-purple-800 disabled:opacity-50 transition-colors"
              >
                {respondingOffer ? 'Venter...' : '✓ Godta tilbud'}
              </button>
              <button
                onClick={() => handleOfferResponse(false)}
                disabled={respondingOffer}
                className="rounded-full border border-purple-300 text-purple-700 px-6 py-2.5 text-sm font-semibold hover:bg-purple-100 disabled:opacity-50 transition-colors"
              >
                ✕ Avslå tilbud
              </button>
            </div>
          </div>
        )}

        {/* Betalingskvittering */}
        {isPaid && fix.status !== 'awaiting_payment' && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 mb-6 flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0"><Check className="w-5 h-5 text-emerald-600" /></div>
            <div className="flex-1">
              <p className="font-bold text-emerald-800">Betaling bekreftet</p>
              <p className="text-sm text-emerald-700 mt-0.5">
                {fix.payment_status === 'authorized'
                  ? 'Beløpet er reservert på kortet ditt og trekkes automatisk når jobben er fullført og godkjent av deg.'
                  : 'Betalingen er gjennomført og jobben er fullført.'}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-white border border-emerald-100 px-3 py-2">
                  <p className="text-emerald-500 mb-0.5">Beløp</p>
                  <p className="font-bold text-emerald-800">{fix.price != null ? `${fix.price} kr` : '—'}</p>
                </div>
                <div className="rounded-lg bg-white border border-emerald-100 px-3 py-2">
                  <p className="text-emerald-500 mb-0.5">Saksnr.</p>
                  <p className="font-bold text-emerald-800 font-mono">#{fix.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="rounded-lg bg-white border border-emerald-100 px-3 py-2">
                  <p className="text-emerald-500 mb-0.5">Status</p>
                  <p className="font-bold text-emerald-800">{fix.payment_status === 'authorized' ? 'Reservert' : 'Betalt'}</p>
                </div>
                <div className="rounded-lg bg-white border border-emerald-100 px-3 py-2">
                  <p className="text-emerald-500 mb-0.5">Metode</p>
                  <p className="font-bold text-emerald-800">Stripe / Kort</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tilbakemeldingsskjema */}
        {showFeedback && (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 mb-6 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Jobben er fullført!</p>
            <h2 className="font-bold text-slate-900 text-lg mb-1">Gi en vurdering</h2>
            <p className="text-sm text-slate-500 mb-4">Hjelper oss å bli bedre — tar bare 10 sekunder.</p>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackRating(star)}
                  onMouseEnter={() => setFeedbackHover(star)}
                  onMouseLeave={() => setFeedbackHover(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star className={`w-7 h-7 transition-colors ${star <= (feedbackHover || feedbackRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
            {feedbackRating > 0 && (
              <p className="text-xs text-slate-500 mb-3">
                {feedbackRating === 5 ? 'Tusen takk!' :
                 feedbackRating === 4 ? 'Bra, takk!' :
                 feedbackRating === 3 ? 'Greit, takk!' :
                 feedbackRating === 2 ? 'Vi beklager!' :
                 'Vi beklager — vi tar det til etterretning!'}
              </p>
            )}
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="Valgfri kommentar — hva fungerte bra eller kan bli bedre?"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300 mb-3"
              rows={3}
            />
            <button
              onClick={handleSubmitFeedback}
              disabled={submittingFeedback || feedbackRating === 0}
              className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              {submittingFeedback ? 'Sender...' : 'Send tilbakemelding'}
            </button>
          </div>
        )}

        {/* Viser allerede avgitt tilbakemelding */}
        {fix.status === 'completed' && fix.rating && !showFeedback && (
          <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 mb-6 flex items-center gap-3">
            <div className="flex gap-0.5">
              {Array.from({ length: fix.rating }).map((_, si) => (
                <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm text-slate-600">Takk for din vurdering!</span>
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
                {canCancel && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="shrink-0 rounded-full border border-red-200 text-red-500 text-xs px-4 py-2 hover:bg-red-50 disabled:opacity-40 transition-colors"
                  >
                    {cancelling ? 'Trekker tilbake...' : 'Trekk tilbake'}
                  </button>
                )}
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
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0"><Key className="w-4 h-4 text-amber-700" /></div>
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
                    <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-600 mb-3 space-y-1.5">
                      <p className="font-semibold text-slate-700">Tre trygge måter å dele tilgang på:</p>
                      <p>
                        <strong>1. WordPress Application Password (anbefalt)</strong> — Logg inn i WP-admin → Brukere → din bruker → scroll ned til «Application Passwords» → Legg til nytt. Gir begrenset tilgang og kan slettes etterpå.
                      </p>
                      <p>
                        <strong>2. Midlertidig admin-bruker</strong> — Opprett en ny admin-bruker kun til dette oppdraget og slett den når jobben er ferdig.
                      </p>
                      <p>
                        <strong>3. FTP/SFTP</strong> — Fungerer om jobben krever filnivå-tilgang (f.eks. tema-filer eller PHP).
                      </p>
                    </div>
                    <textarea
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300 mb-3 font-mono"
                      placeholder={`WP-admin URL: https://nettside.no/wp-admin\nBruker: admin\nApplication Password: xxxx xxxx xxxx xxxx\n\n— eller —\n\nFTP: ftp.nettside.no\nBruker: ftpuser\nPassord: xxxxx`}
                      value={accessInfo}
                      onChange={e => setAccessInfo(e.target.value)}
                      rows={5}
                    />
                    <button
                      onClick={handleSaveAccessInfo}
                      disabled={savingAccess}
                      className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
                    >
                      {savingAccess ? 'Lagrer...' : 'Lagre tilgangsinfo'}
                    </button>
                    <p className="text-xs text-slate-400 mt-2">Tilgangsinformasjon er sikret og slettes etter at jobben er fullført.</p>
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
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 shrink-0">Betaling</span>
                  <span className={`font-medium text-right text-xs leading-tight ${paymentStatusColor}`}>
                    {paymentStatusLabel}
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
              <p className="text-sm text-slate-600">Kortet reserveres, men trekkes <strong>kun</strong> når jobben er ferdig og godkjent. Full refusjon hvis vi ikke løser problemet.</p>
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
