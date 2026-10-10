# KorfStats Bantul

> **Sistem Pencatatan Statistik Pertandingan Real-Time & Evaluasi Atlet Korfball Kabupaten Bantul**

Aplikasi web progresif responsif (**Next.js 14**, **Tailwind CSS**, **Prisma ORM**, **Neon PostgreSQL**, dan **ExcelJS**) yang dirancang untuk menggantikan borang kertas manual di pinggir lapangan (*court-side*), mempermudah pencatatan aksi laga, serta mengekspor lembar skor resmi yang 100% presisi sesuai format `PRINT SCORE SHEET.xlsx`.

---

## 🚀 Fitur Utama (Fase 1 MVP)

1. **Digitalisasi Score Sheet di Lapangan**:
   - Scoreboard terintegrasi & Stopwatch digital (Play, Pause, Reset, Period switch).
   - Kartu pemain on-court untuk input aksi cepat satu sentuhan.
2. **Aturan Baku Skor Korfball**:
   - Semua tembakan yang masuk bernilai tepat **1 Poin**.
3. **5 Tombol Aksi Tembakan Eksplisit**:
   - `Shoot` (M / A)
   - `Running In` (M / A)
   - `Penalty` (M / A)
   - `Free Pass` (M / A)
   - `Free Shot` (M / A)
4. **Kolom DP (Defended)**:
   - Dialog instan (1 klik) untuk mencatat pemain lawan yang menjaga saat gol terjadi.
5. **Aksi Lengkap Borang**:
   - Rebound (Offensive & Defensive), Assist, Intercept, Turnover, dan Foul.
6. **Quick Undo**:
   - Membatalkan aksi terakhir seketika tanpa merusak integritas skor.
7. **Borang View (Replika Lembar Cetak)**:
   - Pratinjau langsung matriks angka M/A dan statistik pemain di layar.
8. **Ekspor Excel High-Fidelity**:
   - Unduh langsung ke file `.xlsx` dengan format, border, header, dan warna sel kuning (`#FFFF00`) identik dengan `PRINT SCORE SHEET.xlsx` (Sheet 2 Team dan 3 Team).

---

## 🛠️ Persyaratan Sistem & Tech Stack

- **Node.js**: v18.17+ atau v20+ / v22+
- **Framework**: Next.js 14+ (App Router), React 18, Tailwind CSS, Lucide Icons
- **Database**: Neon Serverless PostgreSQL (atau PostgreSQL lokal) via Prisma ORM
- **Penyimpanan Lokal**: Dexie.js (IndexedDB)
- **Spreadsheet Generator**: ExcelJS

---

## 📦 Panduan Instalasi & Menjalankan Aplikasi

### 1. Klon Repositori & Masuk Direktori
```bash
git clone <repository-url>
cd KorfStats
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan `DATABASE_URL` dengan koneksi Neon PostgreSQL Anda.

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Jalankan Development Server
```bash
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## 🧪 Menjalankan Verifikasi & Unit Test

Untuk memvalidasi kalkulasi formula statistik dan mesin ekspor Excel:
```bash
# Uji coba kalkulator statistik
npx tsx tests/test-calculator.ts

# Uji coba pembuatan berkas Excel Score Sheet
npx tsx tests/test-excel-exporter.ts

# Uji coba build produksi Next.js
npm run build
```

---

## 📁 Struktur Repositori

```
KorfStats/
├── docs/                             ← Dokumentasi Rekayasa (PRD, Arsitektur, Progress)
├── statistik/                        ← File Referensi Excel (PRINT SCORE SHEET, STATISTIK GAME BANTUL)
├── Database/                         ← Skema DDL SQL PostgreSQL (schema.sql)
├── prisma/                           ← Skema Prisma ORM (schema.prisma)
├── src/
│   ├── app/                          ← Halaman App Router & API Route Handler
│   │   ├── api/matches/[id]/export/  ← Endpoint Unduh Excel Score Sheet
│   │   ├── matches/[id]/             ← Layar Live Match Recording Court-side
│   │   ├── matches/new/              ← Halaman Setup Pertandingan Baru
│   │   ├── layout.tsx                ← Layout Utama
│   │   └── page.tsx                  ← Beranda Ringkasan Pertandingan
│   ├── lib/
│   │   ├── db/                       ← Singleton Prisma Client
│   │   ├── local-db/                 ← Dexie.js Schema & Client Storage Manager
│   │   ├── korf-engine/              ← Rumus Baku Korfball & Event Aggregator
│   │   └── excel/                    ← Generator ExcelJS Sheet 2 Team & 3 Team
│   └── types/                        ← Deklarasi TypeScript Interfaces
├── tests/                            ← Unit & Integration Tests
└── AGENTS.md                         ← Panduan Aturan Operasional Sistem
```

---

## 📝 Lisensi & Hak Cipta
© 2026 Pengcab Korfball Kabupaten Bantul • Dikembangkan untuk modernisasi pencatatan statistik dan evaluasi tim ofisial.
