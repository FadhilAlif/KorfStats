'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
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
  Check,
  Target,
  Shield,
  Award,
  Users,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function LiveMatchPage() {
  const params = useParams();
  const matchId = params.id as string;

  const [match, setMatch] = useState<MatchState | null>(null);
  const [loading, setLoading] = useState(true);

  // Active UI states
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'ACTIONS' | 'BORANG'>('ACTIONS');

  // FIBA LiveStats-style Goal Attribution Modal (Assist + DP Defender)
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [pendingActionType, setPendingActionType] = useState<ActionType | null>(null);
  const [selectedAssistPlayerId, setSelectedAssistPlayerId] = useState<string | null>(null);
  const [selectedDpOpponentId, setSelectedDpOpponentId] = useState<string | null>(null);

  // Rebound prompt on Miss (Optional quick follow-up)
  const [reboundModalOpen, setReboundModalOpen] = useState(false);

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

  // Teammates of the selected player (for Assist option)
  const availableTeammates = (currentTeam.players || []).filter(
    (p) => p.id !== selectedPlayerId
  );

  // Opponents (for DP / Defended option)
  const availableOpponents = currentOpponent.players || [];

  // Format digital clock mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Handle action click
  const handleActionClick = async (actionType: ActionType) => {
    if (!match || !selectedPlayer) return;

    const isGoalMade =
      actionType === 'SHOOT_M' ||
      actionType === 'RI_M' ||
      actionType === 'PENALTY_M' ||
      actionType === 'FREE_PASS_M' ||
      actionType === 'FREE_SHOT_M';

    if (isGoalMade) {
      // Buka modal alur FIBA LiveStats: Assist rekan setim & DP pemain lawan
      setPendingActionType(actionType);
      setSelectedAssistPlayerId(null);
      setSelectedDpOpponentId(null);
      setGoalModalOpen(true);
    } else {
      // Aksi non-scoring langsung
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
        playerGender: selectedPlayer.gender,
      });

      // Jika tembakan attempt (miss), buka opsi cepat penentu rebound
      const isMissAttempt =
        actionType === 'SHOOT_A' ||
        actionType === 'RI_A' ||
        actionType === 'PENALTY_A' ||
        actionType === 'FREE_PASS_A' ||
        actionType === 'FREE_SHOT_A';

      if (isMissAttempt) {
        setReboundModalOpen(true);
      }
    }
  };

  // Commit event and atomik update running scores
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

  // Submit Goal Attribution (FIBA LiveStats flow)
  const handleConfirmGoal = async () => {
    if (!pendingActionType || !selectedPlayer) return;

    const assistPlayer = availableTeammates.find((p) => p.id === selectedAssistPlayerId);
    const opponentPlayer = availableOpponents.find((p) => p.id === selectedDpOpponentId);

    const goalEvent: MatchEvent = {
      id: `ev-${Date.now()}-${Math.random()}`,
      clientEventId: `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      matchId: match.id,
      playerId: selectedPlayer.id,
      teamId: selectedTeamId,
      period: match.currentPeriod,
      gameTimeSeconds: match.gameTimeSeconds,
      actionType: pendingActionType,
      pointsAwarded: 1, // Korfball goal is always 1 point
      runningScoreA: match.scoreTeamA,
      runningScoreB: match.scoreTeamB,
      runningScoreC: match.scoreTeamC,
      recordedAt: new Date().toISOString(),
      isDeleted: false,
      playerName: selectedPlayer.fullName,
      playerJersey: selectedPlayer.jerseyNumber,
      playerGender: selectedPlayer.gender,
      assistPlayerId: assistPlayer?.id,
      assistPlayerName: assistPlayer?.fullName,
      assistPlayerJersey: assistPlayer?.jerseyNumber,
      opponentPlayerId: opponentPlayer?.id,
      opponentPlayerName: opponentPlayer?.fullName,
      opponentPlayerJersey: opponentPlayer?.jerseyNumber,
    };

    await commitEvent(goalEvent);
    setGoalModalOpen(false);
    setPendingActionType(null);
    setSelectedAssistPlayerId(null);
    setSelectedDpOpponentId(null);
  };

  // Handle Quick Rebound attribution after Miss
  const handleAssignRebound = async (reboundPlayer: Player, isOffensive: boolean) => {
    const actionType: ActionType = isOffensive ? 'REB_OFF' : 'REB_DEF';
    await commitEvent({
      id: `ev-${Date.now()}-${Math.random()}`,
      clientEventId: `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      matchId: match.id,
      playerId: reboundPlayer.id,
      teamId: reboundPlayer.teamId,
      period: match.currentPeriod,
      gameTimeSeconds: match.gameTimeSeconds,
      actionType,
      pointsAwarded: 0,
      runningScoreA: match.scoreTeamA,
      runningScoreB: match.scoreTeamB,
      runningScoreC: match.scoreTeamC,
      recordedAt: new Date().toISOString(),
      isDeleted: false,
      playerName: reboundPlayer.fullName,
      playerJersey: reboundPlayer.jerseyNumber,
      playerGender: reboundPlayer.gender,
    });
    setReboundModalOpen(false);
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

  // Download Excel Score Sheet
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

            {/* Players List with L/P Gender Badge */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700">Pilih Atlet Pelaku Aksi</span>
                <span className="text-[10px] text-slate-400">Klik kartu untuk memilih</span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[480px] overflow-y-auto pr-1">
                {(currentTeam.players || []).map((p) => {
                  const isSelected = p.id === selectedPlayerId;
                  const stats = aggregatePlayerStatsFromEvents(match.events, p.id);
                  const isMale = p.gender === 'MALE';
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
                        <div className="flex items-center gap-1.5">
                          {/* Gender Badge L / P */}
                          <span
                            className={`w-5 h-5 rounded text-[11px] font-black flex items-center justify-center ${
                              isMale ? 'bg-blue-600 text-white' : 'bg-rose-500 text-white'
                            }`}
                          >
                            {isMale ? 'L' : 'P'}
                          </span>
                          <span className="font-mono text-sm font-black">#{p.jerseyNumber}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 font-mono font-bold">
                          {stats.totalPoints} Pts
                        </span>
                      </div>
                      <p className="text-xs truncate font-medium mt-1.5">{p.fullName}</p>
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
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {selectedPlayer && (
                      <span
                        className={`w-5 h-5 rounded text-[11px] font-black flex items-center justify-center ${
                          selectedPlayer.gender === 'MALE' ? 'bg-blue-600 text-white' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {selectedPlayer.gender === 'MALE' ? 'L' : 'P'}
                      </span>
                    )}
                    <span className="text-sm font-extrabold text-slate-900">
                      {selectedPlayer
                        ? `#${selectedPlayer.jerseyNumber} — ${selectedPlayer.fullName}`
                        : 'Pilih pemain terlebih dahulu'}
                    </span>
                  </div>
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
                    <span className="text-[10px] font-medium text-emerald-100">+1 Poin (Pilih Assist & DP)</span>
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
                    <span className="text-[10px] font-medium text-teal-100">+1 Poin (Pilih Assist & DP)</span>
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
                    ASSIST (Direct)
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
                    const isMale = g.playerGender === 'MALE';
                    return (
                      <div
                        key={g.id}
                        className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                          isTeamA
                            ? 'bg-blue-50/60 border-blue-200'
                            : 'bg-emerald-50/60 border-emerald-200'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-4 h-4 rounded text-[10px] font-black flex items-center justify-center ${
                                isMale ? 'bg-blue-600 text-white' : 'bg-rose-500 text-white'
                              }`}
                            >
                              {isMale ? 'L' : 'P'}
                            </span>
                            <span className="font-bold text-slate-900">{g.playerName}</span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {formatTime(g.gameTimeSeconds)}
                            </span>
                          </div>

                          {/* Assist attribution */}
                          {g.assistPlayerName && (
                            <p className="text-[10px] text-amber-800 font-semibold flex items-center gap-1">
                              <Award className="w-3 h-3 text-amber-600" />
                              <span>Assist: #{g.assistPlayerJersey} {g.assistPlayerName}</span>
                            </p>
                          )}

                          {/* DP (Defended) attribution */}
                          <p className="text-[10px] text-slate-600">
                            DP: {g.opponentPlayerJersey ? `#${g.opponentPlayerJersey} ${g.opponentPlayerName}` : 'Tanpa Penjaga'}
                          </p>
                        </div>

                        <div className="bg-amber-300 font-mono font-black text-sm px-2.5 py-1 rounded shadow-sm text-slate-950">
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

      {/* FIBA LiveStats-style Goal Attribution Modal: Assist & DP */}
      {goalModalOpen && selectedPlayer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                  GOL BERHASIL DICATAT (+1 POIN)
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  Atribusi Gol #{selectedPlayer.jerseyNumber} {selectedPlayer.fullName}
                </h3>
              </div>
              <div className="text-right font-mono text-xs text-slate-400">
                {formatTime(match.gameTimeSeconds)}
              </div>
            </div>

            {/* Section 1: Assist Teammate Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>1. Umpan Matang (Assist) Oleh Rekan Setim?</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssistPlayerId(null)}
                  className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    selectedAssistPlayerId === null
                      ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Tanpa Assist (Solo)</span>
                </button>
                {availableTeammates.map((mate) => {
                  const isSelected = selectedAssistPlayerId === mate.id;
                  const isMale = mate.gender === 'MALE';
                  return (
                    <button
                      key={mate.id}
                      type="button"
                      onClick={() => setSelectedAssistPlayerId(mate.id)}
                      className={`p-2 rounded-xl border text-xs text-left transition flex items-center gap-2 ${
                        isSelected
                          ? 'bg-blue-600 border-blue-700 text-white shadow-sm font-bold'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-blue-50'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded text-[10px] font-black flex items-center justify-center ${
                          isMale ? 'bg-blue-800 text-white' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {isMale ? 'L' : 'P'}
                      </span>
                      <span className="font-mono font-bold">#{mate.jerseyNumber}</span>
                      <span className="truncate">{mate.fullName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: DP (Defended by opponent) Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>2. Dijaga Pemain Lawan Siapa (DP - Defended)?</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDpOpponentId(null)}
                  className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    selectedDpOpponentId === null
                      ? 'bg-slate-800 border-slate-900 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>Tanpa Penjaga (-)</span>
                </button>
                {availableOpponents.map((opp) => {
                  const isSelected = selectedDpOpponentId === opp.id;
                  const isMale = opp.gender === 'MALE';
                  return (
                    <button
                      key={opp.id}
                      type="button"
                      onClick={() => setSelectedDpOpponentId(opp.id)}
                      className={`p-2 rounded-xl border text-xs text-left transition flex items-center gap-2 ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm font-bold'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-emerald-50'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded text-[10px] font-black flex items-center justify-center ${
                          isMale ? 'bg-blue-800 text-white' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {isMale ? 'L' : 'P'}
                      </span>
                      <span className="font-mono font-bold">#{opp.jerseyNumber}</span>
                      <span className="truncate">{opp.fullName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setGoalModalOpen(false);
                  setPendingActionType(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmGoal}
                className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Gol & Running Score (+1 Poin)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optional Rebound Prompt on Missed Shot */}
      {reboundModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  TEMBAKAN GAGAL (MISS)
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">Siapa Mengambil Rebound?</h4>
              </div>
              <button
                onClick={() => setReboundModalOpen(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Lewati (Bola Keluar)
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-bold text-blue-700 uppercase mb-1">
                  Rebound Offensive ({currentTeam.name})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(currentTeam.players || []).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleAssignRebound(p, true)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 text-left text-xs truncate font-medium flex items-center gap-1"
                    >
                      <span className="font-mono font-bold">#{p.jerseyNumber}</span>
                      <span className="truncate">{p.fullName.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-emerald-700 uppercase mb-1">
                  Rebound Defensive ({currentOpponent.name})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(currentOpponent.players || []).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleAssignRebound(p, false)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 text-left text-xs truncate font-medium flex items-center gap-1"
                    >
                      <span className="font-mono font-bold">#{p.jerseyNumber}</span>
                      <span className="truncate">{p.fullName.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setReboundModalOpen(false)}
                className="w-full py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Tutup / Lewati Tanpa Rebound
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
 * Menampilkan Tabel Pemain di sebelah KIRI dan Tabel RUNNING SCORE di sebelah KANAN
 */
function BorangMatrixView({ match }: { match: MatchState }) {
  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

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
            Venue: {match.venue || 'Bantul'} • Tanggal: {new Date(match.matchDate).toLocaleDateString('id-ID')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition shadow-xs"
          >
            🖨️ Cetak Lembar Skor
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
                                isMale ? 'bg-blue-600 text-white' : 'bg-rose-500 text-white'
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
                                isMale ? 'bg-blue-600 text-white' : 'bg-rose-500 text-white'
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
                                  isMale ? 'bg-blue-600 text-white' : 'bg-rose-500 text-white'
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

            {/* RIGHT SIDE: RUNNING SCORE TABLE (5 cols for 2 Team, or 5 cols for 3 Team) */}
            <div className="col-span-5 space-y-1">
              <div className="font-bold text-xs text-slate-900 uppercase">
                RUNNING SCORE
              </div>

              <table className="w-full text-[10px] border-collapse border border-slate-900 text-center leading-tight">
                <thead>
                  {/* Top Team Names Row */}
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

                  {/* Column Headers Row (with Yellow on Score) */}
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

                    {/* Team C (If 3-team): SCORE | NAME | TIME | DP */}
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
                    const timeA = goalA ? formatTime(goalA.gameTimeSeconds) : '';
                    const nameA = goalA ? goalA.playerName?.split(' ')[0] || '' : '';
                    const scoreA = goalA ? goalA.runningScoreA : '';

                    const dpB = goalB
                      ? goalB.opponentPlayerJersey
                        ? `#${goalB.opponentPlayerJersey}`
                        : goalB.opponentPlayerName?.split(' ')[0] || '-'
                      : '';
                    const timeB = goalB ? formatTime(goalB.gameTimeSeconds) : '';
                    const nameB = goalB ? goalB.playerName?.split(' ')[0] || '' : '';
                    const scoreB = goalB ? goalB.runningScoreB : '';

                    const dpC = goalC
                      ? goalC.opponentPlayerJersey
                        ? `#${goalC.opponentPlayerJersey}`
                        : goalC.opponentPlayerName?.split(' ')[0] || '-'
                      : '';
                    const timeC = goalC ? formatTime(goalC.gameTimeSeconds) : '';
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

