'use client';

import { supabase } from '../app/lib/supabaseClient';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isLoginPage = pathname === '/login';

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-900 tracking-tight">Micro-fix</span>
          <span className="hidden sm:inline text-xs text-slate-400 font-medium">Premium teknisk hjelp</span>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                Mine saker
              </Link>
              <Link
                href="/fix/new"
                className="text-sm font-semibold bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition-colors"
              >
                + Ny forespørsel
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-400 hover:text-slate-600 px-2 py-1 transition-colors"
              >
                Logg ut
              </button>
            </>
          ) : (
            !isLoginPage && (
              <Link
                href="/login"
                className="text-sm font-semibold bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-slate-800 transition-colors"
              >
                Logg inn
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
