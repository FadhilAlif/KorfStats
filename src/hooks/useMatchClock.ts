'use client';

import { useEffect, useRef } from 'react';

/**
 * Menjalankan `onTick` setiap detik selama `running` bernilai true.
 * Callback disimpan di ref agar interval tidak di-reset setiap render.
 */
export function useMatchClock(running: boolean, onTick: () => void): void {
  const callbackRef = useRef(onTick);

  useEffect(() => {
    callbackRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => callbackRef.current(), 1000);
    return () => clearInterval(timer);
  }, [running]);
}
