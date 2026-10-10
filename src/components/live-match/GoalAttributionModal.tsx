'use client';

import { Award, Shield, Check, CheckCircle } from 'lucide-react';
import type { ActionType, Player } from '@/types/match';
import { GenderBadge } from '@/components/ui/GenderBadge';
import { formatClock } from '@/lib/utils/format';
import { getGoalActionLabel } from '@/lib/korf-engine/action-types';

interface GoalAttributionModalProps {
  open: boolean;
  selectedPlayer: Player | undefined;
  pendingActionType: ActionType | null;
  gameTimeSeconds: number;
  availableTeammates: Player[];
  availableOpponents: Player[];
  selectedAssistPlayerId: string | null;
  selectedDpOpponentId: string | null;
  onSelectAssist: (playerId: string | null) => void;
  onSelectDp: (playerId: string | null) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function GoalAttributionModal({
  open,
  selectedPlayer,
  pendingActionType,
  gameTimeSeconds,
  availableTeammates,
  availableOpponents,
  selectedAssistPlayerId,
  selectedDpOpponentId,
  onSelectAssist,
  onSelectDp,
  onConfirm,
  onCancel,
}: GoalAttributionModalProps) {
  if (!open || !selectedPlayer || !pendingActionType) return null;

  const actionLabel = getGoalActionLabel(pendingActionType);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 space-y-5 shadow-raised border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-900 text-white uppercase tracking-wider">
                {actionLabel} MADE • +1
              </span>
              <span className="text-xs font-mono text-slate-500">
                {formatClock(gameTimeSeconds)}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
              <span>Goal Attribution: #{selectedPlayer.jerseyNumber} {selectedPlayer.fullName}</span>
              <GenderBadge gender={selectedPlayer.gender} size="sm" />
            </h3>
          </div>
        </div>

        {/* Section 1: Assist selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Assist By</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onSelectAssist(null)}
              className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                selectedAssistPlayerId === null
                  ? 'bg-slate-900 border-slate-950 text-white shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Solo (No Assist)</span>
            </button>

            {availableTeammates.map((mate) => {
              const isSelected = selectedAssistPlayerId === mate.id;
              return (
                <button
                  key={mate.id}
                  type="button"
                  onClick={() => onSelectAssist(mate.id)}
                  className={`p-2 rounded-xl border text-xs text-left transition flex items-center gap-2 ${
                    isSelected
                      ? 'bg-brand-700 border-brand-800 text-white shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-brand-50/60'
                  }`}
                >
                  <GenderBadge gender={mate.gender} size="xs" />
                  <span className="font-mono font-bold">#{mate.jerseyNumber}</span>
                  <span className="truncate">{mate.fullName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: DP (Defended by opponent) selector */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-brand-700" />
            <span>DP By (Defended)</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onSelectDp(null)}
              className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                selectedDpOpponentId === null
                  ? 'bg-slate-900 border-slate-950 text-white shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>None (Bebas)</span>
            </button>

            {availableOpponents.map((opp) => {
              const isSelected = selectedDpOpponentId === opp.id;
              return (
                <button
                  key={opp.id}
                  type="button"
                  onClick={() => onSelectDp(opp.id)}
                  className={`p-2 rounded-xl border text-xs text-left transition flex items-center gap-2 ${
                    isSelected
                      ? 'bg-teal-700 border-teal-800 text-white shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-teal-50/60'
                  }`}
                >
                  <GenderBadge gender={opp.gender} size="xs" />
                  <span className="font-mono font-bold">#{opp.jerseyNumber}</span>
                  <span className="truncate">{opp.fullName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Simpan Gol (+1)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
