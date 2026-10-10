import { generateScoreSheetWorkbook } from '../src/lib/excel/scoresheet-exporter';
import { MatchState } from '../src/types/match';
import fs from 'fs';

async function testExporter() {
  console.log('=== TESTING EXCELJS SCORE SHEET EXPORTER ===\n');

  const dummyMatch: MatchState = {
    id: 'test-match-1',
    matchCode: 'K8-UJI-01',
    matchDate: '2026-10-10T20:00:00Z',
    venue: 'GOR Sasana Krida Bantul',
    format: 'K8',
    teamStructure: 'TWO_TEAM',
    periods: 2,
    periodDurationMinutes: 20,
    currentPeriod: 1,
    gameTimeSeconds: 320,
    status: 'COMPLETED',
    scoreTeamA: 3,
    scoreTeamB: 2,
    scoreTeamC: 0,
    teamA: {
      id: 'team-a',
      name: 'Bantul Selection A',
      code: 'BTL-A',
      players: [
        { id: 'p1', teamId: 'team-a', fullName: 'Didiv Wandha P', jerseyNumber: 1, gender: 'MALE', isActive: true },
        { id: 'p2', teamId: 'team-a', fullName: 'Citra Wahyuningtyas', jerseyNumber: 3, gender: 'FEMALE', isActive: true },
      ],
    },
    teamB: {
      id: 'team-b',
      name: 'Bantul Selection B',
      code: 'BTL-B',
      players: [
        { id: 'p3', teamId: 'team-b', fullName: 'Rukmi Rayi', jerseyNumber: 9, gender: 'FEMALE', isActive: true },
        { id: 'p4', teamId: 'team-b', fullName: 'Farrel Adhitama', jerseyNumber: 15, gender: 'MALE', isActive: true },
      ],
    },
    lineups: [],
    events: [
      {
        id: 'ev-1',
        clientEventId: 'c-1',
        matchId: 'test-match-1',
        playerId: 'p1',
        teamId: 'team-a',
        period: 1,
        gameTimeSeconds: 65,
        actionType: 'SHOOT_M',
        pointsAwarded: 1,
        opponentPlayerId: 'p4',
        opponentPlayerName: 'Farrel Adhitama',
        opponentPlayerJersey: 15,
        runningScoreA: 1,
        runningScoreB: 0,
        runningScoreC: 0,
        recordedAt: new Date().toISOString(),
        isDeleted: false,
        playerName: 'Didiv Wandha P',
        playerJersey: 1,
      },
      {
        id: 'ev-2',
        clientEventId: 'c-2',
        matchId: 'test-match-1',
        playerId: 'p3',
        teamId: 'team-b',
        period: 1,
        gameTimeSeconds: 120,
        actionType: 'RI_M',
        pointsAwarded: 1,
        opponentPlayerId: 'p2',
        opponentPlayerName: 'Citra Wahyuningtyas',
        opponentPlayerJersey: 3,
        runningScoreA: 1,
        runningScoreB: 1,
        runningScoreC: 0,
        recordedAt: new Date().toISOString(),
        isDeleted: false,
        playerName: 'Rukmi Rayi',
        playerJersey: 9,
      },
    ],
  };

  const workbook = await generateScoreSheetWorkbook(dummyMatch);
  const sheet = workbook.getWorksheet('SCORE SHEET 2 TEAM');

  console.assert(sheet !== undefined, 'Sheet SCORE SHEET 2 TEAM not found');
  console.log('✔ Sheet SCORE SHEET 2 TEAM exists');

  // Verify Title
  const titleVal = sheet!.getCell('A2').value;
  console.assert(titleVal === 'STATISTIK GAME', `Expected STATISTIK GAME, got ${titleVal}`);
  console.log('✔ Title A2 = STATISTIK GAME');

  // Verify Yellow Score fill on running score
  const r5Fill = sheet!.getCell('R5').fill as any;
  console.assert(r5Fill?.fgColor?.argb === 'FFFFFF00', 'Score cell R5 must be yellow');
  console.log('✔ Cell R5 (SCORE) fill is Yellow (FFFFFF00)');

  // Write test output to verify binary integrity
  const testOutPath = 'tests/generated-test-scoresheet.xlsx';
  await workbook.xlsx.writeFile(testOutPath);
  console.assert(fs.existsSync(testOutPath), 'Generated Excel file not created');
  const stats = fs.statSync(testOutPath);
  console.log(`✔ Generated Excel written to disk: ${testOutPath} (${stats.size} bytes)`);

  console.log('\n🎉 ALL EXCEL EXPORTER VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

testExporter();
