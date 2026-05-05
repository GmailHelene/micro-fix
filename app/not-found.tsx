import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-black text-slate-100 mb-4">404</p>
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">Siden finnes ikke</h1>
        <p className="text-slate-500 mb-8">Vi kunne ikke finne siden du lette etter. Den kan ha blitt fjernet eller adressen er feil.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
            Til forsiden
          </Link>
          <Link href="/dashboard" className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Mine forespørsler
          </Link>
        </div>
      </div>
    </div>
  );
}
