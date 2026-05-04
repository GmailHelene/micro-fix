'use client';

import { supabase } from '../app/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ?? null);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!user) return null;

  const isAdmin = user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-semibold text-slate-900">Micro-fix</h1>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <a
              href="/admin/dashboard"
              className="text-blue-600 hover:text-blue-800"
            >
              Admin
            </a>
          )}
          <a
            href="/dashboard"
            className="text-slate-600 hover:text-slate-800"
          >
            Dashboard
          </a>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800"
          >
            Logg ut
          </button>
        </div>
      </div>
    </header>
  );
}