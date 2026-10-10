'use client';

import type { MatchState } from '@/types/match';
import { formatClock, formatDateId } from '@/lib/utils/format';
import {
  aggregatePlayerStatsFromEvents,
  getScoreSheetRowValues,
} from '@/lib/korf-engine/korf-calculator';

interface BorangMatrixViewProps {
  match: MatchState;
}

/**
 * Komponen Pratinjau Borang Matrix Persis PRINT SCORE SHEET.xlsx
 * Menampilkan Tabel Pemain di sebelah KIRI dan Tabel RUNNING SCORE di sebelah KANAN
 */
export function BorangMatrixView({ match }: BorangMatrixViewProps) {
  // Goals extraction per team
  const goalsA = match.events
    .filter((e) => !e.isDeleted && e.pointsAwarded > 0 && e.teamId === match.teamA.id)
    .sort((a, b) => a.gameTimeSeconds - b.gameTimeSeconds);

  const goalsB = match.events
    .filter((e) => !e.isDeleted && e.pointsAwarded > 0 && e.teamId === match.teamB.id)
    .sort((a, b) => a.gameTimeSeconds - b.gameTimeSeconds);

  const goalsC = match.teamC
    ? match.events
        .filter((e) => !e.isDeleted && e.pointsAwarded > 0 && e.teamId === match.teamC!.id)
        .sort((a, b) => a.gameTimeSeconds - b.gameTimeSeconds)
    : [];

  const isThreeTeam = match.teamStructure === 'THREE_TEAM';
  const totalRunningRows = isThreeTeam
    ? Math.max(21, goalsA.length, goalsB.length, goalsC.length)
    : Math.max(31, goalsA.length, goalsB.length);

  return (
    <div className="bg-white rounded-2xl border border-slate-300 p-4 sm:p-6 shadow-md space-y-4">
      {/* Header Info & Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
            BORANG VIEW — REPLIKA FISIK
          </span>
          <h2 className="text-lg font-black text-slate-900 mt-1">
            {isThreeTeam ? 'SCORE SHEET 3 TEAM' : 'SCORE SHEET 2 TEAM'} — {match.matchCode}
          </h2>
          <p className="text-xs text-slate-500">
            Venue: {match.venue || 'Bantul'} • Tanggal: {formatDateId(match.matchDate)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition shadow-xs flex items-center gap-1.5"
          >
            <span>🖨️</span>
            <span>Cetak Lembar Skor</span>
          </button>
        </div>
      </div>

      {/* Main Container: Exact Grid side-by-side like Excel */}
      <div className="overflow-x-auto">
        <div className="min-w-[1150px] border-2 border-slate-900 bg-white p-3 space-y-3 font-sans">
          {/* Title Row (Matching A2:V2 in Excel) */}
          <div className="bg-slate-100 border border-slate-900 py-1.5 text-center">
            <h1 className="text-sm font-black tracking-widest uppercase text-slate-900">
              STATISTIK GAME
            </h1>
          </div>

          {/* Grid: Left (Player Stats) + Right (Running Score) */}
          <div className="grid grid-cols-12 gap-3 items-start">
            {/* LEFT SIDE: Player Stats Tables (7 cols) */}
            <div className="col-span-7 space-y-3">
              {/* TEAM A Table */}
              <div className="space-y-1">
                <div className="font-bold text-xs text-slate-900 uppercase">
                  TEAM A: {match.teamA.name}
                </div>
                <table className="w-full text-[10px] border-collapse border border-slate-900 text-center leading-tight">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-900">
                      <th rowSpan={2} className="border border-slate-900 p-1 w-6">NO</th>
                      <th rowSpan={2} className="border border-slate-900 p-1 text-left w-36">NAMA</th>
                      <th colSpan={2} className="border border-slate-900 p-0.5">SHOOT</th>
                      <th colSpan={2} className="border border-slate-900 p-0.5">RUNNING IN</th>
                      <th colSpan={2} className="border border-slate-900 p-0.5">PINALTY/FS</th>
                      <th colSpan={2} className="border border-slate-900 p-0.5">REBOUND</th>
                      <th rowSpan={2} className="border border-slate-900 p-0.5 w-7">ASSIST</th>
                      <th rowSpan={2} className="border border-slate-900 p-0.5 w-7">INTERCEPT</th>
                      <th rowSpan={2} className="border border-slate-900 p-0.5 w-7">TURN OVER</th>
                      <th rowSpan={2} className="border border-slate-900 p-0.5 w-6">FOUL</th>
                    </tr>
                    <tr className="bg-slate-100 font-bold border-b border-slate-900">
                      <th className="border border-slate-900 p-0.5 w-6">M</th>
                      <th className="border border-slate-900 p-0.5 w-6">A</th>
                      <th className="border border-slate-900 p-0.5 w-6">M</th>
                      <th className="border border-slate-900 p-0.5 w-6">A</th>
                      <th className="border border-slate-900 p-0.5 w-6">M</th>
                      <th className="border border-slate-900 p-0.5 w-6">A</th>
                      <th className="border border-slate-900 p-0.5 w-6">OFF</th>
                      <th className="border border-slate-900 p-0.5 w-6">DEF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(match.teamA.players || []).map((p) => {
                      const stats = aggregatePlayerStatsFromEvents(match.events, p.id);
                      const r = getScoreSheetRowValues(stats);
                      const isMale = p.gender === 'MALE';
                      return (
                        <tr key={p.id} className="hover:bg-slate-50 border-b border-slate-900">
                          <td className="border border-slate-900 p-1 font-mono font-bold">{p.jerseyNumber}</td>
                          <td className="border border-slate-900 p-1 text-left font-medium truncate">
                            <span
                              className={`inline-block w-3.5 h-3.5 rounded text-[8px] font-black text-center leading-3.5 mr-1 ${
                                isMale ? 'bg-sky-700 text-white' : 'bg-rose-600 text-white'
                              }`}
                            >
                              {isMale ? 'L' : 'P'}
                            </span>
                            {p.fullName}
                          </td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.shootM || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.shootA || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.runningInM || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.runningInA || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.pinaltyFsM || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.pinaltyFsA || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.rebOff || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.rebDef || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.assist || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.intercept || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.turnover || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.foul || ''}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* TEAM B Table */}
              <div className="space-y-1 pt-1">
                <div className="font-bold text-xs text-slate-900 uppercase">
                  TEAM B: {match.teamB.name}
                </div>
                <table className="w-full text-[10px] border-collapse border border-slate-900 text-center leading-tight">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-900">
                      <th rowSpan={2} className="border border-slate-900 p-1 w-6">NO</th>
                      <th rowSpan={2} className="border border-slate-900 p-1 text-left w-36">NAMA</th>
                      <th colSpan={2} className="border border-slate-900 p-0.5">SHOOT</th>
                      <th colSpan={2} className="border border-slate-900 p-0.5">RUNNING IN</th>
                      <th colSpan={2} className="border border-slate-900 p-0.5">PINALTY/FS</th>
                      <th colSpan={2} className="border border-slate-900 p-0.5">REBOUND</th>
                      <th rowSpan={2} className="border border-slate-900 p-0.5 w-7">ASSIST</th>
                      <th rowSpan={2} className="border border-slate-900 p-0.5 w-7">INTERCEPT</th>
                      <th rowSpan={2} className="border border-slate-900 p-0.5 w-7">TURN OVER</th>
                      <th rowSpan={2} className="border border-slate-900 p-0.5 w-6">FOUL</th>
                    </tr>
                    <tr className="bg-slate-100 font-bold border-b border-slate-900">
                      <th className="border border-slate-900 p-0.5 w-6">M</th>
                      <th className="border border-slate-900 p-0.5 w-6">A</th>
                      <th className="border border-slate-900 p-0.5 w-6">M</th>
                      <th className="border border-slate-900 p-0.5 w-6">A</th>
                      <th className="border border-slate-900 p-0.5 w-6">M</th>
                      <th className="border border-slate-900 p-0.5 w-6">A</th>
                      <th className="border border-slate-900 p-0.5 w-6">OFF</th>
                      <th className="border border-slate-900 p-0.5 w-6">DEF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(match.teamB.players || []).map((p) => {
                      const stats = aggregatePlayerStatsFromEvents(match.events, p.id);
                      const r = getScoreSheetRowValues(stats);
                      const isMale = p.gender === 'MALE';
                      return (
                        <tr key={p.id} className="hover:bg-slate-50 border-b border-slate-900">
                          <td className="border border-slate-900 p-1 font-mono font-bold">{p.jerseyNumber}</td>
                          <td className="border border-slate-900 p-1 text-left font-medium truncate">
                            <span
                              className={`inline-block w-3.5 h-3.5 rounded text-[8px] font-black text-center leading-3.5 mr-1 ${
                                isMale ? 'bg-sky-700 text-white' : 'bg-rose-600 text-white'
                              }`}
                            >
                              {isMale ? 'L' : 'P'}
                            </span>
                            {p.fullName}
                          </td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.shootM || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.shootA || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.runningInM || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.runningInA || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.pinaltyFsM || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.pinaltyFsA || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.rebOff || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.rebDef || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.assist || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.intercept || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.turnover || ''}</td>
                          <td className="border border-slate-900 p-0.5 font-mono">{r.foul || ''}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* TEAM C Table (If 3-team) */}
              {isThreeTeam && match.teamC && (
                <div className="space-y-1 pt-1">
                  <div className="font-bold text-xs text-slate-900 uppercase">
                    TEAM C: {match.teamC.name}
                  </div>
                  <table className="w-full text-[10px] border-collapse border border-slate-900 text-center leading-tight">
                    <thead>
                      <tr className="bg-slate-100 font-bold border-b border-slate-900">
                        <th rowSpan={2} className="border border-slate-900 p-1 w-6">NO</th>
                        <th rowSpan={2} className="border border-slate-900 p-1 text-left w-36">NAMA</th>
                        <th colSpan={2} className="border border-slate-900 p-0.5">SHOOT</th>
                        <th colSpan={2} className="border border-slate-900 p-0.5">RUNNING IN</th>
                        <th colSpan={2} className="border border-slate-900 p-0.5">PINALTY/FS</th>
                        <th colSpan={2} className="border border-slate-900 p-0.5">REBOUND</th>
                        <th rowSpan={2} className="border border-slate-900 p-0.5 w-7">ASSIST</th>
                        <th rowSpan={2} className="border border-slate-900 p-0.5 w-7">INTERCEPT</th>
                        <th rowSpan={2} className="border border-slate-900 p-0.5 w-7">TURN OVER</th>
                        <th rowSpan={2} className="border border-slate-900 p-0.5 w-6">FOUL</th>
                      </tr>
                      <tr className="bg-slate-100 font-bold border-b border-slate-900">
                        <th className="border border-slate-900 p-0.5 w-6">M</th>
                        <th className="border border-slate-900 p-0.5 w-6">A</th>
                        <th className="border border-slate-900 p-0.5 w-6">M</th>
                        <th className="border border-slate-900 p-0.5 w-6">A</th>
                        <th className="border border-slate-900 p-0.5 w-6">M</th>
                        <th className="border border-slate-900 p-0.5 w-6">A</th>
                        <th className="border border-slate-900 p-0.5 w-6">OFF</th>
                        <th className="border border-slate-900 p-0.5 w-6">DEF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(match.teamC.players || []).map((p) => {
                        const stats = aggregatePlayerStatsFromEvents(match.events, p.id);
                        const r = getScoreSheetRowValues(stats);
                        const isMale = p.gender === 'MALE';
                        return (
                          <tr key={p.id} className="hover:bg-slate-50 border-b border-slate-900">
                            <td className="border border-slate-900 p-1 font-mono font-bold">{p.jerseyNumber}</td>
                            <td className="border border-slate-900 p-1 text-left font-medium truncate">
                              <span
                                className={`inline-block w-3.5 h-3.5 rounded text-[8px] font-black text-center leading-3.5 mr-1 ${
                                  isMale ? 'bg-sky-700 text-white' : 'bg-rose-600 text-white'
                                }`}
                              >
                                {isMale ? 'L' : 'P'}
                              </span>
                              {p.fullName}
                            </td>
                            <td className="border border-slate-900 p-0.5 font-mono">{r.shootM || ''}</td>
                            <td className="border border-slate-900 p-0.5 font-mono">{r.shootA || ''}</td>
                            <td className="border border-slate-900 p-0.5 font-mono">{r.runningInM || ''}</td>
                            <td className="border border-slate-900 p-0.5 font-mono">{r.runningInA || ''}</td>
                            <td className="border border-slate-900 p-0.5 font-mono">{r.pinaltyFsM || ''}</td>
                            <td className="border border-slate-900 p-0.5 font-mono">{r.pinaltyFsA || ''}</td>
                            <td className="border border-slate-900 p-0.5 font-mono">{r.rebOff || ''}</td>
                            <td className="border border-slate-900 p-0.5 font-mono">{r.rebDef || ''}</td>
                            <td className="border border-slate-900 p-0.5 font-mono">{r.assist || ''}</td>
                            <td className="border border-slate-900 p-0.5 font-mono">{r.intercept || ''}</td>
                            <td className="border border-slate-900 p-0.5 font-mono">{r.turnover || ''}</td>
                            <td className="border border-slate-900 p-0.5 font-mono">{r.foul || ''}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* RIGHT SIDE: RUNNING SCORE TABLE */}
            <div className="col-span-5 space-y-1">
              <div className="font-bold text-xs text-slate-900 uppercase">
                RUNNING SCORE
              </div>

              <table className="w-full text-[10px] border-collapse border border-slate-900 text-center leading-tight">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-900">
                    <th colSpan={4} className="border border-slate-900 p-1 uppercase truncate">
                      {match.teamA.name || 'TEAM A'}
                    </th>
                    <th colSpan={4} className="border border-slate-900 p-1 uppercase truncate">
                      {match.teamB.name || 'TEAM B'}
                    </th>
                    {isThreeTeam && match.teamC && (
                      <th colSpan={4} className="border border-slate-900 p-1 uppercase truncate">
                        {match.teamC.name || 'TEAM C'}
                      </th>
                    )}
                  </tr>

                  <tr className="bg-slate-100 font-bold border-b border-slate-900">
                    {/* Team A: DP | TIME | NAME | SCORE */}
                    <th className="border border-slate-900 p-0.5 w-9">DP</th>
                    <th className="border border-slate-900 p-0.5 w-10">TIME</th>
                    <th className="border border-slate-900 p-0.5 w-20 text-left pl-1">NAME</th>
                    <th className="border border-slate-900 p-0.5 w-8 bg-[#FFFF00] text-slate-950 font-black">
                      SCORE
                    </th>

                    {/* Team B: SCORE | NAME | TIME | DP */}
                    <th className="border border-slate-900 p-0.5 w-8 bg-[#FFFF00] text-slate-950 font-black">
                      SCORE
                    </th>
                    <th className="border border-slate-900 p-0.5 w-20 text-left pl-1">NAME</th>
                    <th className="border border-slate-900 p-0.5 w-10">TIME</th>
                    <th className="border border-slate-900 p-0.5 w-9">DP</th>

                    {/* Team C (If 3-team) */}
                    {isThreeTeam && (
                      <>
                        <th className="border border-slate-900 p-0.5 w-8 bg-[#FFFF00] text-slate-950 font-black">
                          SCORE
                        </th>
                        <th className="border border-slate-900 p-0.5 w-20 text-left pl-1">NAME</th>
                        <th className="border border-slate-900 p-0.5 w-10">TIME</th>
                        <th className="border border-slate-900 p-0.5 w-9">DP</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {Array.from({ length: totalRunningRows }).map((_, idx) => {
                    const goalA = goalsA[idx];
                    const goalB = goalsB[idx];
                    const goalC = goalsC[idx];

                    const dpA = goalA
                      ? goalA.opponentPlayerJersey
                        ? `#${goalA.opponentPlayerJersey}`
                        : goalA.opponentPlayerName?.split(' ')[0] || '-'
                      : '';
                    const timeA = goalA ? formatClock(goalA.gameTimeSeconds) : '';
                    const nameA = goalA ? goalA.playerName?.split(' ')[0] || '' : '';
                    const scoreA = goalA ? goalA.runningScoreA : '';

                    const dpB = goalB
                      ? goalB.opponentPlayerJersey
                        ? `#${goalB.opponentPlayerJersey}`
                        : goalB.opponentPlayerName?.split(' ')[0] || '-'
                      : '';
                    const timeB = goalB ? formatClock(goalB.gameTimeSeconds) : '';
                    const nameB = goalB ? goalB.playerName?.split(' ')[0] || '' : '';
                    const scoreB = goalB ? goalB.runningScoreB : '';

                    const dpC = goalC
                      ? goalC.opponentPlayerJersey
                        ? `#${goalC.opponentPlayerJersey}`
                        : goalC.opponentPlayerName?.split(' ')[0] || '-'
                      : '';
                    const timeC = goalC ? formatClock(goalC.gameTimeSeconds) : '';
                    const nameC = goalC ? goalC.playerName?.split(' ')[0] || '' : '';
                    const scoreC = goalC ? goalC.runningScoreC : '';

                    return (
                      <tr key={idx} className="border-b border-slate-900 hover:bg-slate-50 h-5">
                        {/* Team A columns */}
                        <td className="border border-slate-900 p-0.5 text-center text-[9px] font-mono">{dpA}</td>
                        <td className="border border-slate-900 p-0.5 text-center font-mono text-[9px]">{timeA}</td>
                        <td className="border border-slate-900 p-0.5 text-left pl-1 truncate text-[9px] font-medium">{nameA}</td>
                        <td className="border border-slate-900 p-0.5 text-center font-mono font-black text-[10px] bg-[#FFFF00] text-slate-950">
                          {scoreA}
                        </td>

                        {/* Team B columns */}
                        <td className="border border-slate-900 p-0.5 text-center font-mono font-black text-[10px] bg-[#FFFF00] text-slate-950">
                          {scoreB}
                        </td>
                        <td className="border border-slate-900 p-0.5 text-left pl-1 truncate text-[9px] font-medium">{nameB}</td>
                        <td className="border border-slate-900 p-0.5 text-center font-mono text-[9px]">{timeB}</td>
                        <td className="border border-slate-900 p-0.5 text-center text-[9px] font-mono">{dpB}</td>

                        {/* Team C columns */}
                        {isThreeTeam && (
                          <>
                            <td className="border border-slate-900 p-0.5 text-center font-mono font-black text-[10px] bg-[#FFFF00] text-slate-950">
                              {scoreC}
                            </td>
                            <td className="border border-slate-900 p-0.5 text-left pl-1 truncate text-[9px] font-medium">{nameC}</td>
                            <td className="border border-slate-900 p-0.5 text-center font-mono text-[9px]">{timeC}</td>
                            <td className="border border-slate-900 p-0.5 text-center text-[9px] font-mono">{dpC}</td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
