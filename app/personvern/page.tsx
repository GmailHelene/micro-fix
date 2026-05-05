import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personvernpolicy — CodeMedic',
  description: 'Les om hvordan CodeMedic behandler og beskytter dine personopplysninger.',
};

export default function PersonvernPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-16">

        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 mb-8">
          ← Tilbake til forsiden
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Personvernpolicy</h1>
        <p className="text-slate-500 text-sm mb-10">Sist oppdatert: mai 2025</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">1. Behandlingsansvarlig</h2>
            <p className="text-sm leading-relaxed">
              CodeMedic er behandlingsansvarlig for personopplysninger som samles inn gjennom denne tjenesten.
              Har du spørsmål om behandlingen av dine personopplysninger, kan du kontakte oss på{' '}
              <a href="mailto:hei@codemedic.no" className="text-blue-600 hover:underline">hei@codemedic.no</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">2. Hvilke opplysninger samler vi inn?</h2>
            <p className="text-sm leading-relaxed mb-3">Vi samler inn følgende kategorier av personopplysninger:</p>
            <ul className="text-sm space-y-2 list-none">
              {[
                ['Kontaktinformasjon', 'E-postadresse brukt ved registrering og innlogging.'],
                ['Forespørselsdata', 'Beskrivelse av tekniske problemer, nettstedsadresser og skjermbilder du deler med oss.'],
                ['Tilgangsinformasjon', 'WP-admin-, FTP- eller annen tilgang du deler for å la oss utføre arbeidet. Slettes etter fullføring.'],
                ['Betalingsinformasjon', 'Betaling håndteres av Stripe. Vi lagrer aldri kortdetaljer direkte — kun betalingsstatus og referanse-ID.'],
                ['Kommunikasjon', 'Meldinger du sender oss via plattformens meldingssystem.'],
                ['Bruksdata', 'Tekniske data om hvordan tjenesten brukes (f.eks. IP-adresse, nettlesertype) for drifts- og sikkerhetsformål.'],
              ].map(([title, desc]) => (
                <li key={title} className="rounded-xl bg-white border border-slate-200 px-4 py-3">
                  <span className="font-semibold text-slate-800">{title}:</span> {desc}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">3. Formål og rettslig grunnlag</h2>
            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-white border border-slate-200 px-4 py-3">
                <p className="font-semibold text-slate-800 mb-1">Levering av tjenesten (avtale)</p>
                <p>Vi behandler opplysninger som er nødvendige for å opprette konto, ta imot og behandle forespørsler, kommunisere med deg og gjennomføre betaling.</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 px-4 py-3">
                <p className="font-semibold text-slate-800 mb-1">Berettiget interesse</p>
                <p>For å forbedre tjenesten, forhindre misbruk og sikre driften av plattformen.</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 px-4 py-3">
                <p className="font-semibold text-slate-800 mb-1">Lovpålagt plikt</p>
                <p>Regnskapsopplysninger knyttet til betaling lagres i henhold til bokføringsloven.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">4. Lagring og sikkerhet</h2>
            <p className="text-sm leading-relaxed">
              Opplysningene lagres i Supabase (EU-region) og behandles av Stripe for betalingshåndtering.
              Tilgangsinformasjon du deler slettes automatisk når oppdraget er fullført. Vi bruker
              kryptering i overføring (TLS) og hvile. Kun autorisert personell har tilgang til dine data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">5. Deling med tredjeparter</h2>
            <p className="text-sm leading-relaxed mb-3">Vi deler ikke dine personopplysninger med andre enn:</p>
            <ul className="text-sm space-y-2">
              <li className="rounded-xl bg-white border border-slate-200 px-4 py-3">
                <span className="font-semibold text-slate-800">Stripe</span> — betalingsbehandler. Se{' '}
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stripes personvernpolicy</a>.
              </li>
              <li className="rounded-xl bg-white border border-slate-200 px-4 py-3">
                <span className="font-semibold text-slate-800">Supabase</span> — databaseinfrastruktur (EU). Se{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase personvernpolicy</a>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">6. Lagringstid</h2>
            <div className="text-sm space-y-2">
              {[
                ['Kontodata', 'Beholdes så lenge kontoen er aktiv. Slettes på forespørsel.'],
                ['Forespørsler og meldinger', 'Fullførte og avbrutte forespørsler slettes automatisk etter 60 dager.'],
                ['Tilgangsinformasjon', 'Slettes umiddelbart når oppdraget markeres fullført.'],
                ['Betalingsreferanser', 'Lagres i 5 år i henhold til bokføringsloven.'],
              ].map(([item, desc]) => (
                <div key={item} className="flex gap-3 text-slate-600">
                  <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                  <span><strong className="text-slate-800">{item}:</strong> {desc}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">7. Dine rettigheter</h2>
            <p className="text-sm leading-relaxed mb-3">
              I henhold til GDPR har du følgende rettigheter:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {[
                ['Innsyn', 'Be om kopi av opplysningene vi har om deg.'],
                ['Retting', 'Korrigere uriktige opplysninger.'],
                ['Sletting', 'Be om at opplysningene dine slettes («retten til å bli glemt»).'],
                ['Begrensning', 'Be om at behandlingen begrenses i visse situasjoner.'],
                ['Dataportabilitet', 'Motta opplysningene i et maskinlesbart format.'],
                ['Innsigelse', 'Protestere mot behandling basert på berettiget interesse.'],
              ].map(([right, desc]) => (
                <div key={right} className="rounded-xl bg-white border border-slate-200 px-4 py-3">
                  <p className="font-semibold text-slate-800 mb-0.5">{right}</p>
                  <p className="text-slate-600 text-xs">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-600 mt-4">
              Send forespørsel til{' '}
              <a href="mailto:hei@codemedic.no" className="text-blue-600 hover:underline">hei@codemedic.no</a>.
              Du kan også klage til Datatilsynet:{' '}
              <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">datatilsynet.no</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">8. Informasjonskapsler (cookies)</h2>
            <p className="text-sm leading-relaxed">
              Vi bruker kun teknisk nødvendige informasjonskapsler for å opprettholde innloggingsøkten din.
              Vi bruker ikke sporings- eller markedsføringscookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">9. Endringer i policyen</h2>
            <p className="text-sm leading-relaxed">
              Vi kan oppdatere denne policyen ved behov. Vesentlige endringer varsles på e-post.
              Fortsatt bruk av tjenesten etter endringer anses som aksept.
            </p>
          </section>

          <div className="rounded-2xl bg-slate-900 text-white p-6 mt-10">
            <p className="font-semibold mb-1">Spørsmål om personvern?</p>
            <p className="text-sm text-slate-300 mb-3">Vi svarer gjerne innen én virkedag.</p>
            <a href="mailto:hei@codemedic.no" className="inline-block rounded-full bg-white text-slate-900 px-5 py-2 text-sm font-semibold hover:bg-slate-100 transition-colors">
              Kontakt oss →
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
