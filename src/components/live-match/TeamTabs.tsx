'use client';

import type { MatchState } from '@/types/match';
import { getTeamEntries } from '@/lib/korf-engine/match-engine';
import { TEAM_THEME } from '@/lib/ui/team-theme';

interface TeamTabsProps {
  match: MatchState;
  selectedTeamId: string;
  onSelectTeam: (teamId: string) => void;
}

export function TeamTabs({ match, selectedTeamId, onSelectTeam }: TeamTabsProps) {
  const teamEntries = getTeamEntries(match);

  return (
    <div className="flex p-1 bg-slate-200/70 rounded-xl gap-1">
      {teamEntries.map(({ slot, team }) => {
        const isSelected = team.id === selectedTeamId;
        const theme = TEAM_THEME[slot];

        return (
          <button
            key={team.id}
            type="button"
            onClick={() => onSelectTeam(team.id)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 truncate ${
              isSelected
                ? theme.activeTab
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${theme.dot}`} />
            <span className="truncate">{team.name}</span>
          </button>
        );
      })}
    </div>
  );
}
