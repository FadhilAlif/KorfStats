import { ActionType, MatchEvent, PlayerStats } from '@/types/match';

/**
 * Inisialisasi statistik pemain kosong
 */
export function createEmptyPlayerStats(): PlayerStats {
  return {
    sa: 0,
    sm: 0,
    ria: 0,
    rim: 0,
    fpa: 0,
    fpm: 0,
    pa: 0,
    pm: 0,
    fsa: 0,
    fsm: 0,
    rebOff: 0,
    rebDef: 0,
    assist: 0,
    intercept: 0,
    defended: 0,
    toSum: 0,
    fouls: 0,
    fgPercentage: 0,
    riPercentage: 0,
    fpPercentage: 0,
    pPercentage: 0,
    fsPercentage: 0,
    positiveScore: 0,
    negativeScore: 0,
    totalScore: 0,
    totalPositiveActions: 0,
    efficiency: 0,
    totalPoints: 0,
  };
}

/**
 * Menghitung persentase tembakan dengan penanganan divide-by-zero
 */
export function calculatePercentage(made: number, attempt: number): number {
  if (attempt <= 0) return 0;
  return Number(((made / attempt) * 100).toFixed(2));
}

/**
 * Menghitung formula turunan performa sesuai spesifikasi baku STATISTIK GAME BANTUL.xlsx
 */
export function calculateDerivedStats(
  stats: Omit<
    PlayerStats,
    | 'fgPercentage'
    | 'riPercentage'
    | 'fpPercentage'
    | 'pPercentage'
    | 'fsPercentage'
    | 'positiveScore'
    | 'negativeScore'
    | 'totalScore'
    | 'totalPositiveActions'
    | 'efficiency'
    | 'totalPoints'
  >
): PlayerStats {
  const fgPercentage = calculatePercentage(stats.sm, stats.sa);
  const riPercentage = calculatePercentage(stats.rim, stats.ria);
  const fpPercentage = calculatePercentage(stats.fpm, stats.fpa);
  const pPercentage = calculatePercentage(stats.pm, stats.pa);
  const fsPercentage = calculatePercentage(stats.fsm, stats.fsa);

  // POSITIVE = OR + DR + AS + DD + I + FG% + RI% + FP% + P% + FS%
  const positiveScore = Number((
    stats.rebOff +
    stats.rebDef +
    stats.assist +
    stats.defended +
    stats.intercept +
    fgPercentage +
    riPercentage +
    fpPercentage +
    pPercentage +
    fsPercentage
  ).toFixed(2));

  // NEGATIVE = SUM TO + FOUL
  const negativeScore = Number((stats.toSum + stats.fouls).toFixed(2));

  // TOTAL SCORE = POSITIVE - NEGATIVE
  const totalScore = Number((positiveScore - negativeScore).toFixed(2));

  // TOT POS = SM + RIM + OR + DR + AS + FPM + PM + FSM + DD + I
  const totalPositiveActions =
    stats.sm +
    stats.rim +
    stats.rebOff +
    stats.rebDef +
    stats.assist +
    stats.fpm +
    stats.pm +
    stats.fsm +
    stats.defended +
    stats.intercept;

  // EFISIENSI = FG% + RI% + FP% + P% + FS%
  const efficiency = Number((
    fgPercentage +
    riPercentage +
    fpPercentage +
    pPercentage +
    fsPercentage
  ).toFixed(2));

  // TOTAL KESELURUHAN POINT = SM + RIM + PM + FSM + FPM (1 point each in Korfball)
  const totalPoints = stats.sm + stats.rim + stats.pm + stats.fsm + stats.fpm;

  return {
    ...stats,
    fgPercentage,
    riPercentage,
    fpPercentage,
    pPercentage,
    fsPercentage,
    positiveScore,
    negativeScore,
    totalScore,
    totalPositiveActions,
    efficiency,
    totalPoints,
  };
}

/**
 * Akumulasi rangkaian event pertandingan menjadi statistik per pemain
 */
export function aggregatePlayerStatsFromEvents(events: MatchEvent[], playerId: string): PlayerStats {
  const activeEvents = events.filter((e) => !e.isDeleted);
  const raw = {
    sa: 0,
    sm: 0,
    ria: 0,
    rim: 0,
    fpa: 0,
    fpm: 0,
    pa: 0,
    pm: 0,
    fsa: 0,
    fsm: 0,
    rebOff: 0,
    rebDef: 0,
    assist: 0,
    intercept: 0,
    defended: 0,
    toSum: 0,
    fouls: 0,
  };

  for (const event of activeEvents) {
    // 1. Jika pemain adalah pelaku aksi utama (Shooter / Defender / Passer)
    if (event.playerId === playerId) {
      switch (event.actionType) {
        case 'SHOOT_M':
          raw.sm += 1;
          raw.sa += 1;
          break;
        case 'SHOOT_A':
          raw.sa += 1;
          break;
        case 'RI_M':
          raw.rim += 1;
          raw.ria += 1;
          break;
        case 'RI_A':
          raw.ria += 1;
          break;
        case 'PENALTY_M':
          raw.pm += 1;
          raw.pa += 1;
          break;
        case 'PENALTY_A':
          raw.pa += 1;
          break;
        case 'FREE_PASS_M':
          raw.fpm += 1;
          raw.fpa += 1;
          break;
        case 'FREE_PASS_A':
          raw.fpa += 1;
          break;
        case 'FREE_SHOT_M':
          raw.fsm += 1;
          raw.fsa += 1;
          break;
        case 'FREE_SHOT_A':
          raw.fsa += 1;
          break;
        case 'REB_OFF':
          raw.rebOff += 1;
          break;
        case 'REB_DEF':
          raw.rebDef += 1;
          break;
        case 'ASSIST':
          raw.assist += 1;
          break;
        case 'INTERCEPT':
          raw.intercept += 1;
          break;
        case 'TURNOVER':
          raw.toSum += 1;
          break;
        case 'FOUL':
          raw.fouls += 1;
          break;
      }
    }

    // 2. Jika pemain memberikan assist pada tembakan rekan setim yang masuk (Goal Assist)
    if (event.assistPlayerId === playerId && event.pointsAwarded > 0) {
      raw.assist += 1;
    }

    // 3. Jika pemain adalah penjaga lawan saat gol tercipta (DP - Defended counter)
    if (event.opponentPlayerId === playerId && event.pointsAwarded > 0) {
      raw.defended += 1;
    }
  }

  return calculateDerivedStats(raw);
}

/**
 * Agregasi untuk format baris PRINT SCORE SHEET.xlsx:
 * - SHOOT (M, A)
 * - RUNNING IN (M, A)
 * - PINALTY/FS (M, A) -> Kombinasi Penalty, Free Pass, Free Shot
 * - REBOUND (OFF, DEF)
 * - ASSIST, INTERCEPT, TURN OVER, FOUL
 */
export function getScoreSheetRowValues(stats: PlayerStats) {
  return {
    shootM: stats.sm,
    shootA: stats.sa,
    runningInM: stats.rim,
    runningInA: stats.ria,
    pinaltyFsM: stats.pm + stats.fpm + stats.fsm,
    pinaltyFsA: stats.pa + stats.fpa + stats.fsa,
    rebOff: stats.rebOff,
    rebDef: stats.rebDef,
    assist: stats.assist,
    intercept: stats.intercept,
    turnover: stats.toSum,
    foul: stats.fouls,
  };
}
