'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setSuccess('Konto opprettet! Sjekk e-posten din for bekreftelse, logg deretter inn.');
      setMode('login');
      setPassword('');
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError('Feil e-post eller passord. Prøv igjen.');
      return;
    }

    const isAdmin = data.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    router.push(isAdmin ? '/admin/dashboard' : '/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-bold text-slate-900 mb-2">CodeMedic</Link>
          <p className="text-slate-500 text-sm">
            {mode === 'login' ? 'Logg inn på din konto' : 'Opprett en ny konto'}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          {error && (
            <div className="mb-5 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">E-post</label>
              <input
                type="email"
                placeholder="din@epost.no"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300 transition"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Passord</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300 transition"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors mt-2"
            >
              {loading
                ? mode === 'login' ? 'Logger inn...' : 'Oppretter konto...'
                : mode === 'login' ? 'Logg inn' : 'Opprett konto'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setSuccess(null); }}
              className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              {mode === 'login' ? 'Ny her? Opprett konto' : 'Har allerede konto? Logg inn'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Ved å logge inn godtar du våre vilkår og personvernpolicy.
        </p>
      </div>
    </div>
  );
}
