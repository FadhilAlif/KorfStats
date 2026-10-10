import type { MatchEvent, MatchState, Player, Team, ActionType } from '@/types/match';
import { newId } from '@/lib/utils/id';
import { isGoalAction, POINTS_PER_GOAL } from './action-types';

/**
 * Match Engine — fungsi murni (pure) untuk mutasi state pertandingan.
 * Tidak bergantung pada React / IndexedDB sehingga dapat diuji unit dan
 * dipakai ulang oleh server (/api/sync) agar perhitungan simetris (AGENTS.md §3B).
 */

export type TeamSlot = 'A' | 'B' | 'C';

export interface TeamEntry {
  slot: TeamSlot;
  team: Team;
  score: number;
}

/* ------------------------------------------------------------------ */
/* Selectors                                                           */
/* ------------------------------------------------------------------ */

/** Daftar tim aktif beserta slot & skornya (2 atau 3 tim). */
export function getTeamEntries(match: MatchState): TeamEntry[] {
  const entries: TeamEntry[] = [
    { slot: 'A', team: match.teamA, score: match.scoreTeamA },
    { slot: 'B', team: match.teamB, score: match.scoreTeamB },
  ];
  if (match.teamStructure === 'THREE_TEAM' && match.teamC) {
    entries.push({ slot: 'C', team: match.teamC, score: match.scoreTeamC });
  }
  return entries;
}

export function getTeamSlot(match: MatchState, teamId: string): TeamSlot | null {
  return getTeamEntries(match).find((e) => e.team.id === teamId)?.slot ?? null;
}

export function getTeamById(match: MatchState, teamId: string): Team | undefined {
  return getTeamEntries(match).find((e) => e.team.id === teamId)?.team;
}

/**
 * Semua tim lawan dari tim tertentu.
 * Format 3 Tim: lawan = dua tim lainnya (memperbaiki bug lama yang selalu mengembalikan Tim A).
 */
export function getOpponentTeams(match: MatchState, teamId: string): Team[] {
  return getTeamEntries(match)
    .filter((e) => e.team.id !== teamId)
    .map((e) => e.team);
}

export function getActiveEvents(match: MatchState): MatchEvent[] {
  return match.events.filter((e) => !e.isDeleted);
}

/** Event gol aktif (kronologis), opsional difilter per tim. */
export function getGoalEvents(match: MatchState, teamId?: string): MatchEvent[] {
  return getActiveEvents(match)
    .filter((e) => e.pointsAwarded > 0 && (!teamId || e.teamId === teamId))
    .sort((a, b) => a.gameTimeSeconds - b.gameTimeSeconds);
}

export function getRunningScoreForSlot(event: MatchEvent, slot: TeamSlot): number {
  if (slot === 'A') return event.runningScoreA;
  if (slot === 'B') return event.runningScoreB;
  return event.runningScoreC;
}

/* ------------------------------------------------------------------ */
/* Event factory                                                       */
/* ------------------------------------------------------------------ */

export interface CreateEventInput {
  match: MatchState;
  player: Player;
  actionType: ActionType;
  gameTimeSeconds?: number;
  period?: number;
  assist?: Player;
  opponent?: Player;
}

/**
 * Membuat MatchEvent baru dengan `clientEventId` UUIDv4.
 * Mendukung snapshot gameTimeSeconds saat tombol pertama kali diklik (FIBA LiveStats paradigm).
 * Running score final dihitung ulang oleh `applyEvent` (BR-03/BR-07).
 */
export function createMatchEvent({
  match,
  player,
  actionType,
  gameTimeSeconds,
  period,
  assist,
  opponent,
}: CreateEventInput): MatchEvent {
  return {
    id: newId(),
    clientEventId: newId(),
    matchId: match.id,
    playerId: player.id,
    teamId: player.teamId,
    period: period ?? match.currentPeriod,
    gameTimeSeconds: gameTimeSeconds ?? match.gameTimeSeconds,
    actionType,
    pointsAwarded: isGoalAction(actionType) ? POINTS_PER_GOAL : 0,
    runningScoreA: match.scoreTeamA,
    runningScoreB: match.scoreTeamB,
    runningScoreC: match.scoreTeamC,
    recordedAt: new Date().toISOString(),
    isDeleted: false,
    playerName: player.fullName,
    playerJersey: player.jerseyNumber,
    playerGender: player.gender,
    assistPlayerId: assist?.id,
    assistPlayerName: assist?.fullName,
    assistPlayerJersey: assist?.jerseyNumber,
    opponentPlayerId: opponent?.id,
    opponentPlayerName: opponent?.fullName,
    opponentPlayerJersey: opponent?.jerseyNumber,
  };
}

/* ------------------------------------------------------------------ */
/* Reducers                                                            */
/* ------------------------------------------------------------------ */

type Scores = Pick<MatchState, 'scoreTeamA' | 'scoreTeamB' | 'scoreTeamC'>;

function adjustScore(match: MatchState, teamId: string, delta: number): Scores {
  const scores: Scores = {
    scoreTeamA: match.scoreTeamA,
    scoreTeamB: match.scoreTeamB,
    scoreTeamC: match.scoreTeamC,
  };
  const slot = getTeamSlot(match, teamId);
  if (slot === 'A') scores.scoreTeamA = Math.max(0, scores.scoreTeamA + delta);
  if (slot === 'B') scores.scoreTeamB = Math.max(0, scores.scoreTeamB + delta);
  if (slot === 'C') scores.scoreTeamC = Math.max(0, scores.scoreTeamC + delta);
  return scores;
}

/** Terapkan event ke match: update skor tim pencetak & cap running score pada event. */
export function applyEvent(match: MatchState, event: MatchEvent): MatchState {
  const scores = adjustScore(match, event.teamId, event.pointsAwarded);

  const finalizedEvent: MatchEvent = {
    ...event,
    runningScoreA: scores.scoreTeamA,
    runningScoreB: scores.scoreTeamB,
    runningScoreC: scores.scoreTeamC,
  };

  return { ...match, ...scores, events: [...match.events, finalizedEvent] };
}

/** Quick Undo (BR-06): soft-delete event aktif terakhir & kembalikan skor secara atomik. */
export function undoLastEvent(match: MatchState): MatchState {
  const active = getActiveEvents(match);
  const last = active[active.length - 1];
  if (!last) return match;

  const scores = adjustScore(match, last.teamId, -last.pointsAwarded);

  return {
    ...match,
    ...scores,
    events: match.events.map((e) => (e.id === last.id ? { ...e, isDeleted: true } : e)),
  };
}

export function canUndo(match: MatchState): boolean {
  return match.events.some((e) => !e.isDeleted);
}

/* ------------------------------------------------------------------ */
/* Clock & period                                                      */
/* ------------------------------------------------------------------ */

export function tickClock(match: MatchState): MatchState {
  return { ...match, gameTimeSeconds: match.gameTimeSeconds + 1 };
}

export function resetClock(match: MatchState): MatchState {
  return { ...match, gameTimeSeconds: 0 };
}

/** Siklus babak: 1 → 2 → … → periods → 1. */
export function advancePeriod(match: MatchState): MatchState {
  const next = match.currentPeriod >= match.periods ? 1 : match.currentPeriod + 1;
  return { ...match, currentPeriod: next };
}
