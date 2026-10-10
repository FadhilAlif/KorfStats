'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Users, AlertCircle } from 'lucide-react';
import { useMatchSetupForm } from '@/hooks/useMatchSetupForm';
import { MatchConfigForm } from '@/components/match-setup/MatchConfigForm';
import { TeamRosterSection } from '@/components/match-setup/TeamRosterSection';
import type { TeamSlot } from '@/lib/korf-engine/match-engine';

export default function NewMatchPage() {
  const router = useRouter();
  const form = useMatchSetupForm();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const createdMatchId = await form.submit();
    if (createdMatchId) {
      router.push(`/matches/${createdMatchId}`);
    }
  };

  const slots: TeamSlot[] = ['A', 'B', 'C'];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Page Title & Back Button */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Inisialisasi Pertandingan Baru
          </h1>
          <p className="text-xs text-slate-500">
            Setup format pertandingan & komposisi pemain berpasangan (Mixed Gender)
          </p>
        </div>
      </div>

      {/* Validation Warning Alert */}
      {form.validationError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 -mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Komposisi Tim Belum Valid</p>
            <p>{form.validationError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Step 1: Format & Match Metadata */}
        <MatchConfigForm
          structure={form.structure}
          format={form.format}
          matchCode={form.matchCode}
          venue={form.venue}
          onSelectStructure={form.setStructure}
          onSelectFormat={form.setFormat}
          onChangeMatchCode={form.setMatchCode}
          onChangeVenue={form.setVenue}
          onSeedBantul={form.seedBantulRoster}
          onClearRoster={form.clearRosters}
        />

        {/* Step 2: Team Rosters Setup */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 space-y-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-700" />
              <span>2. Susunan Pemain & Komposisi Gender (L/P)</span>
            </h2>
            <div className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-700 font-medium">
              Aturan {form.activeFormat}: Wajib minimal{' '}
              <span className="font-bold text-brand-700">{form.required.males} Laki-laki (L)</span> &{' '}
              <span className="font-bold text-rose-700">{form.required.females} Perempuan (P)</span> per tim
            </div>
          </div>

          <div className="space-y-6">
            {slots.slice(0, form.activeTeamCount).map((slot, idx) => (
              <TeamRosterSection
                key={slot}
                slot={slot}
                teamName={form.teams[idx].name}
                players={form.teams[idx].players}
                count={form.genderCounts[idx]}
                targetMales={form.required.males}
                targetFemales={form.required.females}
                onUpdateTeamName={(name) => form.setTeamName(idx, name)}
                onAddPlayer={(gender) => form.addPlayer(idx, gender)}
                onRemovePlayer={(id) => form.removePlayer(idx, id)}
                onUpdatePlayer={(id, patch) => form.updatePlayer(idx, id, patch)}
              />
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Mulai Pertandingan & Catat Live</span>
          </button>
        </div>
      </form>
    </div>
  );
}
