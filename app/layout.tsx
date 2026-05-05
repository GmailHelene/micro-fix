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
  title: "Micro-fix - Premium teknisk hjelp for WordPress og nettbutikk",
  description: "Få profesjonell teknisk hjelp for WordPress, WooCommerce og web-feil. Faste priser, rask levering og betal først når jobben er godkjent.",
  keywords: "WordPress hjelp, WooCommerce feil, teknisk support, webutvikling, nettbutikk fikser",
  authors: [{ name: "Micro-fix" }],
  openGraph: {
    title: "Micro-fix - Premium teknisk hjelp",
    description: "Profesjonell teknisk hjelp for WordPress og nettbutikk-feil. Betal først når jobben er godkjent.",
    type: "website",
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
