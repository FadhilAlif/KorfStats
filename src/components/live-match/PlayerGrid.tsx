'use client';

import type { MatchEvent, Player } from '@/types/match';
import { GenderBadge } from '@/components/ui/GenderBadge';
import { aggregatePlayerStatsFromEvents } from '@/lib/korf-engine/korf-calculator';

interface PlayerGridProps {
  players: Player[];
  selectedPlayerId: string;
  onSelectPlayer: (playerId: string) => void;
  events: MatchEvent[];
}

export function PlayerGrid({
  players,
  selectedPlayerId,
  onSelectPlayer,
  events,
}: PlayerGridProps) {
  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
        Tidak ada pemain terdaftar di tim ini.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1.5 max-h-[480px] overflow-y-auto pr-1">
      {players.map((player) => {
        const isSelected = player.id === selectedPlayerId;
        const stats = aggregatePlayerStatsFromEvents(events, player.id);

        return (
          <button
            key={player.id}
            type="button"
            onClick={() => onSelectPlayer(player.id)}
            className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
              isSelected
                ? 'bg-brand-900 border-brand-950 text-white shadow-md ring-2 ring-brand-700/60'
                : 'bg-white border-slate-200/80 text-slate-800 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-1 w-full">
              <div className="flex items-center gap-1.5">
                <GenderBadge gender={player.gender} size="sm" />
                <span className="font-mono text-xs font-black">
                  #{player.jerseyNumber}
                </span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  isSelected ? 'bg-white/15 text-slate-100' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {stats.totalPoints} pts
              </span>
            </div>

            <p
              className={`text-xs truncate font-semibold mt-2 ${
                isSelected ? 'text-white' : 'text-slate-800'
              }`}
            >
              {player.fullName}
            </p>
          </button>
        );
      })}
    </div>
  );
}
