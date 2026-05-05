# Micro-fix — Prosjektstatus

Sist oppdatert: 2026-05-05

---

## Hva er ferdig

### Plattform & flyt
- [x] Bestillingsskjema (`/fix/new`) — kategorivalg, pakkevelger, URL + skjermbilde
- [x] Auth-guard på alle beskyttede ruter — redirect til login hvis ikke innlogget
- [x] Bekreftelsesskjerm etter bestilling med "hva skjer nå"-steg
- [x] Statusflyt: `pending_approval → awaiting_changes → awaiting_payment → in_progress → completed / cancelled`
- [x] Fremdriftsindikator i `/fix/[id]` (visuell steg-bar)
- [x] Tilgangsdeling (WP-admin/FTP) — vises kun etter godkjenning, låst til betaling er fullført

### Admin
- [x] Admin-dashboard med filter + søk (`/admin/dashboard`)
- [x] Admin fix-detalj (`/admin/fix/[id]`)
  - Godkjenn, be om endringer, avvis, start arbeid, marker fullført
  - Sett egendefinert pris
  - Generer Stripe-betalingslenke + kopier til utklippstavle
  - Se tilgangsinformasjon fra kunde (konfidensielt)
  - Chat med kunde

### Betalinger
- [x] Stripe Checkout-integrasjon (kunde betaler via `/fix/[id]`)
- [x] Admin genererer Stripe-URL server-side og deler med kunde
- [x] Stripe webhook mottar `checkout.session.completed` og oppdaterer `payment_status`

### Meldinger
- [x] Toveis chat mellom kunde og admin (`/api/messages/[fixId]`)
- [x] Admin-meldinger sendes automatisk ved statusendring (endringer/avvisning)

### Frontend
- [x] Landingsside med: hero, kategorier, pakker, steg-for-steg, omtaler, garanti, CTA
- [x] Kundedashboard med statistikk og forespørselsliste
- [x] 404-side (`/not-found.tsx`)
- [x] Header med logout og dynamiske lenker

### SEO & teknisk
- [x] JSON-LD strukturert data på forsiden
- [x] `sitemap.xml` generert av Next.js
- [x] `robots.txt` (blokkerer admin/dashboard/fix fra indeksering)
- [x] `metadata` eksportert på forsiden
- [x] `.env.example` med alle nødvendige variabler

### Database
- [x] `fix_requests` tabell med alle felt inkl. `access_info`, `admin_note`, `payment_status`
- [x] `fix_messages` tabell
- [x] RLS-policies for multi-tenant isolasjon
- [x] SQL setup-script i `docs/supabase-setup.sql`

---

## Hva gjenstår

### Kritisk før lansering
- [ ] **Stripe webhook** — sett opp i Stripe-dashboard (se instrukser nedenfor)
- [ ] **Supabase** — kjør `docs/supabase-setup.sql` i SQL Editor
- [ ] **Vercel-deploy** — sett alle env-variabler (se `.env.example`)
- [ ] **Domene** — koble til eget domene og oppdater `NEXT_PUBLIC_BASE_URL`

### Ønskelig etter lansering (fase 2)
- [ ] E-postvarsler (Resend/SendGrid) — kunden får e-post ved statusendring
- [ ] Stripe Klarna/Vipps som betalingsmetode
- [ ] Automatisk sletting av `access_info` etter fullføring
- [ ] Admin: sortering etter dato/pris i dashboard
- [ ] Onboarding-flow for nye brukere (første gang)

---

## Eksternt du må gjøre selv

### 1. Supabase — database
1. Gå til [supabase.com](https://supabase.com) → ditt prosjekt → **SQL Editor**
2. Åpne `docs/supabase-setup.sql` og kjør hele skriptet
3. Verifiser at tabellene `fix_requests`, `fix_messages`, `categories`, `packages` er opprettet

### 2. Stripe — webhook
1. Gå til [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Klikk **Add endpoint**
3. URL: `https://din-url.no/api/stripe/webhook`
4. Event å lytte på: `checkout.session.completed`
5. Kopier **Signing secret** → legg inn som `STRIPE_WEBHOOK_SECRET` i Vercel

### 3. Vercel — miljøvariabler
Gå til Vercel → Settings → Environment Variables og legg inn alle fra `.env.example`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_ADMIN_EMAIL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_BASE_URL` (din faktiske domain)

### 4. Domene
Oppdater `NEXT_PUBLIC_BASE_URL` og `public/robots.txt` med riktig domenenavn.

---

## Neste økt — forslag til videre arbeid

- Fikse Stripe
1. **E-postvarsler** — integrer Resend for å sende e-post til kunde ved godkjenning, betaling og fullføring
2. **Automatisk sletting av access_info** — slett sensitiv info når status settes til `completed`
3. **Stripe test → live** — bytt fra test-nøkler til live-nøkler og test full betalingsflyt
4. **Produksjonstest** — gå gjennom hele flyten live (bestill → godkjenn → betal → lever)
