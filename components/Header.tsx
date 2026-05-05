'use client';

import { supabase } from '../app/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isLoginPage = pathname === '/login';

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.png" alt="CodeMedic" width={40} height={40} className="rounded-xl" />
          <span className="text-lg font-bold text-slate-900 tracking-tight">CodeMedic</span>
          <span className="hidden sm:inline text-xs text-slate-400 font-medium">Premium teknisk hjelp</span>
        </Link>

        {/* Desktop nav */}
        {user ? (
          <nav className="hidden sm:flex items-center gap-2">
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
          </nav>
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

        {/* Mobile hamburger — only when logged in */}
        {user && (
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="sm:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Meny"
          >
            <span className={`block w-5 h-0.5 bg-slate-700 transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-slate-700 transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-slate-700 transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        )}
      </div>

      {/* Mobile dropdown */}
      {user && menuOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1 shadow-lg">
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>🛠</span> Admin
            </Link>
          )}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>📋</span> Mine saker
          </Link>
          <Link
            href="/fix/new"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <span>+</span> Ny forespørsel
          </Link>
          <div className="border-t border-slate-100 pt-2 mt-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <span>↩</span> Logg ut
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
