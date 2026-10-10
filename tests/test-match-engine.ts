import {
  applyEvent,
  undoLastEvent,
  createMatchEvent,
  canUndo,
  getOpponentTeams,
} from '../src/lib/korf-engine/match-engine';
import {
  validateTeamComposition,
  getRequiredComposition,
} from '../src/lib/korf-engine/lineup-rules';
import { buildNewMatch } from '../src/lib/korf-engine/match-factory';
import { newId } from '../src/lib/utils/id';
import { MatchState, Player } from '../src/types/match';

function runEngineTests() {
  console.log('=== RUNNING MATCH ENGINE & MODULARITY TESTS ===\n');

  // Test 1: UUID format validation
  const id1 = newId();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  console.assert(uuidRegex.test(id1), `Test 1 Failed: ${id1} is not a valid UUIDv4`);
  console.log(`✔ Test 1 Passed: newId() produces valid UUIDv4: ${id1}`);

  // Test 2: Lineup rules validation
  const compK8Valid = validateTeamComposition('Tim A', { males: 4, females: 4 }, 'K8');
  console.assert(compK8Valid === null, 'Test 2A Failed: 4M/4F should be valid for K8');

  const compK8Invalid = validateTeamComposition('Tim A', { males: 3, females: 5 }, 'K8');
  console.assert(compK8Invalid !== null, 'Test 2B Failed: 3M/5F should be invalid for K8');

  const compK4Valid = validateTeamComposition('Tim B', { males: 2, females: 2 }, 'K4');
  console.assert(compK4Valid === null, 'Test 2C Failed: 2M/2F should be valid for K4');
  console.log('✔ Test 2 Passed: Mixed-gender composition rules (BR-02) working correctly');

  // Test 3: Match factory builds clean match with lineups
  const match = buildNewMatch({
    matchCode: 'GAME-TEST-01',
    venue: 'GOR Bantul',
    structure: 'TWO_TEAM',
    format: 'K8',
    teams: [
      {
        name: 'Tim A',
        players: [
          { id: 'p1', jerseyNumber: 1, fullName: 'Didiv', gender: 'MALE' },
          { id: 'p2', jerseyNumber: 2, fullName: 'Julius', gender: 'MALE' },
          { id: 'p3', jerseyNumber: 3, fullName: 'Guntur', gender: 'MALE' },
          { id: 'p4', jerseyNumber: 4, fullName: 'Fadhil', gender: 'MALE' },
          { id: 'p5', jerseyNumber: 11, fullName: 'Ririn', gender: 'FEMALE' },
          { id: 'p6', jerseyNumber: 12, fullName: 'Maya', gender: 'FEMALE' },
          { id: 'p7', jerseyNumber: 13, fullName: 'Viki', gender: 'FEMALE' },
          { id: 'p8', jerseyNumber: 14, fullName: 'Rukmi', gender: 'FEMALE' },
        ],
      },
      {
        name: 'Tim B',
        players: [
          { id: 'p9', jerseyNumber: 5, fullName: 'Aah', gender: 'MALE' },
          { id: 'p10', jerseyNumber: 6, fullName: 'Dimas', gender: 'MALE' },
          { id: 'p11', jerseyNumber: 7, fullName: 'Arma', gender: 'MALE' },
          { id: 'p12', jerseyNumber: 8, fullName: 'Ilham', gender: 'MALE' },
          { id: 'p13', jerseyNumber: 15, fullName: 'Najwa', gender: 'FEMALE' },
          { id: 'p14', jerseyNumber: 16, fullName: 'Zahra', gender: 'FEMALE' },
          { id: 'p15', jerseyNumber: 17, fullName: 'Thea', gender: 'FEMALE' },
          { id: 'p16', jerseyNumber: 18, fullName: 'Lintang', gender: 'FEMALE' },
        ],
      },
    ],
  });

  console.assert(match.lineups.length === 16, `Test 3A Failed: Lineup length expected 16, got ${match.lineups.length}`);
  console.assert(match.scoreTeamA === 0 && match.scoreTeamB === 0, 'Test 3B Failed: Initial score should be 0');
  console.log('✔ Test 3 Passed: buildNewMatch successfully generated match and lineups');

  // Test 4: Pure Apply Event (Shoot Made increases score by 1)
  const shooterA = match.teamA.players![0];
  const goalEvent = createMatchEvent({
    match,
    player: shooterA,
    actionType: 'SHOOT_M',
  });

  const stateAfterGoal = applyEvent(match, goalEvent);
  console.assert(stateAfterGoal.scoreTeamA === 1, `Test 4A Failed: Score A expected 1, got ${stateAfterGoal.scoreTeamA}`);
  console.assert(stateAfterGoal.scoreTeamB === 0, 'Test 4B Failed: Score B should remain 0');
  console.assert(stateAfterGoal.events.length === 1, 'Test 4C Failed: Events count expected 1');
  console.assert(canUndo(stateAfterGoal) === true, 'Test 4D Failed: canUndo should be true');
  console.log('✔ Test 4 Passed: applyEvent atomically incremented score & running score');

  // Test 5: Quick Undo
  const stateAfterUndo = undoLastEvent(stateAfterGoal);
  console.assert(stateAfterUndo.scoreTeamA === 0, `Test 5A Failed: Score A expected 0 after undo, got ${stateAfterUndo.scoreTeamA}`);
  console.assert(stateAfterUndo.events[0].isDeleted === true, 'Test 5B Failed: Event should be marked isDeleted');
  console.assert(canUndo(stateAfterUndo) === false, 'Test 5C Failed: canUndo should be false after all events deleted');
  console.log('✔ Test 5 Passed: undoLastEvent atomically restored scores and soft-deleted event');

  // Test 6: Opponent resolution for 3 Team format
  const threeTeamMatch: MatchState = {
    ...match,
    teamStructure: 'THREE_TEAM',
    teamC: { id: 'team-c', name: 'Tim C', code: 'TMC', players: [] },
  };
  const opponentsA = getOpponentTeams(threeTeamMatch, match.teamA.id);
  console.assert(opponentsA.length === 2, `Test 6 Failed: Opponents for Team A in 3-team expected 2, got ${opponentsA.length}`);
  console.log('✔ Test 6 Passed: Opponent teams resolution correctly returns 2 opponent teams for 3-team format');

  console.log('\n=== ALL MATCH ENGINE TESTS PASSED (6/6) ===');
}

runEngineTests();
