'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { localDb } from '@/lib/local-db/dexie-db';
import { ActionType, MatchEvent, MatchState, Player } from '@/types/match';
import { aggregatePlayerStatsFromEvents, getScoreSheetRowValues } from '@/lib/korf-engine/korf-calculator';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Undo2,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  Shield,
  Target,
  AlertTriangle,
  Award,
} from 'lucide-react';
import Link from 'next/link';

export default function LiveMatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [match, setMatch] = useState<MatchState | null>(null);
  const [loading, setLoading] = useState(true);

  // Active UI states
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'ACTIONS' | 'BORANG'>('ACTIONS');

  // DP (Defended) Modal
  const [dpModalOpen, setDpModalOpen] = useState(false);
  const [pendingGoalEvent, setPendingGoalEvent] = useState<Partial<MatchEvent> | null>(null);

  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Excel export loading
  const [exporting, setExporting] = useState(false);

  // Load match from Dexie
  useEffect(() => {
    async function fetchMatch() {
      try {
        const data = await localDb.matches.get(matchId);
        if (data) {
          setMatch(data);
          setSelectedTeamId(data.teamA.id);
          const firstPlayer = (data.teamA.players || [])[0];
          if (firstPlayer) setSelectedPlayerId(firstPlayer.id);
        }
      } catch (err) {
        console.error('Error fetching match:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMatch();
  }, [matchId]);

  // Stopwatch interval
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setMatch((prev) => {
          if (!prev) return prev;
          const nextSeconds = prev.gameTimeSeconds + 1;
          const updated = { ...prev, gameTimeSeconds: nextSeconds };
          localDb.matches.put(updated);
          return updated;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Memuat pertandingan...</div>;
  }

  if (!match) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-slate-600">Pertandingan tidak ditemukan.</p>
        <Link href="/" className="text-blue-600 font-semibold hover:underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const currentTeam =
    selectedTeamId === match.teamA.id
      ? match.teamA
      : selectedTeamId === match.teamB.id
      ? match.teamB
      : match.teamC || match.teamA;

  const currentOpponent =
    selectedTeamId === match.teamA.id ? match.teamB : match.teamA;

  const selectedPlayer = (currentTeam.players || []).find((p) => p.id === selectedPlayerId);

  // Format digital clock mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Record an action
  const handleActionClick = async (actionType: ActionType) => {
    if (!match || !selectedPlayer) return;

    const isGoalMade =
      actionType === 'SHOOT_M' ||
      actionType === 'RI_M' ||
      actionType === 'PENALTY_M' ||
      actionType === 'FREE_PASS_M' ||
      actionType === 'FREE_SHOT_M';

    if (isGoalMade) {
      // Prompt for DP (Defended by which opponent)
      const draftEvent: Partial<MatchEvent> = {
        id: `ev-${Date.now()}-${Math.random()}`,
        clientEventId: `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        matchId: match.id,
        playerId: selectedPlayer.id,
        teamId: selectedTeamId,
        period: match.currentPeriod,
        gameTimeSeconds: match.gameTimeSeconds,
        actionType,
        pointsAwarded: 1, // Korfball goal is always 1 point
        recordedAt: new Date().toISOString(),
        isDeleted: false,
        playerName: selectedPlayer.fullName,
        playerJersey: selectedPlayer.jerseyNumber,
      };
      setPendingGoalEvent(draftEvent);
      setDpModalOpen(true);
    } else {
      // Non-scoring action
      await commitEvent({
        id: `ev-${Date.now()}-${Math.random()}`,
        clientEventId: `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        matchId: match.id,
        playerId: selectedPlayer.id,
        teamId: selectedTeamId,
        period: match.currentPeriod,
        gameTimeSeconds: match.gameTimeSeconds,
        actionType,
        pointsAwarded: 0,
        runningScoreA: match.scoreTeamA,
        runningScoreB: match.scoreTeamB,
        runningScoreC: match.scoreTeamC,
        recordedAt: new Date().toISOString(),
        isDeleted: false,
        playerName: selectedPlayer.fullName,
        playerJersey: selectedPlayer.jerseyNumber,
      });
    }
  };

  // Commit event and update running scores
  const commitEvent = async (event: MatchEvent) => {
    let nextScoreA = match.scoreTeamA;
    let nextScoreB = match.scoreTeamB;
    let nextScoreC = match.scoreTeamC;

    if (event.pointsAwarded > 0) {
      if (event.teamId === match.teamA.id) nextScoreA += 1;
      else if (event.teamId === match.teamB.id) nextScoreB += 1;
      else if (match.teamC && event.teamId === match.teamC.id) nextScoreC += 1;
    }

    const finalizedEvent: MatchEvent = {
      ...event,
      runningScoreA: nextScoreA,
      runningScoreB: nextScoreB,
      runningScoreC: nextScoreC,
    };

    const updatedMatch: MatchState = {
      ...match,
      scoreTeamA: nextScoreA,
      scoreTeamB: nextScoreB,
      scoreTeamC: nextScoreC,
      events: [...match.events, finalizedEvent],
    };

    setMatch(updatedMatch);
    await localDb.matches.put(updatedMatch);
  };

  // Finalize DP selection for goal
  const handleSelectDp = async (opponentPlayer?: Player) => {
    if (!pendingGoalEvent) return;

    const fullEvent: MatchEvent = {
      ...(pendingGoalEvent as MatchEvent),
      opponentPlayerId: opponentPlayer?.id,
      opponentPlayerName: opponentPlayer?.fullName,
      opponentPlayerJersey: opponentPlayer?.jerseyNumber,
      runningScoreA: match.scoreTeamA,
      runningScoreB: match.scoreTeamB,
      runningScoreC: match.scoreTeamC,
    };

    await commitEvent(fullEvent);
    setDpModalOpen(false);
    setPendingGoalEvent(null);
  };

  // Quick Undo
  const handleQuickUndo = async () => {
    if (!match || match.events.length === 0) return;

    const activeEvents = match.events.filter((e) => !e.isDeleted);
    if (activeEvents.length === 0) return;

    const lastEvent = activeEvents[activeEvents.length - 1];

    let nextScoreA = match.scoreTeamA;
    let nextScoreB = match.scoreTeamB;
    let nextScoreC = match.scoreTeamC;

    if (lastEvent.pointsAwarded > 0) {
      if (lastEvent.teamId === match.teamA.id) nextScoreA = Math.max(0, nextScoreA - 1);
      else if (lastEvent.teamId === match.teamB.id) nextScoreB = Math.max(0, nextScoreB - 1);
      else if (match.teamC && lastEvent.teamId === match.teamC.id) nextScoreC = Math.max(0, nextScoreC - 1);
    }

    const updatedEvents = match.events.map((e) =>
      e.id === lastEvent.id ? { ...e, isDeleted: true } : e
    );

    const updatedMatch: MatchState = {
      ...match,
      scoreTeamA: nextScoreA,
      scoreTeamB: nextScoreB,
      scoreTeamC: nextScoreC,
      events: updatedEvents,
    };

    setMatch(updatedMatch);
    await localDb.matches.put(updatedMatch);
  };

  // Download Excel
  const handleExportExcel = async () => {
    if (!match) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/matches/${match.id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(match),
      });

      if (!res.ok) throw new Error('Gagal mengekspor berkas Excel');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SCORE_SHEET_${match.matchCode}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Error ekspor file Excel');
    } finally {
      setExporting(false);
    }
  };

  const activeEvents = match.events.filter((e) => !e.isDeleted);
  const goalEvents = activeEvents
    .filter((e) => e.pointsAwarded > 0)
    .sort((a, b) => b.gameTimeSeconds - a.gameTimeSeconds);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Top Bar Navigation & Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                {match.matchCode}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {match.teamStructure === 'THREE_TEAM' ? '3 Team (K4)' : `${match.format} (2 Team)`}
              </span>
            </div>
            <p className="text-xs text-slate-500">{match.venue || 'Bantul'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'ACTIONS' ? 'BORANG' : 'ACTIONS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${
              viewMode === 'BORANG'
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{viewMode === 'BORANG' ? 'Tutup Borang View' : 'Pratinjau Borang View'}</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{exporting ? 'Memproses...' : 'Unduh Score Sheet (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* Scoreboard & Timer Strip */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Teams & Score */}
        <div className="flex-1 w-full flex items-center justify-around text-center">
          {/* Team A */}
          <div className="flex-1">
            <p className="text-xs text-slate-400 font-medium truncate">{match.teamA.name}</p>
            <p className="font-mono text-4xl sm:text-5xl font-black text-amber-400">{match.scoreTeamA}</p>
          </div>

          <div className="px-4 text-slate-600 font-black text-2xl">VS</div>

          {/* Team B */}
          <div className="flex-1">
            <p className="text-xs text-slate-400 font-medium truncate">{match.teamB.name}</p>
            <p className="font-mono text-4xl sm:text-5xl font-black text-amber-400">{match.scoreTeamB}</p>
          </div>

          {/* Team C if 3-team */}
          {match.teamStructure === 'THREE_TEAM' && match.teamC && (
            <>
              <div className="px-4 text-slate-600 font-black text-2xl">VS</div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 font-medium truncate">{match.teamC.name}</p>
                <p className="font-mono text-4xl sm:text-5xl font-black text-amber-400">{match.scoreTeamC}</p>
              </div>
            </>
          )}
        </div>

        {/* Digital Clock & Match Period */}
        <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
          <div className="text-center px-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Babak</p>
            <button
              onClick={() => {
                const nextP = match.currentPeriod >= match.periods ? 1 : match.currentPeriod + 1;
                const upd = { ...match, currentPeriod: nextP };
                setMatch(upd);
                localDb.matches.put(upd);
              }}
              className="text-sm font-black text-amber-300 hover:underline"
            >
              Period {match.currentPeriod}
            </button>
          </div>

          <div className="border-l border-slate-700 pl-3 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Waktu</p>
            <p className="font-mono text-2xl font-black text-white">{formatTime(match.gameTimeSeconds)}</p>
          </div>

          <div className="flex items-center gap-1 pl-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`p-2 rounded-lg font-bold transition ${
                isTimerRunning
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
              title={isTimerRunning ? 'Pause Timer' : 'Start Timer'}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                const upd = { ...match, gameTimeSeconds: 0 };
                setMatch(upd);
                localDb.matches.put(upd);
              }}
              className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 transition"
              title="Reset Timer ke 00:00"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Recording Workspace */}
      {viewMode === 'BORANG' ? (
        /* Matrix Borang Replica View */
        <BorangMatrixView match={match} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Team Switcher & On-Court Lineup (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Team Tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-200 rounded-xl">
              <button
                onClick={() => {
                  setSelectedTeamId(match.teamA.id);
                  if (match.teamA.players?.[0]) setSelectedPlayerId(match.teamA.players[0].id);
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition truncate ${
                  selectedTeamId === match.teamA.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-300'
                }`}
              >
                {match.teamA.name || 'Team A'}
              </button>
              <button
                onClick={() => {
                  setSelectedTeamId(match.teamB.id);
                  if (match.teamB.players?.[0]) setSelectedPlayerId(match.teamB.players[0].id);
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition truncate ${
                  selectedTeamId === match.teamB.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-300'
                }`}
              >
                {match.teamB.name || 'Team B'}
              </button>
              {match.teamStructure === 'THREE_TEAM' && match.teamC && (
                <button
                  onClick={() => {
                    setSelectedTeamId(match.teamC!.id);
                    if (match.teamC!.players?.[0]) setSelectedPlayerId(match.teamC!.players[0].id);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition truncate ${
                    selectedTeamId === match.teamC.id
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {match.teamC.name || 'Team C'}
                </button>
              )}
            </div>

            {/* Players List */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700">Pilih Atlet Pelaku Aksi</span>
                <span className="text-[10px] text-slate-400">Klik kartu untuk memilih</span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[480px] overflow-y-auto pr-1">
                {(currentTeam.players || []).map((p) => {
                  const isSelected = p.id === selectedPlayerId;
                  const stats = aggregatePlayerStatsFromEvents(match.events, p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlayerId(p.id)}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-md ring-2 ring-amber-400 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-black">#{p.jerseyNumber}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 font-mono font-bold">
                          {stats.totalPoints} Pts
                        </span>
                      </div>
                      <p className="text-xs truncate font-medium mt-1">{p.fullName}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center Column: Quick Action Pad (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <span className="text-xs text-slate-500 block">Pemain Terpilih:</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {selectedPlayer
                      ? `#${selectedPlayer.jerseyNumber} — ${selectedPlayer.fullName}`
                      : 'Pilih pemain terlebih dahulu'}
                  </span>
                </div>
                <button
                  onClick={handleQuickUndo}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 flex items-center gap-1 transition shadow-sm"
                  title="Batalkan Aksi Terakhir"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Quick Undo</span>
                </button>
              </div>

              {/* 5 Shot Buttons */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                  <span>Aksi Tembakan (Shooting)</span>
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {/* Shoot */}
                  <button
                    onClick={() => handleActionClick('SHOOT_M')}
                    className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow transition active:scale-95 flex flex-col items-center justify-center"
                  >
                    <span>SHOOT MADE</span>
                    <span className="text-[10px] font-medium text-emerald-100">+1 Poin</span>
                  </button>
                  <button
                    onClick={() => handleActionClick('SHOOT_A')}
                    className="py-3 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 flex flex-col items-center justify-center"
                  >
                    <span>SHOOT ATTEMPT</span>
                    <span className="text-[10px] text-slate-500 font-medium">Miss / Gagal</span>
                  </button>

                  {/* Running In */}
                  <button
                    onClick={() => handleActionClick('RI_M')}
                    className="py-3 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs sm:text-sm shadow transition active:scale-95 flex flex-col items-center justify-center"
                  >
                    <span>RUNNING IN MADE</span>
                    <span className="text-[10px] font-medium text-teal-100">+1 Poin</span>
                  </button>
                  <button
                    onClick={() => handleActionClick('RI_A')}
                    className="py-3 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 flex flex-col items-center justify-center"
                  >
                    <span>RUNNING IN ATT.</span>
                    <span className="text-[10px] text-slate-500 font-medium">Miss / Gagal</span>
                  </button>

                  {/* Penalty */}
                  <button
                    onClick={() => handleActionClick('PENALTY_M')}
                    className="py-2.5 px-3 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-black text-xs shadow transition active:scale-95 flex flex-col items-center justify-center"
                  >
                    <span>PENALTY MADE</span>
                    <span className="text-[10px] font-medium text-cyan-200">+1 Poin</span>
                  </button>
                  <button
                    onClick={() => handleActionClick('PENALTY_A')}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-sm transition active:scale-95 flex flex-col items-center justify-center"
                  >
                    <span>PENALTY ATT.</span>
                    <span className="text-[10px] text-slate-500 font-medium">Miss</span>
                  </button>

                  {/* Free Pass */}
                  <button
                    onClick={() => handleActionClick('FREE_PASS_M')}
                    className="py-2.5 px-3 rounded-xl bg-sky-700 hover:bg-sky-600 text-white font-black text-xs shadow transition active:scale-95 flex flex-col items-center justify-center"
                  >
                    <span>FREE PASS MADE</span>
                    <span className="text-[10px] font-medium text-sky-200">+1 Poin</span>
                  </button>
                  <button
                    onClick={() => handleActionClick('FREE_PASS_A')}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-sm transition active:scale-95 flex flex-col items-center justify-center"
                  >
                    <span>FREE PASS ATT.</span>
                    <span className="text-[10px] text-slate-500 font-medium">Miss</span>
                  </button>

                  {/* Free Shot */}
                  <button
                    onClick={() => handleActionClick('FREE_SHOT_M')}
                    className="py-2.5 px-3 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-black text-xs shadow transition active:scale-95 flex flex-col items-center justify-center"
                  >
                    <span>FREE SHOT MADE</span>
                    <span className="text-[10px] font-medium text-indigo-200">+1 Poin</span>
                  </button>
                  <button
                    onClick={() => handleActionClick('FREE_SHOT_A')}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-sm transition active:scale-95 flex flex-col items-center justify-center"
                  >
                    <span>FREE SHOT ATT.</span>
                    <span className="text-[10px] text-slate-500 font-medium">Miss</span>
                  </button>
                </div>
              </div>

              {/* Other Stats Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>Rebound, Ball Control & Foul</span>
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleActionClick('REB_OFF')}
                    className="py-2.5 px-2 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-800 font-bold text-xs transition active:scale-95"
                  >
                    REBOUND OFF
                  </button>
                  <button
                    onClick={() => handleActionClick('REB_DEF')}
                    className="py-2.5 px-2 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-800 font-bold text-xs transition active:scale-95"
                  >
                    REBOUND DEF
                  </button>
                  <button
                    onClick={() => handleActionClick('ASSIST')}
                    className="py-2.5 px-2 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 font-bold text-xs transition active:scale-95"
                  >
                    ASSIST
                  </button>
                  <button
                    onClick={() => handleActionClick('INTERCEPT')}
                    className="py-2.5 px-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition active:scale-95"
                  >
                    INTERCEPT
                  </button>
                  <button
                    onClick={() => handleActionClick('TURNOVER')}
                    className="py-2.5 px-2 rounded-xl bg-orange-50 border border-orange-200 hover:bg-orange-100 text-orange-800 font-bold text-xs transition active:scale-95"
                  >
                    TURNOVER
                  </button>
                  <button
                    onClick={() => handleActionClick('FOUL')}
                    className="py-2.5 px-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 font-black text-xs transition active:scale-95"
                  >
                    FOUL
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Running Score & Play-by-Play (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Running Score Live</span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {goalEvents.length} Gol Tercipta
                </span>
              </div>

              {goalEvents.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Belum ada gol tercatat.
                </div>
              ) : (
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {goalEvents.map((g) => {
                    const isTeamA = g.teamId === match.teamA.id;
                    const teamName = isTeamA ? match.teamA.name : match.teamB.name;
                    return (
                      <div
                        key={g.id}
                        className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                          isTeamA
                            ? 'bg-blue-50/60 border-blue-200'
                            : 'bg-emerald-50/60 border-emerald-200'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{g.playerName}</span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {formatTime(g.gameTimeSeconds)}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600">
                            DP: {g.opponentPlayerJersey ? `#${g.opponentPlayerJersey} ${g.opponentPlayerName}` : 'Tanpa Penjaga'}
                          </p>
                        </div>

                        <div className="bg-amber-300 font-mono font-black text-sm px-2 py-0.5 rounded shadow-sm text-slate-950">
                          {isTeamA ? g.runningScoreA : g.runningScoreB}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DP (Defended) Modal */}
      {dpModalOpen && pendingGoalEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="space-y-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                GOL BERHASIL DICATAT (+1 POIN)
              </span>
              <h3 className="text-lg font-extrabold text-slate-900">
                Siapa Pemain Lawan yang Menjaga (DP)?
              </h3>
              <p className="text-xs text-slate-500">
                Pilih atlet {currentOpponent.name} yang sedang menjaga saat {pendingGoalEvent.playerName} mencetak poin.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
              {(currentOpponent.players || []).map((opp) => (
                <button
                  key={opp.id}
                  onClick={() => handleSelectDp(opp)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-left transition flex items-center gap-2 group"
                >
                  <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-600 group-hover:text-white font-mono font-bold text-xs flex items-center justify-center transition">
                    #{opp.jerseyNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate">{opp.fullName}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleSelectDp(undefined)}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                Tanpa Penjaga / Bebas (-)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Komponen Pratinjau Borang Matrix Persis PRINT SCORE SHEET.xlsx
 */
function BorangMatrixView({ match }: { match: MatchState }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm overflow-x-auto">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-slate-900 tracking-wider">STATISTIK GAME — BORANG VIEW</h2>
        <p className="text-xs text-slate-500">
          Replika digital lembar cetak {match.teamStructure === 'THREE_TEAM' ? 'SCORE SHEET 3 TEAM' : 'SCORE SHEET 2 TEAM'}
        </p>
      </div>

      {/* Team A Table */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-slate-800">TEAM A: {match.teamA.name}</h3>
        <table className="w-full text-xs border-collapse border border-slate-400 text-center">
          <thead>
            <tr className="bg-slate-100 font-bold">
              <th rowSpan={2} className="border border-slate-400 p-1.5 w-10">NO</th>
              <th rowSpan={2} className="border border-slate-400 p-1.5 text-left w-44">NAMA</th>
              <th colSpan={2} className="border border-slate-400 p-1">SHOOT</th>
              <th colSpan={2} className="border border-slate-400 p-1">RUNNING IN</th>
              <th colSpan={2} className="border border-slate-400 p-1">PINALTY/FS</th>
              <th colSpan={2} className="border border-slate-400 p-1">REBOUND</th>
              <th rowSpan={2} className="border border-slate-400 p-1">ASSIST</th>
              <th rowSpan={2} className="border border-slate-400 p-1">INTERCEPT</th>
              <th rowSpan={2} className="border border-slate-400 p-1">TURN OVER</th>
              <th rowSpan={2} className="border border-slate-400 p-1">FOUL</th>
            </tr>
            <tr className="bg-slate-100 font-bold">
              <th className="border border-slate-400 p-1 w-8">M</th>
              <th className="border border-slate-400 p-1 w-8">A</th>
              <th className="border border-slate-400 p-1 w-8">M</th>
              <th className="border border-slate-400 p-1 w-8">A</th>
              <th className="border border-slate-400 p-1 w-8">M</th>
              <th className="border border-slate-400 p-1 w-8">A</th>
              <th className="border border-slate-400 p-1 w-8">OFF</th>
              <th className="border border-slate-400 p-1 w-8">DEF</th>
            </tr>
          </thead>
          <tbody>
            {(match.teamA.players || []).map((p) => {
              const stats = aggregatePlayerStatsFromEvents(match.events, p.id);
              const r = getScoreSheetRowValues(stats);
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="border border-slate-400 p-1 font-mono font-bold">{p.jerseyNumber}</td>
                  <td className="border border-slate-400 p-1 text-left font-medium">{p.fullName}</td>
                  <td className="border border-slate-400 p-1">{r.shootM || ''}</td>
                  <td className="border border-slate-400 p-1">{r.shootA || ''}</td>
                  <td className="border border-slate-400 p-1">{r.runningInM || ''}</td>
                  <td className="border border-slate-400 p-1">{r.runningInA || ''}</td>
                  <td className="border border-slate-400 p-1">{r.pinaltyFsM || ''}</td>
                  <td className="border border-slate-400 p-1">{r.pinaltyFsA || ''}</td>
                  <td className="border border-slate-400 p-1">{r.rebOff || ''}</td>
                  <td className="border border-slate-400 p-1">{r.rebDef || ''}</td>
                  <td className="border border-slate-400 p-1">{r.assist || ''}</td>
                  <td className="border border-slate-400 p-1">{r.intercept || ''}</td>
                  <td className="border border-slate-400 p-1">{r.turnover || ''}</td>
                  <td className="border border-slate-400 p-1">{r.foul || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Team B Table */}
      <div className="space-y-2 pt-4">
        <h3 className="font-bold text-sm text-slate-800">TEAM B: {match.teamB.name}</h3>
        <table className="w-full text-xs border-collapse border border-slate-400 text-center">
          <thead>
            <tr className="bg-slate-100 font-bold">
              <th rowSpan={2} className="border border-slate-400 p-1.5 w-10">NO</th>
              <th rowSpan={2} className="border border-slate-400 p-1.5 text-left w-44">NAMA</th>
              <th colSpan={2} className="border border-slate-400 p-1">SHOOT</th>
              <th colSpan={2} className="border border-slate-400 p-1">RUNNING IN</th>
              <th colSpan={2} className="border border-slate-400 p-1">PINALTY/FS</th>
              <th colSpan={2} className="border border-slate-400 p-1">REBOUND</th>
              <th rowSpan={2} className="border border-slate-400 p-1">ASSIST</th>
              <th rowSpan={2} className="border border-slate-400 p-1">INTERCEPT</th>
              <th rowSpan={2} className="border border-slate-400 p-1">TURN OVER</th>
              <th rowSpan={2} className="border border-slate-400 p-1">FOUL</th>
            </tr>
            <tr className="bg-slate-100 font-bold">
              <th className="border border-slate-400 p-1 w-8">M</th>
              <th className="border border-slate-400 p-1 w-8">A</th>
              <th className="border border-slate-400 p-1 w-8">M</th>
              <th className="border border-slate-400 p-1 w-8">A</th>
              <th className="border border-slate-400 p-1 w-8">M</th>
              <th className="border border-slate-400 p-1 w-8">A</th>
              <th className="border border-slate-400 p-1 w-8">OFF</th>
              <th className="border border-slate-400 p-1 w-8">DEF</th>
            </tr>
          </thead>
          <tbody>
            {(match.teamB.players || []).map((p) => {
              const stats = aggregatePlayerStatsFromEvents(match.events, p.id);
              const r = getScoreSheetRowValues(stats);
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="border border-slate-400 p-1 font-mono font-bold">{p.jerseyNumber}</td>
                  <td className="border border-slate-400 p-1 text-left font-medium">{p.fullName}</td>
                  <td className="border border-slate-400 p-1">{r.shootM || ''}</td>
                  <td className="border border-slate-400 p-1">{r.shootA || ''}</td>
                  <td className="border border-slate-400 p-1">{r.runningInM || ''}</td>
                  <td className="border border-slate-400 p-1">{r.runningInA || ''}</td>
                  <td className="border border-slate-400 p-1">{r.pinaltyFsM || ''}</td>
                  <td className="border border-slate-400 p-1">{r.pinaltyFsA || ''}</td>
                  <td className="border border-slate-400 p-1">{r.rebOff || ''}</td>
                  <td className="border border-slate-400 p-1">{r.rebDef || ''}</td>
                  <td className="border border-slate-400 p-1">{r.assist || ''}</td>
                  <td className="border border-slate-400 p-1">{r.intercept || ''}</td>
                  <td className="border border-slate-400 p-1">{r.turnover || ''}</td>
                  <td className="border border-slate-400 p-1">{r.foul || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
