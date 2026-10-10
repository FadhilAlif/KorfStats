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
  containerClass: string;
  badgeClass: string;
  madeClass: string;
  missClass: string;
  subtextMade: string;
  subtextMiss: string;
}

/** 5 jenis tembakan dengan palet warna corporate harmonis (urutan = urutan tampil di Action Pad). */
export const SHOT_TYPES: readonly ShotTypeConfig[] = [
  {
    key: 'SHOOT',
    label: 'Shoot',
    made: 'SHOOT_M',
    miss: 'SHOOT_A',
    containerClass: 'border-emerald-200/80 bg-emerald-50/30 hover:border-emerald-300',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    madeClass: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs',
    missClass: 'bg-white hover:bg-emerald-50/70 border-emerald-300 text-emerald-900',
    subtextMade: 'text-emerald-100',
    subtextMiss: 'text-emerald-600',
  },
  {
    key: 'RUNNING_IN',
    label: 'Running In',
    made: 'RI_M',
    miss: 'RI_A',
    containerClass: 'border-teal-200/80 bg-teal-50/30 hover:border-teal-300',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    madeClass: 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs',
    missClass: 'bg-white hover:bg-teal-50/70 border-teal-300 text-teal-900',
    subtextMade: 'text-teal-100',
    subtextMiss: 'text-teal-600',
  },
  {
    key: 'PENALTY',
    label: 'Penalty',
    made: 'PENALTY_M',
    miss: 'PENALTY_A',
    containerClass: 'border-sky-200/80 bg-sky-50/30 hover:border-sky-300',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    madeClass: 'bg-sky-700 hover:bg-sky-800 text-white shadow-xs',
    missClass: 'bg-white hover:bg-sky-50/70 border-sky-300 text-sky-900',
    subtextMade: 'text-sky-100',
    subtextMiss: 'text-sky-600',
  },
  {
    key: 'FREE_PASS',
    label: 'Free Pass',
    made: 'FREE_PASS_M',
    miss: 'FREE_PASS_A',
    containerClass: 'border-indigo-200/80 bg-indigo-50/30 hover:border-indigo-300',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    madeClass: 'bg-indigo-700 hover:bg-indigo-800 text-white shadow-xs',
    missClass: 'bg-white hover:bg-indigo-50/70 border-indigo-300 text-indigo-900',
    subtextMade: 'text-indigo-100',
    subtextMiss: 'text-indigo-600',
  },
  {
    key: 'FREE_SHOT',
    label: 'Free Shot',
    made: 'FREE_SHOT_M',
    miss: 'FREE_SHOT_A',
    containerClass: 'border-purple-200/80 bg-purple-50/30 hover:border-purple-300',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    madeClass: 'bg-purple-700 hover:bg-purple-800 text-white shadow-xs',
    missClass: 'bg-white hover:bg-purple-50/70 border-purple-300 text-purple-900',
    subtextMade: 'text-purple-100',
    subtextMiss: 'text-purple-600',
  },
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
