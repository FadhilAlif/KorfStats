'use client';

import type { Player, Team } from '@/types/match';

interface ReboundModalProps {
  open: boolean;
  currentTeam: Team;
  opponentTeams: Team[];
  onAssignRebound: (player: Player, isOffensive: boolean) => void;
  onClose: () => void;
}

export function ReboundModal({
  open,
  currentTeam,
  opponentTeams,
  onAssignRebound,
  onClose,
}: ReboundModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-raised border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full uppercase">
              MISSED SHOT
            </span>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
              Rebound By
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
          >
            Lewati (Dead Ball)
          </button>
        </div>

        <div className="space-y-3.5">
          {/* Offensive Rebound (Tim Penembak) */}
          <div>
            <p className="text-[11px] font-bold text-brand-700 uppercase mb-1.5 flex items-center gap-1">
              <span>Offensive Rebound •</span>
              <span className="text-slate-600 font-medium normal-case">{currentTeam.name}</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(currentTeam.players || []).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onAssignRebound(p, true)}
                  className="p-1.5 px-2 rounded-lg border border-slate-200 hover:bg-brand-50 hover:border-brand-300 text-left text-xs truncate font-medium flex items-center gap-1 transition"
                >
                  <span className="font-mono font-bold text-slate-900">#{p.jerseyNumber}</span>
                  <span className="truncate text-slate-700">{p.fullName.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Defensive Rebound (Lawan) */}
          {opponentTeams.map((opp) => (
            <div key={opp.id}>
              <p className="text-[11px] font-bold text-teal-700 uppercase mb-1.5 flex items-center gap-1">
                <span>Defensive Rebound •</span>
                <span className="text-slate-600 font-medium normal-case">{opp.name}</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(opp.players || []).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onAssignRebound(p, false)}
                    className="p-1.5 px-2 rounded-lg border border-slate-200 hover:bg-teal-50 hover:border-teal-300 text-left text-xs truncate font-medium flex items-center gap-1 transition"
                  >
                    <span className="font-mono font-bold text-slate-900">#{p.jerseyNumber}</span>
                    <span className="truncate text-slate-700">{p.fullName.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            Lewati / Dead Ball
          </button>
        </div>
      </div>
    </div>
  );
}
