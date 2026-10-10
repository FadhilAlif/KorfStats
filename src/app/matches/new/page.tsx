'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { localDb } from '@/lib/local-db/dexie-db';
import { MatchFormat, MatchState, Player, Team, TeamStructure } from '@/types/match';
import { ArrowLeft, Check, Plus, Trash2, Users, Trophy } from 'lucide-react';
import Link from 'next/link';

interface TempPlayer {
  id: string;
  jerseyNumber: number | '';
  fullName: string;
}

export default function NewMatchPage() {
  const router = useRouter();

  // Match setup form state
  const [matchCode, setMatchCode] = useState(`GAME-${new Date().toISOString().slice(5, 10).replace('-', '')}-${Math.floor(Math.random() * 90 + 10)}`);
  const [venue, setVenue] = useState('GOR Sasana Krida Bantul');
  const [structure, setStructure] = useState<TeamStructure>('TWO_TEAM');
  const [format, setFormat] = useState<MatchFormat>('K8');
  const [periods, setPeriods] = useState<number>(2);
  const [periodDuration, setPeriodDuration] = useState<number>(20);

  // Teams state
  const [teamAName, setTeamAName] = useState('Bantul Putra/Putri A');
  const [teamBName, setTeamBName] = useState('Bantul Putra/Putri B');
  const [teamCName, setTeamCName] = useState('Bantul Scrimmage C');

  // Player rosters
  const [playersA, setPlayersA] = useState<TempPlayer[]>([
    { id: 'pa-1', jerseyNumber: 1, fullName: 'Didiv Wandha P' },
    { id: 'pa-2', jerseyNumber: 2, fullName: 'Julius Rakha Bowo' },
    { id: 'pa-3', jerseyNumber: 3, fullName: 'Citra Wahyuningtyas' },
    { id: 'pa-4', jerseyNumber: 4, fullName: 'Maya Ratna Ningrum' },
    { id: 'pa-5', jerseyNumber: 5, fullName: 'Viki Hidayah' },
    { id: 'pa-6', jerseyNumber: 6, fullName: 'Salsabila Dita' },
    { id: 'pa-7', jerseyNumber: 7, fullName: 'Eduardus Guntur' },
    { id: 'pa-8', jerseyNumber: 8, fullName: 'Isnaini Ayu' },
  ]);

  const [playersB, setPlayersB] = useState<TempPlayer[]>([
    { id: 'pb-1', jerseyNumber: 9, fullName: 'Rukmi Rayi' },
    { id: 'pb-2', jerseyNumber: 10, fullName: 'Rizky Nugraheni' },
    { id: 'pb-3', jerseyNumber: 11, fullName: 'Pinasty Dwi' },
    { id: 'pb-4', jerseyNumber: 12, fullName: 'Hillery Bernassa' },
    { id: 'pb-5', jerseyNumber: 13, fullName: 'Amelia Veronica' },
    { id: 'pb-6', jerseyNumber: 14, fullName: 'Ririn Mulya' },
    { id: 'pb-7', jerseyNumber: 15, fullName: 'Farrel Adhitama' },
    { id: 'pb-8', jerseyNumber: 16, fullName: 'Ardan Rizky' },
  ]);

  const [playersC, setPlayersC] = useState<TempPlayer[]>([
    { id: 'pc-1', jerseyNumber: 17, fullName: 'Atlet Tim C 1' },
    { id: 'pc-2', jerseyNumber: 18, fullName: 'Atlet Tim C 2' },
    { id: 'pc-3', jerseyNumber: 19, fullName: 'Atlet Tim C 3' },
    { id: 'pc-4', jerseyNumber: 20, fullName: 'Atlet Tim C 4' },
  ]);

  const addPlayer = (team: 'A' | 'B' | 'C') => {
    const newP: TempPlayer = {
      id: `p-${Date.now()}-${Math.random()}`,
      jerseyNumber: '',
      fullName: '',
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
    field: 'jerseyNumber' | 'fullName',
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
        gender: idx % 2 === 0 ? 'MALE' : 'FEMALE',
        isActive: true,
      }));

    const formattedPlayersB: Player[] = playersB
      .filter((p) => p.fullName.trim() !== '')
      .map((p, idx) => ({
        id: p.id,
        teamId: teamBId,
        jerseyNumber: Number(p.jerseyNumber) || idx + 1,
        fullName: p.fullName.trim(),
        gender: idx % 2 === 0 ? 'MALE' : 'FEMALE',
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
              gender: idx % 2 === 0 ? 'MALE' : 'FEMALE',
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

    // Lineups: first 8 (or 4 in K4) as on-court starters
    const onCourtLimit = format === 'K4' ? 4 : 8;

    const lineupsA = formattedPlayersA.map((p, idx) => ({
      id: `lineup-${p.id}`,
      matchId,
      playerId: p.id,
      teamId: teamAId,
      isStarter: idx < onCourtLimit,
      isOnCourt: idx < onCourtLimit,
      periodEntered: 1,
      player: p,
    }));

    const lineupsB = formattedPlayersB.map((p, idx) => ({
      id: `lineup-${p.id}`,
      matchId,
      playerId: p.id,
      teamId: teamBId,
      isStarter: idx < onCourtLimit,
      isOnCourt: idx < onCourtLimit,
      periodEntered: 1,
      player: p,
    }));

    const lineupsC = formattedPlayersC
      ? formattedPlayersC.map((p, idx) => ({
          id: `lineup-${p.id}`,
          matchId,
          playerId: p.id,
          teamId: teamCId!,
          isStarter: idx < 4,
          isOnCourt: idx < 4,
          periodEntered: 1,
          player: p,
        }))
      : [];

    const newMatch: MatchState = {
      id: matchId,
      matchCode: matchCode.trim(),
      matchDate: new Date().toISOString(),
      venue: venue.trim(),
      format: structure === 'THREE_TEAM' ? 'K4' : format,
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
            Setup format dan roster pemain sebelum pencatatan live match dimulai
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Format & Metadata */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>1. Format Pertandingan & Informasi Laga</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Struktur Tim & Lembar Cetak
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStructure('TWO_TEAM');
                  }}
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
                  K8 (8 Pemain on-court)
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
                  K4 (4 Pemain on-court)
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Durasi Babak (Menit)
              </label>
              <input
                type="number"
                min="5"
                max="45"
                value={periodDuration}
                onChange={(e) => setPeriodDuration(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Babak
              </label>
              <input
                type="number"
                min="1"
                max="4"
                value={periods}
                onChange={(e) => setPeriods(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Team Roster Setup */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Users className="w-4 h-4 text-blue-600" />
            <span>2. Susunan Tim & Roster Pemain</span>
          </h2>

          <div className="space-y-6">
            {/* Team A */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-6 h-6 rounded-md bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    A
                  </span>
                  <input
                    type="text"
                    required
                    value={teamAName}
                    onChange={(e) => setTeamAName(e.target.value)}
                    placeholder="Nama Tim A"
                    className="font-bold text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-sm flex-1 max-w-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => addPlayer('A')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Atlet</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                {playersA.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200"
                  >
                    <span className="text-[10px] text-slate-400 font-mono w-4">{idx + 1}.</span>
                    <input
                      type="number"
                      placeholder="No"
                      value={p.jerseyNumber}
                      onChange={(e) =>
                        updatePlayer('A', p.id, 'jerseyNumber', e.target.value ? Number(e.target.value) : '')
                      }
                      className="w-12 px-1.5 py-1 text-xs text-center font-bold font-mono rounded border border-slate-300"
                    />
                    <input
                      type="text"
                      placeholder="Nama Pemain"
                      value={p.fullName}
                      onChange={(e) => updatePlayer('A', p.id, 'fullName', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs rounded border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => removePlayer('A', p.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Team B */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-6 h-6 rounded-md bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    B
                  </span>
                  <input
                    type="text"
                    required
                    value={teamBName}
                    onChange={(e) => setTeamBName(e.target.value)}
                    placeholder="Nama Tim B"
                    className="font-bold text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-sm flex-1 max-w-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => addPlayer('B')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Atlet</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                {playersB.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200"
                  >
                    <span className="text-[10px] text-slate-400 font-mono w-4">{idx + 1}.</span>
                    <input
                      type="number"
                      placeholder="No"
                      value={p.jerseyNumber}
                      onChange={(e) =>
                        updatePlayer('B', p.id, 'jerseyNumber', e.target.value ? Number(e.target.value) : '')
                      }
                      className="w-12 px-1.5 py-1 text-xs text-center font-bold font-mono rounded border border-slate-300"
                    />
                    <input
                      type="text"
                      placeholder="Nama Pemain"
                      value={p.fullName}
                      onChange={(e) => updatePlayer('B', p.id, 'fullName', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs rounded border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => removePlayer('B', p.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Team C (Conditional for 3 Team) */}
            {structure === 'THREE_TEAM' && (
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-6 h-6 rounded-md bg-amber-600 text-white text-xs font-bold flex items-center justify-center">
                      C
                    </span>
                    <input
                      type="text"
                      required
                      value={teamCName}
                      onChange={(e) => setTeamCName(e.target.value)}
                      placeholder="Nama Tim C"
                      className="font-bold text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-sm flex-1 max-w-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => addPlayer('C')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Atlet</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                  {playersC.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200"
                    >
                      <span className="text-[10px] text-slate-400 font-mono w-4">{idx + 1}.</span>
                      <input
                        type="number"
                        placeholder="No"
                        value={p.jerseyNumber}
                        onChange={(e) =>
                          updatePlayer('C', p.id, 'jerseyNumber', e.target.value ? Number(e.target.value) : '')
                        }
                        className="w-12 px-1.5 py-1 text-xs text-center font-bold font-mono rounded border border-slate-300"
                      />
                      <input
                        type="text"
                        placeholder="Nama Pemain"
                        value={p.fullName}
                        onChange={(e) => updatePlayer('C', p.id, 'fullName', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs rounded border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => removePlayer('C', p.id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
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
