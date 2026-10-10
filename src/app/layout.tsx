import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Trophy } from 'lucide-react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KorfStats Bantul — Pencatatan Statistik Korfball',
  description:
    'Aplikasi pencatatan score sheet pertandingan real-time dan evaluasi performa atlet Korfball Kabupaten Bantul',
  icons: {
    icon: '/image/Korfball Bantul Logo.jpg',
    apple: '/image/Korfball Bantul Logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-canvas text-slate-900 min-h-screen flex flex-col font-sans antialiased selection:bg-brand-100 selection:text-brand-900">
        {/* Corporate Minimalist Header */}
        <header className="bg-brand-950 text-white shadow-card sticky top-0 z-50 border-b border-brand-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Brand Logo & Name */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/20 shadow-xs group-hover:scale-105 transition-transform bg-brand-900 shrink-0">
                <Image
                  src="/image/Korfball Bantul Logo.jpg"
                  alt="Logo Korfball Bantul"
                  fill
                  sizes="40px"
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <span className="text-base sm:text-lg font-black tracking-tight text-white block">
                  KorfStats <span className="text-amber-400 font-bold">Bantul</span>
                </span>
                <span className="text-[11px] text-slate-400 block -mt-1 font-medium">
                  Official Score Sheet & Match Log
                </span>
              </div>
            </Link>

            {/* Navigation Actions */}
            <nav className="flex items-center space-x-2 sm:space-x-3">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Pertandingan</span>
              </Link>
              <Link
                href="/matches/new"
                className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-white text-brand-950 hover:bg-slate-100 transition flex items-center gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-4 h-4 text-brand-700" />
                <span>Mulai Game Baru</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Corporate Minimalist Footer */}
        <footer className="border-t border-slate-200/90 bg-white py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2.5">
              <div className="relative w-6 h-6 rounded-md overflow-hidden border border-slate-200 bg-brand-900 shrink-0">
                <Image
                  src="/image/Korfball Bantul Logo.jpg"
                  alt="Korfball Bantul"
                  fill
                  sizes="24px"
                  className="object-cover"
                />
              </div>
              <span className="font-semibold text-slate-700">
                KorfStats Bantul • Pengkab Korfball Kabupaten Bantul
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Official Live Match Recording & Scoring System
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
