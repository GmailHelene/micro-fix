-- ============================================================
-- Micro-fix — Supabase oppsett
-- Kjør dette i Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- --------------------------------------------------------
-- 1. Tabell: fix_requests
-- --------------------------------------------------------
create table if not exists fix_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users not null,
  title           text not null,
  description     text,
  category        text,
  package_name    text,
  price           numeric,
  estimated_time  text,
  status          text not null default 'pending_approval',
  payment_status  text not null default 'unpaid',
  -- Tilgangsinfo: deles av kunde etter jobben er godkjent
  access_info     text,
  -- Admin-notat ved avvisning eller endringsforespørsel
  admin_note      text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Auto-oppdater updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger fix_requests_updated_at
  before update on fix_requests
  for each row execute function update_updated_at();

-- RLS
alter table fix_requests enable row level security;

create policy "Brukere ser egne" on fix_requests
  for select using (auth.uid() = user_id);

create policy "Brukere oppretter egne" on fix_requests
  for insert with check (auth.uid() = user_id);

create policy "Brukere oppdaterer egne" on fix_requests
  for update using (auth.uid() = user_id);

create policy "Brukere sletter egne" on fix_requests
  for delete using (auth.uid() = user_id);

-- Indekser
create index if not exists fix_requests_user_id_idx  on fix_requests(user_id);
create index if not exists fix_requests_status_idx   on fix_requests(status);
create index if not exists fix_requests_created_idx  on fix_requests(created_at desc);

-- --------------------------------------------------------
-- 2. Tabell: fix_messages (chat mellom admin og kunde)
-- --------------------------------------------------------
create table if not exists fix_messages (
  id              uuid primary key default gen_random_uuid(),
  fix_request_id  uuid references fix_requests(id) on delete cascade not null,
  user_id         uuid references auth.users not null,
  content         text not null,
  sender          text not null check (sender in ('admin', 'customer')),
  created_at      timestamptz default now()
);

alter table fix_messages enable row level security;

create policy "Kunde ser meldinger på egne saker" on fix_messages
  for select using (
    exists (
      select 1 from fix_requests
      where fix_requests.id = fix_messages.fix_request_id
        and fix_requests.user_id = auth.uid()
    )
  );

create policy "Kunde sender melding på egne saker" on fix_messages
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from fix_requests
      where fix_requests.id = fix_request_id
        and fix_requests.user_id = auth.uid()
    )
  );

create index if not exists fix_messages_fix_id_idx on fix_messages(fix_request_id);
create index if not exists fix_messages_created_idx on fix_messages(created_at asc);

-- --------------------------------------------------------
-- 3. Tabell: categories (kategorier, holdes som referanse)
-- --------------------------------------------------------
create table if not exists categories (
  id             text primary key,
  name           text not null,
  description    text,
  base_price     numeric,
  estimated_time text
);

insert into categories (id, name, description, base_price, estimated_time) values
  ('mobile-view',       'Fikse mobilvisning',            'Responsiv design og mobilopplevelse.',               490,  '20–60 min'),
  ('woocommerce',       'Fikse WooCommerce-feil',        'Handlekurv, betalinger og produktfeil.',             890,  '45–90 min'),
  ('css-js',            'Rette CSS/JS-feil',             'Visuelle feil, layout og interaksjoner.',            490,  '20–60 min'),
  ('speed-optimization','Hastighetsoptimalisering',      'Raskere lastetid og bedre ytelse.',                  890,  '45–90 min'),
  ('plugin-setup',      'Installere plugin + konfigurere','Plugin-oppsett og sikker implementering.',          490,  '20–45 min'),
  ('wordpress-general', 'WordPress generelt',            'Oppdateringer, sikkerhet og tema-problemer.',        490,  '20–60 min'),
  ('security',          'Sikkerhetsfikser',              'Malware-fjerning og sikkerhetsoppdateringer.',       1490, '1–2 timer')
on conflict (id) do nothing;

-- --------------------------------------------------------
-- 4. Tabell: packages (pakker med faste priser)
-- --------------------------------------------------------
create table if not exists packages (
  id            text primary key,
  category_id   text references categories(id),
  name          text not null,
  price         numeric not null,
  features      text[],
  delivery_time text
);

-- Basic — for alle kategorier
insert into packages (id, category_id, name, price, features, delivery_time) values
  ('basic',    null, 'Micro-fix Basic',    490,  array['Én konkret feilretting','20–30 min arbeid','Rask levering'],          '24–48 timer'),
  ('standard', null, 'Micro-fix Standard', 890,  array['Større feil eller flere steder','45–60 min arbeid','CSS/JS/WooCommerce'], '24–48 timer'),
  ('premium',  null, 'Micro-fix Premium',  1490, array['Kompleks feil','1–2 timer arbeid','Prioritert behandling'],          '24 timer'),
  ('express',  null, 'Micro-fix Express',  1290, array['Haster? Samme dag','30–45 min arbeid','Prioritert kø'],              'Samme dag')
on conflict (id) do nothing;

-- --------------------------------------------------------
-- STATUSVERDIER (dokumentasjon, ikke kode)
-- --------------------------------------------------------
-- pending_approval   — Kunde sendt inn, venter på admin-godkjenning
-- awaiting_changes   — Admin ber om endringer fra kunden
-- awaiting_payment   — Admin godkjent, venter på betaling
-- in_progress        — Betalt, arbeid pågår
-- completed          — Ferdig levert
-- cancelled          — Avvist eller avbrutt

-- BETALINGSSTATUS
-- unpaid / paid / refunded
