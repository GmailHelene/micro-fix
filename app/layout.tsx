import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://codemedic.no'),
  title: {
    default: 'CodeMedic — Premium WordPress og web-hjelp fra norsk utvikler',
    template: '%s | CodeMedic',
  },
  description: 'Få profesjonell hjelp med WordPress-feil, WooCommerce, hastighet og CSS fra en norsk utvikler. Fast pris, rask leveranse og betal først når jobben er godkjent.',
  keywords: [
    'WordPress hjelp Norge', 'WooCommerce feil', 'WordPress utvikler norsk',
    'fikse WordPress', 'teknisk hjelp nettside', 'nettbutikk feil', 'CSS feil fikse',
    'WordPress support norsk', 'hastighetsoptimalisering WordPress', 'no-cure-no-pay webservice',
  ],
  authors: [{ name: 'CodeMedic', url: 'https://codemedic.no' }],
  robots: { index: true, follow: true },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'CodeMedic — Premium norsk WordPress-hjelp',
    description: 'Profesjonell teknisk hjelp for WordPress og nettbutikk-feil. Betal kun når jobben er godkjent.',
    type: 'website',
    url: 'https://codemedic.no',
    siteName: 'CodeMedic',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'CodeMedic' }],
    locale: 'nb_NO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeMedic — Premium norsk WordPress-hjelp',
    description: 'Profesjonell teknisk hjelp for WordPress og nettbutikk-feil. Betal kun når jobben er godkjent.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: 'https://codemedic.no',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="no"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
