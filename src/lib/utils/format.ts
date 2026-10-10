/**
 * Format detik menjadi jam pertandingan MM:SS.
 */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Ambil nama depan (dipakai pada kolom NAME borang yang sempit).
 */
export function firstName(fullName?: string): string {
  return fullName?.trim().split(/\s+/)[0] ?? '';
}

/**
 * Format tanggal ISO ke locale Indonesia (dd/mm/yyyy).
 */
export function formatDateId(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID');
}
