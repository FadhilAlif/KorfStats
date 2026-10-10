import type { Gender, MatchFormat, TeamStructure } from '@/types/match';

/**
 * Aturan komposisi Mixed-Gender Korfball (BR-02).
 * K8 = 4 Laki-laki + 4 Perempuan, K4 = 2 Laki-laki + 2 Perempuan.
 */

export interface GenderComposition {
  males: number;
  females: number;
}

export interface GenderCount extends GenderComposition {
  total: number;
}

/** Format 3 Tim selalu K4 (triangular scrimmage). */
export function resolveFormat(structure: TeamStructure, format: MatchFormat): MatchFormat {
  return structure === 'THREE_TEAM' ? 'K4' : format;
}

export function getRequiredComposition(format: MatchFormat): GenderComposition {
  const perGender = format === 'K8' ? 4 : 2;
  return { males: perGender, females: perGender };
}

export function countGender(players: ReadonlyArray<{ gender: Gender }>): GenderCount {
  const males = players.filter((p) => p.gender === 'MALE').length;
  const females = players.filter((p) => p.gender === 'FEMALE').length;
  return { males, females, total: players.length };
}

export function isCompositionValid(count: GenderComposition, required: GenderComposition): boolean {
  return count.males >= required.males && count.females >= required.females;
}

/**
 * Validasi komposisi satu tim. Mengembalikan pesan error (Bahasa Indonesia) atau null bila valid.
 */
export function validateTeamComposition(
  teamLabel: string,
  count: GenderComposition,
  format: MatchFormat
): string | null {
  const required = getRequiredComposition(format);
  if (isCompositionValid(count, required)) return null;
  return (
    `${teamLabel} belum memenuhi syarat resmi Korfball ${format}! ` +
    `Diperlukan minimal ${required.males} Laki-laki (L) dan ${required.females} Perempuan (P). ` +
    `Saat ini: ${count.males}L / ${count.females}P.`
  );
}
