export const categories = [
  {
    id: 'mobile-view',
    name: 'Fikse mobilvisning',
    description: 'Responsiv design og mobilopplevelse som ser bra ut på alle enheter.',
  },
  {
    id: 'woocommerce',
    name: 'Fikse WooCommerce',
    description: 'Handlekurv, betalinger og produktfeil som må virke smertefritt.',
  },
  {
    id: 'css-js',
    name: 'Rette CSS/JS-feil',
    description: 'Visuelle feil, layout-problemer og interaksjoner som ikke fungerer.',
  },
  {
    id: 'speed-optimization',
    name: 'Hastighetsoptimalisering',
    description: 'Raskere lastetid, bedre score og færre avvisninger.',
  },
  {
    id: 'plugin-setup',
    name: 'Installere plugin + konfigurere',
    description: 'Plugin-oppsett, konfigurasjon og sikker implementering.',
  },
];

export const packages = [
  {
    id: 'basic',
    name: 'Micro-fix Basic',
    description: 'Én konkret feilretting, 20–30 min arbeid. Passer for mindre justeringer.',
    price: 490,
    estimatedTime: '20–30 min',
  },
  {
    id: 'standard',
    name: 'Micro-fix Standard',
    description: 'Større feil, CSS/JS, WooCommerce eller mobilretting. 45–60 min arbeid.',
    price: 890,
    estimatedTime: '45–60 min',
  },
  {
    id: 'premium',
    name: 'Micro-fix Premium',
    description: 'Kompleks feil eller flere elementer. 1–2 timer arbeid.',
    price: 1490,
    estimatedTime: '1–2 timer',
  },
];

export const statusLabels: Record<string, string> = {
  pending_approval: 'Avventer godkjenning',
  awaiting_payment: 'Avventer betaling',
  in_progress: 'Under arbeid',
  completed: 'Fullført',
  cancelled: 'Avbrutt',
};
