'use client';

import { useState } from 'react';
import { categories, packages } from '@/app/lib/fixOptions';

export default function NewFixPage() {
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [triedBefore, setTriedBefore] = useState('');
  const [criticality, setCriticality] = useState('medium');
  const [category, setCategory] = useState(categories[0].id);
  const [packageId, setPackageId] = useState(packages[0].id);
  const [accessInfo, setAccessInfo] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedPackage = packages.find(pkg => pkg.id === packageId) ?? packages[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const detailedDescription = `URL: ${pageUrl}\nSkjermbilde: ${screenshotUrl}\nKritikalitet: ${criticality}\nHva jeg har prøvd: ${triedBefore || 'Ingen'}\nTilgang: ${accessInfo || 'Ikke delt ennå'}\n\nDetaljert problem:\n${description}`;

    const res = await fetch('/api/fix/new', {
      method: 'POST',
      body: JSON.stringify({
        title: summary,
        description: detailedDescription,
        category,
        packageName: selectedPackage.name,
        price: selectedPackage.price,
        estimatedTime: selectedPackage.estimatedTime,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setMessage(data.error);
      return;
    }

    setMessage('Forespørselen er sendt og venter på godkjenning. Takk for at du gir tydelig informasjon.');
    setSummary('');
    setDescription('');
    setPageUrl('');
    setScreenshotUrl('');
    setTriedBefore('');
    setAccessInfo('');
    setCriticality('medium');
    setCategory(categories[0].id);
    setPackageId(packages[0].id);
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-10 px-4">
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-semibold text-slate-900">Ny forespørsel</h1>
        <p className="mt-3 text-slate-600">Fyll ut problemet tydelig, legg ved skjermbilde og beskriv hva som er viktig. Dette sparer tid og gjør jobben enklere å starte.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Hva er problemet?</label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900"
                placeholder="Kort, konkret tittel på problemet"
                value={summary}
                onChange={e => setSummary(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">URL til siden</label>
              <input
                type="url"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900"
                placeholder="https://din-nettside.no"
                value={pageUrl}
                onChange={e => setPageUrl(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Skjermbilde</label>
              <input
                type="url"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900"
                placeholder="Link til skjermbilde (Imgur, Drive eller lignende)"
                value={screenshotUrl}
                onChange={e => setScreenshotUrl(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Hva har du prøvd selv?</label>
              <textarea
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900"
                placeholder="Skriv kort hva du har forsøkt før du kontakter meg."
                value={triedBefore}
                onChange={e => setTriedBefore(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Hvor kritisk er feilen?</label>
                <select
                  value={criticality}
                  onChange={e => setCriticality(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900"
                >
                  <option value="low">Lav - kan vente</option>
                  <option value="medium">Medium - bør løses snart</option>
                  <option value="high">Høy - påvirker brukere</option>
                  <option value="urgent">Urgent - stopper drift</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Hvilken pakke ønsker du?</label>
                <select
                  value={packageId}
                  onChange={e => setPackageId(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900"
                >
                  {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — {pkg.price} kr
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Tilgangsinformasjon</label>
              <textarea
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900"
                placeholder="Skriv om du har WP-admin, FTP eller andre tilgangsdetaljer som kan deles senere."
                value={accessInfo}
                onChange={e => setAccessInfo(e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Detaljert problem</label>
              <textarea
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900"
                placeholder="Beskriv problemet mer detaljert. Hva skjer, hva forventer du, og hvor oppstår det?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? 'Sender ...' : 'Send forespørsel'}
            </button>
          </form>

          {message && <p className="mt-4 text-slate-700">{message}</p>}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Valgt pakke</h2>
            <p className="mt-3 text-slate-600">{selectedPackage.description}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Pris</p>
                <p className="mt-2 text-2xl font-bold text-blue-600">{selectedPackage.price} kr</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Estimert arbeid</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{selectedPackage.estimatedTime}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Forventninger</h2>
            <ul className="mt-4 space-y-3 text-slate-600">
              <li>Leveringstid: 24–48 timer etter godkjenning.</li>
              <li>Betaling skjer først når jobben er godkjent.</li>
              <li>Ikke inkludert: redesign, migrering eller større redesign-prosjekter.</li>
              <li>Ekstra arbeid faktureres hvis oppgaven vokser.</li>
              <li>Får jeg ikke tilgang: full refusjon og null stress.</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-blue-50 p-8 shadow-sm border border-blue-200 text-blue-900">
            <h2 className="text-xl font-semibold">Micro-fix garanti</h2>
            <p className="mt-3 text-slate-900">Du betaler først når jobben er godkjent. Det gir deg trygghet og meg full kontroll i adminpanelet.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
