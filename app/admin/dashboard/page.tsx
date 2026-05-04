import Link from 'next/link';
import { createServerSupabase } from '../../lib/supabaseServer';
import { statusLabels } from '../../lib/fixOptions';

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return <p className="text-slate-900">Ingen tilgang.</p>;
  }

  const { data: fixes } = await supabase
    .from('fix_requests')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-semibold mb-6 text-slate-900">Admin Dashboard</h1>

      <div className="grid gap-4">
        {fixes?.map(fix => (
          <div key={fix.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{fix.title}</h2>
                <p className="mt-2 text-slate-700">{fix.description}</p>
                {fix.package_name && <p className="text-sm text-slate-500 mt-2">Pakke: {fix.package_name}</p>}
                {fix.price != null && <p className="text-sm text-slate-500">Pris: {fix.price} kr</p>}
              </div>
              <div className="text-right text-sm text-slate-500">
                <p>{statusLabels[fix.status] ?? fix.status}</p>
                <p>Betaling: {fix.payment_status ?? 'ukjent'}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">Bruker: {fix.user_id} • {new Date(fix.created_at).toLocaleDateString('no-NO')}</p>
              <Link href={`/admin/fix/${fix.id}`} className="rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Administrer
              </Link>
            </div>
          </div>
        ))}

        {fixes?.length === 0 && <p className="text-slate-700">Ingen forespørsler.</p>}
      </div>
    </div>
  );
}