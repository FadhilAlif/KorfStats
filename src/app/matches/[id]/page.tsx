'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';
import type { ActionType, Player } from '@/types/match';
import { useLiveMatch } from '@/hooks/useLiveMatch';
import { useMatchClock } from '@/hooks/useMatchClock';
import { downloadScoreSheet } from '@/lib/excel/download-scoresheet';
import { isGoalAction, isMissAction } from '@/lib/korf-engine/action-types';
import {
  canUndo as checkCanUndo,
  createMatchEvent,
  getOpponentTeams,
  getTeamById,
} from '@/lib/korf-engine/match-engine';
import { Scoreboard } from '@/components/live-match/Scoreboard';
import { TeamTabs } from '@/components/live-match/TeamTabs';
import { PlayerGrid } from '@/components/live-match/PlayerGrid';
import { ActionPad } from '@/components/live-match/ActionPad';
import { RunningScoreFeed } from '@/components/live-match/RunningScoreFeed';
import { GoalAttributionModal } from '@/components/live-match/GoalAttributionModal';
import { ReboundModal } from '@/components/live-match/ReboundModal';
import { BorangMatrixView } from '@/components/live-match/BorangMatrixView';

export default function LiveMatchPage() {
  const params = useParams();
  const matchId = params.id as string;

  const { match, loading, updateMatch, recordEvent, undo, tick } = useLiveMatch(matchId);

  // Active UI navigation
  const [selectedTeamIdState, setSelectedTeamId] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'ACTIONS' | 'BORANG'>('ACTIONS');

  // Clock state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  useMatchClock(isTimerRunning, tick);

  // Modal dialog states & Snapshotted Timestamps (Freeze on Click)
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [pendingActionType, setPendingActionType] = useState<ActionType | null>(null);
  const [pendingGoalTimeSeconds, setPendingGoalTimeSeconds] = useState<number | null>(null);
  const [pendingGoalPeriod, setPendingGoalPeriod] = useState<number | null>(null);

  const [selectedAssistPlayerId, setSelectedAssistPlayerId] = useState<string | null>(null);
  const [selectedDpOpponentId, setSelectedDpOpponentId] = useState<string | null>(null);

  const [reboundModalOpen, setReboundModalOpen] = useState(false);
  const [pendingMissTimeSeconds, setPendingMissTimeSeconds] = useState<number | null>(null);
  const [pendingMissPeriod, setPendingMissPeriod] = useState<number | null>(null);

  const [exporting, setExporting] = useState(false);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Memuat pertandingan...</div>;
  }

  if (!match) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-slate-600">Pertandingan tidak ditemukan.</p>
        <Link href="/" className="text-brand-700 font-semibold hover:underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  // Active team & players resolution
  const selectedTeamId = selectedTeamIdState || match.teamA.id;
  const currentTeam = getTeamById(match, selectedTeamId) || match.teamA;
  const currentPlayers = currentTeam.players || [];
  const selectedPlayer = currentPlayers.find((p) => p.id === selectedPlayerId) || currentPlayers[0];

  const opponentTeams = getOpponentTeams(match, selectedTeamId);
  const availableOpponents = opponentTeams.flatMap((t) => t.players || []);
  const availableTeammates = currentPlayers.filter((p) => p.id !== selectedPlayer?.id);

  // Action Pad click handler — Capture timestamp immediately upon click!
  const handleActionClick = (actionType: ActionType) => {
    if (!selectedPlayer) return;

    if (isGoalAction(actionType)) {
      // FREEZE / SNAPSHOT WAKTU KEJADIAN GOL SAAT TOMBOL DIKLIK
      setPendingActionType(actionType);
      setPendingGoalTimeSeconds(match.gameTimeSeconds);
      setPendingGoalPeriod(match.currentPeriod);
      setSelectedAssistPlayerId(null);
      setSelectedDpOpponentId(null);
      setGoalModalOpen(true);
    } else {
      const event = createMatchEvent({
        match,
        player: selectedPlayer,
        actionType,
      });
      recordEvent(event);

      if (isMissAction(actionType)) {
        // FREEZE / SNAPSHOT WAKTU KEJADIAN REBOUND SEGERA SETELAH TEMBAKAN MISS
        setPendingMissTimeSeconds(match.gameTimeSeconds);
        setPendingMissPeriod(match.currentPeriod);
        setReboundModalOpen(true);
      }
    }
  };

  // Confirm Goal Attribution — Use snapshotted timestamp
  const handleConfirmGoal = () => {
    if (!selectedPlayer || !pendingActionType) return;

    const assist = availableTeammates.find((p) => p.id === selectedAssistPlayerId);
    const opponent = availableOpponents.find((p) => p.id === selectedDpOpponentId);

    const event = createMatchEvent({
      match,
      player: selectedPlayer,
      actionType: pendingActionType,
      gameTimeSeconds: pendingGoalTimeSeconds ?? match.gameTimeSeconds,
      period: pendingGoalPeriod ?? match.currentPeriod,
      assist,
      opponent,
    });

    recordEvent(event);
    setGoalModalOpen(false);
    setPendingActionType(null);
    setPendingGoalTimeSeconds(null);
    setPendingGoalPeriod(null);
  };

  // Assign Rebound after Miss — Use snapshotted timestamp
  const handleAssignRebound = (reboundPlayer: Player, isOffensive: boolean) => {
    const event = createMatchEvent({
      match,
      player: reboundPlayer,
      actionType: isOffensive ? 'REB_OFF' : 'REB_DEF',
      gameTimeSeconds: pendingMissTimeSeconds ?? match.gameTimeSeconds,
      period: pendingMissPeriod ?? match.currentPeriod,
    });
    recordEvent(event);
    setReboundModalOpen(false);
    setPendingMissTimeSeconds(null);
    setPendingMissPeriod(null);
  };

  // Excel Score Sheet Export
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      await downloadScoreSheet(match);
    } catch (err: any) {
      alert(err.message || 'Error saat ekspor file Excel');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Top Bar Navigation & Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200/90 shadow-card">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                {match.matchCode}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                {match.teamStructure === 'THREE_TEAM' ? '3 Team (K4)' : `${match.format} (2 Team)`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{match.venue || 'Bantul'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'ACTIONS' ? 'BORANG' : 'ACTIONS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${
              viewMode === 'BORANG'
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{viewMode === 'BORANG' ? 'Tutup Form View' : 'Form View'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exporting}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{exporting ? 'Memproses...' : 'Export Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* Corporate Scoreboard */}
      <Scoreboard
        match={match}
        isTimerRunning={isTimerRunning}
        onToggleTimer={() => setIsTimerRunning(!isTimerRunning)}
        onUpdateMatch={updateMatch}
      />

      {/* Main Recording Workspace */}
      {viewMode === 'BORANG' ? (
        <BorangMatrixView match={match} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Team Switcher & On-Court Lineup (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <TeamTabs
              match={match}
              selectedTeamId={selectedTeamId}
              onSelectTeam={(teamId) => {
                setSelectedTeamId(teamId);
                const targetTeam = getTeamById(match, teamId);
                const first = targetTeam?.players?.[0];
                if (first) setSelectedPlayerId(first.id);
              }}
            />

            <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-card space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Lineup Lapangan</span>
                <span className="text-[10px] text-slate-400">Pilih atlet</span>
              </div>

              <PlayerGrid
                players={currentPlayers}
                selectedPlayerId={selectedPlayer?.id || ''}
                onSelectPlayer={setSelectedPlayerId}
                events={match.events}
              />
            </div>
          </div>

          {/* Center Column: Quick Action Pad (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <ActionPad
              selectedPlayer={selectedPlayer}
              canUndo={checkCanUndo(match)}
              onActionClick={handleActionClick}
              onQuickUndo={undo}
            />
          </div>

          {/* Right Column: Running Score Live (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <RunningScoreFeed match={match} />
          </div>
        </div>
      )}

      {/* FIBA LiveStats-style Goal Attribution Modal: Assist & DP */}
      <GoalAttributionModal
        open={goalModalOpen}
        selectedPlayer={selectedPlayer}
        pendingActionType={pendingActionType}
        gameTimeSeconds={pendingGoalTimeSeconds ?? match.gameTimeSeconds}
        availableTeammates={availableTeammates}
        availableOpponents={availableOpponents}
        selectedAssistPlayerId={selectedAssistPlayerId}
        selectedDpOpponentId={selectedDpOpponentId}
        onSelectAssist={setSelectedAssistPlayerId}
        onSelectDp={setSelectedDpOpponentId}
        onConfirm={handleConfirmGoal}
        onCancel={() => {
          setGoalModalOpen(false);
          setPendingActionType(null);
          setPendingGoalTimeSeconds(null);
          setPendingGoalPeriod(null);
        }}
      />

      {/* Rebound Prompt after Missed Shot Attempt */}
      <ReboundModal
        open={reboundModalOpen}
        currentTeam={currentTeam}
        opponentTeams={opponentTeams}
        onAssignRebound={handleAssignRebound}
        onClose={() => {
          setReboundModalOpen(false);
          setPendingMissTimeSeconds(null);
          setPendingMissPeriod(null);
        }}
      />
    </div>
  );
}
