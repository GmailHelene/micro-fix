import Link from 'next/link';
import { createServerSupabase } from './lib/supabaseServer';
import { categories, packages } from './lib/fixOptions';

export default async function HomePage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-[3rem] bg-white p-10 shadow-[0_40px_120px_rgba(15,23,42,0.08)]">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Micro-fix</p>
              <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-tight text-slate-900">
                Premium, norsk teknisk hjelp for WordPress, nettbutikk og web-feil.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-slate-600">
                Få et ryddig og enkel bestillingsforløp, profesjonell godkjenning og trygg betaling først når jobben er godkjent.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={user ? '/dashboard' : '/login'} className="rounded-full bg-slate-900 px-6 py-3 text-white shadow hover:bg-slate-800">
                  {user ? 'Gå til mitt dashboard' : 'Start nå'}
                </Link>
                {user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                  <Link href="/admin/dashboard" className="rounded-full border border-slate-300 px-6 py-3 text-slate-900 hover:bg-slate-100">
                    Admin dashboard
                  </Link>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[2rem] bg-slate-50 p-8">
                <h2 className="text-xl font-semibold text-slate-900">Ryddig prosess</h2>
                <p className="mt-3 text-slate-600">Bestilling, godkjenning og betaling i samme flyt.</p>
              </div>
              <div className="rounded-[2rem] bg-slate-50 p-8">
                <h2 className="text-xl font-semibold text-slate-900">Trygg levering</h2>
                <p className="mt-3 text-slate-600">Du betaler kun når jobben er godkjent og ferdig.</p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-3xl font-bold">Fokuserte Micro-fix tjenester</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categories.map(category => (
              <div key={category.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900">{category.name}</h3>
                <p className="mt-3 text-slate-600">{category.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold">Premium pakker med faste priser</h2>
              <p className="mt-3 text-slate-600">Velg en pakke som passer oppgaven. Enkelt, forutsigbart og uten overraskelser.</p>
            </div>
            <div className="rounded-full border border-blue-600 bg-blue-50 px-5 py-3 text-blue-700">
              Betal først når jobben er godkjent.
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {packages.map(pkg => (
              <div key={pkg.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-900">{pkg.name}</h3>
                  <span className="text-slate-500">{pkg.estimatedTime}</span>
                </div>
                <p className="mt-3 text-slate-600">{pkg.description}</p>
                <p className="mt-6 text-3xl font-bold text-blue-600">{pkg.price} kr</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-slate-900">Premium kundeopplevelse</h2>
              <ul className="mt-6 space-y-4 text-slate-600">
                <li>Ryddig prosess fra bestilling til ferdig levering.</li>
                <li>Profesjonell kommunikasjon med tydelig status.</li>
                <li>Forventet levering innen 24–48 timer etter godkjenning.</li>
                <li>Betaling først når jobben er godkjent.</li>
              </ul>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-slate-900">Hvordan vi jobber</h2>
              <ol className="mt-6 space-y-4 text-slate-600">
                <li>1. Du beskriver problemet og velger pakke.</li>
                <li>2. Jeg godkjenner forespørselen og sender betalingslink.</li>
                <li>3. Jobben starter når betalingen er gjennomført.</li>
                <li>4. Du får en kort oppsummering når oppdraget er ferdig.</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="rounded-[2rem] border border-blue-200 bg-blue-50 p-8 text-slate-900 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Micro-fix garanti</p>
                <p className="mt-3 text-2xl font-semibold">Du betaler først når jobben er godkjent.</p>
              </div>
              <div className="rounded-full border border-blue-700 bg-white px-5 py-3 text-blue-700">Trygt for deg. Kontrollert for meg.</div>
            </div>
            <p className="mt-4 text-slate-700">Dette gir deg mer tillit, mindre risiko og en premium opplevelse fra første sekund.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

