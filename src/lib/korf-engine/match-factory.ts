import type {
  MatchFormat,
  MatchLineup,
  MatchState,
  Player,
  PlayerDraft,
  Team,
  TeamDraft,
  TeamStructure,
} from '@/types/match';
import { newId } from '@/lib/utils/id';
import {
  countGender,
  getRequiredComposition,
  resolveFormat,
  validateTeamComposition,
  type GenderComposition,
} from './lineup-rules';

const TEAM_CODES = ['TMA', 'TMB', 'TMC'] as const;
const TEAM_LABELS = ['Tim A', 'Tim B', 'Tim C'] as const;
const DEFAULT_TEAM_NAMES = ['Team A', 'Team B', 'Team C'] as const;

export const DEFAULT_PERIODS = 2;
export const DEFAULT_PERIOD_DURATION_MINUTES = 20;

export function getActiveTeamCount(structure: TeamStructure): number {
  return structure === 'THREE_TEAM' ? 3 : 2;
}

/** Pemain draft yang terisi namanya (baris kosong diabaikan). */
export function getNamedPlayers(players: PlayerDraft[]): PlayerDraft[] {
  return players.filter((p) => p.fullName.trim() !== '');
}

/** Validasi seluruh tim aktif. Mengembalikan pesan error pertama atau null. */
export function validateTeamDrafts(
  teams: TeamDraft[],
  structure: TeamStructure,
  format: MatchFormat
): string | null {
  const activeFormat = resolveFormat(structure, format);
  for (let i = 0; i < getActiveTeamCount(structure); i++) {
    const count = countGender(getNamedPlayers(teams[i]?.players ?? []));
    const error = validateTeamComposition(TEAM_LABELS[i], count, activeFormat);
    if (error) return error;
  }
  return null;
}

function draftsToPlayers(drafts: PlayerDraft[], teamId: string): Player[] {
  return getNamedPlayers(drafts).map((p, idx) => ({
    id: p.id,
    teamId,
    jerseyNumber: Number(p.jerseyNumber) || idx + 1,
    fullName: p.fullName.trim(),
    gender: p.gender,
    isActive: true,
  }));
}

/** Starter otomatis: N putra pertama + N putri pertama sesuai format. */
function buildStartingLineup(
  matchId: string,
  players: Player[],
  required: GenderComposition
): MatchLineup[] {
  const starterIds = new Set([
    ...players.filter((p) => p.gender === 'MALE').slice(0, required.males).map((p) => p.id),
    ...players.filter((p) => p.gender === 'FEMALE').slice(0, required.females).map((p) => p.id),
  ]);

  return players.map((p) => ({
    id: newId(),
    matchId,
    playerId: p.id,
    teamId: p.teamId,
    isStarter: starterIds.has(p.id),
    isOnCourt: starterIds.has(p.id),
    periodEntered: 1,
    player: p,
  }));
}

export interface NewMatchInput {
  matchCode: string;
  venue: string;
  structure: TeamStructure;
  format: MatchFormat;
  teams: TeamDraft[];
  periods?: number;
  periodDurationMinutes?: number;
}

/** Bangun MatchState baru (status LIVE) dari input form setup. */
export function buildNewMatch(input: NewMatchInput): MatchState {
  const matchId = newId();
  const format = resolveFormat(input.structure, input.format);
  const required = getRequiredComposition(format);

  const teams: Team[] = input.teams.slice(0, getActiveTeamCount(input.structure)).map((draft, i) => {
    const teamId = newId();
    return {
      id: teamId,
      name: draft.name.trim() || DEFAULT_TEAM_NAMES[i],
      code: TEAM_CODES[i],
      players: draftsToPlayers(draft.players, teamId),
    };
  });

  const [teamA, teamB, teamC] = teams;

  return {
    id: matchId,
    matchCode: input.matchCode.trim(),
    matchDate: new Date().toISOString(),
    venue: input.venue.trim(),
    format,
    teamStructure: input.structure,
    teamA,
    teamB,
    teamC,
    periods: input.periods ?? DEFAULT_PERIODS,
    periodDurationMinutes: input.periodDurationMinutes ?? DEFAULT_PERIOD_DURATION_MINUTES,
    currentPeriod: 1,
    gameTimeSeconds: 0,
    status: 'LIVE',
    scoreTeamA: 0,
    scoreTeamB: 0,
    scoreTeamC: 0,
    lineups: teams.flatMap((t) => buildStartingLineup(matchId, t.players ?? [], required)),
    events: [],
  };
}

/** Kode game default: GAME-MMDD-NN */
export function generateMatchCode(date = new Date()): string {
  const mmdd = date.toISOString().slice(5, 10).replace('-', '');
  const suffix = Math.floor(Math.random() * 90 + 10);
  return `GAME-${mmdd}-${suffix}`;
}
