import Link from 'next/link';
import Image from 'next/image';
import { createServerSupabase } from './lib/supabaseServer';
import { categories, packages } from './lib/fixOptions';

export const metadata = {
  title: 'CodeMedic — Premium WordPress og web-hjelp fra norsk utvikler',
  description: 'Få profesjonell hjelp med WordPress-feil, WooCommerce, hastighet og CSS fra en norsk utvikler. Du betaler kun etter godkjent levering. Fast pris, rask leveranse.',
  alternates: { canonical: 'https://codemedic.no' },
  openGraph: {
    title: 'CodeMedic — Premium norsk WordPress-hjelp',
    description: 'Profesjonell WordPress og web-hjelp. Betal kun når jobben er godkjent.',
    url: 'https://codemedic.no',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'CodeMedic' }],
  },
};

const testimonials = [
  {
    name: 'Kristine H.',
    role: 'Eier, nettbutikk',
    text: 'WooCommerce-checkout fungerte ikke og jeg mistet salg. CodeMedic løste det på noen timer. Helt supert!',
    stars: 5,
  },
  {
    name: 'Jonas M.',
    role: 'Frilanser',
    text: 'Nettsiden min lastet sakte og Google-rangeringen led. Etter hastighetsoptimalisering er alt mye bedre.',
    stars: 5,
  },
  {
    name: 'Camilla L.',
    role: 'Daglig leder, AS',
    text: 'Fikk hjelp med en kritisk plugin-konflikt som krasjet hele siden. Profesjonell og trygg løsning.',
    stars: 5,
  },
];

export default async function HomePage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://codemedic.no';

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'CodeMedic',
      url: base,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: 'CodeMedic',
      description: 'Premium norsk WordPress og web-hjelp med fast pris og no-cure-no-pay garanti.',
      url: base,
      email: 'support@codemedic.no',
      provider: { '@type': 'Person', name: 'CodeMedic', url: base },
      areaServed: { '@type': 'Country', name: 'Norway' },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'CodeMedic tjenester',
        itemListElement: packages.map(p => ({
          '@type': 'Offer',
          name: p.name,
          price: p.price,
          priceCurrency: 'NOK',
          description: p.description,
          url: base,
        })),
      },
    },
  ];

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-[3rem] bg-white p-10 shadow-[0_40px_120px_rgba(15,23,42,0.08)]">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Image src="/logo.png" alt="CodeMedic" width={56} height={56} className="rounded-2xl" />
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">CodeMedic</p>
              </div>
              <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-tight text-slate-900">
                Premium, norsk teknisk hjelp for WordPress, nettbutikk og web-feil.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-slate-600">
                CodeMedic gjør teknisk webhjelp like enkelt som å bestille en tjeneste i en nettbutikk. Velg pakke — Vi godkjenner forespørselen og starter arbeidet, og du betaler først når jobben er fullført som avtalt.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={user ? '/fix/new' : '/login'} className="rounded-full bg-slate-900 px-6 py-3 text-white shadow hover:bg-slate-800">
                  {user ? 'Ny forespørsel' : 'Start nå'}
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
          <h2 className="text-3xl font-bold">Fokuserte CodeMedic tjenester</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categories.map(category => (
              <div key={category.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl mb-4">{category.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
                <p className="mt-2 text-slate-600 text-sm">{category.description}</p>
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
              <div key={pkg.id} className={`rounded-[2rem] border bg-white p-6 shadow-sm relative ${pkg.highlight ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                {pkg.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Mest populær</span>
                )}
                <h3 className="text-xl font-semibold text-slate-900">{pkg.name}</h3>
                <p className="mt-3 text-slate-600 text-sm">{pkg.description}</p>
                <p className="mt-6 text-3xl font-bold text-blue-600">
                  <span className="text-base font-normal text-slate-500">fra kr </span>{pkg.price}
                </p>
                <ul className="mt-4 space-y-2">
                  {pkg.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="text-emerald-500 font-bold">✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Steg-for-steg */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Slik fungerer det</h2>
          <p className="text-slate-500 mb-8">Fra problem til løsning — i fire enkle steg.</p>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { step: '01', title: 'Beskriv problemet', desc: 'Velg kategori og pakke, legg ved skjermbilde og URL. Tar 2 minutter.' },
              { step: '02', title: 'Godkjenning', desc: 'Vi gjennomgår forespørselen og sender et tilbud innen 2–4 timer.' },
              { step: '03', title: 'Betaling & arbeid', desc: 'Du godkjenner tilbudet, betaler trygt via Stripe og arbeidet starter.' },
              { step: '04', title: 'Ferdig levert', desc: 'Du mottar beskjed når jobben er løst. Full refusjon om vi ikke løser det.' },
            ].map(s => (
              <div key={s.step} className="rounded-[2rem] bg-white border border-slate-200 p-6 shadow-sm">
                <p className="text-4xl font-black text-slate-100 mb-3">{s.step}</p>
                <h3 className="font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Omtaler */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Hva kundene sier</h2>
          <p className="text-slate-500 mb-8">Ekte tilbakemeldinger fra fornøyde kunder.</p>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-[2rem] bg-white border border-slate-200 p-6 shadow-sm">
                <p className="text-amber-400 text-lg mb-3">{'★'.repeat(t.stars)}</p>
                <p className="text-slate-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
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
                <li>Du betaler kun når jobben er godkjent og ferdig.</li>
                <li>Full refusjon hvis vi ikke kan løse problemet.</li>
              </ul>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-slate-900">Garantier</h2>
              <ul className="mt-6 space-y-4 text-slate-600">
                <li>✓ Fast pris — ingen skjulte kostnader.</li>
                <li>✓ Levering innen 24–48 timer etter betaling.</li>
                <li>✓ Full refusjon hvis problemet ikke løses.</li>
                <li>✓ Konfidensielt — tilgangsinformasjon slettes etter fullføring.</li>
                <li>✓ Norsk support, på norsk.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Hvorfor velge CodeMedic?</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">✓</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Ingen risiko</h3>
                <p className="text-slate-600 text-sm">Betal først når jobben er ferdig og godkjent av deg.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">⚡</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Rask levering</h3>
                <p className="text-slate-600 text-sm">24-48 timer leveringstid på de fleste oppdrag.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">💼</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Profesjonell</h3>
                <p className="text-slate-600 text-sm">Dedikert WordPress-utvikler med 5+ års erfaring.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="rounded-[2rem] border border-blue-200 bg-blue-50 p-8 text-slate-900 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-700">CodeMedic garanti</p>
                <p className="mt-3 text-2xl font-semibold">Du betaler først når jobben er godkjent.</p>
              </div>
              <div className="rounded-full border border-blue-700 bg-white px-5 py-3 text-blue-700">Trygt for deg. Kontrollert for meg.</div>
            </div>
            <p className="mt-4 text-slate-700">Dette gir deg mer tillit, mindre risiko og en premium opplevelse fra første sekund.</p>
          </div>
        </section>

        <section className="mt-16">
          <div className="rounded-[3rem] bg-slate-900 text-white p-10 text-center shadow-[0_40px_120px_rgba(15,23,42,0.3)]">
            <h2 className="text-3xl font-bold mb-4">Klar til å fikse ditt tekniske problem?</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Beskriv problemet ditt, velg pakke og få profesjonell hjelp innen 24-48 timer.
              Ingen risiko - betal først når jobben er ferdig.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href={user ? '/fix/new' : '/login'} className="rounded-full bg-white text-slate-900 px-8 py-4 font-semibold shadow hover:bg-slate-100 transition-colors">
                {user ? 'Start ny forespørsel' : 'Registrer deg og start'}
              </Link>
              {user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                <Link href="/admin/dashboard" className="rounded-full border-2 border-white text-white px-8 py-4 font-semibold hover:bg-white hover:text-slate-900 transition-colors">
                  Admin dashboard
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
    </>
  );
}

