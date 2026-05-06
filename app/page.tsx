import Link from 'next/link';
import Image from 'next/image';
import { createServerSupabase } from './lib/supabaseServer';
import { categories, packages } from './lib/fixOptions';
import {
  Shield, Zap, Lock, Flag, Star, Check,
  ShieldCheck, Clock, CreditCard, MessageSquare,
  Smartphone, ShoppingCart, Palette, Plug, Globe,
  FileText, Search, CheckCircle,
  Trash2, User,
  Building2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const categoryIcons: Record<string, LucideIcon> = {
  Smartphone,
  ShoppingCart,
  Palette,
  Zap,
  Plug,
  Globe,
  Shield,
  MessageSquare,
};

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
    text: 'WooCommerce-checkout fungerte ikke og jeg mistet salg hver dag. CodeMedic løste det på noen timer. Helt supert — og jeg betalte kun etter at jeg hadde bekreftet at det fungerte.',
    stars: 5,
  },
  {
    name: 'Jonas M.',
    role: 'Frilanser',
    text: 'Nettsiden min lastet sakte og Google-rangeringen led. Etter hastighetsoptimalisering er alt mye bedre. Profesjonell kommunikasjon gjennom hele prosessen.',
    stars: 5,
  },
  {
    name: 'Camilla L.',
    role: 'Daglig leder, AS',
    text: 'Fikk hjelp med en kritisk plugin-konflikt som krasjet hele siden. Rask, profesjonell løsning. Ingen unødvendige spørsmål — bare resultater.',
    stars: 5,
  },
];

const faq = [
  {
    q: 'Betaler jeg før eller etter jobben er ferdig?',
    a: 'Du betaler aldri på forhånd. Betalingen reserveres via Stripe først når du godkjenner tilbudet — og trekkes kun når jobben er fullført og du er fornøyd. Full refusjon om vi ikke løser problemet.',
  },
  {
    q: 'Hva skjer etter at jeg sender inn forespørselen?',
    a: 'Du får en bekreftelse på e-post umiddelbart. Vi gjennomgår forespørselen innen 2–4 timer og sender deg et tilbud med pris og estimert leveringstid. Du bestemmer om du vil gå videre.',
  },
  {
    q: 'Hva om jobben er mer kompleks enn pakken tilsier?',
    a: 'Da sender vi deg et custom tilbud med ny pris og forklaring. Du velger selv om du vil godta eller avslå — ingen overraskelser på fakturaen.',
  },
  {
    q: 'Hvordan deler jeg tilgang trygt?',
    a: 'Etter betaling får du en sikker, kryptert kanal i systemet der du deler WP Application Password, midlertidig admin-bruker eller FTP-innlogging. Tilgangen slettes fra systemet etter fullføring.',
  },
  {
    q: 'Hva er ikke inkludert?',
    a: 'Vi tar ikke på oss redesign, nytt nettsted, store migrasjoner eller opplæring. Fokuset er på å fikse konkrete, tekniske feil raskt og trygt.',
  },
  {
    q: 'Kan jeg bruke CodeMedic uten WordPress?',
    a: 'Primært jobber vi med WordPress og WooCommerce, men vi hjelper også med andre plattformer for CSS-, JS- og tekniske feil. Beskriv problemet under "Annet" så vurderer vi.',
  },
];

export default async function HomePage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const base = 'https://codemedic.no';

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
      priceRange: '990–2490 kr',
      areaServed: { '@type': 'Country', name: 'Norway' },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5',
        reviewCount: '3',
        bestRating: '5',
        worstRating: '1',
      },
      review: testimonials.map(t => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: t.name },
        reviewRating: { '@type': 'Rating', ratingValue: String(t.stars), bestRating: '5' },
        reviewBody: t.text,
      })),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'CodeMedic tjenester',
        itemListElement: packages
          .filter(p => p.price != null)
          .map(p => ({
            '@type': 'Offer',
            name: p.name,
            price: String(p.price),
            priceCurrency: 'NOK',
            description: p.description,
            url: base,
          })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-5xl px-4 py-16 space-y-24">

          {/* ── HERO ── */}
          <section>
            <div className="rounded-[2.5rem] bg-white p-10 md:p-14 shadow-[0_32px_80px_rgba(15,23,42,0.07)] border border-slate-100">
              <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:items-center">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <Image src="/logo.png" alt="CodeMedic" width={128} height={128} className="rounded-2xl" />
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400 font-medium">CodeMedic</p>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] text-slate-900 tracking-tight">
                    Norsk, profesjonell hjelp med WordPress og web-feil.
                  </h1>
                  <p className="mt-5 text-lg text-slate-500 leading-relaxed max-w-lg">
                    Beskriv problemet ditt, velg pakke og få det løst innen 1–3 dager.
                    Du betaler <strong className="text-slate-700">kun når jobben er godkjent og ferdig</strong>.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Link
                      href={user ? '/fix/new' : '/login'}
                      className="rounded-full bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      {user ? 'Send ny forespørsel →' : 'Kom i gang →'}
                    </Link>
                    <span className="text-xs text-slate-400 sm:ml-1">Ingen bindingstid. Betal kun for det du godkjenner.</span>
                  </div>
                </div>

                {/* Trust-points */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { Icon: Shield, label: 'No cure, no pay', sub: 'Full refusjon om vi ikke løser det' },
                    { Icon: Zap, label: '1–3 dagers levering', sub: 'Rask behandling og svar' },
                    { Icon: Lock, label: 'Trygg betaling', sub: 'Stripe — reservert, ikke trukket' },
                    { Icon: Flag, label: 'Norsk support', sub: 'På norsk, av norsk utvikler' },
                  ].map(t => (
                    <div key={t.label} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                      <div className="mb-2"><t.Icon className="w-6 h-6 text-slate-700" /></div>
                      <div className="text-xs font-semibold text-slate-800">{t.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{t.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── SOCIAL PROOF BAR ── */}
          <section className="-mt-10">
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-6 py-4 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                <strong className="text-slate-700 ml-1">5.0</strong> gjennomsnitt
              </span>
              <span className="hidden sm:block text-slate-200">|</span>
              <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> <strong className="text-slate-700">100 %</strong> fornøyde kunder</span>
              <span className="hidden sm:block text-slate-200">|</span>
              <span className="inline-flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-slate-500" /> Betaling kun ved ferdigstillelse</span>
              <span className="hidden sm:block text-slate-200">|</span>
              <span className="inline-flex items-center gap-1.5"><Flag className="w-4 h-4 text-slate-500" /> Norsk utvikler — norsk kommunikasjon</span>
            </div>
          </section>

          {/* ── HVA VI FIKSER ── */}
          <section>
            <div className="mb-8">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Tjenester</p>
              <h2 className="text-3xl font-bold text-slate-900">Hva vi fikser</h2>
              <p className="mt-2 text-slate-500">Fokuserte kategorier — ingenting generelt, alt spesialisert.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {categories.filter(c => c.id !== 'other').map(cat => {
                const CatIcon = categoryIcons[cat.icon];
                return (
                  <div key={cat.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-slate-100 transition-colors">
                      {CatIcon && <CatIcon className="w-5 h-5 text-slate-700" />}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">{cat.name}</h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">{cat.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── PAKKER ── */}
          <section>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Priser</p>
                <h2 className="text-3xl font-bold text-slate-900">Velg pakke</h2>
                <p className="mt-2 text-slate-500 max-w-md">
                  Startpriser — vi bekrefter alltid endelig pris før du betaler. Ingen overraskelser.
                </p>
              </div>
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-700 font-medium whitespace-nowrap self-start sm:self-auto inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Betal kun når jobben er godkjent
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {packages.map(pkg => (
                <div
                  key={pkg.id}
                  className={`rounded-2xl border bg-white p-6 shadow-sm relative flex flex-col ${
                    pkg.highlight ? 'border-blue-300 ring-2 ring-blue-100 shadow-md' : 'border-slate-200'
                  }`}
                >
                  {pkg.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Mest populær
                    </span>
                  )}
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-900">{pkg.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{pkg.description}</p>
                    <p className="mt-4 text-3xl font-bold text-slate-900">
                      {pkg.price} <span className="text-base font-normal text-slate-400">kr</span>
                      <span className="text-sm font-normal text-slate-400 ml-1">startpris</span>
                    </p>

                    <ul className="mt-4 space-y-1.5 mb-5">
                      {pkg.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />{f}
                        </li>
                      ))}
                    </ul>

                    {/* Passer for deg som */}
                    {'fitsFor' in pkg && (
                      <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Passer for deg som…</p>
                        <ul className="space-y-1">
                          {(pkg as typeof pkg & { fitsFor: string[] }).fitsFor.map((f: string) => (
                            <li key={f} className="flex items-start gap-1.5 text-xs text-slate-600">
                              <span className="text-slate-400 mt-0.5 shrink-0">→</span>{f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <Link
                    href={user ? '/fix/new' : '/login'}
                    className={`mt-5 block text-center rounded-full py-2.5 text-sm font-semibold transition-colors ${
                      pkg.highlight
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    Velg denne →
                  </Link>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-slate-400 mt-4">
              Usikker på hvilken pakke? Send en forespørsel — vi hjelper deg å velge riktig.
            </p>
          </section>

          {/* ── SLIK FUNGERER DET ── */}
          <section>
            <div className="mb-8">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Prosess</p>
              <h2 className="text-3xl font-bold text-slate-900">Slik fungerer det</h2>
              <p className="mt-2 text-slate-500">Fra problem til løsning — fire enkle steg.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: '01', Icon: FileText, title: 'Beskriv problemet', desc: 'Velg kategori og pakke, legg ved URL og eventuelt skjermbilde. Tar under 3 minutter.' },
                { step: '02', Icon: Search, title: 'Vi gjennomgår', desc: 'Vi vurderer forespørselen og sender et tilbud med pris innen 2–4 timer.' },
                { step: '03', Icon: CreditCard, title: 'Godkjenn og betal', desc: 'Du godkjenner tilbudet og betaler trygt via Stripe. Vi starter umiddelbart.' },
                { step: '04', Icon: CheckCircle, title: 'Ferdig levert', desc: 'Du får beskjed når jobben er gjort. Betalingen trekkes kun ved fullføring.' },
              ].map(s => (
                <div key={s.step} className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <s.Icon className="w-6 h-6 text-slate-700" />
                    <span className="text-3xl font-black text-slate-100">{s.step}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1.5">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── OM MEG ── */}
          <section>
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="grid lg:grid-cols-[1fr_2fr] gap-0">
                <div className="bg-slate-900 p-8 flex flex-col justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-5">
                    <User className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Om meg</p>
                  <h2 className="text-2xl font-bold text-white">Norsk utvikler, 5+ års erfaring</h2>
                  <p className="mt-2 text-slate-400 text-sm">WordPress · WooCommerce · CSS/JS · PHP</p>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <p className="text-slate-600 leading-relaxed mb-4">
                    CodeMedic er bygget på ett premiss: <strong className="text-slate-800">teknisk hjelp skal være enkel, trygg og forutsigbar.</strong>
                    Ingen uforståelige tilbud, ingen skjulte kostnader, ingen unødvendig venting.
                  </p>
                  <p className="text-slate-500 text-sm leading-relaxed mb-5">
                    Jeg er en norsk webutvikler med spesialisering i WordPress, WooCommerce og frontend-feil.
                    Jeg har hjulpet nettbutikker, frilansere og bedrifter med alt fra kritiske bugfikser til
                    hastighetsoptimalisering og sikkerhetshull. Alt kommuniseres på norsk, alt leveres raskt.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['WordPress', 'WooCommerce', 'PHP', 'CSS / JS', 'Hastighet', 'Sikkerhet'].map(tag => (
                      <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── OMTALER ── */}
          <section>
            <div className="mb-8">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Kunder</p>
              <h2 className="text-3xl font-bold text-slate-900">Hva kundene sier</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <div key={i} className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.stars }).map((_, si) => (
                      <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed flex-1">"{t.text}"</p>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── SIKKERHET ── */}
          <section>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8">
              <div className="grid lg:grid-cols-[1fr_2fr] gap-8 items-start">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Sikkerhet og personvern</p>
                  <h2 className="text-2xl font-bold text-slate-900">Din tilgang er trygg hos oss</h2>
                  <p className="mt-3 text-slate-500 text-sm leading-relaxed">
                    Vi vet at du stoler på oss med innloggingsinformasjon til nettsiden din.
                    Vi tar det på dypeste alvor.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { Icon: Lock, title: 'Kryptert overføring', desc: 'Tilgangsinformasjon sendes kun gjennom vårt sikre system — aldri via e-post eller chat.' },
                    { Icon: Trash2, title: 'Slettes etter fullføring', desc: 'WP-passord, FTP og admin-tilgang slettes umiddelbart fra systemet når jobben er levert.' },
                    { Icon: User, title: 'Begrenset tilgang', desc: 'Kun den som jobber på oppdraget har tilgang til innloggingsinformasjonen din.' },
                    { Icon: CreditCard, title: 'Stripe-sikkerhet', desc: 'Betaling håndteres eksklusivt av Stripe. Vi lagrer aldri kortinformasjon.' },
                  ].map(s => (
                    <div key={s.title} className="flex gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                        <s.Icon className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{s.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section>
            <div className="mb-8">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">FAQ</p>
              <h2 className="text-3xl font-bold text-slate-900">Vanlige spørsmål</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {faq.map((item, i) => (
                <div key={i} className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm">{item.q}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-center text-sm text-slate-500">
              Andre spørsmål? Ta kontakt på{' '}
              <a href="mailto:support@codemedic.no" className="text-slate-700 font-medium hover:underline">support@codemedic.no</a>
            </p>
          </section>

          {/* ── GARANTIER ── */}
          <section>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { Icon: ShieldCheck, title: 'No cure, no pay', desc: 'Full refusjon om vi ikke kan løse problemet — ingen diskusjon.' },
                { Icon: Clock, title: '1–3 dagers levering', desc: 'De fleste oppdrag leveres innen 1–3 dager etter betalt reservasjon.' },
                { Icon: MessageSquare, title: 'Norsk kommunikasjon', desc: 'Alt foregår på norsk. Ingen språkbarrierer, ingen misforståelser.' },
              ].map(g => (
                <div key={g.title} className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm text-center">
                  <div className="flex justify-center mb-3"><g.Icon className="w-8 h-8 text-slate-700" /></div>
                  <h3 className="font-semibold text-slate-900 mb-1">{g.title}</h3>
                  <p className="text-sm text-slate-500">{g.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── NETTSIDER & NETTBUTIKKER ── */}
          <section>
            <div className="rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-sm">
              <div className="grid lg:grid-cols-2">
                {/* Venstre — tekst */}
                <div className="bg-white p-10 md:p-12 flex flex-col justify-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-blue-500 font-semibold mb-3">Mer enn reparasjoner</p>
                  <h2 className="text-3xl font-bold text-slate-900 leading-tight mb-4">
                    Trenger du en ny nettside eller nettbutikk?
                  </h2>
                  <p className="text-slate-500 leading-relaxed mb-5">
                    Vi bygger profesjonelle WordPress-nettsider og WooCommerce-nettbutikker fra bunnen av —
                    skreddersydd til deg, med ryddig kode og godt design. Du får en løsning som er rask,
                    mobiloptimert og enkel å administrere selv.
                  </p>
                  <ul className="space-y-2 mb-7">
                    {[
                      { Icon: Building2, title: 'WordPress og WooCommerce', sub: 'Bransjens mest fleksible plattform' },
                      { Icon: Smartphone, title: 'Mobiloptimert fra start', sub: 'Ser bra ut på alle skjermstørrelser' },
                      { Icon: Zap, title: 'Rask og SEO-vennlig', sub: 'Riktig teknisk fundament fra dag én' },
                      { Icon: CheckCircle, title: 'Opplæring inkludert', sub: 'Du kan enkelt oppdatere siden selv' },
                    ].map(({ Icon, title, sub }) => (
                      <li key={title} className="flex items-start gap-3">
                        <Icon className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-semibold text-slate-800">{title}</span>
                          <span className="text-sm text-slate-500"> — {sub}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="mailto:support@codemedic.no?subject=Forespørsel om ny nettside/nettbutikk"
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-7 py-3.5 text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm self-start"
                  >
                    Ta kontakt for et uforpliktende tilbud →
                  </a>
                </div>

                {/* Høyre — visuell boks */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-10 md:p-12 flex flex-col justify-center text-white">
                  <p className="text-blue-200 text-xs uppercase tracking-widest font-semibold mb-6">Vi leverer</p>
                  <div className="space-y-4">
                    {[
                      { label: 'Presentasjonsnettsider', desc: 'For bedrifter, frilansere og fagpersoner som vil fremstå profesjonelt på nett.' },
                      { label: 'WooCommerce-nettbutikker', desc: 'Komplett netthandel med produkter, betalingsløsning og ordrehåndtering.' },
                      { label: 'Landingssider', desc: 'Konverteringsfokuserte sider for kampanjer, produktlanseringer og leads.' },
                    ].map(item => (
                      <div key={item.label} className="rounded-2xl bg-white/10 border border-white/10 p-4">
                        <p className="font-semibold text-white text-sm mb-1">{item.label}</p>
                        <p className="text-blue-100 text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-blue-200 text-xs mt-6 leading-relaxed">
                    Alle prosjekter starter med en gratis samtale der vi kartlegger behovene dine. Ingen binding — bare en ærlig vurdering.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section>
            <div className="rounded-[2.5rem] bg-slate-900 text-white p-10 md:p-14 text-center shadow-[0_32px_80px_rgba(15,23,42,0.25)]">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 mb-4">Klar til å starte?</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                La oss fikse det — raskt og trygt.
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                Send inn forespørselen din på under 3 minutter. Ingen risiko — du betaler kun når jobben er godkjent og ferdig.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={user ? '/fix/new' : '/login'}
                  className="rounded-full bg-white text-slate-900 px-8 py-3.5 text-sm font-bold hover:bg-slate-100 transition-colors shadow"
                >
                  {user ? 'Send ny forespørsel →' : 'Kom i gang →'}
                </Link>
                <a
                  href="mailto:support@codemedic.no"
                  className="rounded-full border border-slate-600 text-slate-300 px-8 py-3.5 text-sm font-medium hover:border-slate-400 hover:text-white transition-colors"
                >
                  Ta kontakt
                </a>
              </div>
            </div>
          </section>

        </div>

        {/* ── FOOTER ── */}
        <footer className="border-t border-slate-200 mt-8 py-10">
          <div className="max-w-5xl mx-auto px-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <Image src="/logo.png" alt="CodeMedic" width={36} height={36} className="rounded-lg" />
                <div>
                  <span className="font-semibold text-slate-600 text-sm">CodeMedic</span>
                  <p className="text-slate-400">Premium teknisk hjelp for WordPress og web</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <a href="mailto:support@codemedic.no" className="hover:text-slate-600 transition-colors">support@codemedic.no</a>
                <Link href="/fix/new" className="hover:text-slate-600 transition-colors">Send forespørsel</Link>
                <Link href="/blogg" className="hover:text-slate-600 transition-colors">Blogg</Link>
                <Link href="/kontakt" className="hover:text-slate-600 transition-colors">Kontakt</Link>
                <Link href="/login" className="hover:text-slate-600 transition-colors">Logg inn</Link>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-300">
              <span>© {new Date().getFullYear()} CodeMedic. Alle rettigheter forbeholdt.</span>
              <div className="flex items-center gap-4">
                <Link href="/personvern" className="hover:text-slate-500 transition-colors">Personvern</Link>
                <span>Norsk tjeneste · Trygt via Stripe · No cure, no pay</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
