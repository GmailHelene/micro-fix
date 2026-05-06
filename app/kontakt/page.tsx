import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kontakt CodeMedic — WordPress-hjelp og support',
  description:
    'Ta kontakt med CodeMedic for profesjonell WordPress-hjelp. Vi svarer innen 2–4 timer på hverdager. Support på norsk, fast pris, no cure no pay.',
  alternates: { canonical: 'https://codemedic.no/kontakt' },
};

const faq = [
  {
    q: 'Hva er svartiden deres?',
    a: 'Vi svarer normalt innen 2–4 timer på hverdager. For akutte tekniske feil som gjør nettstedet ditt utilgjengelig, forsøker vi å svare enda raskere. Send gjerne e-post med «HASTER» i emnefeltet.',
  },
  {
    q: 'Kan jeg kontakte dere for en uforpliktende vurdering?',
    a: 'Absolutt. Beskriv problemet ditt på e-post og vi gir deg en vurdering uten kostnad. Vi forteller deg ærlig om vi kan hjelpe og hva det vil koste — ingen binding.',
  },
  {
    q: 'Hva om jobben er for stor til en standardpakke?',
    a: 'Da sender vi deg et custom tilbud basert på en vurdering av scope. Du velger selv om du vil gå videre. Vi tar ikke betalt for vurderingen.',
  },
];

export default function KontaktPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-16 space-y-16">

        {/* Header */}
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Kontakt</p>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Ta kontakt</h1>
          <p className="text-slate-500 text-lg max-w-xl leading-relaxed">
            Har du et spørsmål, et teknisk problem eller et prosjekt du trenger hjelp med? Vi hører fra deg.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-8 lg:grid-cols-2">

          {/* Left: what we help with */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-7">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Vi hjelper med …</h2>
              <ul className="space-y-3">
                {[
                  { icon: '🔧', label: 'WordPress-feil og krasj', desc: 'Hvit skjerm, databasefeil, 404-feil, innloggingsproblemer og alt annet som gjør siden utilgjengelig.' },
                  { icon: '🛒', label: 'WooCommerce-problemer', desc: 'Checkout som ikke virker, betalingsgateway-feil, ordrebehandling og plugin-konflikter i nettbutikken.' },
                  { icon: '⚡', label: 'Hastighetsoptimalisering', desc: 'Dårlig PageSpeed-score, treg lasting, bildeoptimalisering, caching og CDN-oppsett.' },
                  { icon: '🎨', label: 'CSS og design-feil', desc: 'Layout som brekker, responsivitetsproblemer, font- og fargefeil, styling etter tema-oppdatering.' },
                  { icon: '🔌', label: 'Plugin-konflikter', desc: 'Plugins som krasjer med hverandre, etter oppdatering eller etter PHP-versjonsskifte.' },
                  { icon: '💬', label: 'Custom forespørsler', desc: 'Noe som ikke passer i standardpakkene? Beskriv det — vi vurderer og sender et custom tilbud.' },
                ].map(item => (
                  <li key={item.label} className="flex items-start gap-3">
                    <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: contact card */}
          <div className="space-y-5">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-7">
              <h2 className="text-lg font-bold text-slate-900 mb-5">Kontaktinformasjon</h2>

              <div className="space-y-5">
                {/* Email */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">E-post</p>
                  <a
                    href="mailto:support@codemedic.no"
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-3 text-sm font-semibold hover:bg-slate-800 transition-colors"
                  >
                    ✉️ support@codemedic.no
                  </a>
                </div>

                {/* Response time */}
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                  <p className="text-xs font-semibold text-emerald-700 mb-1">Responstid</p>
                  <p className="text-sm text-emerald-800">
                    Vanligvis innen <strong>2–4 timer</strong> på hverdager.
                  </p>
                </div>

                {/* Divider */}
                <hr className="border-slate-100" />

                {/* Technical help link */}
                <div>
                  <p className="text-sm text-slate-600 mb-3">
                    For teknisk hjelp — beskriv problemet direkte i systemet og få et tilbud:
                  </p>
                  <Link
                    href="/fix/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-5 py-3 text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Send forespørsel →
                  </Link>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { icon: '🛡️', label: 'No cure, no pay' },
                  { icon: '🇳🇴', label: 'Norsk support' },
                  { icon: '💳', label: 'Trygt via Stripe' },
                ].map(badge => (
                  <div key={badge.label}>
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <p className="text-xs text-slate-500 font-medium">{badge.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ section */}
        <div>
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Vanlige spørsmål</p>
            <h2 className="text-2xl font-bold text-slate-900">Spørsmål om kontakt</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {faq.map((item, i) => (
              <div key={i} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">{item.q}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
