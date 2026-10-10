import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Activity, PlusCircle, Trophy } from 'lucide-react';

export const metadata: Metadata = {
  title: 'KorfStats Bantul — Pencatatan Statistik Korfball',
  description: 'Aplikasi pencatatan score sheet pertandingan dan evaluasi atlet Korfball Kabupaten Bantul',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased">
        <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-sky-500 flex items-center justify-center font-black text-xl text-slate-900 shadow-sm group-hover:scale-105 transition-transform">
                K
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white block">
                  KorfStats <span className="text-amber-400">Bantul</span>
                </span>
                <span className="text-xs text-slate-400 block -mt-1 font-medium">
                  Official Score Sheet & Match Log
                </span>
              </div>
            </Link>

            <nav className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Pertandingan</span>
              </Link>
              <Link
                href="/matches/new"
                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 shadow-sm hover:shadow"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Mulai Game Baru</span>
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          <p>© 2026 Pengcab Korfball Kabupaten Bantul • Sistem Pencatatan Statistik Resmi</p>
        </footer>
      </body>
    </html>
  );
}
