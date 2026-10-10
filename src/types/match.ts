export type MatchFormat = 'K4' | 'K8';
export type TeamStructure = 'TWO_TEAM' | 'THREE_TEAM';
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED';
export type Gender = 'MALE' | 'FEMALE';

export type ActionType =
  | 'SHOOT_M'
  | 'SHOOT_A'
  | 'RI_M'
  | 'RI_A'
  | 'PENALTY_M'
  | 'PENALTY_A'
  | 'FREE_PASS_M'
  | 'FREE_PASS_A'
  | 'FREE_SHOT_M'
  | 'FREE_SHOT_A'
  | 'REB_OFF'
  | 'REB_DEF'
  | 'ASSIST'
  | 'INTERCEPT'
  | 'TURNOVER'
  | 'FOUL';

export interface Player {
  id: string;
  teamId: string;
  fullName: string;
  nickname?: string;
  jerseyNumber: number;
  gender: Gender; // MALE = Laki-laki (L), FEMALE = Perempuan (P)
  jerseySize?: string;
  primaryPosition?: string;
  isActive: boolean;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  players?: Player[];
}

export interface MatchLineup {
  id: string;
  matchId: string;
  playerId: string;
  teamId: string;
  isStarter: boolean;
  isOnCourt: boolean;
  periodEntered: number;
  player?: Player;
}

export interface MatchEvent {
  id: string;
  clientEventId: string;
  matchId: string;
  playerId?: string;
  teamId: string;
  period: number;
  gameTimeSeconds: number;
  actionType: ActionType;
  shotPosition?: number;       // 1 to 8 (reserved for Phase 2)
  shotDistanceMeter?: number;  // 2, 4, 6, 8 (reserved for Phase 2)
  turnoverType?: string;
  opponentPlayerId?: string;   // DP (Defended by opponent)
  opponentPlayerName?: string;
  opponentPlayerJersey?: number;
  assistPlayerId?: string;     // Assist by teammate
  assistPlayerName?: string;
  assistPlayerJersey?: number;
  pointsAwarded: number;       // 1 or 0
  runningScoreA: number;
  runningScoreB: number;
  runningScoreC: number;
  recordedAt: string;
  isDeleted: boolean;
  // joined fields for display
  playerName?: string;
  playerJersey?: number;
  playerGender?: Gender;
}

export interface PlayerStats {
  sa: number;
  sm: number;
  ria: number;
  rim: number;
  fpa: number;
  fpm: number;
  pa: number;
  pm: number;
  fsa: number;
  fsm: number;
  rebOff: number;
  rebDef: number;
  assist: number;
  intercept: number;
  defended: number;
  toSum: number;
  fouls: number;
  // Calculated metrics
  fgPercentage: number;
  riPercentage: number;
  fpPercentage: number;
  pPercentage: number;
  fsPercentage: number;
  positiveScore: number;
  negativeScore: number;
  totalScore: number;
  totalPositiveActions: number;
  efficiency: number;
  totalPoints: number;
}

export interface MatchState {
  id: string;
  matchCode: string;
  matchDate: string;
  venue?: string;
  format: MatchFormat;
  teamStructure: TeamStructure;
  teamA: Team;
  teamB: Team;
  teamC?: Team;
  periods: number;
  periodDurationMinutes: number;
  currentPeriod: number;
  gameTimeSeconds: number;
  status: MatchStatus;
  scoreTeamA: number;
  scoreTeamB: number;
  scoreTeamC: number;
  lineups: MatchLineup[];
  events: MatchEvent[];
}
