'use client';

import { Play, Pause, RotateCcw } from 'lucide-react';
import type { MatchState } from '@/types/match';
import { formatClock } from '@/lib/utils/format';
import { advancePeriod, resetClock } from '@/lib/korf-engine/match-engine';
import { TEAM_THEME } from '@/lib/ui/team-theme';

interface ScoreboardProps {
  match: MatchState;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onUpdateMatch: (reducer: (m: MatchState) => MatchState) => void;
}

export function Scoreboard({
  match,
  isTimerRunning,
  onToggleTimer,
  onUpdateMatch,
}: ScoreboardProps) {
  const isThreeTeam = match.teamStructure === 'THREE_TEAM' && match.teamC;

  return (
    <div className="rounded-2xl bg-brand-950 p-4 sm:p-5 text-white shadow-card ring-1 ring-brand-900/40">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
        {/* Teams and Scores Display */}
        <div className="flex-1 w-full flex items-center justify-around text-center divide-x divide-white/10">
          {/* Team A */}
          <div className="flex-1 px-3">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full ${TEAM_THEME.A.dot}`} />
              <p className="text-xs text-slate-300 font-medium truncate max-w-[140px] sm:max-w-[200px]">
                {match.teamA.name}
              </p>
            </div>
            <p className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white">
              {match.scoreTeamA}
            </p>
          </div>

          {/* Team B */}
          <div className="flex-1 px-3">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full ${TEAM_THEME.B.dot}`} />
              <p className="text-xs text-slate-300 font-medium truncate max-w-[140px] sm:max-w-[200px]">
                {match.teamB.name}
              </p>
            </div>
            <p className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white">
              {match.scoreTeamB}
            </p>
          </div>

          {/* Team C (if 3-team format) */}
          {isThreeTeam && match.teamC && (
            <div className="flex-1 px-3">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className={`w-2 h-2 rounded-full ${TEAM_THEME.C.dot}`} />
                <p className="text-xs text-slate-300 font-medium truncate max-w-[140px] sm:max-w-[200px]">
                  {match.teamC.name}
                </p>
              </div>
              <p className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white">
                {match.scoreTeamC}
              </p>
            </div>
          )}
        </div>

        {/* Center Clock & Period Control */}
        <div className="flex items-center gap-3 bg-brand-900/60 p-2.5 sm:p-3 rounded-xl ring-1 ring-white/10 shrink-0">
          {/* Period button */}
          <div className="text-center px-2">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Babak</p>
            <button
              onClick={() => onUpdateMatch(advancePeriod)}
              className="text-xs sm:text-sm font-bold text-amber-300 hover:text-amber-200 transition"
              title="Klik untuk lanjut babak berikutnya"
            >
              Period {match.currentPeriod}
            </button>
          </div>

          {/* Clock Display */}
          <div className="border-l border-white/15 pl-3 text-center min-w-[76px]">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Waktu</p>
            <p className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-white">
              {formatClock(match.gameTimeSeconds)}
            </p>
          </div>

          {/* Clock Controls */}
          <div className="flex items-center gap-1 border-l border-white/15 pl-2">
            <button
              onClick={onToggleTimer}
              className={`p-2 rounded-lg transition ${
                isTimerRunning
                  ? 'bg-amber-500 text-brand-950 hover:bg-amber-400'
                  : 'bg-teal-600 text-white hover:bg-teal-500'
              }`}
              title={isTimerRunning ? 'Jeda Waktu' : 'Mulai Waktu'}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onUpdateMatch(resetClock)}
              className="p-2 rounded-lg bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition"
              title="Reset Waktu ke 00:00"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
