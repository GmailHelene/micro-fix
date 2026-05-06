import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { articles, getArticleBySlug, type ArticleSection } from '../../lib/articles';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return articles.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: { canonical: `https://codemedic.no/blogg/${slug}` },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      url: `https://codemedic.no/blogg/${slug}`,
      type: 'article',
      publishedTime: article.date,
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function renderSection(section: ArticleSection, index: number) {
  switch (section.type) {
    case 'h2':
      return (
        <h2 key={index} className="text-2xl font-bold text-slate-900 mt-10 mb-4">
          {section.text}
        </h2>
      );
    case 'h3':
      return (
        <h3 key={index} className="text-xl font-semibold text-slate-800 mt-6 mb-3">
          {section.text}
        </h3>
      );
    case 'p':
      return (
        <p key={index} className="text-slate-700 leading-relaxed mb-4">
          {section.text}
        </p>
      );
    case 'ul':
      return (
        <ul key={index} className="space-y-2 mb-5">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-700">
              <span className="text-emerald-500 font-bold mt-0.5 shrink-0">✓</span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={index} className="space-y-2 mb-5 counter-reset-item">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-700">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ol>
      );
    case 'tip':
      return (
        <div key={index} className="rounded-xl bg-blue-50 border border-blue-200 px-5 py-4 mb-5 flex gap-3">
          <span className="text-xl shrink-0">💡</span>
          <p className="text-blue-800 text-sm leading-relaxed">{section.text}</p>
        </div>
      );
    case 'warning':
      return (
        <div key={index} className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 mb-5 flex gap-3">
          <span className="text-xl shrink-0">⚠️</span>
          <p className="text-amber-800 text-sm leading-relaxed">{section.text}</p>
        </div>
      );
    case 'code':
      return (
        <pre
          key={index}
          className="rounded-xl bg-slate-900 text-slate-100 text-sm font-mono p-5 mb-5 overflow-x-auto leading-relaxed whitespace-pre-wrap"
        >
          {section.text}
        </pre>
      );
    case 'cta':
      return (
        <div key={index} className="rounded-2xl bg-slate-900 text-white p-8 mt-12 text-center">
          <h3 className="text-xl font-bold mb-2">Vil du ha profesjonell hjelp?</h3>
          <p className="text-slate-400 text-sm mb-5 max-w-md mx-auto">
            CodeMedic løser WordPress-feil raskt og trygt. Fast pris — du betaler kun når jobben er godkjent og ferdig.
          </p>
          <Link
            href="/fix/new"
            className="inline-block rounded-full bg-white text-slate-900 px-7 py-3 text-sm font-bold hover:bg-slate-100 transition-colors"
          >
            Send forespørsel →
          </Link>
        </div>
      );
    default:
      return null;
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://codemedic.no';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.headline,
    description: article.metaDescription,
    datePublished: article.date,
    author: {
      '@type': 'Organization',
      name: 'CodeMedic',
      url: base,
    },
    publisher: {
      '@type': 'Organization',
      name: 'CodeMedic',
      url: base,
      logo: {
        '@type': 'ImageObject',
        url: `${base}/logo.png`,
      },
    },
    url: `${base}/blogg/${slug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${base}/blogg/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-12">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-8" aria-label="Navigasjon">
            <Link href="/" className="hover:text-slate-600 transition-colors">Hjem</Link>
            <span>›</span>
            <Link href="/blogg" className="hover:text-slate-600 transition-colors">Blogg</Link>
            <span>›</span>
            <span className="text-slate-600 truncate max-w-[200px]">{article.title}</span>
          </nav>

          {/* Article header */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {article.category}
              </span>
              <span className="text-xs text-slate-400">{formatDate(article.date)}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400">{article.readTime} min lesing</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4">
              {article.headline}
            </h1>
            <p className="text-slate-500 text-lg leading-relaxed border-l-4 border-slate-200 pl-4">
              {article.intro}
            </p>
          </header>

          {/* Article content */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8 md:p-10">
            {article.sections.map((section, index) => renderSection(section, index))}
          </div>

          {/* Back link */}
          <div className="mt-10 text-center">
            <Link
              href="/blogg"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              ← Tilbake til blogg
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
