'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let result;

    if (mode === 'login') {
      result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    } else {
      result = await supabase.auth.signUp({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      alert('Konto opprettet! Nå kan du logge inn.');
      setMode('login');
      return;
    }

    if (result.error) {
      setError(result.error.message);
      return;
    }

    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-slate-200">
        <h1 className="text-2xl font-semibold mb-4 text-slate-900">
          {mode === 'login' ? 'Logg inn' : 'Opprett konto'}
        </h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="E-post"
            className="w-full border border-slate-400 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-600"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Passord"
            className="w-full border border-slate-400 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-600"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
          >
            {mode === 'login' ? 'Logg inn' : 'Opprett konto'}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="w-full mt-4 text-blue-600 hover:text-blue-800"
        >
          {mode === 'login' ? 'Opprett ny konto' : 'Har allerede konto?'}
        </button>
      </div>
    </div>
  );
}