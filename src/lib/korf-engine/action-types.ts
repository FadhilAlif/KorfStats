import type { ActionType } from '@/types/match';

/**
 * Katalog aksi pertandingan — satu-satunya sumber kebenaran untuk klasifikasi aksi.
 * Dipakai oleh engine, Action Pad, dan Running Score agar tidak ada daftar hardcode ganda.
 */

export const GOAL_ACTIONS = [
  'SHOOT_M',
  'RI_M',
  'PENALTY_M',
  'FREE_PASS_M',
  'FREE_SHOT_M',
] as const satisfies readonly ActionType[];

export const MISS_ACTIONS = [
  'SHOOT_A',
  'RI_A',
  'PENALTY_A',
  'FREE_PASS_A',
  'FREE_SHOT_A',
] as const satisfies readonly ActionType[];

export type GoalActionType = (typeof GOAL_ACTIONS)[number];
export type MissActionType = (typeof MISS_ACTIONS)[number];

/** Aturan Korfball: setiap gol bernilai tepat 1 poin. */
export const POINTS_PER_GOAL = 1;

export function isGoalAction(action: ActionType): action is GoalActionType {
  return (GOAL_ACTIONS as readonly ActionType[]).includes(action);
}

export function isMissAction(action: ActionType): action is MissActionType {
  return (MISS_ACTIONS as readonly ActionType[]).includes(action);
}

export interface ShotTypeConfig {
  key: string;
  label: string;
  made: GoalActionType;
  miss: MissActionType;
}

/** 5 jenis tembakan eksplisit (urutan = urutan tampil di Action Pad). */
export const SHOT_TYPES: readonly ShotTypeConfig[] = [
  { key: 'SHOOT', label: 'Shoot', made: 'SHOOT_M', miss: 'SHOOT_A' },
  { key: 'RUNNING_IN', label: 'Running In', made: 'RI_M', miss: 'RI_A' },
  { key: 'PENALTY', label: 'Penalty', made: 'PENALTY_M', miss: 'PENALTY_A' },
  { key: 'FREE_PASS', label: 'Free Pass', made: 'FREE_PASS_M', miss: 'FREE_PASS_A' },
  { key: 'FREE_SHOT', label: 'Free Shot', made: 'FREE_SHOT_M', miss: 'FREE_SHOT_A' },
];

export type ActionTone = 'neutral' | 'positive' | 'negative';

export interface GeneralActionConfig {
  action: ActionType;
  label: string;
  tone: ActionTone;
}

/** Aksi non-tembakan (rebound, ball control, foul). */
export const GENERAL_ACTIONS: readonly GeneralActionConfig[] = [
  { action: 'REB_OFF', label: 'Rebound Off', tone: 'neutral' },
  { action: 'REB_DEF', label: 'Rebound Def', tone: 'neutral' },
  { action: 'ASSIST', label: 'Assist (Direct)', tone: 'positive' },
  { action: 'INTERCEPT', label: 'Intercept', tone: 'positive' },
  { action: 'TURNOVER', label: 'Turnover', tone: 'negative' },
  { action: 'FOUL', label: 'Foul', tone: 'negative' },
];

const GOAL_ACTION_LABEL: Record<GoalActionType, string> = {
  SHOOT_M: 'Shoot',
  RI_M: 'Running In',
  PENALTY_M: 'Penalty',
  FREE_PASS_M: 'Free Pass',
  FREE_SHOT_M: 'Free Shot',
};

export function getGoalActionLabel(action: ActionType): string {
  return isGoalAction(action) ? GOAL_ACTION_LABEL[action] : action;
}
