import ExcelJS from 'exceljs';
import { MatchState } from '@/types/match';
import { aggregatePlayerStatsFromEvents, getScoreSheetRowValues } from '../korf-engine/korf-calculator';

const YELLOW_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFFFF00' },
};

const BORDER_THIN: Partial<ExcelJS.Borders> = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
};

function applyCellBorder(cell: ExcelJS.Cell) {
  cell.border = BORDER_THIN;
}

/**
 * Generate workbook Excel sesuai persis format PRINT SCORE SHEET.xlsx
 */
export async function generateScoreSheetWorkbook(match: MatchState): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'KorfStats Bantul';
  workbook.lastModifiedBy = 'KorfStats Bantul';
  workbook.created = new Date();

  if (match.teamStructure === 'THREE_TEAM') {
    buildThreeTeamSheet(workbook, match);
  } else {
    buildTwoTeamSheet(workbook, match);
  }

  return workbook;
}

/**
 * Membangun lembar SCORE SHEET 2 TEAM
 */
function buildTwoTeamSheet(workbook: ExcelJS.Workbook, match: MatchState) {
  const sheet = workbook.addWorksheet('SCORE SHEET 2 TEAM', {
    pageSetup: { orientation: 'landscape', paperSize: 9 }, // A4 landscape
  });

  // Column widths
  sheet.columns = [
    { width: 4.5 },  // A: NO
    { width: 18 },   // B: NAMA
    { width: 6 },    // C: SHOOT M
    { width: 6 },    // D: SHOOT A
    { width: 6 },    // E: RI M
    { width: 6 },    // F: RI A
    { width: 6.5 },  // G: PINALTY/FS M
    { width: 6.5 },  // H: PINALTY/FS A
    { width: 6 },    // I: REB OFF
    { width: 6 },    // J: REB DEF
    { width: 7 },    // K: ASSIST
    { width: 7.5 },  // L: INTERCEPT
    { width: 7.5 },  // M: TURN OVER
    { width: 6 },    // N: FOUL
    { width: 6 },    // O: DP
    { width: 7 },    // P: TIME
    { width: 14 },   // Q: NAME
    { width: 6 },    // R: SCORE (Yellow)
    { width: 6 },    // S: SCORE (Yellow)
    { width: 14 },   // T: NAME
    { width: 7 },    // U: TIME
    { width: 6 },    // V: DP
  ];

  // Row 2: Title
  sheet.mergeCells('A2:V2');
  const titleCell = sheet.getCell('A2');
  titleCell.value = 'STATISTIK GAME';
  titleCell.font = { name: 'Arial', size: 14, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Row 3: Team A header & Running score title
  sheet.getCell('A3').value = match.teamA.name ? `TEAM A: ${match.teamA.name}` : 'TEAM A';
  sheet.getCell('A3').font = { name: 'Arial', size: 11, bold: true };

  sheet.mergeCells('O3:V3');
  const rsTitle = sheet.getCell('O3');
  rsTitle.value = 'RUNNING SCORE';
  rsTitle.font = { name: 'Arial', size: 11, bold: true };
  rsTitle.alignment = { horizontal: 'center', vertical: 'middle' };

  // Headers for Team A (Rows 4 to 7)
  setupTeamHeaderRows(sheet, 4, match.teamA.name, match.teamB.name);

  // Fill Team A Players (Rows 8 to 19 - up to 12 rows)
  const teamAPlayers = match.teamA.players || [];
  for (let i = 0; i < 12; i++) {
    const rowNum = 8 + i;
    const player = teamAPlayers[i];
    fillPlayerRow(sheet, rowNum, player, match);
  }

  // Row 20: Team B Label
  sheet.getCell('A20').value = match.teamB.name ? `TEAM B: ${match.teamB.name}` : 'TEAM B';
  sheet.getCell('A20').font = { name: 'Arial', size: 11, bold: true };

  // Headers for Team B (Rows 21 to 24)
  setupTeamBHeaderRows(sheet, 21);

  // Fill Team B Players (Rows 25 to 36 - up to 12 rows)
  const teamBPlayers = match.teamB.players || [];
  for (let i = 0; i < 12; i++) {
    const rowNum = 25 + i;
    const player = teamBPlayers[i];
    fillPlayerRow(sheet, rowNum, player, match);
  }

  // Running Score Table Fill (Columns O to V, rows 5 to 36)
  fillRunningScoreTwoTeam(sheet, match);

  // Apply borders to table cells
  applyBordersToRange(sheet, 4, 36, 1, 22);
}

/**
 * Membangun lembar SCORE SHEET 3 TEAM
 */
function buildThreeTeamSheet(workbook: ExcelJS.Workbook, match: MatchState) {
  const sheet = workbook.addWorksheet('SCORE SHEET 3 TEAM', {
    pageSetup: { orientation: 'landscape', paperSize: 9 },
  });

  sheet.columns = [
    { width: 4.5 },  // A: NO
    { width: 16 },   // B: NAMA
    { width: 6 },    // C: SHOOT M
    { width: 6 },    // D: SHOOT A
    { width: 6 },    // E: RI M
    { width: 6 },    // F: RI A
    { width: 6.5 },  // G: PINALTY/FS M
    { width: 6.5 },  // H: PINALTY/FS A
    { width: 6 },    // I: REB OFF
    { width: 6 },    // J: REB DEF
    { width: 7 },    // K: ASSIST
    { width: 7.5 },  // L: INTERCEPT
    { width: 7.5 },  // M: TURN OVER
    { width: 6 },    // N: FOUL
    { width: 6 },    // O: DP
    { width: 7 },    // P: TIME
    { width: 12 },   // Q: NAME
    { width: 6 },    // R: SCORE (Yellow)
    { width: 6 },    // S: SCORE (Yellow)
    { width: 12 },   // T: NAME
    { width: 7 },    // U: TIME
    { width: 6 },    // V: DP
    { width: 6 },    // W: SCORE (Yellow)
    { width: 12 },   // X: NAME
    { width: 7 },    // Y: TIME
    { width: 6 },    // Z: DP
  ];

  // Row 2: Title
  sheet.mergeCells('A2:Z2');
  const titleCell = sheet.getCell('A2');
  titleCell.value = 'STATISTIK GAME';
  titleCell.font = { name: 'Arial', size: 14, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Row 3
  sheet.getCell('A3').value = match.teamA.name ? `TEAM A: ${match.teamA.name}` : 'TEAM A';
  sheet.getCell('A3').font = { name: 'Arial', size: 11, bold: true };
  sheet.mergeCells('O3:Z3');
  sheet.getCell('O3').value = 'RUNNING SCORE';
  sheet.getCell('O3').font = { name: 'Arial', size: 11, bold: true };
  sheet.getCell('O3').alignment = { horizontal: 'center', vertical: 'middle' };

  // Headers (Rows 4-7)
  setupThreeTeamHeaders(sheet, match);

  // Team A Players (Rows 8-11, 4 players)
  fillTeamRows(sheet, 8, 11, match.teamA.players || [], match);

  // Team B Label & Players (Row 12 label, rows 13-16 players)
  sheet.getCell('A12').value = match.teamB.name ? `TEAM B: ${match.teamB.name}` : 'TEAM B';
  sheet.getCell('A12').font = { name: 'Arial', size: 10, bold: true };
  fillTeamRows(sheet, 13, 16, match.teamB.players || [], match);

  // Team C Label & Players (Row 17 label, rows 18-21 players)
  sheet.getCell('A17').value = match.teamC?.name ? `TEAM C: ${match.teamC.name}` : 'TEAM C';
  sheet.getCell('A17').font = { name: 'Arial', size: 10, bold: true };
  fillTeamRows(sheet, 18, 21, match.teamC?.players || [], match);

  // Team D Label & Players (Row 22 label, rows 23-26 empty/optional)
  sheet.getCell('A22').value = 'TEAM D';
  sheet.getCell('A22').font = { name: 'Arial', size: 10, bold: true };
  for (let r = 23; r <= 26; r++) {
    sheet.getCell(`A${r}`).value = '';
  }

  // Running score fill (Cols O to Z, rows 5 to 26)
  fillRunningScoreThreeTeam(sheet, match);

  applyBordersToRange(sheet, 4, 26, 1, 26);
}

// ---------------- Helper formatting functions ----------------

function setupTeamHeaderRows(sheet: ExcelJS.Worksheet, startRow: number, teamAName?: string, teamBName?: string) {
  // A4:A7 NO
  sheet.mergeCells('A4:A7');
  sheet.getCell('A4').value = 'NO';
  // B4:B7 NAMA
  sheet.mergeCells('B4:B7');
  sheet.getCell('B4').value = 'NAMA';
  // C4:H5 SHOOTING
  sheet.mergeCells('C4:H5');
  sheet.getCell('C4').value = 'SHOOTING';
  // I4:J5 REBOUND
  sheet.mergeCells('I4:J5');
  sheet.getCell('I4').value = 'REBOUND';
  // K4:K7 ASSIST
  sheet.mergeCells('K4:K7');
  sheet.getCell('K4').value = 'ASSIST';
  // L4:L7 INTERCEPT
  sheet.mergeCells('L4:L7');
  sheet.getCell('L4').value = 'INTERCEPT';
  // M4:M7 TURN OVER
  sheet.mergeCells('M4:M7');
  sheet.getCell('M4').value = 'TURN OVER';
  // N4:N7 FOUL
  sheet.mergeCells('N4:N7');
  sheet.getCell('N4').value = 'FOUL';

  // Subheaders Row 6
  sheet.mergeCells('C6:D6');
  sheet.getCell('C6').value = 'SHOOT';
  sheet.mergeCells('E6:F6');
  sheet.getCell('E6').value = 'RUNNING IN';
  sheet.mergeCells('G6:H6');
  sheet.getCell('G6').value = 'PINALTY/FS';
  sheet.mergeCells('I6:I7');
  sheet.getCell('I6').value = 'OFF';
  sheet.mergeCells('J6:J7');
  sheet.getCell('J6').value = 'DEF';

  // Subheaders Row 7
  sheet.getCell('C7').value = 'M';
  sheet.getCell('D7').value = 'A';
  sheet.getCell('E7').value = 'M';
  sheet.getCell('F7').value = 'A';
  sheet.getCell('G7').value = 'M';
  sheet.getCell('H7').value = 'A';

  // Running score header O4:R4 (TEAM A) & S4:V4 (TEAM B)
  sheet.mergeCells('O4:R4');
  sheet.getCell('O4').value = teamAName || 'TEAM A';
  sheet.mergeCells('S4:V4');
  sheet.getCell('S4').value = teamBName || 'TEAM B';

  // Row 5 Running score subheaders
  sheet.getCell('O5').value = 'DP';
  sheet.getCell('P5').value = 'TIME';
  sheet.getCell('Q5').value = 'NAME';
  sheet.getCell('R5').value = 'SCORE';
  sheet.getCell('S5').value = 'SCORE';
  sheet.getCell('T5').value = 'NAME';
  sheet.getCell('U5').value = 'TIME';
  sheet.getCell('V5').value = 'DP';

  // Yellow fills for Score columns in header
  sheet.getCell('R5').fill = YELLOW_FILL;
  sheet.getCell('S5').fill = YELLOW_FILL;

  // Center alignments for all headers
  ['A4', 'B4', 'C4', 'I4', 'K4', 'L4', 'M4', 'N4', 'O4', 'S4', 'C6', 'E6', 'G6', 'I6', 'J6', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7', 'O5', 'P5', 'Q5', 'R5', 'S5', 'T5', 'U5', 'V5'].forEach((ref) => {
    sheet.getCell(ref).alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell(ref).font = { name: 'Arial', size: 9, bold: true };
  });
}

function setupTeamBHeaderRows(sheet: ExcelJS.Worksheet, r: number) {
  sheet.mergeCells(`A${r}:A${r + 3}`);
  sheet.getCell(`A${r}`).value = 'NO';
  sheet.mergeCells(`B${r}:B${r + 3}`);
  sheet.getCell(`B${r}`).value = 'NAMA';
  sheet.mergeCells(`C${r}:H${r + 1}`);
  sheet.getCell(`C${r}`).value = 'SHOOTING';
  sheet.mergeCells(`I${r}:J${r + 1}`);
  sheet.getCell(`I${r}`).value = 'REBOUND';
  sheet.mergeCells(`K${r}:K${r + 3}`);
  sheet.getCell(`K${r}`).value = 'ASSIST';
  sheet.mergeCells(`L${r}:L${r + 3}`);
  sheet.getCell(`L${r}`).value = 'INTERCEPT';
  sheet.mergeCells(`M${r}:M${r + 3}`);
  sheet.getCell(`M${r}`).value = 'TURN OVER';
  sheet.mergeCells(`N${r}:N${r + 3}`);
  sheet.getCell(`N${r}`).value = 'FOUL';

  // Subheaders r+2
  sheet.mergeCells(`C${r + 2}:D${r + 2}`);
  sheet.getCell(`C${r + 2}`).value = 'SHOOT';
  sheet.mergeCells(`E${r + 2}:F${r + 2}`);
  sheet.getCell(`E${r + 2}`).value = 'RUNNING IN';
  sheet.mergeCells(`G${r + 2}:H${r + 2}`);
  sheet.getCell(`G${r + 2}`).value = 'PINALTY/FS';
  sheet.mergeCells(`I${r + 2}:I${r + 3}`);
  sheet.getCell(`I${r + 2}`).value = 'OFF';
  sheet.mergeCells(`J${r + 2}:J${r + 3}`);
  sheet.getCell(`J${r + 2}`).value = 'DEF';

  // Subheaders r+3
  sheet.getCell(`C${r + 3}`).value = 'M';
  sheet.getCell(`D${r + 3}`).value = 'A';
  sheet.getCell(`E${r + 3}`).value = 'M';
  sheet.getCell(`F${r + 3}`).value = 'A';
  sheet.getCell(`G${r + 3}`).value = 'M';
  sheet.getCell(`H${r + 3}`).value = 'A';

  [`A${r}`, `B${r}`, `C${r}`, `I${r}`, `K${r}`, `L${r}`, `M${r}`, `N${r}`, `C${r + 2}`, `E${r + 2}`, `G${r + 2}`, `I${r + 2}`, `J${r + 2}`, `C${r + 3}`, `D${r + 3}`, `E${r + 3}`, `F${r + 3}`, `G${r + 3}`, `H${r + 3}`].forEach((ref) => {
    sheet.getCell(ref).alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell(ref).font = { name: 'Arial', size: 9, bold: true };
  });
}

function setupThreeTeamHeaders(sheet: ExcelJS.Worksheet, match: MatchState) {
  // A4 to N7 same as team A
  sheet.mergeCells('A4:A7');
  sheet.getCell('A4').value = 'NO';
  sheet.mergeCells('B4:B7');
  sheet.getCell('B4').value = 'NAMA';
  sheet.mergeCells('C4:H5');
  sheet.getCell('C4').value = 'SHOOTING';
  sheet.mergeCells('I4:J5');
  sheet.getCell('I4').value = 'REBOUND';
  sheet.mergeCells('K4:K7');
  sheet.getCell('K4').value = 'ASSIST';
  sheet.mergeCells('L4:L7');
  sheet.getCell('L4').value = 'INTERCEPT';
  sheet.mergeCells('M4:M7');
  sheet.getCell('M4').value = 'TURN OVER';
  sheet.mergeCells('N4:N7');
  sheet.getCell('N4').value = 'FOUL';

  sheet.mergeCells('C6:D6');
  sheet.getCell('C6').value = 'SHOOT';
  sheet.mergeCells('E6:F6');
  sheet.getCell('E6').value = 'RUNNING IN';
  sheet.mergeCells('G6:H6');
  sheet.getCell('G6').value = 'PINALTY/FS';
  sheet.mergeCells('I6:I7');
  sheet.getCell('I6').value = 'OFF';
  sheet.mergeCells('J6:J7');
  sheet.getCell('J6').value = 'DEF';

  sheet.getCell('C7').value = 'M';
  sheet.getCell('D7').value = 'A';
  sheet.getCell('E7').value = 'M';
  sheet.getCell('F7').value = 'A';
  sheet.getCell('G7').value = 'M';
  sheet.getCell('H7').value = 'A';

  // 3 Teams in Running score header
  sheet.mergeCells('O4:R4');
  sheet.getCell('O4').value = match.teamA.name || 'TEAM A';
  sheet.mergeCells('S4:V4');
  sheet.getCell('S4').value = match.teamB.name || 'TEAM B';
  sheet.mergeCells('W4:Z4');
  sheet.getCell('W4').value = match.teamC?.name || 'TEAM C';

  // Row 5
  sheet.getCell('O5').value = 'DP';
  sheet.getCell('P5').value = 'TIME';
  sheet.getCell('Q5').value = 'NAME';
  sheet.getCell('R5').value = 'SCORE';
  sheet.getCell('S5').value = 'SCORE';
  sheet.getCell('T5').value = 'NAME';
  sheet.getCell('U5').value = 'TIME';
  sheet.getCell('V5').value = 'DP';
  sheet.getCell('W5').value = 'SCORE';
  sheet.getCell('X5').value = 'NAME';
  sheet.getCell('Y5').value = 'TIME';
  sheet.getCell('Z5').value = 'DP';

  sheet.getCell('R5').fill = YELLOW_FILL;
  sheet.getCell('S5').fill = YELLOW_FILL;
  sheet.getCell('W5').fill = YELLOW_FILL;

  ['A4', 'B4', 'C4', 'I4', 'K4', 'L4', 'M4', 'N4', 'O4', 'S4', 'W4', 'C6', 'E6', 'G6', 'I6', 'J6', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7', 'O5', 'P5', 'Q5', 'R5', 'S5', 'T5', 'U5', 'V5', 'W5', 'X5', 'Y5', 'Z5'].forEach((ref) => {
    sheet.getCell(ref).alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell(ref).font = { name: 'Arial', size: 9, bold: true };
  });
}

function fillPlayerRow(sheet: ExcelJS.Worksheet, rowNum: number, player: any, match: MatchState) {
  if (player) {
    const stats = aggregatePlayerStatsFromEvents(match.events, player.id);
    const rowVals = getScoreSheetRowValues(stats);

    sheet.getCell(`A${rowNum}`).value = player.jerseyNumber;
    sheet.getCell(`B${rowNum}`).value = player.fullName;
    sheet.getCell(`C${rowNum}`).value = rowVals.shootM || '';
    sheet.getCell(`D${rowNum}`).value = rowVals.shootA || '';
    sheet.getCell(`E${rowNum}`).value = rowVals.runningInM || '';
    sheet.getCell(`F${rowNum}`).value = rowVals.runningInA || '';
    sheet.getCell(`G${rowNum}`).value = rowVals.pinaltyFsM || '';
    sheet.getCell(`H${rowNum}`).value = rowVals.pinaltyFsA || '';
    sheet.getCell(`I${rowNum}`).value = rowVals.rebOff || '';
    sheet.getCell(`J${rowNum}`).value = rowVals.rebDef || '';
    sheet.getCell(`K${rowNum}`).value = rowVals.assist || '';
    sheet.getCell(`L${rowNum}`).value = rowVals.intercept || '';
    sheet.getCell(`M${rowNum}`).value = rowVals.turnover || '';
    sheet.getCell(`N${rowNum}`).value = rowVals.foul || '';
  } else {
    // Empty row placeholder
    sheet.getCell(`A${rowNum}`).value = '';
    sheet.getCell(`B${rowNum}`).value = '';
  }

  // Alignment
  sheet.getCell(`A${rowNum}`).alignment = { horizontal: 'center' };
  sheet.getCell(`B${rowNum}`).alignment = { horizontal: 'left' };
  ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'].forEach((col) => {
    sheet.getCell(`${col}${rowNum}`).alignment = { horizontal: 'center' };
  });
}

function fillTeamRows(sheet: ExcelJS.Worksheet, startR: number, endR: number, players: any[], match: MatchState) {
  for (let r = startR; r <= endR; r++) {
    const idx = r - startR;
    const player = players[idx];
    fillPlayerRow(sheet, r, player, match);
  }
}

function fillRunningScoreTwoTeam(sheet: ExcelJS.Worksheet, match: MatchState) {
  const goalEvents = match.events
    .filter((e) => !e.isDeleted && e.pointsAwarded > 0)
    .sort((a, b) => a.gameTimeSeconds - b.gameTimeSeconds);

  // We have rows 6 to 36 (31 rows available for running score)
  let rowA = 6;
  let rowB = 6;

  for (const event of goalEvents) {
    const min = Math.floor(event.gameTimeSeconds / 60);
    const sec = event.gameTimeSeconds % 60;
    const timeStr = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    const dpVal = event.opponentPlayerJersey ? `#${event.opponentPlayerJersey}` : (event.opponentPlayerName || '-');

    if (event.teamId === match.teamA.id && rowA <= 36) {
      sheet.getCell(`O${rowA}`).value = dpVal;
      sheet.getCell(`P${rowA}`).value = timeStr;
      sheet.getCell(`Q${rowA}`).value = event.playerName || '';
      sheet.getCell(`R${rowA}`).value = event.runningScoreA;
      sheet.getCell(`R${rowA}`).fill = YELLOW_FILL;
      sheet.getCell(`R${rowA}`).font = { bold: true };
      rowA++;
    } else if (event.teamId === match.teamB.id && rowB <= 36) {
      sheet.getCell(`S${rowB}`).value = event.runningScoreB;
      sheet.getCell(`S${rowB}`).fill = YELLOW_FILL;
      sheet.getCell(`S${rowB}`).font = { bold: true };
      sheet.getCell(`T${rowB}`).value = event.playerName || '';
      sheet.getCell(`U${rowB}`).value = timeStr;
      sheet.getCell(`V${rowB}`).value = dpVal;
      rowB++;
    }
  }

  // Ensure yellow fill for remaining empty score cells
  for (let r = 6; r <= 36; r++) {
    sheet.getCell(`R${r}`).fill = YELLOW_FILL;
    sheet.getCell(`S${r}`).fill = YELLOW_FILL;
    sheet.getCell(`O${r}`).alignment = { horizontal: 'center' };
    sheet.getCell(`P${r}`).alignment = { horizontal: 'center' };
    sheet.getCell(`R${r}`).alignment = { horizontal: 'center' };
    sheet.getCell(`S${r}`).alignment = { horizontal: 'center' };
    sheet.getCell(`U${r}`).alignment = { horizontal: 'center' };
    sheet.getCell(`V${r}`).alignment = { horizontal: 'center' };
  }
}

function fillRunningScoreThreeTeam(sheet: ExcelJS.Worksheet, match: MatchState) {
  const goalEvents = match.events
    .filter((e) => !e.isDeleted && e.pointsAwarded > 0)
    .sort((a, b) => a.gameTimeSeconds - b.gameTimeSeconds);

  let rowA = 6;
  let rowB = 6;
  let rowC = 6;

  for (const event of goalEvents) {
    const min = Math.floor(event.gameTimeSeconds / 60);
    const sec = event.gameTimeSeconds % 60;
    const timeStr = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    const dpVal = event.opponentPlayerJersey ? `#${event.opponentPlayerJersey}` : (event.opponentPlayerName || '-');

    if (event.teamId === match.teamA.id && rowA <= 26) {
      sheet.getCell(`O${rowA}`).value = dpVal;
      sheet.getCell(`P${rowA}`).value = timeStr;
      sheet.getCell(`Q${rowA}`).value = event.playerName || '';
      sheet.getCell(`R${rowA}`).value = event.runningScoreA;
      rowA++;
    } else if (event.teamId === match.teamB.id && rowB <= 26) {
      sheet.getCell(`S${rowB}`).value = event.runningScoreB;
      sheet.getCell(`T${rowB}`).value = event.playerName || '';
      sheet.getCell(`U${rowB}`).value = timeStr;
      sheet.getCell(`V${rowB}`).value = dpVal;
      rowB++;
    } else if (match.teamC && event.teamId === match.teamC.id && rowC <= 26) {
      sheet.getCell(`W${rowC}`).value = event.runningScoreC;
      sheet.getCell(`X${rowC}`).value = event.playerName || '';
      sheet.getCell(`Y${rowC}`).value = timeStr;
      sheet.getCell(`Z${rowC}`).value = dpVal;
      rowC++;
    }
  }

  for (let r = 6; r <= 26; r++) {
    sheet.getCell(`R${r}`).fill = YELLOW_FILL;
    sheet.getCell(`S${r}`).fill = YELLOW_FILL;
    sheet.getCell(`W${r}`).fill = YELLOW_FILL;
    sheet.getCell(`R${r}`).font = { bold: true };
    sheet.getCell(`S${r}`).font = { bold: true };
    sheet.getCell(`W${r}`).font = { bold: true };
    sheet.getCell(`R${r}`).alignment = { horizontal: 'center' };
    sheet.getCell(`S${r}`).alignment = { horizontal: 'center' };
    sheet.getCell(`W${r}`).alignment = { horizontal: 'center' };
  }
}

function applyBordersToRange(sheet: ExcelJS.Worksheet, startR: number, endR: number, startC: number, endC: number) {
  for (let r = startR; r <= endR; r++) {
    for (let c = startC; c <= endC; c++) {
      const cell = sheet.getCell(r, c);
      applyCellBorder(cell);
    }
  }
}
