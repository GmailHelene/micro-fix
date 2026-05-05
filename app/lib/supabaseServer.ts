import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Bypasser Next.js data-cache på alle Supabase-kall
const noStoreFetch = (url: RequestInfo | URL, init?: RequestInit) =>
  fetch(url, { ...init, cache: 'no-store' });

// Leser innlogget bruker fra session-cookie (ANON-nøkkel, RLS aktiv)
export const createServerSupabase = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
      global: { fetch: noStoreFetch },
    }
  );
};

// Ren service-role-klient uten JWT fra cookies — garantert RLS-bypass
// Bruk denne for alle dataspørringer som skal se/endre alle rader
export const createServiceSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { fetch: noStoreFetch },
    }
  );
