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
];

export const packages = [
  {
    id: 'basic',
    name: 'Micro-fix Basic',
    description: 'Én konkret feilretting. Passer for enkle justeringer og klare feil.',
    features: ['Én konkret feilretting', '20–30 min arbeid', 'Levering innen 24–48 timer', 'Kort oppsummering etterpå'],
    price: 490,
    estimatedTime: '20–30 min',
    highlight: false,
  },
  {
    id: 'standard',
    name: 'Micro-fix Standard',
    description: 'Større feil, CSS/JS, WooCommerce eller mobilretting.',
    features: ['Én til to feilrettinger', '45–60 min arbeid', 'CSS, JS, WooCommerce', 'Levering innen 24–48 timer', 'Oppsummering av hva som ble gjort'],
    price: 890,
    estimatedTime: '45–60 min',
    highlight: true,
  },
  {
    id: 'premium',
    name: 'Micro-fix Premium',
    description: 'Kompleks feil eller flere elementer som henger sammen.',
    features: ['Opptil tre feilrettinger', '1–2 timer arbeid', 'Prioritert behandling', 'Levering innen 24 timer', 'Detaljert oppsummering'],
    price: 1490,
    estimatedTime: '1–2 timer',
    highlight: false,
  },
  {
    id: 'express',
    name: 'Micro-fix Express',
    description: 'Haster? Samme dag levering for kritiske feil.',
    features: ['Prioritert kø', '30–45 min arbeid', 'Levering samme dag', 'Direkte oppfølging'],
    price: 1290,
    estimatedTime: '30–45 min (samme dag)',
    highlight: false,
  },
];

export const statusLabels: Record<string, string> = {
  pending_approval:   'Avventer godkjenning',
  awaiting_changes:   'Endringer ønsket',
  awaiting_payment:   'Avventer betaling',
  in_progress:        'Under arbeid',
  completed:          'Fullført',
  cancelled:          'Avbrutt',
};

export const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  pending_approval:  { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400'  },
  awaiting_changes:  { bg: 'bg-orange-50',  text: 'text-orange-700',  dot: 'bg-orange-400' },
  awaiting_payment:  { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400'   },
  in_progress:       { bg: 'bg-indigo-50',  text: 'text-indigo-700',  dot: 'bg-indigo-400' },
  completed:         { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400'},
  cancelled:         { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400'  },
};

// Steg for fremdriftsindikator (kun "fremover"-statuser)
export const progressSteps = [
  { key: 'pending_approval',  label: 'Sendt inn' },
  { key: 'awaiting_payment',  label: 'Godkjent' },
  { key: 'in_progress',       label: 'Under arbeid' },
  { key: 'completed',         label: 'Fullført' },
];
