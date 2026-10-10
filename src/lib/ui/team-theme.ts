import type { TeamSlot } from '@/lib/korf-engine/match-engine';

/**
 * Identitas visual per slot tim.
 * Kelas ditulis lengkap (bukan string dinamis) agar terdeteksi Tailwind JIT.
 */
export interface TeamTheme {
  role: string;
  dot: string;
  solid: string;
  soft: string;
  text: string;
  ruleLeft: string;
  ruleRight: string;
  ruleTop: string;
  activeTab: string;
}

export const TEAM_THEME: Record<TeamSlot, TeamTheme> = {
  A: {
    role: 'Home',
    dot: 'bg-brand-600',
    solid: 'bg-brand-600 text-white',
    soft: 'bg-brand-50 text-brand-700',
    text: 'text-brand-700',
    ruleLeft: 'border-l-brand-600',
    ruleRight: 'border-r-brand-600',
    ruleTop: 'border-t-brand-600',
    activeTab: 'bg-white text-brand-800 shadow-card',
  },
  B: {
    role: 'Away',
    dot: 'bg-teal-600',
    solid: 'bg-teal-600 text-white',
    soft: 'bg-teal-50 text-teal-700',
    text: 'text-teal-700',
    ruleLeft: 'border-l-teal-600',
    ruleRight: 'border-r-teal-600',
    ruleTop: 'border-t-teal-600',
    activeTab: 'bg-white text-teal-800 shadow-card',
  },
  C: {
    role: 'Team C',
    dot: 'bg-amber-500',
    solid: 'bg-amber-500 text-white',
    soft: 'bg-amber-50 text-amber-700',
    text: 'text-amber-700',
    ruleLeft: 'border-l-amber-500',
    ruleRight: 'border-r-amber-500',
    ruleTop: 'border-t-amber-500',
    activeTab: 'bg-white text-amber-800 shadow-card',
  },
};
