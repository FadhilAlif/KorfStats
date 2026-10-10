'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { localDb } from '@/lib/local-db/dexie-db';
import { MatchState } from '@/types/match';
import { PlusCircle, FileSpreadsheet, Play, Trophy, Calendar, MapPin, Users } from 'lucide-react';

export default function HomePage() {
  const [matches, setMatches] = useState<MatchState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      try {
        const storedMatches = await localDb.matches.toArray();
        setMatches(storedMatches.sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()));
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
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Trophy className="w-3.5 h-3.5" />
            <span>Fase 1 MVP — Digital Score Sheet & Excel Export</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Pencatatan Statistik Real-Time Korfball Bantul
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Eliminasi borang kertas di pinggir lapangan. Catat tembakan, pelanggaran, turnover, rebound, serta running score secara digital dengan ekspor instan ke format resmi <span className="font-semibold text-amber-300">PRINT SCORE SHEET</span>.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/matches/new"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Inisialisasi Pertandingan Baru</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Matches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Daftar Pertandingan</h2>
            <p className="text-xs text-slate-500">Pertandingan aktif dan arsip riwayat skor</p>
          </div>
          <Link
            href="/matches/new"
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>+ Tambah Baru</span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Memuat data pertandingan...</div>
        ) : matches.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-800">Belum ada pertandingan tercatat</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Mulai dengan membuat pertandingan baru (format 2 Tim atau 3 Tim) untuk mencatat skor langsung di lapangan.
              </p>
            </div>
            <Link
              href="/matches/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Pertandingan Pertama</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {m.matchCode}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        m.status === 'LIVE'
                          ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                          : m.status === 'COMPLETED'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  {/* Teams & Score */}
                  <div className="pt-2">
                    {m.teamStructure === 'THREE_TEAM' ? (
                      <div className="space-y-1 text-sm font-bold text-slate-800">
                        <div className="flex justify-between">
                          <span>{m.teamA.name || 'Team A'}</span>
                          <span className="text-blue-600 font-mono text-base">{m.scoreTeamA}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{m.teamB.name || 'Team B'}</span>
                          <span className="text-blue-600 font-mono text-base">{m.scoreTeamB}</span>
                        </div>
                        {m.teamC && (
                          <div className="flex justify-between">
                            <span>{m.teamC.name || 'Team C'}</span>
                            <span className="text-blue-600 font-mono text-base">{m.scoreTeamC}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between py-2 text-center">
                        <div className="flex-1 text-left">
                          <p className="text-xs text-slate-500 font-medium">Tim A</p>
                          <p className="font-bold text-slate-800 text-sm truncate">{m.teamA.name}</p>
                        </div>
                        <div className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 font-mono text-xl font-black text-slate-900 tracking-wider">
                          {m.scoreTeamA} - {m.scoreTeamB}
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-xs text-slate-500 font-medium">Tim B</p>
                          <p className="font-bold text-slate-800 text-sm truncate">{m.teamB.name}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(m.matchDate).toLocaleDateString('id-ID')}
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
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400" />
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
