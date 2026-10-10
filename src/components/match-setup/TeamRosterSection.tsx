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
    <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Team Name Input & Gender Status */}
        <div className="flex items-center gap-2 flex-1">
          <span
            className={`w-7 h-7 rounded-lg ${theme.solid} text-xs font-bold flex items-center justify-center shrink-0`}
          >
            {slot}
          </span>
          <input
            type="text"
            required
            value={teamName}
            onChange={(e) => onUpdateTeamName(e.target.value)}
            placeholder={`Nama Tim ${slot}`}
            className="font-bold text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-sm flex-1 max-w-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          {/* Gender Count Status Pills */}
          <div className="flex items-center gap-1.5 text-xs font-bold pl-2 shrink-0">
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
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => onAddPlayer('MALE')}
            className="text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1 rounded-md flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Laki-laki (L)</span>
          </button>
          <button
            type="button"
            onClick={() => onAddPlayer('FEMALE')}
            className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-md flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Perempuan (P)</span>
          </button>
        </div>
      </div>

      {/* Players List Grid */}
      {players.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
          Belum ada pemain di Tim {slot}. Klik tombol <strong>+ Laki-laki (L)</strong> /{' '}
          <strong>+ Perempuan (P)</strong> di atas atau gunakan tombol{' '}
          <strong>Muat Roster Atlet Bantul</strong>.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
          {players.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-slate-200 shadow-xs"
            >
              <span className="text-[10px] text-slate-400 font-mono w-4">{idx + 1}.</span>

              {/* Gender Toggle Badge L / P */}
              <GenderBadge
                gender={p.gender}
                size="md"
                onToggle={() =>
                  onUpdatePlayer(p.id, {
                    gender: p.gender === 'MALE' ? 'FEMALE' : 'MALE',
                  })
                }
              />

              {/* Jersey Number */}
              <input
                type="number"
                placeholder="No"
                value={p.jerseyNumber}
                onChange={(e) =>
                  onUpdatePlayer(p.id, {
                    jerseyNumber: e.target.value ? Number(e.target.value) : '',
                  })
                }
                className="w-11 px-1 py-1 text-xs text-center font-bold font-mono rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />

              {/* Full Name */}
              <input
                type="text"
                placeholder="Nama Pemain"
                value={p.fullName}
                onChange={(e) => onUpdatePlayer(p.id, { fullName: e.target.value })}
                className="flex-1 px-2 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
              />

              {/* Remove button */}
              <button
                type="button"
                onClick={() => onRemovePlayer(p.id)}
                className="text-slate-400 hover:text-red-500 p-1 transition"
                title="Hapus Pemain"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
