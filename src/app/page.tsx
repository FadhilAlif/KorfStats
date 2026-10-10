'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { localDb } from '@/lib/local-db/dexie-db';
import type { MatchState } from '@/types/match';
import { PlusCircle, FileSpreadsheet, Play, Trophy, Calendar, Users } from 'lucide-react';
import { formatDateId } from '@/lib/utils/format';

export default function HomePage() {
  const [matches, setMatches] = useState<MatchState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      try {
        const storedMatches = await localDb.matches.toArray();
        setMatches(
          storedMatches.sort(
            (a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()
          )
        );
      } catch (err) {
        console.error('Failed to load local matches:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Banner — Corporate Minimalist with Official Logo */}
      <div className="relative overflow-hidden rounded-2xl bg-brand-950 p-6 sm:p-10 text-white shadow-card border border-brand-900">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/15">
              <span>Pengkab Korfball Kabupaten Bantul</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Pencatatan Statistik Real-Time Korfball Bantul
            </h1>
            <p className="text-sm text-slate-300">
              Platform resmi pencatatan skor live pinggir lapangan, penghitungan statistik baku, dan ekspor score sheet resmi.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/matches/new"
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white hover:bg-slate-100 text-brand-950 transition flex items-center gap-2 shadow-xs"
              >
                <PlusCircle className="w-4 h-4 text-brand-700" />
                <span>Inisialisasi Pertandingan Baru</span>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex shrink-0 items-center justify-center">
            <div className="relative w-28 h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden border border-white/20 shadow-raised bg-brand-900 group-hover:scale-105 transition">
              <Image
                src="/image/Korfball Bantul Logo.jpg"
                alt="Logo Korfball Bantul"
                fill
                sizes="128px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Matches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Daftar Pertandingan
            </h2>
            <p className="text-xs text-slate-500">Pertandingan aktif dan riwayat skor lokal</p>
          </div>
          <Link
            href="/matches/new"
            className="text-xs sm:text-sm font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1"
          >
            <span>+ Tambah Baru</span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Memuat data pertandingan...</div>
        ) : matches.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-semibold text-slate-800">
                Belum ada pertandingan tercatat
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Mulai dengan membuat pertandingan baru (format 2 Tim atau 3 Tim) untuk mencatat skor langsung di pinggir lapangan.
              </p>
            </div>
            <Link
              href="/matches/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Buat Pertandingan Pertama</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-card hover:border-slate-300 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {m.matchCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${m.status === 'LIVE'
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 animate-pulse'
                        : m.status === 'COMPLETED'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                        }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  {/* Teams & Score */}
                  <div className="pt-1">
                    {m.teamStructure === 'THREE_TEAM' ? (
                      <div className="space-y-1.5 text-sm font-bold text-slate-800">
                        <div className="flex justify-between items-center">
                          <span className="truncate">{m.teamA.name || 'Team A'}</span>
                          <span className="text-brand-700 font-mono text-base font-black">
                            {m.scoreTeamA}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="truncate">{m.teamB.name || 'Team B'}</span>
                          <span className="text-brand-700 font-mono text-base font-black">
                            {m.scoreTeamB}
                          </span>
                        </div>
                        {m.teamC && (
                          <div className="flex justify-between items-center">
                            <span className="truncate">{m.teamC.name || 'Team C'}</span>
                            <span className="text-brand-700 font-mono text-base font-black">
                              {m.scoreTeamC}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between py-2 text-center">
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Tim A</p>
                          <p className="font-bold text-slate-800 text-sm truncate">{m.teamA.name}</p>
                        </div>
                        <div className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-200 font-mono text-lg font-black text-slate-900 tracking-wider mx-2">
                          {m.scoreTeamA} - {m.scoreTeamB}
                        </div>
                        <div className="flex-1 text-right min-w-0">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Tim B</p>
                          <p className="font-bold text-slate-800 text-sm truncate">{m.teamB.name}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDateId(m.matchDate)}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-600">
                      <Users className="w-3.5 h-3.5" />
                      {m.teamStructure === 'THREE_TEAM' ? '3 Team (K4)' : `${m.format} (2 Team)`}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/matches/${m.id}`}
                    className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Buka Lembar Pencatatan</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
