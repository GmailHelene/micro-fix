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
  user_id: string;
  category?: string;
  package_name?: string;
  price?: number;
  estimated_time?: string;
  payment_status?: string;
}

export default function AdminFixDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [fix, setFix] = useState<Fix | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');

  const fetchFix = useCallback(async () => {
    const res = await fetch(`/api/admin/fix/${id}`);
    const data = await res.json();
    if (data.error) {
      setMessage(data.error);
      setLoading(false);
      return;
    }
    setFix(data);
    setStatus(data.status);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchFix(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchFix]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const res = await fetch(`/api/admin/fix/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });

    const data = await res.json();

    if (data.error) {
      setMessage(data.error);
      return;
    }

    setMessage('Status oppdatert!');
    fetchFix();
  };

  if (loading) return <p className="text-slate-900">Laster...</p>;
  if (!fix) return <p className="text-slate-900">Forespørsel ikke funnet.</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow border border-slate-200">
      <h1 className="text-2xl font-semibold mb-4 text-slate-900">Admin: Forespørsel detaljer</h1>

      {message && <p className="text-green-600 mb-4">{message}</p>}

      <div className="space-y-4">
        <div className="rounded-3xl bg-slate-50 p-6">
          <h2 className="text-lg font-semibold text-slate-900">{fix.title}</h2>
          <p className="mt-3 text-slate-700">{fix.description}</p>
          {fix.category && <p className="text-slate-600">Kategori: {fix.category}</p>}
          {fix.package_name && <p className="text-slate-600">Pakke: {fix.package_name}</p>}
          {fix.price != null && <p className="text-slate-600">Pris: {fix.price} kr</p>}
          {fix.estimated_time && <p className="text-slate-600">Estimert tid: {fix.estimated_time}</p>}
          <p className="text-sm text-slate-500 mt-3">Bruker ID: {fix.user_id}</p>
          <p className="text-sm text-slate-500">Status: {statusLabels[fix.status] ?? fix.status}</p>
          <p className="text-sm text-slate-500">Betaling: {fix.payment_status ?? 'ukjent'}</p>
          <p className="text-sm text-slate-500">Opprettet: {new Date(fix.created_at).toLocaleDateString('no-NO')}</p>
        </div>

        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border border-slate-400 rounded-lg px-3 py-2 text-slate-900"
            >
              <option value="pending_approval">Avventer godkjenning</option>
              <option value="awaiting_payment">Avventer betaling</option>
              <option value="in_progress">Under arbeid</option>
              <option value="completed">Fullført</option>
              <option value="cancelled">Avbrutt</option>
            </select>
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Oppdater status
          </button>
        </form>

        <button
          onClick={() => router.push('/admin/dashboard')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          Tilbake til dashboard
        </button>
      </div>
    </div>
  );
}