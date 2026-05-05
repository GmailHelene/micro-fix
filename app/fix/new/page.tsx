'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';
import { categories, packages } from '@/app/lib/fixOptions';

const criticalities = [
  { value: 'low',    label: 'Lav — kan vente',             color: 'text-slate-600' },
  { value: 'medium', label: 'Medium — bør løses snart',    color: 'text-amber-600' },
  { value: 'high',   label: 'Høy — påvirker brukere',      color: 'text-orange-600' },
  { value: 'urgent', label: 'Kritisk — stopper drift',     color: 'text-red-600' },
];

export default function NewFixPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fixId, setFixId] = useState<string | null>(null);

  const [summary, setSummary]       = useState('');
  const [description, setDescription] = useState('');
  const [otherDescription, setOtherDescription] = useState('');
  const [pageUrl, setPageUrl]       = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [triedBefore, setTriedBefore] = useState('');
  const [criticality, setCriticality] = useState('medium');
  const [category, setCategory]     = useState(categories[0].id);
  const [packageId, setPackageId]   = useState(packages[0].id);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const isOtherCategory = category === 'other';

  // Auth-guard
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login?redirect=/fix/new');
      } else {
        setAuthChecked(true);
      }
    });
  }, [router]);

  const selectedPackage = packages.find(p => p.id === packageId) ?? packages[0];
  const selectedCategory = categories.find(c => c.id === category) ?? categories[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fullDescription = [
      ...(pageUrl ? [`URL: ${pageUrl}`] : []),
      ...(screenshotUrl ? [`Skjermbilde: ${screenshotUrl}`] : []),
      `Kritikalitet: ${criticalities.find(c => c.value === criticality)?.label ?? criticality}`,
      `Hva er prøvd: ${triedBefore || 'Ikke oppgitt'}`,
      ...(isOtherCategory && otherDescription ? [``, `Hva handler det om:`, otherDescription] : []),
      ``,
      `Problembeskrivelse:`,
      description,
    ].join('\n');

    const res = await fetch('/api/fix/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: summary,
        description: fullDescription,
        category,
        packageName: selectedPackage.name,
        price: selectedPackage.price,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setError(data.error);
      return;
    }

    setFixId(data.id ?? null);
    setSubmitted(true);
  };

  if (!authChecked) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Sjekker innlogging...</div>;
  }

  // Bekreftelsesskjerm
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Forespørsel mottatt!</h1>
          <p className="text-slate-600 mb-2">
            Takk for at du valgte CodeMedic. Forespørselen din er sendt inn og vil bli gjennomgått innen kort tid.
          </p>
          <div className="rounded-2xl bg-white border border-slate-200 p-6 mt-6 text-left shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Hva skjer nå?</p>
            <ol className="space-y-3 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                <span>Vi gjennomgår forespørselen og sender deg en bekreftelse innen 24 timer.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                <span>Når jobben er godkjent, får du beskjed om betaling. Du betaler <strong>kun</strong> når du er klar.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                <span>Etter betaling starter arbeidet umiddelbart. Levering innen 24–48 timer.</span>
              </li>
            </ol>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Se mine forespørsler
            </button>
            {fixId && (
              <button
                onClick={() => router.push(`/fix/${fixId}`)}
                className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Åpne forespørselen
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-12">

        <div className="mb-8">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Ny forespørsel</p>
          <h1 className="text-3xl font-semibold text-slate-900">Beskriv problemet</h1>
          <p className="mt-2 text-slate-500 text-sm">Jo tydeligere du beskriver, desto raskere kan jeg starte. Du betaler først når jobben er godkjent.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Skjema */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Kategori */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <label className="block text-sm font-semibold text-slate-800 mb-3">Hva handler det om?</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      category === cat.id
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <div className="text-lg mb-1">{cat.icon}</div>
                    <div className="text-xs font-semibold leading-tight">{cat.name}</div>
                  </button>
                ))}
              </div>
              {isOtherCategory && (
                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Hva handler forespørselen om? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
                    placeholder="Beskriv kort hva du trenger hjelp med, så vurderer vi om og hvordan vi kan hjelpe."
                    value={otherDescription}
                    onChange={e => setOtherDescription(e.target.value)}
                    rows={3}
                    required
                  />
                </div>
              )}
            </div>

            {/* Pakkevalg */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <label className="block text-sm font-semibold text-slate-800 mb-1">Velg pakke</label>
              <p className="text-xs text-slate-500 mb-3">
                Velg pakken som passer best til problemets omfang. Prisen er en <strong>startpris</strong> — vi vurderer alltid forespørselen og bekrefter pris før du betaler.
              </p>
              <div className="space-y-2">
                {packages.map(pkg => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setPackageId(pkg.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      packageId === pkg.id
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{pkg.name}</div>
                        <div className={`text-xs mt-0.5 ${packageId === pkg.id ? 'text-slate-300' : 'text-slate-500'}`}>
                          {pkg.description}
                        </div>
                      </div>
                      <div className={`text-right shrink-0 ml-3`}>
                        <div className={`text-xs ${packageId === pkg.id ? 'text-slate-300' : 'text-slate-400'}`}>fra kr</div>
                        <div className={`text-xl font-bold ${packageId === pkg.id ? 'text-white' : 'text-blue-600'}`}>{pkg.price}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 leading-relaxed">
                <strong>💡 Slik fungerer prising hos CodeMedic:</strong><br/>
                Prisene over er <em>startpriser</em>. Etter at du sender inn forespørselen, gjennomgår vi oppdraget og bekrefter endelig pris.
                Dersom jobben er mer omfattende enn pakken tilsier, sender vi deg et <strong>custom tilbud med ny pris</strong> — du velger selv om du vil godta eller avslå. Du betaler aldri uten at du har godkjent prisen.
              </div>
            </div>

            {/* Problemdetaljer */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Hva er problemet? <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="Kort, konkret tittel — f.eks. 'Mobilvisning ødelagt på forsiden'"
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  URL til siden {!isOtherCategory && <span className="text-red-500">*</span>}
                  {isOtherCategory && <span className="text-xs font-normal text-slate-500 ml-1">(valgfritt)</span>}
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="din-nettside.no eller https://din-nettside.no/side-med-feil"
                  value={pageUrl}
                  onChange={e => setPageUrl(e.target.value)}
                  onBlur={e => {
                    const v = e.target.value.trim();
                    if (v && !/^https?:\/\//i.test(v)) setPageUrl('https://' + v);
                  }}
                  required={!isOtherCategory}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Skjermbilde
                  <span className="text-xs font-normal text-slate-500 ml-2">Valgfritt — lim inn lenke (Imgur, Google Drive, Dropbox o.l.)</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="imgur.com/ditt-skjermbilde eller full https://-lenke"
                  value={screenshotUrl}
                  onChange={e => setScreenshotUrl(e.target.value)}
                  onBlur={e => {
                    const v = e.target.value.trim();
                    if (v && !/^https?:\/\//i.test(v)) setScreenshotUrl('https://' + v);
                  }}
                />
                <p className="text-xs text-slate-400 mt-1">Tips: Ta skjermbilde → last opp på imgur.com (gratis) → lim inn lenken</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Beskriv problemet <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="Hva skjer? Hva forventer du? Når startet problemet?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">Kritikalitet</label>
                  <select
                    value={criticality}
                    onChange={e => setCriticality(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
                  >
                    {criticalities.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">Hva har du prøvd?</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
                    placeholder="F.eks. tømt cache, deaktivert plugin..."
                    value={triedBefore}
                    onChange={e => setTriedBefore(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-slate-900 py-4 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-lg"
            >
              {loading ? 'Sender inn...' : 'Send forespørsel →'}
            </button>
            <p className="text-center text-xs text-slate-400">Du betaler ikke nå. Vi gjennomgår forespørselen og bekrefter pris — du godkjenner før betaling starter.</p>
          </form>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-20 self-start">

            {/* Valgt pakke */}
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Valgt pakke</p>
              <div className="flex items-baseline justify-between mb-3">
                <span className="font-bold text-slate-900">{selectedPackage.name}</span>
                <span className="text-2xl font-bold text-blue-600">{selectedPackage.price} kr</span>
              </div>
              <p className="text-sm text-slate-600 mb-3">{selectedPackage.description}</p>
              <ul className="space-y-1.5">
                {selectedPackage.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="text-emerald-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Valgt kategori */}
            <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Valgt kategori</p>
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedCategory.icon}</span>
                <span className="font-medium text-slate-800 text-sm">{selectedCategory.name}</span>
              </div>
            </div>

            {/* Garanti */}
            <div className="rounded-3xl bg-blue-50 border border-blue-200 p-5">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">CodeMedic garanti</p>
              <p className="text-sm text-slate-700">Du betaler først når jobben er godkjent og du er fornøyd. Full refusjon hvis vi ikke kan løse problemet.</p>
            </div>

            {/* Forventninger */}
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Ikke inkludert</p>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li>• Redesign eller nytt nettsted</li>
                <li>• Store migreringer eller plattformbytte</li>
                <li>• Opplæring eller kursing</li>
                <li>• Feil utenfor valgt kategori</li>
              </ul>
              <p className="text-xs text-slate-400 mt-3">Ekstra arbeid avtales og faktureres separat.</p>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
