# Micro-fix

Et premium system for å håndtere feilrettingsforespørsler bygget med Next.js, Supabase og Stripe.

## Funksjoner

### For brukere:
- Registrering og innlogging med Supabase Auth
- Opprette nye fix-forespørsler med detaljert informasjon
- Velge mellom forskjellige pakker og priser
- Se og administrere egne forespørsler
- Betale via Stripe Checkout
- Redigere og slette forespørsler

### For admin:
- Se alle forespørsler fra alle brukere
- Godkjenne/avvise forespørsler
- Oppdatere status på forespørsler (venter på godkjenning → venter på betaling → pågår → fullført)
- Administrere betalingsstatus

### Betalingsflyt:
- Bruker sender forespørsel → status: `pending_approval`
- Admin godkjenner → status: `awaiting_payment`
- Bruker betaler via Stripe → status: `in_progress`
- Admin fullfører → status: `completed`

## Teknologi stack

- **Frontend:** Next.js 16 med App Router, React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL database, autentisering)
- **Betaling:** Stripe Checkout og Webhooks
- **Deployment:** Vercel

## Lokal utvikling

### 1. Klone repository
```bash
git clone <repository-url>
cd micro-fix
```

### 2. Installer dependencies
```bash
npm install
```

### 3. Database setup i Supabase

Opprett følgende tabell i Supabase SQL Editor:

```sql
CREATE TABLE fix_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  package_name TEXT,
  price DECIMAL(10,2),
  estimated_time TEXT,
  status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'awaiting_payment', 'in_progress', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aktiver Row Level Security
ALTER TABLE fix_requests ENABLE ROW LEVEL SECURITY;

-- Policy for å la brukere se sine egne forespørsler
CREATE POLICY "Users can view own requests" ON fix_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for å la brukere opprette forespørsler
CREATE POLICY "Users can create requests" ON fix_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for å la brukere oppdatere sine egne forespørsler
CREATE POLICY "Users can update own requests" ON fix_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for admin å se alle forespørsler
CREATE POLICY "Admin can view all requests" ON fix_requests
  FOR SELECT USING (auth.jwt() ->> 'email' = 'admin@microfix.no');

-- Policy for admin å oppdatere alle forespørsler
CREATE POLICY "Admin can update all requests" ON fix_requests
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'admin@microfix.no');
```

### 4. Environment variables

Opprett `.env.local` fil med følgende variabler:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin
NEXT_PUBLIC_ADMIN_EMAIL=admin@microfix.no

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 5. Stripe webhook setup

1. I Stripe Dashboard, gå til Webhooks
2. Legg til endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Velg events: `checkout.session.completed`
4. Kopier webhook secret til `STRIPE_WEBHOOK_SECRET`

### 6. Kjør utviklingsserver
```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000)

## Deployment til Vercel

### 1. Push til GitHub
```bash
git add .
git commit -m "Complete Micro-fix platform"
git push origin main
```

### 2. Deploy på Vercel
1. Gå til [vercel.com](https://vercel.com) og logg inn
2. Klikk "New Project"
3. Koble til GitHub repository
4. Sett environment variables i Vercel dashboard
5. Deploy

### 3. Oppdater webhook URL
Etter deploy, oppdater Stripe webhook URL til den nye Vercel URL-en.

## Testing

### Kjør tester
```bash
npm run build
npm run lint
```

### Manuelt testing
1. Registrer en bruker
2. Opprett en forespørsel
3. Logg inn som admin og godkjenn
4. Betal som bruker
5. Sjekk at status oppdateres korrekt

## Prosjektstruktur

```
app/
├── api/
│   ├── admin/fix/[id]/          # Admin API for forespørsler
│   ├── fix/
│   │   ├── [id]/                # Bruker API for forespørsler
│   │   └── new/                 # Opprett ny forespørsel
│   └── stripe/
│       ├── create-checkout-session/  # Stripe checkout
│       └── webhook/             # Stripe webhook
├── admin/
│   ├── dashboard/               # Admin oversikt
│   └── fix/[id]/                # Admin detaljvisning
├── dashboard/                   # Bruker dashboard
├── fix/
│   ├── [id]/                    # Bruker detaljvisning
│   └── new/                     # Ny forespørsel form
├── lib/
│   ├── fixOptions.ts            # Pakker og statuser
│   ├── supabaseClient.ts        # Klient-side Supabase
│   └── supabaseServer.ts        # Server-side Supabase
├── login/                       # Innlogging/registrering
├── page.tsx                     # Landingsside
└── layout.tsx                   # App layout
```

## Lisens

MIT
```

## Deployment til Vercel

1. Push koden til GitHub
2. Koble til Vercel og importer prosjektet
3. Sett environment variables i Vercel dashboard
4. Deploy

## Bruk

1. Gå til hjemmesiden og logg inn eller registrer deg
2. Opprett en ny forespørsel via "Ny forespørsel"
3. Se forespørsler i dashboard
4. Admin kan logge inn med admin-epost og administrere alle forespørsler

## Utvikling

- `npm run dev` - Start utviklingsserver
- `npm run build` - Bygg for produksjon
- `npm run lint` - Kjør ESLint
