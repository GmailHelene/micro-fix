import { createServerSupabase } from '../lib/supabaseServer';
import Link from 'next/link';
import { statusLabels } from '../lib/fixOptions';

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p className="text-slate-900">Du er ikke innlogget.</p>;
  }

  const { data: fixes } = await supabase
    .from('fix_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-3xl font-semibold mb-6 text-slate-900">
        Mine forespørsler
      </h1>

      <Link
        href="/fix/new"
        className="inline-block mb-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        + Ny forespørsel
      </Link>

      <div className="space-y-4">
        {fixes?.map(fix => (
          <div
            key={fix.id}
            className="p-4 bg-white border border-slate-300 rounded-lg shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              {fix.title}
            </h2>
            <p className="text-slate-700">{fix.description}</p>
            {fix.package_name && (
              <p className="text-sm text-slate-500 mt-2">Pakke: {fix.package_name}</p>
            )}
            {fix.price != null && (
              <p className="text-sm text-slate-500">Pris: {fix.price} kr</p>
            )}
            <p className="text-sm text-slate-500 mt-2">
              Status: {statusLabels[fix.status] ?? fix.status} • Betaling: {fix.payment_status ?? 'ukjent'}
            </p>
            <a
              href={`/fix/${fix.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
            >
              Se detaljer
            </a>
          </div>
        ))}

        {fixes?.length === 0 && (
          <p className="text-slate-700">Ingen forespørsler enda.</p>
        )}
      </div>
    </div>
  );
}
