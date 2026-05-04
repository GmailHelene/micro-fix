'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { statusLabels } from '@/app/lib/fixOptions';

interface Fix {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  category?: string;
  package_name?: string;
  price?: number;
  estimated_time?: string;
  payment_status?: string;
}

export default function FixDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [fix, setFix] = useState<Fix | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const fetchFix = useCallback(async () => {
    const res = await fetch(`/api/fix/${id}`);
    const data = await res.json();
    if (data.error) {
      setMessage(data.error);
      setLoading(false);
      return;
    }
    setFix(data);
    setTitle(data.title);
    setDescription(data.description);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchFix(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchFix]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const res = await fetch(`/api/fix/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, description }),
    });

    const data = await res.json();

    if (data.error) {
      setMessage(data.error);
      return;
    }

    setMessage('Oppdatert!');
    setEditing(false);
    fetchFix();
  };

  const handleDelete = async () => {
    if (!confirm('Er du sikker på at du vil slette denne forespørselen?')) return;

    const res = await fetch(`/api/fix/${id}`, {
      method: 'DELETE',
    });

    const data = await res.json();

    if (data.error) {
      setMessage(data.error);
      return;
    }

    router.push('/dashboard');
  };

  const handlePay = async () => {
    if (!fix) return;
    setMessage('Oppretter betalingslenke...');

    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ requestId: id }),
    });

    const data = await res.json();

    if (data.error) {
      setMessage(data.error);
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    }
  };

  if (loading) return <p className="text-slate-900">Laster...</p>;
  if (!fix) return <p className="text-slate-900">Forespørsel ikke funnet.</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow border border-slate-200">
      <h1 className="text-2xl font-semibold mb-4 text-slate-900">Forespørsel detaljer</h1>

      {message && <p className="text-red-600 mb-4">{message}</p>}

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{fix.title}</h2>
          <p className="text-slate-700 mt-2">{fix.description}</p>
          {fix.category && <p className="text-slate-600">Kategori: {fix.category}</p>}
          {fix.package_name && <p className="text-slate-600">Pakke: {fix.package_name}</p>}
          {fix.price != null && <p className="text-slate-600">Pris: {fix.price} kr</p>}
          {fix.estimated_time && <p className="text-slate-600">Estimert tid: {fix.estimated_time}</p>}
          <p className="text-sm text-slate-500 mt-2">
            Status: {statusLabels[fix.status] ?? fix.status} | Betaling: {fix.payment_status ?? 'ukjent'}
          </p>
          <p className="text-sm text-slate-500">Opprettet: {new Date(fix.created_at).toLocaleDateString('no-NO')}</p>
        </div>

        {fix.status === 'awaiting_payment' && fix.payment_status === 'unpaid' && (
          <button
            onClick={handlePay}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Betal {fix.price} kr nå
          </button>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Rediger
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Slett
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Tilbake
          </button>
        </div>
      </div>

      {editing && (
        <form onSubmit={handleUpdate} className="mt-8 space-y-4">
          <input
            className="w-full border border-slate-400 rounded-lg px-3 py-2 text-slate-900"
            placeholder="Tittel"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <textarea
            className="w-full border border-slate-400 rounded-lg px-3 py-2 text-slate-900"
            placeholder="Beskrivelse"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            required
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Lagre endringer
            </button>
            <button type="button" onClick={() => setEditing(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
              Avbryt
            </button>
          </div>
        </form>
      )}
    </div>
  );
}