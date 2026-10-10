# PROJECT PROGRESS TRACKER (PROGRESS.md)
## KorfStats Bantul — Pelacak Progres Pengerjaan Sistem

| Metadata Pelaksanaan | Nilai |
|---|---|
| **Tanggal Mulai** | 2026-10-10 |
| **Target Selesai / Deadline** | Fase 1 MVP Release |
| **Status Keseluruhan** | 🟡 In Progress |
| **Persentase Selesai** | 25% |
| **PIC / Penanggung Jawab** | Lead AI Architect & Tim Pengembang Korfball Bantul |

---

## 📊 Ringkasan Progress Fase 1 MVP (Fokus Digitalisasi Score Sheet & Ekspor Excel)

| Fase | Komponen / Fokus Kerja | Status | Estimasi Waktu | Waktu Aktual | PIC / Agent |
|---|---|---|---|---|---|
| **0** | Discovery & Penyelarasan Kebutuhan Borang Lapangan (DP, 1 Poin Korfball, 5 Shot Buttons, 2 & 3 Team Sheet) | 🟢 Selesai | 45 mnt | 45 mnt | AI Architect |
| **1** | Setup Proyek Next.js, Tailwind CSS, Prisma ORM, & Database Schema Neon PostgreSQL | 🟡 In Progress | 30 mnt | - | AI Developer |
| **2** | Core Match Recording Engine (Skor 1 Poin, 5 Tipe Tembakan, DP Keeper, Quick Undo, Lineup on-court) | 🔴 Belum | 45 mnt | - | AI Developer |
| **3** | Halaman Setup Pertandingan & Input Roster Tim (2 Team & 3 Team) | 🔴 Belum | 45 mnt | - | AI Developer |
| **4** | Layar Live Match Recording (Scoreboard, Timer, Action Pad, Running Score Feed, & Borang View) | 🔴 Belum | 1.5 jam | - | AI Developer |
| **5** | Mesin Ekspor ExcelJS (High-Fidelity SCORE SHEET 2 TEAM & 3 TEAM matching `PRINT SCORE SHEET.xlsx`) | 🔴 Belum | 1 jam | - | AI Developer |
| **6** | Pengujian Integrasi Alur Live Match & Validasi Hasil Unduhan Excel di Microsoft Excel | 🔴 Belum | 30 mnt | - | AI Developer |

---

## 🗺️ Roadmap Lanjutan (Fase 2 — Analitik Kompleks `STATISTIK GAME BANTUL`)
*Dikerjakan setelah Fase 1 MVP tervalidasi di lapangan:*
- [ ] Radial 360° Shot Spot Selector (Posisi 1–8, Jarak 2M–8M) & Heatmap Visual.
- [ ] Mesin Kalkulasi Formula Baku Bantul (FG%, RI%, FP%, P%, FS%, Positive, Negative, Total Score, Efisiensi).
- [ ] Leaderboard Seleksi Tim Ofisial (Putra & Putri terpisah) + Custom Weighting Editor.
- [ ] Modul Impor 18 Sheet `STATISTIK GAME BANTUL.xlsx`.
- [ ] Neon Auth & Manajemen Peran Multi-User.

---

## FASE 0 — Discovery & Clarification
**Status**: 🟢 Selesai
- [x] Klarifikasi kolom **DP** pada Running Score: Singkatan dari **Defended** (pemain lawan yang menjaga saat gol terjadi).
- [x] Konfirmasi aturan poin Korfball: **Setiap tembakan yang masuk bernilai 1 poin** (tanpa 2 atau 3 poin).
- [x] Konfirmasi 5 tombol tembakan eksplisit: Shoot, Running In, Penalty, Free Pass, Free Shot.
- [x] Konfirmasi format 3 Team (K4 scrimmage 3 tim saling bertanding bergantian).
- [x] Pembaruan dokumen `docs/PRD.md`, `docs/ARCHITECTURE.md`, `AGENTS.md`.

---

## FASE 1 — Inisialisasi Proyek & Database Setup
**Status**: 🟡 In Progress
- [ ] Inisialisasi aplikasi Next.js (App Router, TypeScript, Tailwind CSS, Lucide React).
- [ ] DDL Database di `Database/schema.sql` dan Skema Prisma (`prisma/schema.prisma`).
- [ ] Konfigurasi koneksi Neon PostgreSQL.
