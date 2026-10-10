'use client';

import { useCallback, useMemo, useState } from 'react';
import type { Gender, MatchFormat, PlayerDraft, TeamDraft, TeamStructure } from '@/types/match';
import { localDb } from '@/lib/local-db/dexie-db';
import { newId } from '@/lib/utils/id';
import { buildBantulSeed } from '@/lib/seed/bantul-roster';
import {
  buildNewMatch,
  generateMatchCode,
  getActiveTeamCount,
  getNamedPlayers,
  validateTeamDrafts,
} from '@/lib/korf-engine/match-factory';
import {
  countGender,
  getRequiredComposition,
  resolveFormat,
  type GenderCount,
} from '@/lib/korf-engine/lineup-rules';

const INITIAL_TEAMS: TeamDraft[] = [
  { name: 'Tim A (Bantul Merah)', players: [] },
  { name: 'Tim B (Bantul Putih)', players: [] },
  { name: 'Tim C (Bantul Hijau)', players: [] },
];

/**
 * State & aksi form setup pertandingan. Halaman hanya merender.
 */
export function useMatchSetupForm() {
  const [matchCode, setMatchCode] = useState(generateMatchCode);
  const [venue, setVenue] = useState('GOR Sasana Krida Bantul');
  const [structure, setStructureState] = useState<TeamStructure>('TWO_TEAM');
  const [format, setFormat] = useState<MatchFormat>('K8');
  const [teams, setTeams] = useState<TeamDraft[]>(INITIAL_TEAMS);
  const [validationError, setValidationError] = useState<string | null>(null);

  const activeFormat = resolveFormat(structure, format);
  const required = getRequiredComposition(activeFormat);
  const activeTeamCount = getActiveTeamCount(structure);

  const genderCounts: GenderCount[] = useMemo(
    () => teams.map((t) => countGender(getNamedPlayers(t.players))),
    [teams]
  );

  const setStructure = useCallback((next: TeamStructure) => {
    setStructureState(next);
    if (next === 'THREE_TEAM') setFormat('K4');
  }, []);

  const updateTeam = useCallback((index: number, reducer: (team: TeamDraft) => TeamDraft) => {
    setTeams((prev) => prev.map((t, i) => (i === index ? reducer(t) : t)));
  }, []);

  const setTeamName = useCallback(
    (index: number, name: string) => updateTeam(index, (t) => ({ ...t, name })),
    [updateTeam]
  );

  const addPlayer = useCallback(
    (index: number, gender: Gender) =>
      updateTeam(index, (t) => ({
        ...t,
        players: [...t.players, { id: newId(), jerseyNumber: '', fullName: '', gender }],
      })),
    [updateTeam]
  );

  const removePlayer = useCallback(
    (index: number, playerId: string) =>
      updateTeam(index, (t) => ({ ...t, players: t.players.filter((p) => p.id !== playerId) })),
    [updateTeam]
  );

  const updatePlayer = useCallback(
    (index: number, playerId: string, patch: Partial<Omit<PlayerDraft, 'id'>>) =>
      updateTeam(index, (t) => ({
        ...t,
        players: t.players.map((p) => (p.id === playerId ? { ...p, ...patch } : p)),
      })),
    [updateTeam]
  );

  const seedBantulRoster = useCallback(() => {
    const seed = buildBantulSeed(structure);
    setTeams(seed.teamNames.map((name, i) => ({ name, players: seed.rosters[i] })));
    setValidationError(null);
  }, [structure]);

  const clearRosters = useCallback(() => {
    setTeams((prev) => prev.map((t) => ({ ...t, players: [] })));
    setValidationError(null);
  }, []);

  /** Validasi + simpan ke IndexedDB. Mengembalikan matchId bila sukses. */
  const submit = useCallback(async (): Promise<string | null> => {
    const error = validateTeamDrafts(teams, structure, format);
    setValidationError(error);
    if (error) return null;

    const match = buildNewMatch({ matchCode, venue, structure, format, teams });
    await localDb.matches.put(match);
    return match.id;
  }, [teams, structure, format, matchCode, venue]);

  return {
    // values
    matchCode,
    venue,
    structure,
    format,
    activeFormat,
    required,
    teams,
    activeTeamCount,
    genderCounts,
    validationError,
    // actions
    setMatchCode,
    setVenue,
    setStructure,
    setFormat,
    setTeamName,
    addPlayer,
    removePlayer,
    updatePlayer,
    seedBantulRoster,
    clearRosters,
    submit,
  };
}

export type MatchSetupForm = ReturnType<typeof useMatchSetupForm>;
