'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { localDb } from '@/lib/local-db/dexie-db';
import { Gender, MatchFormat, MatchState, Player, Team, TeamStructure } from '@/types/match';
import { ArrowLeft, Check, Plus, Trash2, Users, Trophy, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface TempPlayer {
  id: string;
  jerseyNumber: number | '';
  fullName: string;
  gender: Gender;
}

// Data Baku Atlet Korfball Kabupaten Bantul
const OFFICIAL_BANTUL_MALE: { name: string; number: number }[] = [
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

const OFFICIAL_BANTUL_FEMALE: { name: string; number: number }[] = [
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

export default function NewMatchPage() {
  const router = useRouter();

  // Match setup form state
  const [matchCode, setMatchCode] = useState(
    `GAME-${new Date().toISOString().slice(5, 10).replace('-', '')}-${Math.floor(Math.random() * 90 + 10)}`
  );
  const [venue, setVenue] = useState('GOR Sasana Krida Bantul');
  const [structure, setStructure] = useState<TeamStructure>('TWO_TEAM');
  const [format, setFormat] = useState<MatchFormat>('K8');
  const [periods, setPeriods] = useState<number>(2);
  const [periodDuration, setPeriodDuration] = useState<number>(20);

  // Teams state
  const [teamAName, setTeamAName] = useState('Tim A (Bantul Merah)');
  const [teamBName, setTeamBName] = useState('Tim B (Bantul Putih)');
  const [teamCName, setTeamCName] = useState('Tim C (Bantul Hijau)');

  // Default clean state
  const [playersA, setPlayersA] = useState<TempPlayer[]>([]);
  const [playersB, setPlayersB] = useState<TempPlayer[]>([]);
  const [playersC, setPlayersC] = useState<TempPlayer[]>([]);

  // Validation warning state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Helper count L/P
  const getGenderCount = (players: TempPlayer[]) => {
    const validPlayers = players.filter((p) => p.fullName.trim() !== '');
    const males = validPlayers.filter((p) => p.gender === 'MALE').length;
    const females = validPlayers.filter((p) => p.gender === 'FEMALE').length;
    return { males, females, total: validPlayers.length };
  };

  const countA = getGenderCount(playersA);
  const countB = getGenderCount(playersB);
  const countC = getGenderCount(playersC);

  // Opsi Muat Skuad Resmi Atlet Korfball Bantul
  const handleSeedBantulSquad = () => {
    if (structure === 'THREE_TEAM') {
      // 3 Team format: K4 (minimal 2 L & 2 P per team)
      setTeamAName('Bantul Scrimmage A');
      setTeamBName('Bantul Scrimmage B');
      setTeamCName('Bantul Scrimmage C');

      setPlayersA([
        { id: 'pa-1', jerseyNumber: OFFICIAL_BANTUL_MALE[0].number, fullName: OFFICIAL_BANTUL_MALE[0].name, gender: 'MALE' },
        { id: 'pa-2', jerseyNumber: OFFICIAL_BANTUL_MALE[1].number, fullName: OFFICIAL_BANTUL_MALE[1].name, gender: 'MALE' },
        { id: 'pa-3', jerseyNumber: OFFICIAL_BANTUL_FEMALE[0].number, fullName: OFFICIAL_BANTUL_FEMALE[0].name, gender: 'FEMALE' },
        { id: 'pa-4', jerseyNumber: OFFICIAL_BANTUL_FEMALE[1].number, fullName: OFFICIAL_BANTUL_FEMALE[1].name, gender: 'FEMALE' },
      ]);

      setPlayersB([
        { id: 'pb-1', jerseyNumber: OFFICIAL_BANTUL_MALE[2].number, fullName: OFFICIAL_BANTUL_MALE[2].name, gender: 'MALE' },
        { id: 'pb-2', jerseyNumber: OFFICIAL_BANTUL_MALE[3].number, fullName: OFFICIAL_BANTUL_MALE[3].name, gender: 'MALE' },
        { id: 'pb-3', jerseyNumber: OFFICIAL_BANTUL_FEMALE[2].number, fullName: OFFICIAL_BANTUL_FEMALE[2].name, gender: 'FEMALE' },
        { id: 'pb-4', jerseyNumber: OFFICIAL_BANTUL_FEMALE[3].number, fullName: OFFICIAL_BANTUL_FEMALE[3].name, gender: 'FEMALE' },
      ]);

      setPlayersC([
        { id: 'pc-1', jerseyNumber: OFFICIAL_BANTUL_MALE[4].number, fullName: OFFICIAL_BANTUL_MALE[4].name, gender: 'MALE' },
        { id: 'pc-2', jerseyNumber: OFFICIAL_BANTUL_MALE[5].number, fullName: OFFICIAL_BANTUL_MALE[5].name, gender: 'MALE' },
        { id: 'pc-3', jerseyNumber: OFFICIAL_BANTUL_FEMALE[4].number, fullName: OFFICIAL_BANTUL_FEMALE[4].name, gender: 'FEMALE' },
        { id: 'pc-4', jerseyNumber: OFFICIAL_BANTUL_FEMALE[5].number, fullName: OFFICIAL_BANTUL_FEMALE[5].name, gender: 'FEMALE' },
      ]);
    } else {
      // 2 Team format:
      // K8 / K4: 5 Putra & 5 Putri untuk Tim A, 5 Putra & 5 Putri untuk Tim B
      setTeamAName('Bantul Merah (A)');
      setTeamBName('Bantul Putih (B)');

      setPlayersA([
        ...OFFICIAL_BANTUL_MALE.slice(0, 5).map((m, idx) => ({
          id: `pa-m-${idx}`,
          jerseyNumber: m.number,
          fullName: m.name,
          gender: 'MALE' as Gender,
        })),
        ...OFFICIAL_BANTUL_FEMALE.slice(0, 5).map((f, idx) => ({
          id: `pa-f-${idx}`,
          jerseyNumber: f.number,
          fullName: f.name,
          gender: 'FEMALE' as Gender,
        })),
      ]);

      setPlayersB([
        ...OFFICIAL_BANTUL_MALE.slice(5, 10).map((m, idx) => ({
          id: `pb-m-${idx}`,
          jerseyNumber: m.number,
          fullName: m.name,
          gender: 'MALE' as Gender,
        })),
        ...OFFICIAL_BANTUL_FEMALE.slice(5, 10).map((f, idx) => ({
          id: `pb-f-${idx}`,
          jerseyNumber: f.number,
          fullName: f.name,
          gender: 'FEMALE' as Gender,
        })),
      ]);
    }
    setValidationError(null);
  };

  // Opsi Bersihkan Form
  const handleClearRoster = () => {
    setPlayersA([]);
    setPlayersB([]);
    setPlayersC([]);
    setValidationError(null);
  };

  const addPlayer = (team: 'A' | 'B' | 'C', defaultGender: Gender = 'MALE') => {
    const newP: TempPlayer = {
      id: `p-${Date.now()}-${Math.random()}`,
      jerseyNumber: '',
      fullName: '',
      gender: defaultGender,
    };
    if (team === 'A') setPlayersA([...playersA, newP]);
    if (team === 'B') setPlayersB([...playersB, newP]);
    if (team === 'C') setPlayersC([...playersC, newP]);
  };

  const removePlayer = (team: 'A' | 'B' | 'C', id: string) => {
    if (team === 'A') setPlayersA(playersA.filter((p) => p.id !== id));
    if (team === 'B') setPlayersB(playersB.filter((p) => p.id !== id));
    if (team === 'C') setPlayersC(playersC.filter((p) => p.id !== id));
  };

  const updatePlayer = (
    team: 'A' | 'B' | 'C',
    id: string,
    field: keyof TempPlayer,
    val: any
  ) => {
    const updater = (list: TempPlayer[]) =>
      list.map((p) => (p.id === id ? { ...p, [field]: val } : p));
    if (team === 'A') setPlayersA(updater(playersA));
    if (team === 'B') setPlayersB(updater(playersB));
    if (team === 'C') setPlayersC(updater(playersC));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Komposisi Gender Korfball
    const activeFormat = structure === 'THREE_TEAM' ? 'K4' : format;
    const requiredMales = activeFormat === 'K8' ? 4 : 2;
    const requiredFemales = activeFormat === 'K8' ? 4 : 2;

    if (countA.males < requiredMales || countA.females < requiredFemales) {
      setValidationError(
        `Tim A belum memenuhi syarat resmi Korfball ${activeFormat}! Diperlukan minimal ${requiredMales} Laki-laki (L) dan ${requiredFemales} Perempuan (P). Saat ini: ${countA.males}L / ${countA.females}P.`
      );
      return;
    }

    if (countB.males < requiredMales || countB.females < requiredFemales) {
      setValidationError(
        `Tim B belum memenuhi syarat resmi Korfball ${activeFormat}! Diperlukan minimal ${requiredMales} Laki-laki (L) dan ${requiredFemales} Perempuan (P). Saat ini: ${countB.males}L / ${countB.females}P.`
      );
      return;
    }

    if (structure === 'THREE_TEAM' && (countC.males < requiredMales || countC.females < requiredFemales)) {
      setValidationError(
        `Tim C belum memenuhi syarat resmi Korfball ${activeFormat}! Diperlukan minimal ${requiredMales} Laki-laki (L) dan ${requiredFemales} Perempuan (P). Saat ini: ${countC.males}L / ${countC.females}P.`
      );
      return;
    }

    setValidationError(null);

    const matchId = `match-${Date.now()}`;
    const teamAId = `team-${Date.now()}-a`;
    const teamBId = `team-${Date.now()}-b`;
    const teamCId = structure === 'THREE_TEAM' ? `team-${Date.now()}-c` : undefined;

    const formattedPlayersA: Player[] = playersA
      .filter((p) => p.fullName.trim() !== '')
      .map((p, idx) => ({
        id: p.id,
        teamId: teamAId,
        jerseyNumber: Number(p.jerseyNumber) || idx + 1,
        fullName: p.fullName.trim(),
        gender: p.gender,
        isActive: true,
      }));

    const formattedPlayersB: Player[] = playersB
      .filter((p) => p.fullName.trim() !== '')
      .map((p, idx) => ({
        id: p.id,
        teamId: teamBId,
        jerseyNumber: Number(p.jerseyNumber) || idx + 1,
        fullName: p.fullName.trim(),
        gender: p.gender,
        isActive: true,
      }));

    const formattedPlayersC: Player[] | undefined =
      structure === 'THREE_TEAM' && teamCId
        ? playersC
            .filter((p) => p.fullName.trim() !== '')
            .map((p, idx) => ({
              id: p.id,
              teamId: teamCId,
              jerseyNumber: Number(p.jerseyNumber) || idx + 1,
              fullName: p.fullName.trim(),
              gender: p.gender,
              isActive: true,
            }))
        : undefined;

    const teamAObj: Team = {
      id: teamAId,
      name: teamAName.trim() || 'Team A',
      code: 'TMA',
      players: formattedPlayersA,
    };

    const teamBObj: Team = {
      id: teamBId,
      name: teamBName.trim() || 'Team B',
      code: 'TMB',
      players: formattedPlayersB,
    };

    const teamCObj: Team | undefined =
      structure === 'THREE_TEAM' && teamCId
        ? {
            id: teamCId,
            name: teamCName.trim() || 'Team C',
            code: 'TMC',
            players: formattedPlayersC,
          }
        : undefined;

    // Lineup Starter: 4 L + 4 P untuk K8, atau 2 L + 2 P untuk K4
    const buildStarters = (players: Player[]) => {
      const males = players.filter((p) => p.gender === 'MALE');
      const females = players.filter((p) => p.gender === 'FEMALE');
      const startersMale = males.slice(0, requiredMales).map((p) => p.id);
      const startersFemale = females.slice(0, requiredFemales).map((p) => p.id);
      const starterIds = new Set([...startersMale, ...startersFemale]);

      return players.map((p) => ({
        id: `lineup-${p.id}`,
        matchId,
        playerId: p.id,
        teamId: p.teamId,
        isStarter: starterIds.has(p.id),
        isOnCourt: starterIds.has(p.id),
        periodEntered: 1,
        player: p,
      }));
    };

    const lineupsA = buildStarters(formattedPlayersA);
    const lineupsB = buildStarters(formattedPlayersB);
    const lineupsC = formattedPlayersC ? buildStarters(formattedPlayersC) : [];

    const newMatch: MatchState = {
      id: matchId,
      matchCode: matchCode.trim(),
      matchDate: new Date().toISOString(),
      venue: venue.trim(),
      format: activeFormat,
      teamStructure: structure,
      teamA: teamAObj,
      teamB: teamBObj,
      teamC: teamCObj,
      periods,
      periodDurationMinutes: periodDuration,
      currentPeriod: 1,
      gameTimeSeconds: 0,
      status: 'LIVE',
      scoreTeamA: 0,
      scoreTeamB: 0,
      scoreTeamC: 0,
      lineups: [...lineupsA, ...lineupsB, ...lineupsC],
      events: [],
    };

    // Save to local IndexedDB
    await localDb.matches.put(newMatch);

    // Redirect to live match recording
    router.push(`/matches/${matchId}`);
  };

  const activeFormat = structure === 'THREE_TEAM' ? 'K4' : format;
  const targetMales = activeFormat === 'K8' ? 4 : 2;
  const targetFemales = activeFormat === 'K8' ? 4 : 2;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inisialisasi Pertandingan Baru</h1>
          <p className="text-xs text-slate-500">
            Setup format pertandingan & komposisi pemain berpasangan (Mixed Gender)
          </p>
        </div>
      </div>

      {/* Validation Warning Alert */}
      {validationError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 -mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Komposisi Tim Belum Valid</p>
            <p>{validationError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Format & Metadata */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>1. Format Pertandingan & Informasi Laga</span>
            </h2>

            {/* Quick Seed Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSeedBantulSquad}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 flex items-center gap-1.5 transition shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>⚡ Muat Roster Atlet Bantul (Didiv dkk.)</span>
              </button>
              <button
                type="button"
                onClick={handleClearRoster}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 transition"
              >
                Kosongkan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Struktur Tim & Lembar Cetak
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStructure('TWO_TEAM')}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold border transition ${
                    structure === 'TWO_TEAM'
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  SCORE SHEET 2 TEAM (Standar)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStructure('THREE_TEAM');
                    setFormat('K4');
                  }}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold border transition ${
                    structure === 'THREE_TEAM'
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  SCORE SHEET 3 TEAM (K4 Scrimmage)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nomor Format Korfball
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={structure === 'THREE_TEAM'}
                  onClick={() => setFormat('K8')}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold border transition ${
                    format === 'K8' && structure !== 'THREE_TEAM'
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40'
                  }`}
                >
                  K8 (4 Putra + 4 Putri)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('K4')}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold border transition ${
                    format === 'K4'
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  K4 (2 Putra + 2 Putri)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode / Nomor Game
              </label>
              <input
                type="text"
                required
                value={matchCode}
                onChange={(e) => setMatchCode(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tempat / Venue Pertandingan
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Team Roster Setup with L/P Badge & Gender Validation */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>2. Susunan Pemain & Komposisi Gender (L/P)</span>
            </h2>
            <div className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-700 font-medium">
              Aturan {activeFormat}: Wajib minimal{' '}
              <span className="font-bold text-blue-700">{targetMales} Laki-laki (L)</span> &{' '}
              <span className="font-bold text-rose-700">{targetFemales} Perempuan (P)</span> per tim
            </div>
          </div>

          <div className="space-y-6">
            {/* Team A */}
            <TeamRosterSection
              teamKey="A"
              teamName={teamAName}
              setTeamName={setTeamAName}
              players={playersA}
              colorBadge="bg-blue-600"
              count={countA}
              targetMales={targetMales}
              targetFemales={targetFemales}
              onAddPlayer={(gender) => addPlayer('A', gender)}
              onRemovePlayer={(id) => removePlayer('A', id)}
              onUpdatePlayer={(id, field, val) => updatePlayer('A', id, field, val)}
            />

            {/* Team B */}
            <TeamRosterSection
              teamKey="B"
              teamName={teamBName}
              setTeamName={setTeamBName}
              players={playersB}
              colorBadge="bg-emerald-600"
              count={countB}
              targetMales={targetMales}
              targetFemales={targetFemales}
              onAddPlayer={(gender) => addPlayer('B', gender)}
              onRemovePlayer={(id) => removePlayer('B', id)}
              onUpdatePlayer={(id, field, val) => updatePlayer('B', id, field, val)}
            />

            {/* Team C (Conditional for 3 Team) */}
            {structure === 'THREE_TEAM' && (
              <TeamRosterSection
                teamKey="C"
                teamName={teamCName}
                setTeamName={setTeamCName}
                players={playersC}
                colorBadge="bg-amber-600"
                count={countC}
                targetMales={targetMales}
                targetFemales={targetFemales}
                onAddPlayer={(gender) => addPlayer('C', gender)}
                onRemovePlayer={(id) => removePlayer('C', id)}
                onUpdatePlayer={(id, field, val) => updatePlayer('C', id, field, val)}
              />
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Mulai Pertandingan & Catat Live</span>
          </button>
        </div>
      </form>
    </div>
  );
}

interface TeamRosterSectionProps {
  teamKey: 'A' | 'B' | 'C';
  teamName: string;
  setTeamName: (val: string) => void;
  players: TempPlayer[];
  colorBadge: string;
  count: { males: number; females: number; total: number };
  targetMales: number;
  targetFemales: number;
  onAddPlayer: (gender: Gender) => void;
  onRemovePlayer: (id: string) => void;
  onUpdatePlayer: (id: string, field: keyof TempPlayer, val: any) => void;
}

function TeamRosterSection({
  teamKey,
  teamName,
  setTeamName,
  players,
  colorBadge,
  count,
  targetMales,
  targetFemales,
  onAddPlayer,
  onRemovePlayer,
  onUpdatePlayer,
}: TeamRosterSectionProps) {
  const isMaleValid = count.males >= targetMales;
  const isFemaleValid = count.females >= targetFemales;

  return (
    <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <span className={`w-7 h-7 rounded-lg ${colorBadge} text-white text-xs font-bold flex items-center justify-center`}>
            {teamKey}
          </span>
          <input
            type="text"
            required
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder={`Nama Tim ${teamKey}`}
            className="font-bold text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-sm flex-1 max-w-sm"
          />

          {/* Gender Status Pill */}
          <div className="flex items-center gap-1.5 text-xs font-bold pl-2">
            <span
              className={`px-2 py-0.5 rounded-md border ${
                isMaleValid
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-rose-100 text-rose-800 border-rose-200'
              }`}
            >
              L: {count.males}/{targetMales}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md border ${
                isFemaleValid
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}
            >
              P: {count.females}/{targetFemales}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onAddPlayer('MALE')}
            className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-md flex items-center gap-1 transition"
          >
            <Plus className="w-3 h-3" />
            <span>+ Laki-laki (L)</span>
          </button>
          <button
            type="button"
            onClick={() => onAddPlayer('FEMALE')}
            className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-md flex items-center gap-1 transition"
          >
            <Plus className="w-3 h-3" />
            <span>+ Perempuan (P)</span>
          </button>
        </div>
      </div>

      {players.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
          Belum ada pemain di Tim {teamKey}. Klik tombol <strong>+ Laki-laki (L)</strong> / <strong>+ Perempuan (P)</strong> di atas atau gunakan tombol <strong>Muat Roster Atlet Bantul</strong>.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
          {players.map((p, idx) => {
            const isMale = p.gender === 'MALE';
            return (
              <div
                key={p.id}
                className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-slate-200 shadow-xs"
              >
                <span className="text-[10px] text-slate-400 font-mono w-4">{idx + 1}.</span>

                {/* Gender Toggle Badge L / P */}
                <button
                  type="button"
                  onClick={() =>
                    onUpdatePlayer(p.id, 'gender', isMale ? 'FEMALE' : 'MALE')
                  }
                  title="Klik untuk mengubah gender (L = Laki-laki, P = Perempuan)"
                  className={`w-6 h-6 rounded font-black text-xs flex items-center justify-center transition ${
                    isMale
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-rose-500 text-white hover:bg-rose-600'
                  }`}
                >
                  {isMale ? 'L' : 'P'}
                </button>

                {/* Jersey Number */}
                <input
                  type="number"
                  placeholder="No"
                  value={p.jerseyNumber}
                  onChange={(e) =>
                    onUpdatePlayer(
                      p.id,
                      'jerseyNumber',
                      e.target.value ? Number(e.target.value) : ''
                    )
                  }
                  className="w-11 px-1 py-1 text-xs text-center font-bold font-mono rounded border border-slate-300 focus:ring-1 focus:ring-blue-500"
                />

                {/* Full Name */}
                <input
                  type="text"
                  placeholder="Nama Pemain"
                  value={p.fullName}
                  onChange={(e) => onUpdatePlayer(p.id, 'fullName', e.target.value)}
                  className="flex-1 px-2 py-1 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-blue-500 font-medium"
                />

                <button
                  type="button"
                  onClick={() => onRemovePlayer(p.id)}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
