'use client';

import { useState } from 'react';
import { Columns, ArrowUpDown, Award, Shield, Target } from 'lucide-react';
import type { MatchEvent, MatchState } from '@/types/match';
import { GenderBadge } from '@/components/ui/GenderBadge';
import { ScorePill } from '@/components/ui/ScorePill';
import { formatClock } from '@/lib/utils/format';
import { getGoalActionLabel } from '@/lib/korf-engine/action-types';
import { TEAM_THEME } from '@/lib/ui/team-theme';

interface RunningScoreFeedProps {
  match: MatchState;
}

export function RunningScoreFeed({ match }: RunningScoreFeedProps) {
  const [styleMode, setStyleMode] = useState<'TIMELINE' | 'COLUMNS'>('TIMELINE');
  const [sortOrder, setSortOrder] = useState<'NEWEST_FIRST' | 'CHRONOLOGICAL'>('NEWEST_FIRST');

  const activeEvents = match.events.filter((e) => !e.isDeleted);
  const rawGoalEvents = activeEvents.filter((e) => e.pointsAwarded > 0);

  const sortedGoals = [...rawGoalEvents].sort((a, b) =>
    sortOrder === 'NEWEST_FIRST'
      ? b.gameTimeSeconds - a.gameTimeSeconds
      : a.gameTimeSeconds - b.gameTimeSeconds
  );

  const goalsA = rawGoalEvents.filter((e) => e.teamId === match.teamA.id);
  const goalsB = rawGoalEvents.filter((e) => e.teamId === match.teamB.id);
  const goalsC = match.teamC ? rawGoalEvents.filter((e) => e.teamId === match.teamC!.id) : [];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-card space-y-3">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
            Running Score Live
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {rawGoalEvents.length} Gol
          </span>
        </div>

        {/* View mode & sort order controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setStyleMode('TIMELINE')}
              className={`px-2 py-1 rounded transition ${
                styleMode === 'TIMELINE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Gaya Timeline Kanan Kiri"
            >
              Kanan-Kiri
            </button>
            <button
              type="button"
              onClick={() => setStyleMode('COLUMNS')}
              className={`px-2 py-1 rounded transition flex items-center gap-1 ${
                styleMode === 'COLUMNS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Gaya Kolom Berdampingan"
            >
              <Columns className="w-3 h-3" />
              <span>2 Kolom</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              setSortOrder(sortOrder === 'NEWEST_FIRST' ? 'CHRONOLOGICAL' : 'NEWEST_FIRST')
            }
            className="p-1 px-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-bold flex items-center gap-1"
            title={sortOrder === 'NEWEST_FIRST' ? 'Urutan: Terbaru di atas' : 'Urutan: Dari awal'}
          >
            <ArrowUpDown className="w-3 h-3" />
            <span className="hidden sm:inline">
              {sortOrder === 'NEWEST_FIRST' ? 'Terbaru' : 'Awal'}
            </span>
          </button>
        </div>
      </div>

      {/* Matchup Score Strip */}
      <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-brand-700 text-white shrink-0">
            HOME
          </span>
          <span className="font-bold text-slate-800 truncate block">{match.teamA.name}</span>
          <span className="ml-auto font-mono font-black text-sm text-brand-800 bg-brand-100 px-2 py-0.2 rounded shrink-0">
            {match.scoreTeamA}
          </span>
        </div>

        <div className="flex items-center gap-2 justify-end border-l border-slate-200 pl-2 min-w-0">
          <span className="font-mono font-black text-sm text-teal-800 bg-teal-100 px-2 py-0.2 rounded shrink-0">
            {match.scoreTeamB}
          </span>
          <span className="font-bold text-slate-800 truncate block text-right">
            {match.teamB.name}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-teal-700 text-white shrink-0">
            AWAY
          </span>
        </div>
      </div>

      {/* Empty State */}
      {rawGoalEvents.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs space-y-1 border border-dashed border-slate-200 rounded-xl">
          <Target className="w-7 h-7 mx-auto mb-2 text-slate-300" />
          <p className="font-semibold text-slate-600">Belum ada gol tercatat</p>
          <p className="text-[11px] text-slate-400">
            Catat tembakan Made untuk melihat alur running score live.
          </p>
        </div>
      ) : styleMode === 'TIMELINE' ? (
        /* STYLE 1: TIMELINE KANAN - KIRI */
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {sortedGoals.map((g) => {
            const isTeamA = g.teamId === match.teamA.id;
            const isTeamB = g.teamId === match.teamB.id;
            const actionLabel = getGoalActionLabel(g.actionType);

            // Home Goal (Team A) -> Sisi KIRI
            if (isTeamA) {
              return (
                <div key={g.id} className="flex justify-start w-full">
                  <div className="w-full max-w-[92%] sm:max-w-[88%] rounded-xl p-2.5 border border-slate-200/90 border-l-4 border-l-brand-600 bg-gradient-to-r from-brand-50/70 via-white to-white shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-1.5 text-xs">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-brand-700 text-white uppercase shrink-0">
                          HOME
                        </span>
                        <GenderBadge gender={g.playerGender} size="xs" />
                        <span className="font-extrabold text-slate-900 truncate">
                          #{g.playerJersey} {g.playerName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold shrink-0">
                        P{g.period} • {formatClock(g.gameTimeSeconds)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded font-black border bg-slate-900 text-white border-slate-900 text-[9px] uppercase">
                        {actionLabel}
                      </span>
                      {g.assistPlayerName ? (
                        <span className="text-amber-900 font-semibold flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          <Award className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Assist: #{g.assistPlayerJersey} {g.assistPlayerName}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Solo (No Assist)</span>
                      )}
                      <span className="text-slate-600 flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                        <Shield className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>
                          DP: {g.opponentPlayerJersey ? `#${g.opponentPlayerJersey} ${g.opponentPlayerName}` : 'Tanpa Penjaga'}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Kumulatif: <span className="font-mono font-bold text-slate-800">({g.runningScoreA} - {g.runningScoreB})</span>
                      </span>
                      <ScorePill value={g.runningScoreA} label="Score" />
                    </div>
                  </div>
                </div>
              );
            }

            // Away Goal (Team B) -> Sisi KANAN
            if (isTeamB) {
              return (
                <div key={g.id} className="flex justify-end w-full">
                  <div className="w-full max-w-[92%] sm:max-w-[88%] rounded-xl p-2.5 border border-slate-200/90 border-r-4 border-r-teal-600 bg-gradient-to-l from-teal-50/70 via-white to-white shadow-xs space-y-1.5 text-right">
                    <div className="flex items-center justify-between gap-1.5 text-xs">
                      <span className="text-[10px] font-mono text-slate-500 font-bold shrink-0">
                        P{g.period} • {formatClock(g.gameTimeSeconds)}
                      </span>
                      <div className="flex items-center gap-1.5 truncate justify-end">
                        <span className="font-extrabold text-slate-900 truncate">
                          #{g.playerJersey} {g.playerName}
                        </span>
                        <GenderBadge gender={g.playerGender} size="xs" />
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-teal-700 text-white uppercase shrink-0">
                          AWAY
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-0.5 text-[10px]">
                      <span className="text-slate-600 flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                        <span>
                          DP: {g.opponentPlayerJersey ? `#${g.opponentPlayerJersey} ${g.opponentPlayerName}` : 'Tanpa Penjaga'}
                        </span>
                        <Shield className="w-3 h-3 text-slate-400 shrink-0" />
                      </span>
                      {g.assistPlayerName ? (
                        <span className="text-amber-900 font-semibold flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          <span>Assist: #{g.assistPlayerJersey} {g.assistPlayerName}</span>
                          <Award className="w-3 h-3 text-amber-600 shrink-0" />
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Solo (No Assist)</span>
                      )}
                      <span className="px-1.5 py-0.5 rounded font-black border bg-slate-900 text-white border-slate-900 text-[9px] uppercase">
                        {actionLabel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <ScorePill value={g.runningScoreB} label="Score" />
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Kumulatif: <span className="font-mono font-bold text-slate-800">({g.runningScoreA} - {g.runningScoreB})</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            // Team C Goal (If 3-team match)
            return (
              <div key={g.id} className="flex justify-center w-full">
                <div className="w-full max-w-[92%] sm:max-w-[88%] rounded-xl p-2.5 border border-amber-300 border-y-2 border-y-amber-600 bg-amber-50/80 shadow-xs space-y-1.5 text-center">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-600 text-white uppercase">
                      TEAM C
                    </span>
                    <span className="font-extrabold text-slate-900">
                      #{g.playerJersey} {g.playerName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      P{g.period} • {formatClock(g.gameTimeSeconds)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded font-black border bg-slate-900 text-white text-[9px]">
                      {actionLabel}
                    </span>
                    {g.assistPlayerName && (
                      <span className="text-amber-900 font-semibold">
                        Assist: #{g.assistPlayerJersey} {g.assistPlayerName}
                      </span>
                    )}
                    <span className="text-slate-600">
                      DP: {g.opponentPlayerJersey ? `#${g.opponentPlayerJersey} ${g.opponentPlayerName}` : 'Tanpa DP'}
                    </span>
                  </div>
                  <div className="flex justify-center pt-1 border-t border-amber-200">
                    <ScorePill value={g.runningScoreC} label="Score" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* STYLE 2: DUAL COLUMN (2 KOLOM BERDAMPINGAN) */
        <div className="grid grid-cols-2 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
          {/* Kolom Home */}
          <div className="space-y-2">
            <div className="bg-brand-700 text-white text-[11px] font-black p-1.5 rounded-lg text-center uppercase tracking-wide truncate">
              {match.teamA.name} ({goalsA.length})
            </div>
            {goalsA.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-[11px] border border-dashed border-slate-200 rounded-lg">
                Belum ada gol
              </div>
            ) : (
              goalsA.map((g) => (
                <div
                  key={g.id}
                  className="p-2 rounded-lg border border-slate-200 bg-white space-y-1.5 text-left text-xs shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <ScorePill value={g.runningScoreA} />
                    <span className="text-[10px] font-mono text-slate-500">
                      {formatClock(g.gameTimeSeconds)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-slate-900 truncate">
                    <GenderBadge gender={g.playerGender} size="xs" />
                    <span className="truncate">#{g.playerJersey} {g.playerName}</span>
                  </div>
                  <div className="text-[9px] text-slate-500 flex items-center gap-1">
                    <span className="px-1 py-0.2 rounded font-bold bg-slate-100 text-slate-800">
                      {getGoalActionLabel(g.actionType)}
                    </span>
                  </div>
                  {g.assistPlayerName && (
                    <p className="text-[9px] text-amber-800 font-semibold truncate flex items-center gap-1">
                      <Award className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                      <span className="truncate">Ast: #{g.assistPlayerJersey} {g.assistPlayerName}</span>
                    </p>
                  )}
                  <p className="text-[9px] text-slate-600 truncate flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      DP: {g.opponentPlayerJersey ? `#${g.opponentPlayerJersey} ${g.opponentPlayerName}` : 'Tanpa DP'}
                    </span>
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Kolom Away */}
          <div className="space-y-2">
            <div className="bg-teal-700 text-white text-[11px] font-black p-1.5 rounded-lg text-center uppercase tracking-wide truncate">
              {match.teamB.name} ({goalsB.length})
            </div>
            {goalsB.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-[11px] border border-dashed border-slate-200 rounded-lg">
                Belum ada gol
              </div>
            ) : (
              goalsB.map((g) => (
                <div
                  key={g.id}
                  className="p-2 rounded-lg border border-slate-200 bg-white space-y-1.5 text-left text-xs shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <ScorePill value={g.runningScoreB} />
                    <span className="text-[10px] font-mono text-slate-500">
                      {formatClock(g.gameTimeSeconds)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-slate-900 truncate">
                    <GenderBadge gender={g.playerGender} size="xs" />
                    <span className="truncate">#{g.playerJersey} {g.playerName}</span>
                  </div>
                  <div className="text-[9px] text-slate-500 flex items-center gap-1">
                    <span className="px-1 py-0.2 rounded font-bold bg-slate-100 text-slate-800">
                      {getGoalActionLabel(g.actionType)}
                    </span>
                  </div>
                  {g.assistPlayerName && (
                    <p className="text-[9px] text-amber-800 font-semibold truncate flex items-center gap-1">
                      <Award className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                      <span className="truncate">Ast: #{g.assistPlayerJersey} {g.assistPlayerName}</span>
                    </p>
                  )}
                  <p className="text-[9px] text-slate-600 truncate flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      DP: {g.opponentPlayerJersey ? `#${g.opponentPlayerJersey} ${g.opponentPlayerName}` : 'Tanpa DP'}
                    </span>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
