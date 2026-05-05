'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { statusLabels, statusColors } from '@/app/lib/fixOptions';

interface Fix {
  id: string; title: string; description: string; status: string;
  created_at: string; user_id: string; category?: string;
  package_name?: string; price?: number; estimated_time?: string;
  payment_status?: string; access_info?: string; admin_note?: string;
  custom_payment_url?: string;
}
interface Message {
  id: string; content: string; sender: 'customer' | 'admin'; created_at: string;
}

const statusFlow = [
  { value: 'pending_approval',  label: 'Avventer godkjenning',  action: null },
  { value: 'awaiting_changes',  label: 'Be om endringer',       action: 'changes' },
  { value: 'awaiting_payment',  label: 'Godkjenn → send betalingslenke', action: 'approve' },
  { value: 'in_progress',       label: 'Marker som under arbeid', action: 'progress' },
  { value: 'completed',         label: 'Marker fullført',       action: 'complete' },
  { value: 'cancelled',         label: 'Avvis forespørsel',     action: 'cancel' },
];

export default function AdminFixDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [fix, setFix] = useState<Fix | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [offerNote, setOfferNote] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [working, setWorking] = useState(false);
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);
  const [customPaymentInput, setCustomPaymentInput] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (text: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFix = useCallback(async () => {
    const res = await fetch(`/api/admin/fix/${id}`);
    const data = await res.json();
    if (!data.error) {
      setFix(data);
      setCustomPrice(String(data.price ?? ''));
      setCustomPaymentInput(data.custom_payment_url ?? '');
    }
    setLoading(false);
  }, [id]);

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/messages/${id}`);
    if (res.ok) setMessages(await res.json());
  }, [id]);

  useEffect(() => { fetchFix(); fetchMessages(); }, [fetchFix, fetchMessages]);

  const updateStatus = async (status: string, note?: string, price?: number) => {
    setWorking(true);
    const body: Record<string, unknown> = { status };
    if (note)  body.admin_note = note;
    if (price) body.price = price;

    const res = await fetch(`/api/admin/fix/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.error) {
      fetchFix();
      showToast(`Status: ${statusLabels[status]}`);
      setShowNoteInput(false);
      setShowPriceInput(false);

      // Auto-send melding til kunde ved endringer/avvisning
      if (note) {
        await fetch(`/api/messages/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: note, sender: 'admin' }),
        });
        fetchMessages();
      }
    } else {
      showToast(data.error, 'err');
    }
    setWorking(false);
  };

  const generateStripeUrl = async () => {
    setWorking(true);
    const res = await fetch(`/api/admin/fix/${id}`, { method: 'POST' });
    const data = await res.json();
    if (data.url) {
      setStripeUrl(data.url);
      showToast('Stripe-lenke generert!');
    } else {
      showToast(data.error || 'Feil ved generering', 'err');
    }
    setWorking(false);
  };

  const copyStripeUrl = async () => {
    if (!stripeUrl) return;
    await navigator.clipboard.writeText(stripeUrl);
    setCopySuccess(true);
    showToast('Betalingslenke kopiert!');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSendingMsg(true);
    const res = await fetch(`/api/messages/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage, sender: 'admin' }),
    });
    if (res.ok) { setNewMessage(''); fetchMessages(); }
    setSendingMsg(false);
  };

  const saveCustomPrice = async () => {
    const price = parseFloat(customPrice);
    if (isNaN(price) || price <= 0) { showToast('Ugyldig pris', 'err'); return; }
    setWorking(true);
    const res = await fetch(`/api/admin/fix/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price }),
    });
    const data = await res.json();
    if (!data.error) { fetchFix(); showToast(`Pris oppdatert til ${price} kr`); setShowPriceInput(false); }
    else showToast(data.error, 'err');
    setWorking(false);
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Laster...</div>;
  if (!fix) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <button onClick={() => router.push('/admin/dashboard')} className="text-blue-600 text-sm hover:underline">← Tilbake</button>
    </div>
  );

  const sc = statusColors[fix.status] ?? statusColors.pending_approval;

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 text-sm font-medium px-5 py-3 rounded-full shadow-lg
          ${toast.type === 'err' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>
          {toast.text}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-12">
        <button onClick={() => router.push('/admin/dashboard')} className="text-sm text-slate-500 hover:text-slate-800 mb-8 inline-flex items-center gap-1">
          ← Oppdragsoversikt
        </button>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Venstre */}
          <div className="space-y-5">

            {/* Forespørsel */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                <div>
                  <span className="font-mono text-xs text-slate-400">#{fix.id.slice(0, 8).toUpperCase()}</span>
                  <h1 className="mt-1 text-xl font-semibold text-slate-900">{fix.title}</h1>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                      {statusLabels[fix.status] ?? fix.status}
                    </span>
                    {fix.payment_status === 'paid' && (
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold">Betalt</span>
                    )}
                    {fix.access_info && (
                      <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-semibold">🔑 Tilgang delt</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed mb-4">
                {fix.description}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {fix.category && <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Kategori</p><p className="font-medium text-slate-800 text-sm mt-0.5">{fix.category}</p></div>}
                {fix.package_name && <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Pakke</p><p className="font-medium text-slate-800 text-sm mt-0.5">{fix.package_name}</p></div>}
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Pris</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="font-bold text-blue-600 text-lg">{fix.price ?? '—'} kr</p>
                    <button onClick={() => setShowPriceInput(!showPriceInput)} className="text-xs text-slate-400 hover:text-slate-700 underline">endre</button>
                  </div>
                  {showPriceInput && (
                    <div className="flex gap-2 mt-2">
                      <input type="number" value={customPrice} onChange={e => setCustomPrice(e.target.value)}
                        className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-900 outline-none" placeholder="kr" />
                      <button onClick={saveCustomPrice} disabled={working} className="rounded-lg bg-slate-900 px-3 py-1 text-xs text-white font-semibold disabled:opacity-40">Lagre</button>
                    </div>
                  )}
                </div>
                {fix.estimated_time && <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Tid</p><p className="font-medium text-slate-800 text-sm mt-0.5">{fix.estimated_time}</p></div>}
              </div>
            </div>

            {/* Tilgangsinfo fra kunde */}
            {fix.access_info && (
              <div className="rounded-3xl bg-amber-50 border border-amber-200 p-5 shadow-sm">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">🔑 Tilgangsinformasjon fra kunde</p>
                <pre className="text-sm text-amber-900 whitespace-pre-wrap font-mono bg-amber-100 rounded-xl p-3">{fix.access_info}</pre>
                <p className="text-xs text-amber-600 mt-2">Behandle konfidensielt. Slett etter fullføring.</p>
              </div>
            )}

            {/* Meldinger */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">Meldinger til kunde</h2>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {messages.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Ingen meldinger ennå.</p>}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm
                      ${msg.sender === 'admin' ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                      {msg.sender === 'customer' && <p className="text-xs font-semibold text-slate-500 mb-1">Kunde</p>}
                      <p>{msg.content}</p>
                      <p className="text-xs mt-1 text-slate-400">{new Date(msg.created_at).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  placeholder="Skriv melding til kunden..."
                  className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-300" />
                <button type="submit" disabled={sendingMsg || !newMessage.trim()}
                  className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40 transition-colors">
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Høyre — handlinger */}
          <div className="space-y-4">

            {/* Handlinger */}
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Handlinger</h3>
              <div className="space-y-2">

                {/* Godkjenn til standard pris */}
                {['pending_approval', 'awaiting_offer_approval'].includes(fix.status) && (
                  <button
                    onClick={() => updateStatus('awaiting_payment')}
                    disabled={working}
                    className="w-full rounded-xl bg-emerald-600 text-white px-4 py-3 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                  >
                    ✓ Godkjenn — standard pris
                  </button>
                )}

                {/* Send custom tilbud */}
                {['pending_approval', 'awaiting_changes', 'awaiting_offer_approval'].includes(fix.status) && (
                  <>
                    <button
                      onClick={() => setShowOfferInput(n => !n)}
                      className="w-full rounded-xl border border-purple-200 bg-purple-50 text-purple-700 px-4 py-2.5 text-sm font-semibold hover:bg-purple-100 transition-colors"
                    >
                      💬 Send custom tilbud med ny pris
                    </button>
                    {showOfferInput && (
                      <div className="space-y-2 rounded-xl border border-purple-200 bg-purple-50 p-3">
                        <p className="text-xs text-purple-700 font-medium">Forklaring til kunden (vises i e-post og på siden):</p>
                        <textarea
                          value={offerNote}
                          onChange={e => setOfferNote(e.target.value)}
                          placeholder="F.eks: Vi har sett på saken og det viser seg å være mer omfattende enn en standard pakke. Jobben krever X og Y, og vi estimerer Y timer..."
                          className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-purple-300"
                          rows={4}
                        />
                        <div className="flex gap-2 items-center">
                          <span className="text-xs text-purple-700 font-medium whitespace-nowrap">Ny pris (kr):</span>
                          <input
                            type="number"
                            value={offerPrice}
                            onChange={e => setOfferPrice(e.target.value)}
                            placeholder="F.eks. 1200"
                            className="flex-1 rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-purple-300"
                          />
                        </div>
                        <button
                          onClick={async () => {
                            const price = parseFloat(offerPrice);
                            if (!offerNote.trim() || isNaN(price) || price <= 0) {
                              showToast('Fyll inn forklaring og gyldig pris', 'err'); return;
                            }
                            setWorking(true);
                            const res = await fetch(`/api/admin/fix/${id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                status: 'awaiting_offer_approval',
                                admin_note: offerNote,
                                price,
                              }),
                            });
                            const data = await res.json();
                            if (!data.error) {
                              showToast('Custom tilbud sendt til kunde!');
                              setShowOfferInput(false);
                              setOfferNote('');
                              setOfferPrice('');
                              fetchFix();
                            } else showToast(data.error, 'err');
                            setWorking(false);
                          }}
                          disabled={working || !offerNote.trim() || !offerPrice}
                          className="w-full rounded-xl bg-purple-700 text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-40 hover:bg-purple-800 transition-colors"
                        >
                          Send tilbud til kunde →
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Be om endringer */}
                {['pending_approval', 'awaiting_changes', 'awaiting_offer_approval'].includes(fix.status) && (
                  <>
                    <button
                      onClick={() => setShowNoteInput(n => !n)}
                      className="w-full rounded-xl border border-orange-200 bg-orange-50 text-orange-700 px-4 py-2.5 text-sm font-semibold hover:bg-orange-100 transition-colors"
                    >
                      ↩ Be om endringer
                    </button>
                    {showNoteInput && (
                      <div className="space-y-2">
                        <textarea
                          value={adminNote}
                          onChange={e => setAdminNote(e.target.value)}
                          placeholder="Beskriv hva kunden må endre eller legge til..."
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
                          rows={3}
                        />
                        <button
                          onClick={() => updateStatus('awaiting_changes', adminNote)}
                          disabled={working || !adminNote.trim()}
                          className="w-full rounded-xl bg-orange-600 text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-40 hover:bg-orange-700 transition-colors"
                        >
                          Send endringsforespørsel
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Avvis */}
                {['pending_approval', 'awaiting_changes', 'awaiting_offer_approval'].includes(fix.status) && (
                  <button
                    onClick={() => {
                      if (confirm('Er du sikker på at du vil avvise denne forespørselen?')) {
                        updateStatus('cancelled');
                      }
                    }}
                    disabled={working}
                    className="w-full rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-2.5 text-sm font-semibold hover:bg-red-100 transition-colors"
                  >
                    ✕ Avvis forespørsel
                  </button>
                )}

                {/* Under arbeid */}
                {fix.status === 'awaiting_payment' && fix.payment_status === 'paid' && (
                  <button
                    onClick={() => updateStatus('in_progress')}
                    disabled={working}
                    className="w-full rounded-xl bg-indigo-600 text-white px-4 py-3 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                  >
                    ▶ Start arbeid
                  </button>
                )}

                {/* Fullført */}
                {fix.status === 'in_progress' && (
                  <button
                    onClick={() => updateStatus('completed')}
                    disabled={working}
                    className="w-full rounded-xl bg-emerald-600 text-white px-4 py-3 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                  >
                    ✓ Marker fullført
                  </button>
                )}

                {/* Nåværende status */}
                <div className={`rounded-xl border px-3 py-2 text-xs font-medium text-center ${statusColors[fix.status]?.bg ?? 'bg-slate-50'} ${statusColors[fix.status]?.text ?? 'text-slate-600'} border-current border-opacity-20`}>
                  Nå: {statusLabels[fix.status] ?? fix.status}
                </div>
              </div>
            </div>

            {/* Stripe-betalingslenke */}
            {fix.status === 'awaiting_payment' && (
              <div className="rounded-3xl bg-blue-50 border border-blue-200 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-blue-900">Betalingslenke til kunde</h3>

                {/* Standard pakke — generer fra Stripe Products */}
                <div>
                  <p className="text-xs text-blue-700 mb-2 font-medium">Standard pakke (fra Stripe Products)</p>
                  {!stripeUrl ? (
                    <button
                      onClick={generateStripeUrl}
                      disabled={working}
                      className="w-full rounded-full bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors"
                    >
                      {working ? 'Genererer...' : 'Generer Stripe-lenke'}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="rounded-xl bg-white border border-blue-200 px-3 py-2 text-xs font-mono text-blue-800 break-all">
                        {stripeUrl.slice(0, 60)}...
                      </div>
                      <button
                        onClick={copyStripeUrl}
                        className={`w-full rounded-full py-2.5 text-sm font-semibold transition-colors ${
                          copySuccess ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {copySuccess ? '✓ Kopiert!' : 'Kopier lenke'}
                      </button>
                      <button onClick={generateStripeUrl} className="w-full rounded-full border border-blue-200 py-2 text-xs text-blue-700 hover:bg-blue-100 transition-colors">
                        Generer ny lenke
                      </button>
                    </div>
                  )}
                </div>

                {/* Custom tilbud — lim inn Stripe payment link */}
                <div className="border-t border-blue-200 pt-4">
                  <p className="text-xs text-blue-700 mb-2 font-medium">Custom tilbud (lim inn Stripe payment link)</p>
                  <div className="flex gap-2">
                    <input
                      value={customPaymentInput}
                      onChange={e => setCustomPaymentInput(e.target.value)}
                      placeholder="https://buy.stripe.com/..."
                      className="flex-1 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <button
                      disabled={working}
                      onClick={async () => {
                        setWorking(true);
                        const res = await fetch(`/api/admin/fix/${id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ custom_payment_url: customPaymentInput || null }),
                        });
                        const data = await res.json();
                        if (!data.error) { fetchFix(); showToast('Custom lenke lagret!'); }
                        else showToast(data.error, 'err');
                        setWorking(false);
                      }}
                      className="rounded-xl bg-blue-600 text-white px-3 py-2 text-xs font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors whitespace-nowrap"
                    >
                      Lagre
                    </button>
                  </div>
                  {fix.custom_payment_url && (
                    <div className="mt-2 space-y-1.5">
                      <p className="text-xs text-emerald-600">✓ Custom lenke er satt — kunden bruker denne ved betaling</p>
                      {fix.payment_status !== 'paid' && (
                        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-800">
                          <p className="font-semibold mb-1">⚠️ Manuell bekreftelse kreves</p>
                          <p className="mb-2">Custom Stripe-lenker oppdaterer ikke status automatisk. Når du har bekreftet betaling i Stripe-dashboardet, klikk under:</p>
                          <button
                            disabled={working}
                            onClick={async () => {
                              if (!confirm('Bekreft at betaling er mottatt via Stripe-dashboardet?')) return;
                              setWorking(true);
                              const res = await fetch(`/api/admin/fix/${id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ payment_status: 'paid', status: 'in_progress' }),
                              });
                              const data = await res.json();
                              if (!data.error) { fetchFix(); showToast('Betaling bekreftet — status satt til Under arbeid'); }
                              else showToast(data.error, 'err');
                              setWorking(false);
                            }}
                            className="rounded-lg bg-amber-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-amber-700 disabled:opacity-40 transition-colors"
                          >
                            ✓ Bekreft betaling mottatt
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Info</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Opprettet</span><span className="font-medium text-slate-700">{new Date(fix.created_at).toLocaleDateString('no-NO')}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Betaling</span>
                  <span className={`font-medium ${
                    fix.payment_status === 'paid'           ? 'text-emerald-600' :
                    fix.payment_status === 'authorized'     ? 'text-blue-600' :
                    fix.payment_status === 'capture_failed' ? 'text-red-600' :
                    'text-slate-700'}`}>
                    {fix.payment_status === 'authorized'     ? 'Reservert' :
                     fix.payment_status === 'capture_failed' ? '⚠️ Capture feilet' :
                     fix.payment_status === 'paid'           ? 'Betalt' :
                     (fix.payment_status ?? '—')}
                  </span>
                </div>
                <div className="flex justify-between gap-2"><span className="text-slate-500 shrink-0">Bruker-ID</span>
                  <span className="font-mono text-slate-600 truncate">{fix.user_id.slice(0, 14)}…</span>
                </div>
              </div>
              {fix.payment_status === 'capture_failed' && (
                <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  <strong>Capture feilet</strong> — autorisasjonen er sannsynligvis utløpt (7 dager). Gå til Stripe-dashboardet og opprett ny betalingsforespørsel manuelt.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
