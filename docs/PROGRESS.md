# PROJECT PROGRESS TRACKER (PROGRESS.md)
## KorfStats Bantul — Pelacak Progres Pengerjaan Sistem

| Metadata Pelaksanaan | Nilai |
|---|---|
| **Tanggal Mulai** | 2026-10-10 |
| **Target Selesai / Deadline** | Fase 1 MVP Release |
| **Status Keseluruhan** | 🟢 Selesai (Fase 1 MVP Selesai & Terverifikasi) |
| **Persentase Selesai** | 100% (Fase 1 MVP) |
| **PIC / Penanggung Jawab** | Lead AI Architect & Tim Pengembang Korfball Bantul |

---

## 📊 Ringkasan Progress Fase 1 MVP

| Fase | Komponen / Fokus Kerja | Status | Estimasi Waktu | Waktu Aktual | PIC / Agent |
|---|---|---|---|---|---|
| **0** | Discovery & Penyelarasan Kebutuhan Borang Lapangan (DP, 1 Poin Korfball, 5 Shot Buttons, 2 & 3 Team Sheet) | 🟢 Selesai | 45 mnt | 45 mnt | AI Architect |
| **1** | Inisialisasi Git Repo, Next.js 14 App Router, Tailwind CSS, Prisma, & Database Schema Neon PostgreSQL | 🟢 Selesai | 30 mnt | 20 mnt | AI Developer |
| **2** | Core Match Recording Engine (Skor 1 Poin, 5 Tipe Tembakan, DP Keeper, Quick Undo, Lineup on-court) | 🟢 Selesai | 45 mnt | 30 mnt | AI Developer |
| **3** | Halaman Setup Pertandingan & Input Roster Tim (2 Team & 3 Team) | 🟢 Selesai | 45 mnt | 25 mnt | AI Developer |
| **4** | Layar Live Match Recording (Scoreboard, Timer, Action Pad, Running Score Feed, & Borang View) | 🟢 Selesai | 1.5 jam | 45 mnt | AI Developer |
| **5** | Mesin Ekspor ExcelJS (High-Fidelity SCORE SHEET 2 TEAM & 3 TEAM matching `PRINT SCORE SHEET.xlsx`) | 🟢 Selesai | 1 jam | 30 mnt | AI Developer |
| **6** | Pengujian Terpadu, Unit Testing Rumus, & Validasi Build Produksi (`next build`) | 🟢 Selesai | 30 mnt | 15 mnt | AI Developer |

---

## 🗺️ Roadmap Lanjutan (Fase 2 — Analitik Kompleks `STATISTIK GAME BANTUL`)
*Dikerjakan pada fase berikutnya dengan fondasi data yang sudah modular:*
- [ ] Radial 360° Shot Spot Selector (Posisi 1–8, Jarak 2M–8M) & Heatmap Visual.
- [ ] Mesin Kalkulasi Formula Baku Bantul (FG%, RI%, FP%, P%, FS%, Positive, Negative, Total Score, Efisiensi).
- [ ] Leaderboard Seleksi Tim Ofisial (Putra & Putri terpisah) + Custom Weighting Editor.
- [ ] Modul Impor 18 Sheet `STATISTIK GAME BANTUL.xlsx`.
- [ ] Neon Auth & Manajemen Peran Multi-User.

---

## 📋 Log Aktivitas Pengerjaan Fase 1 MVP

- **2026-10-10**:
  - Inisialisasi repositori Git dan file konfigurasi `.gitignore`, `.env.example`, `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.mjs`.
  - Penulisan DDL PostgreSQL di `Database/schema.sql` dan Prisma Schema di `prisma/schema.prisma`.
  - Pemasangan dependensi (`next`, `react`, `react-dom`, `tailwindcss`, `lucide-react`, `exceljs`, `dexie`, `prisma`).
  - Implementasi pustaka kalkulasi simetris di `src/lib/korf-engine/korf-calculator.ts`.
  - Implementasi penyimpanan lokal IndexedDB di `src/lib/local-db/dexie-db.ts`.
  - Implementasi generator lembar skor fisik berpresisi tinggi di `src/lib/excel/scoresheet-exporter.ts` (mencakup warna kuning `#FFFF00` untuk kolom SCORE).
  - Implementasi API Route Handler `/api/matches/[id]/export/route.ts`.
  - Implementasi layout utama (`src/app/layout.tsx`) dan halaman beranda (`src/app/page.tsx`).
  - Refinement alur pencatatan ala FIBA LiveStats (Assist by rekan & DP Defended by lawan) saat gol Made.
  - Opsi form clean dengan tombol 1-klik "Muat Roster Atlet Bantul" (10 Putra & 10 Putri resmi: Didiv dkk & Ririn dkk).
  - Validasi ketat gender mixed-sports korfball (K8: 4L & 4P; K4: 2L & 2P) beserta badge visual [L] dan [P] di seluruh antarmuka.
  - Implementasi Borang View lengkap dengan tabel Running Score berdampingan di sisi kanan (DP | TIME | NAME | SCORE [Kuning] | SCORE [Kuning] | NAME | TIME | DP).
  - Implementasi Running Score Live di Layar Live View dengan gaya komparatif Kanan-Kiri (Home di sisi kiri dengan aksen biru, Away di sisi kanan dengan aksen hijau zamrud, kotak skor kuning #FFFF00, info Assist & DP, serta toggle mode 2 Kolom Berdampingan dan urutan waktu).
  - **Refactoring Arsitektur Modular & Desain Corporate Minimalist**:
    - Ekstraksi engine murni: `match-engine.ts`, `action-types.ts`, `lineup-rules.ts`, `match-factory.ts`, `bantul-roster.ts`.
    - Pematuhan aturan AGENTS.md §3A: implementasi UUIDv4 (`id.ts`) untuk `client_event_id` dan ID entitas untuk menjamin idempotensi background sync.
    - Custom hooks terisolasi: `useLiveMatch.ts`, `useMatchClock.ts`, `useMatchSetupForm.ts` dengan titik persistensi tunggal di IndexedDB.
    - Pemecahan komponen terstruktur: `Scoreboard`, `TeamTabs`, `PlayerGrid`, `ActionPad`, `RunningScoreFeed`, `GoalAttributionModal`, `ReboundModal`, `BorangMatrixView`, `MatchConfigForm`, `TeamRosterSection`.
    - Dekomposisi god components: `page.tsx` live match berkurang drastis dari 1.824 baris menjadi ~230 baris; `new/page.tsx` dari 735 baris menjadi ~125 baris.
    - Penerapan design system Modern Minimalist (Corporate Navy `#0A1529` / `#1F3F7A`, Teal `#0D9488`, Amber `#F59E0B`, Yellow `#FFFF00`, font Inter + JetBrains Mono tabular angka).
  - Pengujian unit test kalkulator di `tests/test-calculator.ts` (100% lulus).
  - Pengujian unit test match engine & lineup di `tests/test-match-engine.ts` (100% lulus 6/6).
  - Pengujian ekspor berkas Excel di `tests/test-excel-exporter.ts` (100% lulus).
  - Build produksi `npm run build` sukses 0 error.
  - Seluruh perubahan tercatat di Git branch `main`.
