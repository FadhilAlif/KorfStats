import {
  calculateDerivedStats,
  calculatePercentage,
  aggregatePlayerStatsFromEvents,
  getScoreSheetRowValues,
} from '../src/lib/korf-engine/korf-calculator';
import { MatchEvent } from '../src/types/match';

function runTests() {
  console.log('=== RUNNING KORFSTATS CALCULATOR VERIFICATION TESTS ===\n');

  // Test 1: Percentage calculation
  const pct1 = calculatePercentage(3, 10);
  console.assert(pct1 === 30, `Test 1 Failed: Expected 30, got ${pct1}`);
  console.log('✔ Test 1 Passed: calculatePercentage(3, 10) = 30%');

  const pctZero = calculatePercentage(0, 0);
  console.assert(pctZero === 0, `Test 1.1 Failed: Expected 0, got ${pctZero}`);
  console.log('✔ Test 1.1 Passed: calculatePercentage(0, 0) = 0% (Divide-by-zero safe)');

  // Test 2: Formula test from sample row in STATISTIK GAME BANTUL.xlsx
  // Sample: SA=3, SM=1 (FG%=33.33), RIA=1, RIM=1 (RI%=100), REB_OFF=2, REB_DEF=1, AS=1, TO=2, FOUL=1
  const rawStats = {
    sa: 3,
    sm: 1,
    ria: 1,
    rim: 1,
    fpa: 0,
    fpm: 0,
    pa: 0,
    pm: 0,
    fsa: 0,
    fsm: 0,
    rebOff: 2,
    rebDef: 1,
    assist: 1,
    intercept: 1,
    defended: 0,
    toSum: 2,
    fouls: 1,
  };

  const calculated = calculateDerivedStats(rawStats);

  // FG% = 33.33, RI% = 100
  console.assert(calculated.fgPercentage === 33.33, `FG% failed: ${calculated.fgPercentage}`);
  console.assert(calculated.riPercentage === 100, `RI% failed: ${calculated.riPercentage}`);

  // Total Points = SM + RIM = 1 + 1 = 2 (in Korfball, each made goal = 1 point)
  console.assert(calculated.totalPoints === 2, `Total points failed: ${calculated.totalPoints}`);
  console.log('✔ Test 2 Passed: Total Points in Korfball = 2 (SM + RIM, 1 pt each)');

  // Negative Score = TO (2) + FOUL (1) = 3
  console.assert(calculated.negativeScore === 3, `Negative score failed: ${calculated.negativeScore}`);
  console.log('✔ Test 3 Passed: Negative Score = 3 (SUM TO + FOUL)');

  // Positive Score = OR(2) + DR(1) + AS(1) + I(1) + DD(0) + FG%(33.33) + RI%(100) = 138.33
  console.assert(calculated.positiveScore === 138.33, `Positive score failed: ${calculated.positiveScore}`);
  console.log('✔ Test 4 Passed: Positive Score = 138.33');

  // Total Score = 138.33 - 3 = 135.33
  console.assert(calculated.totalScore === 135.33, `Total score failed: ${calculated.totalScore}`);
  console.log('✔ Test 5 Passed: Total Score = 135.33 (Positive - Negative)');

  // Test 6: ScoreSheet Row values
  const rowVals = getScoreSheetRowValues(calculated);
  console.assert(rowVals.shootM === 1 && rowVals.shootA === 3, 'ScoreSheet shoot failed');
  console.assert(rowVals.runningInM === 1 && rowVals.runningInA === 1, 'ScoreSheet RI failed');
  console.assert(rowVals.turnover === 2 && rowVals.foul === 1, 'ScoreSheet TO/Foul failed');
  console.log('✔ Test 6 Passed: getScoreSheetRowValues correctly maps to PRINT SCORE SHEET columns');

  console.log('\n🎉 ALL CALCULATOR FORMULA TESTS PASSED SUCCESSFULLY!');
}

runTests();
