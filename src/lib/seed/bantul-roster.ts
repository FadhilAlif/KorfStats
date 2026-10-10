import type { Gender, PlayerDraft, TeamStructure } from '@/types/match';
import { newId } from '@/lib/utils/id';

/**
 * Roster resmi atlet Korfball Kabupaten Bantul (opsi seed 1-klik di form setup).
 */

interface RosterEntry {
  name: string;
  number: number;
}

export const BANTUL_MALE_ROSTER: readonly RosterEntry[] = [
  { name: 'Didiv Wandha', number: 1 },
  { name: 'Julius Rakha', number: 2 },
  { name: 'Eduardus Guntur', number: 3 },
  { name: 'Fadhil Alif', number: 4 },
  { name: 'Aah Faqih', number: 5 },
  { name: 'Dimas Bekti', number: 6 },
  { name: 'Arma Machfud', number: 7 },
  { name: 'Ilham Wibi', number: 8 },
  { name: 'Ramdhan Rafy', number: 9 },
  { name: 'Adesta', number: 10 },
];

export const BANTUL_FEMALE_ROSTER: readonly RosterEntry[] = [
  { name: 'Ririn Mulyasari', number: 11 },
  { name: 'Maya Ratna', number: 12 },
  { name: 'Viki Hidayah', number: 13 },
  { name: 'Rukmi Rayi', number: 14 },
  { name: 'Najwa Alya', number: 15 },
  { name: 'Zahra Asyita', number: 16 },
  { name: 'Thea', number: 17 },
  { name: 'Lintang', number: 18 },
  { name: 'Vanes', number: 19 },
  { name: 'Nadia', number: 20 },
];

function toDrafts(entries: readonly RosterEntry[], gender: Gender): PlayerDraft[] {
  return entries.map((e) => ({
    id: newId(),
    jerseyNumber: e.number,
    fullName: e.name,
    gender,
  }));
}

export interface RosterSeed {
  teamNames: [string, string, string];
  rosters: [PlayerDraft[], PlayerDraft[], PlayerDraft[]];
}

/**
 * 2 Tim: 5L + 5P per tim.
 * 3 Tim (K4): 2L + 2P per tim.
 */
export function buildBantulSeed(structure: TeamStructure): RosterSeed {
  const m = BANTUL_MALE_ROSTER;
  const f = BANTUL_FEMALE_ROSTER;

  if (structure === 'THREE_TEAM') {
    return {
      teamNames: ['Bantul Scrimmage A', 'Bantul Scrimmage B', 'Bantul Scrimmage C'],
      rosters: [
        [...toDrafts(m.slice(0, 2), 'MALE'), ...toDrafts(f.slice(0, 2), 'FEMALE')],
        [...toDrafts(m.slice(2, 4), 'MALE'), ...toDrafts(f.slice(2, 4), 'FEMALE')],
        [...toDrafts(m.slice(4, 6), 'MALE'), ...toDrafts(f.slice(4, 6), 'FEMALE')],
      ],
    };
  }

  return {
    teamNames: ['Bantul Merah (A)', 'Bantul Putih (B)', 'Tim C (Bantul Hijau)'],
    rosters: [
      [...toDrafts(m.slice(0, 5), 'MALE'), ...toDrafts(f.slice(0, 5), 'FEMALE')],
      [...toDrafts(m.slice(5, 10), 'MALE'), ...toDrafts(f.slice(5, 10), 'FEMALE')],
      [],
    ],
  };
}
