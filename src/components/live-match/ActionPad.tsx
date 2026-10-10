'use client';

import { Target, Shield, Undo2 } from 'lucide-react';
import type { ActionType, Player } from '@/types/match';
import { GenderBadge } from '@/components/ui/GenderBadge';
import { GENERAL_ACTIONS, SHOT_TYPES } from '@/lib/korf-engine/action-types';

interface ActionPadProps {
  selectedPlayer: Player | undefined;
  canUndo: boolean;
  onActionClick: (actionType: ActionType) => void;
  onQuickUndo: () => void;
}

export function ActionPad({
  selectedPlayer,
  canUndo,
  onActionClick,
  onQuickUndo,
}: ActionPadProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-card space-y-4">
      {/* Selected Player Info Strip + Quick Undo */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Pemain Terpilih
          </span>
          <div className="flex items-center gap-2 mt-0.5 min-w-0">
            {selectedPlayer ? (
              <>
                <GenderBadge gender={selectedPlayer.gender} size="sm" />
                <span className="text-sm font-extrabold text-slate-900 truncate">
                  #{selectedPlayer.jerseyNumber} {selectedPlayer.fullName}
                </span>
              </>
            ) : (
              <span className="text-xs font-semibold text-slate-400 italic">
                Pilih atlet dari lineup di sebelah kiri
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onQuickUndo}
          disabled={!canUndo}
          className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100 transition flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none shrink-0"
          title="Undo Aksi Terakhir"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>Undo</span>
        </button>
      </div>

      {/* 5 Shot Types: Distinct Corporate Color Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <span className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-brand-700" />
            <span>Shooting</span>
          </span>
          <span className="text-[10px] font-normal text-slate-400">+1 Goal • Attempt</span>
        </div>

        <div className="space-y-2">
          {SHOT_TYPES.map((st) => (
            <div
              key={st.key}
              className={`p-2.5 rounded-xl border transition ${st.containerClass}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider ${st.badgeClass}`}
                >
                  {st.label}
                </span>
                <span className="text-[9px] font-medium text-slate-400">
                  {st.key === 'SHOOT' ? 'Reguler' : st.key === 'RUNNING_IN' ? 'Layup / Drive' : 'Pelanggaran / Set'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Made Button (+1 Goal) */}
                <button
                  type="button"
                  disabled={!selectedPlayer}
                  onClick={() => onActionClick(st.made)}
                  className={`py-2 px-3 rounded-lg font-black text-xs transition active:scale-98 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-between ${st.madeClass}`}
                >
                  <span className="tracking-wide">MADE</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/20 ${st.subtextMade}`}>
                    +1
                  </span>
                </button>

                {/* Miss / Attempt Button */}
                <button
                  type="button"
                  disabled={!selectedPlayer}
                  onClick={() => onActionClick(st.miss)}
                  className={`py-2 px-3 rounded-lg font-bold text-xs shadow-xs transition active:scale-98 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-between ${st.missClass}`}
                >
                  <span className="tracking-wide">ATTEMPT</span>
                  <span className={`text-[10px] font-medium ${st.subtextMiss}`}>
                    Miss
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* General Actions: Rebounds, Ball Control & Fouls */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <Shield className="w-3.5 h-3.5 text-brand-700" />
          <span>Rebound & Ball Control</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {GENERAL_ACTIONS.map((ga) => {
            const isFoul = ga.action === 'FOUL';
            const isTurnover = ga.action === 'TURNOVER';
            const isPositive = ga.tone === 'positive';

            return (
              <button
                key={ga.action}
                type="button"
                disabled={!selectedPlayer}
                onClick={() => onActionClick(ga.action)}
                className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition active:scale-98 disabled:opacity-40 disabled:pointer-events-none text-center truncate ${
                  isFoul
                    ? 'bg-rose-50/70 border-rose-200 text-rose-700 hover:bg-rose-100'
                    : isTurnover
                    ? 'bg-amber-50/70 border-amber-200 text-amber-800 hover:bg-amber-100'
                    : isPositive
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800 hover:bg-emerald-100/70'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {ga.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
