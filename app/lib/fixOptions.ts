export const categories = [
  {
    id: 'mobile-view',
    name: 'Fikse mobilvisning',
    description: 'Responsiv design og mobilopplevelse som ser bra ut på alle enheter.',
    icon: '📱',
  },
  {
    id: 'woocommerce',
    name: 'Fikse WooCommerce-feil',
    description: 'Handlekurv, betalinger og produktfeil som må virke smertefritt.',
    icon: '🛒',
  },
  {
    id: 'css-js',
    name: 'Rette CSS/JS-feil',
    description: 'Visuelle feil, layout-problemer og interaksjoner som ikke fungerer.',
    icon: '🎨',
  },
  {
    id: 'speed-optimization',
    name: 'Hastighetsoptimalisering',
    description: 'Raskere lastetid, bedre score og færre avvisninger.',
    icon: '⚡',
  },
  {
    id: 'plugin-setup',
    name: 'Installere plugin + konfigurere',
    description: 'Plugin-oppsett, konfigurasjon og sikker implementering.',
    icon: '🔌',
  },
  {
    id: 'wordpress-general',
    name: 'WordPress generelt',
    description: 'Oppdateringer, sikkerhet, tema-problemer og generell WordPress-hjelp.',
    icon: '🔧',
  },
  {
    id: 'security',
    name: 'Sikkerhetsfikser',
    description: 'Malware-fjerning, sikkerhetsoppdateringer og beskyttelse mot angrep.',
    icon: '🔒',
  },
  {
    id: 'other',
    name: 'Annet',
    description: 'Noe som ikke passer inn i kategoriene over? Beskriv det her, så vurderer vi om vi kan hjelpe.',
    icon: '💬',
  },
];

export const packages = [
  {
    id: 'basic',
    name: 'CodeMedic Basic',
    description: 'Én konkret feilretting. Passer for enkle justeringer og klare feil.',
    features: ['Én konkret feilretting', 'Levering innen 1–3 dager', 'Kort oppsummering etterpå'],
    fitsFor: ['Du har én klar feil som må fikses', 'Problemet er lett å beskrive', 'Mindre justeringer i CSS, tekst eller innstillinger'],
    price: 490,
    highlight: false,
  },
  {
    id: 'standard',
    name: 'CodeMedic Standard',
    description: 'Større feil, CSS/JS, WooCommerce eller mobilretting.',
    features: ['Én til to feilrettinger', 'CSS, JS, WooCommerce', 'Levering innen 1–3 dager', 'Oppsummering av hva som ble gjort'],
    fitsFor: ['Mobilvisning som ikke ser riktig ut', 'WooCommerce-feil som påvirker salg', 'Layout eller JS som har sluttet å virke'],
    price: 890,
    highlight: true,
  },
  {
    id: 'premium',
    name: 'CodeMedic Premium',
    description: 'Kompleks feil eller flere elementer som henger sammen.',
    features: ['Opptil tre feilrettinger', 'Prioritert behandling', 'Levering innen 1–2 dager', 'Detaljert oppsummering'],
    fitsFor: ['Plugin-konflikter eller kritiske feil', 'Flere ting som henger sammen', 'Du trenger rask og grundig løsning'],
    price: 1490,
    highlight: false,
  },
];

export const statusLabels: Record<string, string> = {
  pending_approval:          'Avventer godkjenning',
  awaiting_changes:          'Endringer ønsket',
  awaiting_offer_approval:   'Custom tilbud sendt',
  awaiting_payment:          'Avventer betaling',
  in_progress:               'Under arbeid',
  completed:                 'Fullført',
  cancelled:                 'Avbrutt',
};

export const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  pending_approval:         { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400'  },
  awaiting_changes:         { bg: 'bg-orange-50',  text: 'text-orange-700',  dot: 'bg-orange-400' },
  awaiting_offer_approval:  { bg: 'bg-purple-50',  text: 'text-purple-700',  dot: 'bg-purple-400' },
  awaiting_payment:         { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400'   },
  in_progress:              { bg: 'bg-indigo-50',  text: 'text-indigo-700',  dot: 'bg-indigo-400' },
  completed:                { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400'},
  cancelled:                { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400'  },
};

// Steg for fremdriftsindikator (kun "fremover"-statuser)
export const progressSteps = [
  { key: 'pending_approval',  label: 'Sendt inn' },
  { key: 'awaiting_payment',  label: 'Godkjent' },
  { key: 'in_progress',       label: 'Under arbeid' },
  { key: 'completed',         label: 'Fullført' },
];
