'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { Gender, PlayerDraft } from '@/types/match';
import { GenderBadge } from '@/components/ui/GenderBadge';
import type { GenderCount } from '@/lib/korf-engine/lineup-rules';
import { TEAM_THEME } from '@/lib/ui/team-theme';
import type { TeamSlot } from '@/lib/korf-engine/match-engine';

interface TeamRosterSectionProps {
  slot: TeamSlot;
  teamName: string;
  players: PlayerDraft[];
  count: GenderCount;
  targetMales: number;
  targetFemales: number;
  onUpdateTeamName: (name: string) => void;
  onAddPlayer: (gender: Gender) => void;
  onRemovePlayer: (id: string) => void;
  onUpdatePlayer: (id: string, patch: Partial<Omit<PlayerDraft, 'id'>>) => void;
}

export function TeamRosterSection({
  slot,
  teamName,
  players,
  count,
  targetMales,
  targetFemales,
  onUpdateTeamName,
  onAddPlayer,
  onRemovePlayer,
  onUpdatePlayer,
}: TeamRosterSectionProps) {
  const theme = TEAM_THEME[slot];
  const isMaleValid = count.males >= targetMales;
  const isFemaleValid = count.females >= targetFemales;

  return (
    <div className="space-y-3.5 p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Team Name Input & Gender Status */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          <span
            className={`w-7 h-7 rounded-lg ${theme.solid} text-xs font-bold flex items-center justify-center shrink-0 shadow-xs`}
          >
            {slot}
          </span>
          <input
            type="text"
            required
            value={teamName}
            onChange={(e) => onUpdateTeamName(e.target.value)}
            placeholder={`Nama Tim ${slot}`}
            className="font-bold text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-sm flex-1 min-w-[130px] max-w-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
          />

          {/* Gender Count Status Pills */}
          <div className="flex items-center gap-1.5 text-xs font-bold shrink-0">
            <span
              className={`px-2 py-0.5 rounded-md border ${
                isMaleValid
                  ? 'bg-sky-50 text-sky-800 border-sky-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              L: {count.males}/{targetMales}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md border ${
                isFemaleValid
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              P: {count.females}/{targetFemales}
            </span>
          </div>
        </div>

        {/* Add Player Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onAddPlayer('MALE')}
            className="text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Laki-laki</span>
          </button>
          <button
            type="button"
            onClick={() => onAddPlayer('FEMALE')}
            className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Perempuan</span>
          </button>
        </div>
      </div>

      {/* Players List Grid — 1 Col on Mobile, 2 Cols on Tablet & Desktop (Never cram 3 cols) */}
      {players.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
          Belum ada pemain di Tim {slot}. Klik tombol <strong>+ Laki-laki</strong> /{' '}
          <strong>+ Perempuan</strong> di atas atau gunakan tombol{' '}
          <strong>Muat Roster Atlet Bantul</strong>.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 pt-1">
          {players.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition w-full min-w-0"
            >
              <span className="text-[11px] text-slate-400 font-mono w-5 shrink-0 text-center font-bold">
                {idx + 1}.
              </span>

              {/* Gender Toggle Badge L / P */}
              <div className="shrink-0">
                <GenderBadge
                  gender={p.gender}
                  size="md"
                  onToggle={() =>
                    onUpdatePlayer(p.id, {
                      gender: p.gender === 'MALE' ? 'FEMALE' : 'MALE',
                    })
                  }
                />
              </div>

              {/* Jersey Number */}
              <div className="shrink-0">
                <input
                  type="number"
                  placeholder="No"
                  value={p.jerseyNumber}
                  onChange={(e) =>
                    onUpdatePlayer(p.id, {
                      jerseyNumber: e.target.value ? Number(e.target.value) : '',
                    })
                  }
                  className="w-12 h-8 px-1 text-xs text-center font-bold font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  title="Nomor Punggung"
                />
              </div>

              {/* Full Name Input — with min-w-0 so it NEVER pushes delete button off screen */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Nama Pemain"
                  value={p.fullName}
                  onChange={(e) => onUpdatePlayer(p.id, { fullName: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium truncate"
                />
              </div>

              {/* Remove button — always shrink-0 and clearly visible */}
              <button
                type="button"
                onClick={() => onRemovePlayer(p.id)}
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
                title="Hapus Pemain"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
