'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { localDb } from '@/lib/local-db/dexie-db';
import type { MatchEvent, MatchState } from '@/types/match';
import { applyEvent, tickClock, undoLastEvent } from '@/lib/korf-engine/match-engine';

/**
 * State pertandingan live yang offline-first (BR-05).
 *
 * - Semua mutasi berupa fungsi murni dari `match-engine` (tanpa side-effect di dalam updater).
 * - Satu titik persistensi: setiap perubahan `match` ditulis ke IndexedDB.
 */
export function useLiveMatch(matchId: string) {
  const [match, setMatch] = useState<MatchState | null>(null);
  const [loading, setLoading] = useState(true);
  const hydrated = useRef(false);

  // Load dari IndexedDB
  useEffect(() => {
    let cancelled = false;
    hydrated.current = false;

    localDb.matches
      .get(matchId)
      .then((data) => {
        if (cancelled) return;
        setMatch(data ?? null);
        hydrated.current = true;
      })
      .catch((err) => console.error('Gagal memuat pertandingan:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [matchId]);

  // Persistensi tunggal ke IndexedDB
  useEffect(() => {
    if (!hydrated.current || !match) return;
    localDb.matches.put(match).catch((err) => console.error('Gagal menyimpan pertandingan:', err));
  }, [match]);

  const updateMatch = useCallback((reducer: (m: MatchState) => MatchState) => {
    setMatch((prev) => (prev ? reducer(prev) : prev));
  }, []);

  const recordEvent = useCallback(
    (event: MatchEvent) => updateMatch((m) => applyEvent(m, event)),
    [updateMatch]
  );

  const undo = useCallback(() => updateMatch(undoLastEvent), [updateMatch]);

  const tick = useCallback(() => updateMatch(tickClock), [updateMatch]);

  return { match, loading, updateMatch, recordEvent, undo, tick };
}
