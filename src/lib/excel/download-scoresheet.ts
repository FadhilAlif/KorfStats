import type { MatchState } from '@/types/match';

/**
 * Client helper: minta file Excel Score Sheet ke API route lalu picu unduhan browser.
 * (Tidak mengimpor ExcelJS sehingga aman untuk bundle client.)
 */
export async function downloadScoreSheet(match: MatchState): Promise<void> {
  const res = await fetch(`/api/matches/${match.id}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(match),
  });

  if (!res.ok) throw new Error('Gagal mengekspor berkas Excel');

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `SCORE_SHEET_${match.matchCode}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
