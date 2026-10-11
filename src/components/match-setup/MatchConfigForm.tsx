'use client';

import { Trophy, Sparkles } from 'lucide-react';
import type { MatchFormat, TeamStructure } from '@/types/match';

interface MatchConfigFormProps {
  structure: TeamStructure;
  format: MatchFormat;
  matchCode: string;
  venue: string;
  onSelectStructure: (s: TeamStructure) => void;
  onSelectFormat: (f: MatchFormat) => void;
  onChangeMatchCode: (code: string) => void;
  onChangeVenue: (venue: string) => void;
  onSeedBantul: () => void;
  onClearRoster: () => void;
}

export function MatchConfigForm({
  structure,
  format,
  matchCode,
  venue,
  onSelectStructure,
  onSelectFormat,
  onChangeMatchCode,
  onChangeVenue,
  onSeedBantul,
  onClearRoster,
}: MatchConfigFormProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>1. Format Pertandingan & Informasi Laga</span>
        </h2>

        {/* Quick Seed Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onSeedBantul}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 flex items-center gap-1.5 transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              <span className="sm:hidden">⚡ Muat Tim Bantul</span>
              <span className="hidden sm:inline">⚡ Muat Roster Atlet Bantul (Didiv dkk.)</span>
            </span>
          </button>
          <button
            type="button"
            onClick={onClearRoster}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 transition shrink-0"
          >
            Kosongkan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Struktur Tim & Lembar Cetak */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Struktur Tim & Lembar Cetak
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSelectStructure('TWO_TEAM')}
              className={`py-2 px-3 rounded-lg text-xs font-bold border transition text-center ${
                structure === 'TWO_TEAM'
                  ? 'bg-brand-50 border-brand-600 text-brand-800 shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              SCORE SHEET 2 TEAM (Standar)
            </button>
            <button
              type="button"
              onClick={() => onSelectStructure('THREE_TEAM')}
              className={`py-2 px-3 rounded-lg text-xs font-bold border transition text-center ${
                structure === 'THREE_TEAM'
                  ? 'bg-brand-50 border-brand-600 text-brand-800 shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              SCORE SHEET 3 TEAM (K4 Scrimmage)
            </button>
          </div>
        </div>

        {/* Nomor Format Korfball */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nomor Format Korfball
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={structure === 'THREE_TEAM'}
              onClick={() => onSelectFormat('K8')}
              className={`py-2 px-3 rounded-lg text-xs font-bold border transition text-center ${
                format === 'K8' && structure !== 'THREE_TEAM'
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40'
              }`}
            >
              K8 (4 Putra + 4 Putri)
            </button>
            <button
              type="button"
              onClick={() => onSelectFormat('K4')}
              className={`py-2 px-3 rounded-lg text-xs font-bold border transition text-center ${
                format === 'K4'
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              K4 (2 Putra + 2 Putri)
            </button>
          </div>
        </div>

        {/* Kode / Nomor Game */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Kode / Nomor Game
          </label>
          <input
            type="text"
            required
            value={matchCode}
            onChange={(e) => onChangeMatchCode(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono font-medium"
          />
        </div>

        {/* Tempat / Venue */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tempat / Venue Pertandingan
          </label>
          <input
            type="text"
            required
            value={venue}
            onChange={(e) => onChangeVenue(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>
    </div>
  );
}
