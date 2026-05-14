export type ArticleSection =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'tip'; text: string }
  | { type: 'warning'; text: string }
  | { type: 'code'; text: string }
  | { type: 'cta' };

export interface Article {
  slug: string;
  title: string;
  headline: string;
  metaTitle: string;
  metaDescription: string;
  date: string;
  readTime: number;
  category: string;
  intro: string;
  sections: ArticleSection[];
}

export const articles: Article[] = [
  {
    slug: 'de-5-vanligste-wordpress-feilene',
    title: 'De 5 vanligste WordPress-feilene (og hvordan du fikser dem)',
    headline: 'De 5 vanligste WordPress-feilene — og trinn-for-trinn løsninger',
    metaTitle: 'De 5 vanligste WordPress-feilene og løsningene',
    metaDescription:
      'Hvit skjerm, databasefeil, 404-feil på innlegg, wp-admin-loop og 500-feil. Lær å fikse de vanligste WordPress-feilene med trinn-for-trinn veiledning.',
    date: '2025-04-10',
    readTime: 8,
    category: 'Feilsøking',
    intro:
      'Noen WordPress-feil dukker opp igjen og igjen — uansett hva slags nettside du driver. Her gjennomgår vi de fem vanligste, hva som forårsaker dem og nøyaktig hvordan du fikser dem steg for steg.',
    sections: [
      {
        type: 'p',
        text: 'WordPress er verdens mest brukte CMS, og med det følger et velkjent sett av feilmeldinger som rammer utviklere og nettstedeiere jevnlig. Mange av disse kan løses på noen minutter — hvis du vet hva du ser etter. Her er de fem vanligste, med konkrete løsningssteg.',
      },
      {
        type: 'h2',
        text: '1. Den hvite skjermen (White Screen of Death)',
      },
      {
        type: 'p',
        text: 'Den hvite skjermen — eller WSOD (White Screen of Death) — er en av de mest skremmende feilene fordi du ikke får noen feilmelding i det hele tatt. Siden er bare hvit og tom. Årsaken er nesten alltid en PHP-feil, en krasjet plugin eller et tema som genererer en fatal error.',
      },
      {
        type: 'h3',
        text: 'Slik fikser du det:',
      },
      {
        type: 'ol',
        items: [
          'Aktiver feillogging ved å legge til define(\'WP_DEBUG\', true); og define(\'WP_DEBUG_LOG\', true); i wp-config.php — feilmeldingen vil da logges til /wp-content/debug.log.',
          'Koble til via FTP og gi pluginsmappen et midlertidig nytt navn (f.eks. plugins_bak). Dette deaktiverer alle plugins samtidig.',
          'Hvis siden kommer tilbake, har du en plugin-konflikt. Gi mappen det originale navnet tilbake og aktiver plugins én om gangen til feilen gjenoppstår.',
          'Sjekk temaet: gå til wp-content/themes og gi det aktive temaet nytt navn. WordPress vil da bruke et standardtema.',
          'Øk minnegrensen ved å legge til define(\'WP_MEMORY_LIMIT\', \'256M\'); i wp-config.php.',
        ],
      },
      {
        type: 'tip',
        text: 'Bruk alltid FTP-tilgang i stedet for wp-admin for disse operasjonene — wp-admin er som regel utilgjengelig når WSOD oppstår.',
      },
      {
        type: 'h2',
        text: '2. "Error establishing a database connection"',
      },
      {
        type: 'p',
        text: 'Denne feilen betyr at WordPress ikke klarer å koble seg til MySQL-databasen. Det kan skyldes feil innloggingsdetaljer i wp-config.php, at databaseserveren er nede, eller at databasen er ødelagt.',
      },
      {
        type: 'h3',
        text: 'Slik fikser du det:',
      },
      {
        type: 'ol',
        items: [
          'Åpne wp-config.php og sjekk at DB_NAME, DB_USER, DB_PASSWORD og DB_HOST stemmer med det du finner i kontrollpanelet hos hostingleverandøren din.',
          'Logg inn på phpMyAdmin eller kontrollpanelet og sjekk om databasen finnes og er tilgjengelig.',
          'Hvis innloggingsdetaljene er riktige, kan databasen være korrupt. Gå til wp-admin/maint/repair.php for å starte WordPress sin innebygde databasereparsjon (krever at du legger define(\'WP_ALLOW_REPAIR\', true); i wp-config.php midlertidig).',
          'Kontakt hostingleverandøren din og spør om MySQL-tjenesten er oppe — noen ganger er det serversiden som er problemet.',
        ],
      },
      {
        type: 'warning',
        text: 'Husk å fjerne define(\'WP_ALLOW_REPAIR\', true); fra wp-config.php etter at reparasjonen er fullført — denne innstillingen er en sikkerhetsrisiko hvis den står der permanent.',
      },
      {
        type: 'h2',
        text: '3. 404-feil på innlegg og sider',
      },
      {
        type: 'p',
        text: 'Plutselig gir alle enkeltinnlegg og -sider 404-feil, selv om de vises i wp-admin? Dette er nesten alltid et problem med permalink-strukturen, og det løses enkelt.',
      },
      {
        type: 'h3',
        text: 'Slik fikser du det:',
      },
      {
        type: 'ol',
        items: [
          'Logg inn i wp-admin og gå til Innstillinger → Permalenker.',
          'Uten å endre noe, klikk "Lagre endringer". Dette regenererer .htaccess-filen med riktige rewrite-regler.',
          'Hvis det ikke hjelper, koble til via FTP og sjekk om .htaccess-filen finnes i rotkatalogen. Hvis den mangler, opprett en ny med standardinnholdet fra WordPress Codex.',
          'Sjekk at mod_rewrite er aktivert på serveren — ta kontakt med hosten din hvis du er usikker.',
          'Sjekk også at AllowOverride All er satt i Apache-konfigurasjonen (dette håndteres av hosten på delte hostingplaner).',
        ],
      },
      {
        type: 'code',
        text: '# Standard WordPress .htaccess-innhold\n# BEGIN WordPress\n<IfModule mod_rewrite.c>\nRewriteEngine On\nRewriteBase /\nRewriteRule ^index\\.php$ - [L]\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule . /index.php [L]\n</IfModule>\n# END WordPress',
      },
      {
        type: 'h2',
        text: '4. Innloggingsloop i wp-admin',
      },
      {
        type: 'p',
        text: 'Du taster inn riktig brukernavn og passord, klikker "Logg inn" — og siden laster bare om igjen til innloggingsskjemaet. Ingen feilmelding, bare evig loop. Årsaken er som oftest et problem med WordPress-cookies, og det løses uten at du trenger FTP.',
      },
      {
        type: 'h3',
        text: 'Slik fikser du det:',
      },
      {
        type: 'ol',
        items: [
          'Åpne wp-config.php og sjekk at COOKIE_DOMAIN og COOKIEPATH er riktig satt — eller ikke satt i det hele tatt (da bruker WordPress standardverdier).',
          'Sørg for at nettstedets URL i Innstillinger → Generelt er identisk med den faktiske adressen du bruker, inkludert om du bruker www eller ikke.',
          'Tøm nettleserens cookies og cache fullstendig, og prøv å logge inn igjen.',
          'Deaktiver alle plugins via FTP (gi pluginsmappen nytt navn) og prøv innlogging på nytt.',
          'Sjekk at det aktive temaet ikke inneholder kode som forstyrrer session-håndteringen.',
        ],
      },
      {
        type: 'tip',
        text: 'Legg til define(\'COOKIE_DOMAIN\', \'\'); i wp-config.php som en midlertidig løsning. Dette tvinger WordPress til å bruke standardinnstillinger for cookies.',
      },
      {
        type: 'h2',
        text: '5. 500 Internal Server Error',
      },
      {
        type: 'p',
        text: 'En generisk 500-feil betyr at noe på serversiden har gått galt — men feilen i seg selv forteller ingenting om hva. Det kan være en plugin, temaet, PHP-versjonskonflikter, en ødelagt .htaccess-fil eller ressursproblemer på serveren.',
      },
      {
        type: 'h3',
        text: 'Slik fikser du det:',
      },
      {
        type: 'ol',
        items: [
          'Aktiver WP_DEBUG og sjekk debug.log for den faktiske feilmeldingen — det sparer deg for mye tid.',
          'Gi .htaccess-filen et nytt navn (f.eks. .htaccess_bak) og last inn siden på nytt. Hvis feilen forsvinner, er problemet i .htaccess. Gjenopprett filen og regenerer den via Innstillinger → Permalenker.',
          'Deaktiver alle plugins via FTP og aktiver dem én om gangen for å isolere hvilken som skaper feilen.',
          'Sjekk serverens error-logg via kontrollpanelet eller FTP (/var/log/apache2/error.log eller tilsvarende).',
          'Spør hosten om å øke PHP-minnegrensen og sjekk at PHP-versjonen du bruker er kompatibel med temaet og pluginsene dine.',
        ],
      },
      {
        type: 'p',
        text: 'De fleste 500-feil på WordPress skyldes enten en defekt plugin eller en ødelagt .htaccess-fil. Start alltid med disse to før du graver dypere.',
      },
      { type: 'cta' },
    ],
  },

  {
    slug: 'woocommerce-checkout-fungerer-ikke',
    title: 'WooCommerce checkout fungerer ikke — komplett feilsøkingsguide',
    headline: 'WooCommerce checkout fungerer ikke — slik finner og fikser du problemet',
    metaTitle: 'WooCommerce checkout fungerer ikke — feilsøkingsguide',
    metaDescription:
      'WooCommerce checkout som ikke fungerer kan ha mange årsaker: plugin-konflikter, SSL, cache, betalingsfeil eller JavaScript-feil. Komplett steg-for-steg guide.',
    date: '2025-04-22',
    readTime: 9,
    category: 'WooCommerce',
    intro:
      'Checkout-siden i WooCommerce er blant de mest komplekse sidene på hele nettstedet — og dessverre en av de som lettest bryter. Her er den komplette guiden for å finne årsaken og fikse det raskt.',
    sections: [
      {
        type: 'p',
        text: 'Når WooCommerce-checkout ikke fungerer, koster det deg penger direkte. Kunder som ikke kan fullføre kjøpet forlater handlevognen, og det kan gå timer eller dager før du oppdager problemet. Denne guiden tar deg systematisk gjennom alle vanlige årsaker — fra plugin-konflikter til betalingsgatewayfeil.',
      },
      {
        type: 'h2',
        text: 'Symptomene — hva ser du?',
      },
      {
        type: 'ul',
        items: [
          'Checkout-siden laster tomt eller viser bare spinner og ingenting skjer',
          'Betalingsknappen er grå eller klikker ingenting',
          'Siden refresher uten at ordren behandles',
          'Feilmelding som "Det oppstod en feil, prøv igjen" uten mer info',
          'PayPal/Stripe-vinduet åpnes ikke',
          'Ordren legges inn men betaling gjennomføres ikke',
        ],
      },
      {
        type: 'h2',
        text: 'Steg 1: Test med standardtema og alle plugins deaktivert',
      },
      {
        type: 'p',
        text: 'Det aller første du bør gjøre er å eliminere tema- og plugin-konflikter. Aktiver Storefront-temaet (det offisielle WooCommerce-temaet) og deaktiver alle plugins unntatt WooCommerce. Prøv deretter å gjennomføre en testkjøp.',
      },
      {
        type: 'ol',
        items: [
          'Gå til Utseende → Temaer og aktiver Storefront eller Twenty Twenty-Four.',
          'Gå til Plugins og deaktiver alle plugins unntatt WooCommerce.',
          'Åpne checkout-siden i en ny inkognito-fane og forsøk å legge til en vare og gå til kassen.',
          'Hvis checkout nå fungerer, er problemet et tredjepartsplugin eller temaet ditt.',
          'Reaktiver plugins én om gangen (med full sideopplastning mellom hver) til du finner synderen.',
        ],
      },
      {
        type: 'tip',
        text: 'Bruk alltid en inkognito-fane under testing — på den måten unngår du å bli forvirret av gamle nettlesercookies og cachet innhold.',
      },
      {
        type: 'h2',
        text: 'Steg 2: Sjekk JavaScript-konsollen',
      },
      {
        type: 'p',
        text: 'WooCommerce checkout er svært avhengig av JavaScript. En eneste JavaScript-feil kan hindre hele checkout-prosessen. Åpne nettleserens utviklerverktøy (F12 i Chrome) og se i Console-fanen mens du er på checkout-siden.',
      },
      {
        type: 'ul',
        items: [
          'Røde feilmeldinger som "Uncaught TypeError" eller "ReferenceError" peker på et script som feiler',
          'Feilmeldingen inneholder ofte filnavnet — sjekk om det er et plugin-script eller tema-script',
          'Se også i Network-fanen etter forespørsler som returnerer 404 eller 500',
        ],
      },
      {
        type: 'code',
        text: '// Vanlig årsak: jQuery ikke lastet eller feil versjon\n// Sjekk i konsollen:\nconsole.log(typeof jQuery); // Skal returnere "function"\nconsole.log(jQuery.fn.jquery); // Skal vise versjonsnummer',
      },
      {
        type: 'h2',
        text: 'Steg 3: SSL og HTTPS',
      },
      {
        type: 'p',
        text: 'WooCommerce krever HTTPS på checkout-siden for at de fleste betalingsløsninger skal fungere. Mangler SSL-sertifikat, eller er det feil konfigurert, vil betalingsgatewayen nekte å laste.',
      },
      {
        type: 'ol',
        items: [
          'Sjekk at nettstedet bruker HTTPS — det skal vises et hengelåsikon i adressefeltet.',
          'Gå til WooCommerce → Innstillinger → Avansert og bekreft at "Force secure checkout" er aktivert.',
          'Sjekk at WordPress-adressen og nettstedsadressen i Innstillinger → Generelt starter med https://, ikke http://.',
          'Se etter mixed content-advarsler i konsollen (blandet HTTP/HTTPS-innhold blokkeres av nettleseren).',
        ],
      },
      {
        type: 'h2',
        text: 'Steg 4: Tøm all cache',
      },
      {
        type: 'p',
        text: 'Caching er en av de vanligste synderne bak WooCommerce-feil. Checkout-siden skal aldri caches — men feilkonfigurerte caching-plugins gjør det likevel.',
      },
      {
        type: 'ol',
        items: [
          'Tøm cache i alle caching-plugins (WP Rocket, W3 Total Cache, LiteSpeed Cache, etc.).',
          'Sjekk at checkout-siden, handlekurv og "min konto"-sidene er lagt til unntakslisten i caching-pluginen.',
          'Tøm eventuell CDN-cache (Cloudflare, BunnyCDN, etc.).',
          'Tøm nettleserens cache fullstendig eller test i inkognito-modus.',
        ],
      },
      {
        type: 'warning',
        text: 'I WP Rocket: gå til WP Rocket → Innstillinger → Avanserte regler og sørg for at URL-mønstrene /checkout/, /cart/ og /my-account/ er lagt til under "Aldri cache disse sidene".',
      },
      {
        type: 'h2',
        text: 'Steg 5: Feilsøk betalingsgatewayen',
      },
      {
        type: 'p',
        text: 'Hvis checkout-siden vises, men betalingen ikke gjennomføres, er problemet sannsynligvis betalingsgatewayen. Her er en systematisk tilnærming:',
      },
      {
        type: 'ol',
        items: [
          'Aktiver testmodus i betalingsgatewayen (Stripe, PayPal, Vipps, etc.) og gjennomfør en testtransaksjon.',
          'Sjekk at API-nøklene er korrekte og ikke utløpt — logg inn i betalingsleverandørens dashboard og verifiser nøklene.',
          'Kontroller at webhook-URL er registrert og aktiv hos betalingsleverandøren.',
          'Se i WooCommerce → Status → Logger etter feilmeldinger fra betalingsgatewayen.',
          'Prøv å deaktivere og reaktivere gateway-pluginen for å tvinge en frisk initialisering.',
        ],
      },
      {
        type: 'h2',
        text: 'Steg 6: Sjekk WooCommerce-systemstatus',
      },
      {
        type: 'p',
        text: 'WooCommerce har et innebygd diagnoseverktøy: gå til WooCommerce → Status. Her ser du om det er PHP-versjonsadvarsler, minneproblemer, nødvendige sider som mangler eller andre konfigurasjonsavvik.',
      },
      {
        type: 'tip',
        text: 'Klikk "Kopier for støtte" på systemstatussiden — dette gir deg en fullstendig teknisk rapport som er svært nyttig hvis du skal kontakte support eller en utvikler.',
      },
      { type: 'cta' },
    ],
  },

  {
    slug: 'wordpress-siden-laster-sakte',
    title: 'WordPress laster sakte — slik måler og fikser du det',
    headline: 'WordPress laster sakte — de 6 viktigste optimaliseringene',
    metaTitle: 'WordPress laster sakte — slik fikser du det (2025)',
    metaDescription:
      'Mål hastigheten med PageSpeed Insights og GTmetrix, og optimaliser med caching, bildekomprimering, CDN og riktig hosting. Konkrete tips med forventede forbedringer.',
    date: '2025-05-01',
    readTime: 10,
    category: 'Hastighet',
    intro:
      'En treg WordPress-side mister besøkende og rangeringer. Studier viser at 53 % av mobilbrukere forlater en side som bruker mer enn 3 sekunder å laste. Her er en komplett guide til å måle, diagnostisere og fikse tregheten.',
    sections: [
      {
        type: 'p',
        text: 'Sidehastighet er ikke bare en brukeropplevelsessak — det er direkte knyttet til Google-rangeringer gjennom Core Web Vitals. En side som laster på under 2 sekunder rangeres bedre, konverterer bedre og holder på besøkende lenger. Her er alt du trenger å vite for å komme dit.',
      },
      {
        type: 'h2',
        text: 'Slik måler du hastigheten riktig',
      },
      {
        type: 'p',
        text: 'Før du begynner å optimalisere, trenger du et baseline-måle. Bruk disse verktøyene — de er gratis og gir deg konkrete data å jobbe med.',
      },
      {
        type: 'ul',
        items: [
          'PageSpeed Insights (pagespeed.web.dev): Googles eget verktøy — gir deg Core Web Vitals-score for mobil og desktop, og konkrete forbedringsforslag rangert etter effekt.',
          'GTmetrix (gtmetrix.com): Mer detaljert enn PageSpeed, med waterfall-diagram som viser nøyaktig hvilke ressurser som bremser siden.',
          'WebPageTest (webpagetest.org): Teknisk dybdeanalyse, mulighet for å teste fra ulike lokasjoner og med ulike nettverkshastigheter.',
        ],
      },
      {
        type: 'tip',
        text: 'Mål alltid fra en server nærmest målgruppen din. Hvis du har norske besøkende, velg en europeisk testserver. Kjør målingen minst 3 ganger og bruk medianen — enkeltmålinger kan variere mye.',
      },
      {
        type: 'h2',
        text: 'Optimalisering 1: Caching-plugin',
      },
      {
        type: 'p',
        text: 'Caching er den enkleste og mest effektive enkeltoptimaliseringen du kan gjøre. En caching-plugin lagrer ferdigrenderte HTML-filer slik at serveren slipper å bygge siden fra bunnen av ved hvert besøk.',
      },
      {
        type: 'ul',
        items: [
          'WP Rocket (betalt, ca. 59 USD/år): Den anbefalte løsningen. Enkel konfigurasjon, svært effektiv. Dekker caching, minifisering, lazy loading og database-cleanup i én plugin.',
          'LiteSpeed Cache (gratis): Utmerket for hostingleverandører som kjører LiteSpeed-servere (mange norske leverandører). Konkurransedyktig med WP Rocket på disse serverne.',
          'W3 Total Cache (gratis): Mer kompleks å konfigurere, men kraftig. Krever at du forstår hva du gjør — feilkonfigurering kan brekke siden.',
        ],
      },
      {
        type: 'p',
        text: 'Forventet forbedring: En godt konfigurert caching-plugin reduserer typisk lastetiden med 40–70 % og Time to First Byte (TTFB) fra 800ms+ til under 200ms.',
      },
      {
        type: 'h2',
        text: 'Optimalisering 2: Bildekomprimering',
      },
      {
        type: 'p',
        text: 'Ukomprimerte bilder er den vanligste årsaken til treghet på WordPress-sider. Et enkelt produktbilde på 3–4 MB der det burde vært 150–300 KB er ikke uvanlig.',
      },
      {
        type: 'ul',
        items: [
          'Smush (gratis/betalt): Komprimerer automatisk alle nye bilder ved opplasting og lar deg bulk-komprimere eksisterende bilder.',
          'ShortPixel (betalt, fra ca. 4–9 USD/mnd): Bedre komprimeringsrate enn Smush. Støtter WebP-konvertering og AVIF.',
          'Imagify (betalt): Laget av WP Rocket-teamet. Enkel og effektiv, integrerer sømløst med WP Rocket.',
        ],
      },
      {
        type: 'tip',
        text: 'Bruk WebP-format der det er mulig — WebP-bilder er typisk 25–35 % mindre enn JPEG med tilsvarende kvalitet. Alle moderne nettlesere støtter det, og alle de nevnte pluginsene kan konvertere automatisk.',
      },
      {
        type: 'h2',
        text: 'Optimalisering 3: Lazy loading',
      },
      {
        type: 'p',
        text: 'Lazy loading betyr at bilder og videoer utenfor den synlige skjermen ikke lastes inn før brukeren scroller ned mot dem. Dette kan redusere den initielle sidelastingen drastisk på sider med mange bilder.',
      },
      {
        type: 'p',
        text: 'Siden WordPress 5.5 er lazy loading aktivert som standard for bilder via loading="lazy"-attributtet. Men for iframe-innhold (YouTube-videoer, kart, etc.) kreves det vanligvis en plugin. WP Rocket, LiteSpeed Cache og Smush håndterer alle dette.',
      },
      {
        type: 'p',
        text: 'Forventet forbedring: Lazy loading alene kan redusere den initielle sidevekten med 30–60 % på bildetunge sider og forbedre Largest Contentful Paint (LCP) betydelig.',
      },
      {
        type: 'h2',
        text: 'Optimalisering 4: CDN (Content Delivery Network)',
      },
      {
        type: 'p',
        text: 'Et CDN distribuerer statiske filer (bilder, CSS, JavaScript) til servere rundt om i verden. Besøkende henter disse filene fra den serveren som er geografisk nærmest dem, noe som reduserer latens.',
      },
      {
        type: 'ul',
        items: [
          'Cloudflare (gratis plan tilgjengelig): Det vanligste valget. Enkelt å sette opp, gratis plan dekker det meste for mindre nettsteder.',
          'BunnyCDN (betalt, men billig — fra ca. 1 USD/mnd): Svært rask, god dekning i Europa. Passer godt for norske nettsteder med globalt publikum.',
          'KeyCDN: Konkurransedyktig prising, god ytelse. Integrer med WordPress via CDN Enabler-pluginen.',
        ],
      },
      {
        type: 'h2',
        text: 'Optimalisering 5: Database-opprydding',
      },
      {
        type: 'p',
        text: 'WordPress-databasen kan over tid bli full av unødvendige data: revisjoner av innlegg, slettede kommentarer, transient-data og plugin-logger. En oppblåst database gir tregere databasespørringer.',
      },
      {
        type: 'ol',
        items: [
          'Installer WP-Optimize eller Advanced Database Cleaner.',
          'Slett alle innleggrevisjoner (WordPress lagrer som standard uendelig mange versjoner).',
          'Tøm søppelkurven for innlegg, kommentarer og media.',
          'Slett utdaterte transients.',
          'Kjør "Optimer database"-funksjon for å defragmentere tabellene.',
        ],
      },
      {
        type: 'warning',
        text: 'Ta alltid en komplett databasebackup før du kjører opprydding. Selv om disse operasjonene er trygge i seg selv, er det god praksis å ha en sikkerhetskopi.',
      },
      {
        type: 'h2',
        text: 'Optimalisering 6: Velg riktig hosting',
      },
      {
        type: 'p',
        text: 'Ingen mengde optimalisering kompenserer for dårlig hosting. Billig delt hosting der én server huser tusenvis av nettsteder gir dårlig grunnytelse uansett hva du gjør.',
      },
      {
        type: 'ul',
        items: [
          'Managed WordPress-hosting (Kinsta, WP Engine, Flywheel): Spesialbygd for WordPress, rask SSD-lagring, innebygd caching på servernivå. Beste ytelse, men kostbart (fra ca. 300 kr/mnd).',
          'VPS-hosting (DigitalOcean, Linode/Akamai, Hetzner): Full kontroll, god ytelse til rimelig pris. Krever noe teknisk kunnskap å sette opp.',
          'Norske leverandører (Domeneshop, Zetta, One.com): Bra for norsk målgruppe som ikke trenger global CDN-distribusjon. Ytelsen varierer — velg plan med SSD og PHP 8.x.',
        ],
      },
      {
        type: 'p',
        text: 'Forventet totalforbedring: Med alle seks optimaliseringene implementert er det realistisk å gå fra en lastetid på 4–8 sekunder til under 2 sekunder, og en PageSpeed-score på under 40 til over 85.',
      },
      { type: 'cta' },
    ],
  },

  {
    slug: 'wordpress-hvit-skjerm',
    title: 'WordPress hvit skjerm (WSOD) — komplett feilsøkingsguide',
    headline: 'WordPress hvit skjerm — slik fikser du White Screen of Death',
    metaTitle: 'WordPress hvit skjerm (WSOD) — slik fikser du det',
    metaDescription:
      'WordPress viser bare en hvit, tom side? Lær å aktivere WP_DEBUG, deaktivere plugins via FTP, bytte tema og øke minnegrensen. Komplett steg-for-steg guide.',
    date: '2025-05-06',
    readTime: 9,
    category: 'Feilsøking',
    intro:
      'WordPress hvit skjerm — eller WSOD (White Screen of Death) — er en av de mest forvirrende WordPress-feilene. Siden er bare hvit og tom, uten en eneste feilmelding å forholde seg til. Her er den komplette guiden for å finne årsaken og komme seg ut av det.',
    sections: [
      {
        type: 'p',
        text: 'Den hvite skjermen oppstår når WordPress treffer en fatal PHP-feil og ikke klarer å rendre siden — men heller ikke viser deg feilmeldingen (fordi feilvisning er deaktivert av sikkerhetshensyn på produksjonsservere). Resultatet er en tom, hvit side som ikke forteller deg noe som helst.',
      },
      {
        type: 'h2',
        text: 'Vanligste årsaker til hvit skjerm i WordPress',
      },
      {
        type: 'ul',
        items: [
          'En plugin som krasjer med en fatal PHP-feil etter oppdatering',
          'Et tema som inneholder PHP-syntaksfeil eller bruker utdaterte funksjoner',
          'PHP-minnegrensen er for lav og prosessen krasjer',
          'Inkompatibel PHP-versjon etter serveroppgradering',
          'Korrupt kjernefil etter feilet WordPress-oppdatering',
          'Minneuttømming ved behandling av store filer eller komplekse spørringer',
        ],
      },
      {
        type: 'h2',
        text: 'Steg 1: Aktiver WP_DEBUG for å se feilen',
      },
      {
        type: 'p',
        text: 'Det første du bør gjøre er å tvinge WordPress til å vise — eller logge — feilmeldingen. Dette gjøres ved å redigere wp-config.php, som ligger i roten av WordPress-installasjonen.',
      },
      {
        type: 'ol',
        items: [
          'Koble til nettstedet via FTP (FileZilla, Cyberduck eller lignende).',
          'Finn wp-config.php i rotkatalogen og last den ned.',
          'Legg til følgende linjer like før linjen som sier "That\'s all, stop editing!":',
        ],
      },
      {
        type: 'code',
        text: 'define( \'WP_DEBUG\', true );\ndefine( \'WP_DEBUG_LOG\', true );\ndefine( \'WP_DEBUG_DISPLAY\', false );',
      },
      {
        type: 'ol',
        items: [
          'Last opp den redigerte wp-config.php tilbake til serveren.',
          'Last inn siden på nytt.',
          'Feilmeldingen loggs nå til /wp-content/debug.log — last ned denne filen og les hva som står der.',
        ],
      },
      {
        type: 'tip',
        text: 'Sett WP_DEBUG_DISPLAY til false for å unngå at feilmeldinger vises for besøkende. Logg heller til debug.log og les filen via FTP.',
      },
      {
        type: 'h2',
        text: 'Steg 2: Deaktiver alle plugins via FTP',
      },
      {
        type: 'p',
        text: 'Plugins er den vanligste årsaken til WSOD, og dette er den raskeste måten å sjekke det på. Du trenger FTP-tilgang fordi wp-admin er utilgjengelig når siden er hvit.',
      },
      {
        type: 'ol',
        items: [
          'Koble til FTP og naviger til wp-content/.',
          'Høyreklikk på mappen plugins og gi den nytt navn — f.eks. plugins_disabled.',
          'Last inn nettstedet på nytt. Hvis siden nå vises, er problemet i en plugin.',
          'Gi mappen tilbake navnet plugins.',
          'Gå til wp-admin (som nå skal fungere) og aktiver plugins én om gangen. Last inn frontsiden etter hver aktivering til feilen dukker opp igjen.',
          'Når du har funnet den skyldige pluginen: sjekk om det finnes en oppdatert versjon, rapporter feilen til plugin-utvikleren, og finn et alternativ om nødvendig.',
        ],
      },
      {
        type: 'h2',
        text: 'Steg 3: Bytt til standardtema',
      },
      {
        type: 'p',
        text: 'Hvis plugin-deaktivering ikke hjalp, kan temaet være problemet. Slik tester du:',
      },
      {
        type: 'ol',
        items: [
          'Koble til FTP og naviger til wp-content/themes/.',
          'Finn det aktive temaet (vanligvis det med nyligst endringsdato) og gi mappen et nytt navn.',
          'WordPress vil nå automatisk falle tilbake til et standardtema (Twenty Twenty-Four eller lignende).',
          'Last inn nettstedet. Hvis det nå fungerer, er temaet problemkilden.',
          'Kontakt temaets utvikler eller oppdater til siste versjon. Husk å ta backup av eventuelle endringer du har gjort i temafilene.',
        ],
      },
      {
        type: 'warning',
        text: 'Hvis du har gjort direkte endringer i temafilene (noe du aldri bør gjøre — bruk et child theme), vil disse gå tapt om du reinstallerer temaet. Hent alltid en kopi av endrede filer via FTP før du reinstallerer.',
      },
      {
        type: 'h2',
        text: 'Steg 4: Øk PHP-minnegrensen',
      },
      {
        type: 'p',
        text: 'Hvit skjerm uten noen feilmelding i debug.log kan skyldes minneuttømming. WordPress klarer ikke engang å logge feilen fordi all minne er brukt opp.',
      },
      {
        type: 'ol',
        items: [
          'Åpne wp-config.php via FTP.',
          'Legg til følgende linje like før "That\'s all, stop editing!":',
        ],
      },
      {
        type: 'code',
        text: 'define( \'WP_MEMORY_LIMIT\', \'256M\' );',
      },
      {
        type: 'ol',
        items: [
          'Last opp filen og prøv å laste inn siden på nytt.',
          'Hvis dette hjelper, har du et genuint minneproblem. Vurder å oppgradere hostingplanen eller finne tyngre plugins som kan erstattes med lettere alternativer.',
        ],
      },
      {
        type: 'p',
        text: 'Noen hostingleverandører lar deg ikke overstyke minnegrensen via wp-config.php. I så fall kan du prøve å legge til php_value memory_limit 256M i .htaccess-filen, eller kontakte hosten din direkte.',
      },
      {
        type: 'h2',
        text: 'Steg 5: Sjekk serverens feillogg',
      },
      {
        type: 'p',
        text: 'Hvis ingen av stegene over har hjulpet, er det på tide å se på serverens egne feillogger. Disse inneholder som oftest den faktiske PHP-feilen.',
      },
      {
        type: 'ul',
        items: [
          'Logg inn på kontrollpanelet (cPanel, Plesk, DirectAdmin) og finn "Error Logs" eller "PHP Error Logs".',
          'Sjekk /var/log/apache2/error.log eller /var/log/nginx/error.log om du har SSH-tilgang.',
          'Filtrer loggen på tidspunktet feilen oppstod og se etter PHP Fatal error-linjer.',
        ],
      },
      {
        type: 'h2',
        text: 'Slik forhindrer du WSOD i fremtiden',
      },
      {
        type: 'p',
        text: 'WSOD er som oftest fullt ut forebyggbart med gode rutiner:',
      },
      {
        type: 'ul',
        items: [
          'Ta alltid backup før du oppdaterer plugins, tema eller WordPress-kjernen. Bruk UpdraftPlus, Jetpack Backup eller hostingleverandørens egne backupverktøy.',
          'Test oppdateringer på et stagingmiljø (kopi av nettstedet) før du kjører dem på produksjonssiden.',
          'Oppdater aldri alle plugins på én gang — gjør dem én om gangen og sjekk etter hver oppdatering.',
          'Hold PHP-versjonen oppdatert, men sjekk plugin- og temakompatibilitet før du oppgraderer.',
          'Overvåk nettstedet med et oppetidsovervåkingsverktøy (UptimeRobot er gratis) som varsler deg på SMS eller e-post ved nedetid.',
        ],
      },
      { type: 'cta' },
    ],
  },
  {
    slug: '5-woocommerce-feil-norske-nettbutikker',
    title: '5 WooCommerce-feil som koster norske nettbutikker tusenvis i tapte salg',
    headline: '5 WooCommerce-feil som koster norske nettbutikker tusenvis i tapte salg — og hvordan du fikser dem',
    metaTitle: '5 WooCommerce-feil norske nettbutikker | CodeMedic',
    metaDescription: 'Nets Easy-avrundingsfeil, Vipps på mobil, norske tegn i URL-er, treg checkout og e-post som ikke leveres. De 5 vanligste WooCommerce-feilene med konkrete løsninger.',
    date: '2026-05-14',
    readTime: 8,
    category: 'WooCommerce',
    intro: 'Nets Easy-avrundingsfeil, Vipps som feiler på mobil, norske tegn som ødelegger URL-er, treg checkout og ordrebekreftelser som aldri kommer frem — de samme feilene koster norske nettbutikker tusenvis i tapte salg hver uke. Her er de fem vanligste, med konkrete løsninger.',
    sections: [
      {
        type: 'p',
        text: 'Hver uke får jeg meldinger fra norske nettbutikkeiere som har samme historie: noe har sluttet å fungere, kunder klager, salget faller — og forrige utvikler tar 18 000 kr og tre uker for å se på det. De fleste av disse problemene har jeg sett før. Mange av dem kan fikses på under en time hvis du vet hvor du skal lete.',
      },
      {
        type: 'h2',
        text: 'Feil 1: "Amount does not match sum of orderitems" i Nets Easy / Nexi Checkout',
      },
      {
        type: 'p',
        text: 'Dette er sannsynligvis den vanligste feilen jeg ser hos butikker som bruker Nets Easy (nå Nexi Checkout). Symptomet er enkelt: kunder kommer til betalingssteget og får en feilmelding. Resultat: salget går tapt. Kunden gir opp, og du får aldri vite at det var et problem.',
      },
      {
        type: 'warning',
        text: 'Feilmelding kunden ser: "Amount does not match sum of orderitems"',
      },
      {
        type: 'h3',
        text: 'Hva som faktisk skjer',
      },
      {
        type: 'p',
        text: 'WooCommerce kan konfigureres til å vise priser med 0 desimaler (f.eks. "299 kr" istedenfor "299,00 kr"). Det ser ryddig ut visuelt, men Nets Easy forventer priser med 2 desimaler internt. Når WooCommerce sender ordresummen med 0 desimaler og linjeproduktene med 2 desimaler (eller omvendt), oppstår det en avrundingsfeil som gjør at totalsummen ikke matcher summen av enkeltvarene.',
      },
      {
        type: 'h3',
        text: 'Slik fikser du det',
      },
      {
        type: 'p',
        text: 'Den enkle løsningen: Gå til WooCommerce → Innstillinger → Generelt → Valutaalternativer og sett "Antall desimaler" til 2.',
      },
      {
        type: 'p',
        text: 'Den programmatiske løsningen hvis du må overstyre temaet — legg dette i functions.php:',
      },
      {
        type: 'code',
        text: "add_filter( 'wc_get_price_decimals', function() {\n    return 2;\n}, 99 );",
      },
      {
        type: 'p',
        text: 'Etter endringen må du gå inn på eksisterende produkter og lagre dem på nytt for at prisene skal regenereres med riktig presisjon. Hvis du har mange produkter kan du kjøre denne SQL-spørringen (ta backup først):',
      },
      {
        type: 'code',
        text: "UPDATE wp_postmeta \nSET meta_value = CAST(meta_value AS DECIMAL(10,2))\nWHERE meta_key IN ('_price', '_regular_price', '_sale_price')\nAND meta_value != '';",
      },
      {
        type: 'h2',
        text: 'Feil 2: Vipps fungerer på desktop, men ikke på mobil',
      },
      {
        type: 'p',
        text: 'Dette er en frustrerende feil fordi alt ser ut til å fungere når du tester selv — men når en kunde prøver fra mobilen sin, skjer det ingenting når de trykker "Betal med Vipps", eller de blir sendt tilbake til en feilside.',
      },
      {
        type: 'h3',
        text: 'De tre vanligste årsakene',
      },
      {
        type: 'h3',
        text: '1. Mixed content (HTTP/HTTPS-konflikt)',
      },
      {
        type: 'p',
        text: 'Vipps krever HTTPS over hele kjøpsreisen. Hvis ett eneste element på checkout-siden lastes via http:// (et bilde, et script eller en CSS-fil), blokkerer mobilnettlesere Vipps-popupen som en sikkerhetsrisiko. Desktop-nettlesere er ofte mer tolerante og viser advarsel istedenfor å blokkere. Sjekk dette ved å åpne nettleserkonsollen (F12) på checkout-siden og se etter "Mixed Content"-advarsler.',
      },
      {
        type: 'h3',
        text: '2. Webhook URL ikke konfigurert riktig',
      },
      {
        type: 'p',
        text: 'Vipps sender en bekreftelse til serveren din når en betaling fullføres. Hvis webhook-URL-en peker til feil sted, eller hvis serveren din blokkerer eksterne kall, blir ordren stående som "venter" selv om kunden har betalt. Sjekk: WooCommerce → Innstillinger → Betalinger → Vipps → Webhook URL. Den skal være https://dittdomene.no/wc-api/vipps/.',
      },
      {
        type: 'h3',
        text: '3. Test- og produksjonsnøkler er blandet',
      },
      {
        type: 'p',
        text: 'Hvis Vipps er satt opp i testmodus men butikken er live (eller omvendt), feiler betalinger uten tydelig feilmelding. Sjekk om "Test mode" er aktivert under Vipps-innstillingene og at API-nøklene matcher modusen.',
      },
      {
        type: 'h3',
        text: 'Diagnostisk sjekkliste',
      },
      {
        type: 'ol',
        items: [
          'Åpne checkout-siden på mobil og sjekk om hele URL-en er https:// (ikke bare deler av den)',
          'Test betaling med et reelt 1 kr-produkt og se i Vipps-loggene',
          'Sjekk WooCommerce → Status → Logger for Vipps-relaterte feil',
          'Verifiser at webhook URL er nådd av Vipps (kan ofte ses i Vipps\' merchant portal)',
        ],
      },
      {
        type: 'h2',
        text: 'Feil 3: Norske tegn (æ, ø, å) ødelegger URL-strukturen og SEO',
      },
      {
        type: 'p',
        text: 'Dette er en stille feil — alt ser ut til å fungere, men du taper Google-rangering hver dag uten å vite det.',
      },
      {
        type: 'h3',
        text: 'Hva som skjer',
      },
      {
        type: 'p',
        text: 'Når du oppretter et produkt med norske tegn lager WordPress en URL-slug ved å konvertere æ→e, ø→o og å→a. Men norsk språkkonvensjon transkriberer disse annerledes: å skal bli aa, ø skal bli oe og æ skal bli ae. Dette betyr at folk som søker med korrekt norsk transkripsjon ikke finner butikken din. Verre: importerte produkter kan få URL-encodede slugs som %C3%A5rbok — praktisk talt usynlige i Google.',
      },
      {
        type: 'h3',
        text: 'Løsning 1: Manuell overstyring (best for nye butikker)',
      },
      {
        type: 'p',
        text: 'For hvert produkt: gå inn på produktsiden og rediger URL-slug-en manuelt under tittelen. Sett en SEO-vennlig versjon som matcher hvordan folk faktisk søker.',
      },
      {
        type: 'h3',
        text: 'Løsning 2: Egen filter i functions.php (best for tekniske eiere)',
      },
      {
        type: 'code',
        text: "add_filter( 'sanitize_title', function( \$title, \$raw_title, \$context ) {\n    if ( 'save' === \$context ) {\n        \$replacements = array(\n            'æ' => 'ae', 'Æ' => 'ae',\n            'ø' => 'oe', 'Ø' => 'oe',\n            'å' => 'aa', 'Å' => 'aa',\n        );\n        \$title = strtr( \$raw_title, \$replacements );\n        \$title = sanitize_title_with_dashes( \$title, '', \$context );\n    }\n    return \$title;\n}, 5, 3 );",
      },
      {
        type: 'warning',
        text: 'Dette endrer kun nye slugs. Eksisterende produkt-URL-er må regenereres manuelt — og du må sette opp 301-redirects fra de gamle URL-ene for å ikke miste eksisterende Google-rangeringer.',
      },
      {
        type: 'h3',
        text: 'Løsning 3: Plugin (best for ikke-tekniske eiere)',
      },
      {
        type: 'p',
        text: 'Permalink Manager Pro håndterer dette automatisk og lar deg masseredigere URL-er med 301-redirects bygd inn. Koster ca. 800 kr/år, men sparer mye tid hvis du har mange produkter.',
      },
      {
        type: 'h2',
        text: 'Feil 4: Treg checkout som dreper konverteringen',
      },
      {
        type: 'p',
        text: 'Norske nettkunder forventer at en side laster på under 2 sekunder. Hvis checkout-siden din tar 4 sekunder å laste, mister du opptil 40 % av kundene før de kommer til betalingssteget.',
      },
      {
        type: 'h3',
        text: 'Hovedårsakene jeg ser oftest',
      },
      {
        type: 'ul',
        items: [
          'For mange aktive plugins — 60+ plugins betyr hundrevis av unødvendige databasespørringer på hver sidevisning.',
          'Heavy assets fra page builders — Elementor, Divi og Visual Composer laster 200–500 kB CSS/JS per side, selv på sider som ikke bruker dem.',
          'Manglende caching for statiske ressurser — bilder, CSS og JS bør caches aggressivt selv om checkout-siden selv ikke kan caches.',
          'Billig hosting — WooCommerce trenger PHP 8.1+, MySQL 8.0+ og minst 1 GB dedikert RAM for stabil drift.',
        ],
      },
      {
        type: 'h3',
        text: 'Quick wins — sjekkliste',
      },
      {
        type: 'ol',
        items: [
          'Installer Query Monitor (gratis plugin) og se hvor mange databasespørringer checkout-siden gjør. Mer enn 100 = du har et problem.',
          'Deaktiver page builderen på checkout-siden spesifikt — de fleste har en innstilling for dette.',
          'Skru på "Defer parsing of JavaScript" i caching-pluginen din.',
          'Optimaliser bildene: WebP-format, ikke større enn 1200 px bred.',
          'Vurder oppgradering til VPS-hosting hos en norsk leverandør (Domeneshop, Domain.no, eller PRO ISP).',
        ],
      },
      {
        type: 'h2',
        text: 'Feil 5: Ordrebekreftelser og fakturaer kommer aldri frem til kundene',
      },
      {
        type: 'p',
        text: 'Dette er kanskje den mest skadelige feilen, fordi den er helt usynlig. Kunden betaler, du ser ordren i WooCommerce, men kunden får aldri bekreftelse på e-post. De ringer kundeservice — eller refunderer betalingen via banken fordi de tror noe har gått galt.',
      },
      {
        type: 'h3',
        text: 'Hvorfor WordPress\' standard e-post er upålitelig',
      },
      {
        type: 'p',
        text: 'WordPress sender e-post via PHPs mail()-funksjon, som bruker serveren din direkte. Problemet: Gmail, Outlook og Hotmail sjekker om e-posten kommer fra en autorisert avsender via SPF-, DKIM- og DMARC-records. Hvis din hostingleverandørs server sender på vegne av dittdomene.no uten å være autorisert, havner e-posten i søppelpost — eller blir avvist helt.',
      },
      {
        type: 'h3',
        text: 'Slik fikser du det',
      },
      {
        type: 'p',
        text: 'Steg 1: Installer pluginen WP Mail SMTP (gratis) og koble til en transactional e-postleverandør. For norske nettbutikker anbefaler jeg:',
      },
      {
        type: 'ul',
        items: [
          'Mailgun — 5 000 e-poster gratis per måned, best leveringsrate i Norden',
          'Brevo — 300 e-poster per dag gratis',
          'SendGrid — 100 e-poster per dag gratis',
          'Amazon SES — svært billig for høyt volum',
        ],
      },
      {
        type: 'p',
        text: 'Steg 2: Legg til en SPF TXT-record i DNS-administrasjonen din (Domeneshop, Loopia, GoDaddy):',
      },
      {
        type: 'code',
        text: 'v=spf1 include:mailgun.org ~all',
      },
      {
        type: 'p',
        text: 'Steg 3: Sett opp DKIM — leverandøren gir deg en TXT-record som du legger inn i DNS. Dette beviser kryptografisk at e-posten faktisk kommer fra deg.',
      },
      {
        type: 'tip',
        text: 'Test leveringsraten din på mail-tester.com — send en test-e-post fra WooCommerce og få en score fra 0–10. Alt under 8 trenger forbedring.',
      },
      {
        type: 'h2',
        text: 'Når du bør be om profesjonell hjelp',
      },
      {
        type: 'p',
        text: 'Mange av disse feilene kan du fikse selv hvis du har tid og tålmodighet. Men det er noen situasjoner der det lønner seg å sette ut jobben:',
      },
      {
        type: 'ul',
        items: [
          'Du taper salg akkurat nå — hver dag med ødelagt checkout koster mer enn å få det fikset profesjonelt.',
          'Du er usikker på hva som er årsaken — å gjette seg fram i WooCommerce kan gjøre vondt verre, særlig med databaseendringer.',
          'Du har gjort backup, men ikke testet den — profesjonelle utviklere har testede rollback-prosesser.',
          'Feilen ligger i kode du ikke kjenner — custom plugins, tema-overstyringer og legacy-kode kan ha skjulte avhengigheter.',
        ],
      },
      { type: 'cta' },
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find(a => a.slug === slug);
}
