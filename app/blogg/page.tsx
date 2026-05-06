import type { Metadata } from 'next';
import Link from 'next/link';
import { articles } from '../lib/articles';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blogg — WordPress-tips og feilsøkingsguider | CodeMedic',
  description:
    'Praktiske guider om WordPress-feil, WooCommerce, hastighetsoptimalisering og vedlikehold. Skrevet av norsk WordPress-utvikler.',
  alternates: { canonical: 'https://codemedic.no/blogg' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function BloggPage() {
  const sorted = [...articles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Ressurser</p>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Blogg</h1>
          <p className="text-slate-500 text-lg max-w-xl leading-relaxed">
            Praktiske guider og tips om WordPress, WooCommerce og webutvikling — skrevet av en norsk utvikler som jobber med dette til daglig.
          </p>
        </div>

        {/* Article grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {sorted.map(article => (
            <article
              key={article.slug}
              className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
            >
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {article.category}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(article.date)}</span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 mb-3 leading-snug">
                  <Link
                    href={`/blogg/${article.slug}`}
                    className="hover:text-slate-600 transition-colors"
                  >
                    {article.title}
                  </Link>
                </h2>

                <p className="text-sm text-slate-500 leading-relaxed flex-1">
                  {article.intro}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {article.readTime} min lesing
                  </span>
                  <Link
                    href={`/blogg/${article.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    Les mer <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl bg-slate-900 text-white p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Har du et WordPress-problem akkurat nå?</h2>
          <p className="text-slate-400 text-sm mb-5 max-w-md mx-auto">
            Vi løser det for deg — fast pris, rask levering, betal kun når du er fornøyd.
          </p>
          <Link
            href="/fix/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-white text-slate-900 px-7 py-3 text-sm font-bold hover:bg-slate-100 transition-colors"
          >
            Send forespørsel <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
