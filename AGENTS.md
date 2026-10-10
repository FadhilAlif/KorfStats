# AGENTS.md — KorfStats Bantul
### Panduan Arsitektur, Kontrak Teknis, dan Batasan Sistem untuk AI Agent

---

## 🎯 1. Konteks Proyek & Ringkasan Teknis

**KorfStats Bantul** adalah sistem pencatatan statistik pertandingan real-time di pinggir lapangan (*court-side*) dan platform evaluasi performa atlet untuk penentuan tim ofisial Korfball Kabupaten Bantul.
- **Tujuan Sistem**: Mengeliminasi pencatatan manual berbasis borang kertas/pena (`PRINT SCORE SHEET.xlsx`), mengotomatiskan rekapitulasi data pertandingan yang sebelumnya diolah manual di 18 sheet spreadsheet (`STATISTIK GAME BANTUL.xlsx`), menyediakan diagram interaktif radial 360° untuk shot chart, memfasilitasi perangkingan atlet objektif putra & putri, serta mendukung ekspor/impor file Excel resmi.
- **Arsitektur Utama**: Modular Web App dengan Offline-First PWA & Event-Sourced Match Logging.
- **Frontend Stack**: Next.js 14+ (App Router), React 18, Tailwind CSS, Lucide Icons, Recharts, Dexie.js (IndexedDB).
- **Backend Stack**: Next.js Server Actions & API Route Handlers (Node.js runtime) + Prisma ORM.
- **Database Engine**: **Neon Serverless PostgreSQL** (ACID compliant, connection pooling SSL).
- **Storage Engine**: Neon Object Storage (arsip berkas ekspor dan template Excel).
- **Excel Processing**: **ExcelJS** (High-fidelity workbook builder matching official score sheet layout).
- **Target Deadline**: Rilis MVP Fase 1.

> ⚠️ **Prioritas Eksekusi**: Selesaikan seluruh fitur **WAJIB (Must-Have)** terlebih dahulu sebelum mengerjakan fitur nilai plus / opsional.

---

## 📁 2. Struktur Direktori Repositori (Monorepo)

```
KorfStats/
├── docs/                             ← Dokumentasi Proyek
│   ├── PRD.md                        ← Product Requirements Document
│   ├── ARCHITECTURE.md               ← Desain Arsitektur & Sequence Flows
│   └── PROGRESS.md                   ← Pelacak Progres Pelaksanaan
├── statistik/                        ← Berkas Excel Referensi Tim Bantul
│   ├── PRINT SCORE SHEET.xlsx        ← Template borang fisik 2 Team & 3 Team
│   └── STATISTIK GAME BANTUL.xlsx    ← Template 18 sheet analitik & rumus eksisting
├── Database/                         ← Database Setup Scripts
│   ├── schema.sql                    ← DDL tabel, index, dan constraints PostgreSQL
│   └── seed.sql                      ← Skrip seed data awal (opsional)
├── src/                              ← Source Code Aplikasi Next.js
│   ├── app/                          ← App Router Pages & API Routes
│   │   ├── api/                      ← API Handlers (/matches, /sync, /reports, /import)
│   │   ├── matches/                  ← Halaman List & Setup Pertandingan
│   │   │   └── [id]/                 ← Halaman Live Match Recording (Offline PWA)
│   │   ├── players/                  ← Halaman Manajemen Roster Atlet & Profil
│   │   ├── analytics/                ← Dashboard Statistik, Ranking, & Shot Chart
│   │   ├── reports/                  ← Halaman Ekspor Score Sheet & Rekap
│   │   ├── layout.tsx                ← Layout Utama (Navigasi & PWA Provider)
│   │   └── page.tsx                  ← Beranda / Dashboard Ringkasan
│   ├── components/                   ← Komponen UI Reusable
│   │   ├── live-match/               ← Scoreboard, Timer, ActionPad, RadialShotChart
│   │   ├── analytics/                ← RadarChart, Heatmap, RankingTable
│   │   └── ui/                       ← Button, Modal, Card, Input, Toast
│   ├── lib/                          ← Utilitas & Core Business Logic
│   │   ├── db/                       ← Prisma Client & Neon DB Connection
│   │   ├── local-db/                 ← Dexie.js Schema & Client Storage Manager
│   │   ├── korf-engine/              ← Rumus Statistik Baku Bantul & Match Simulator
│   │   └── excel/                    ← ExcelJS Score Sheet Generator & Parser
│   └── types/                        ← Deklarasi TypeScript Interfaces & Enums
├── prisma/                           ← Skema Prisma ORM
│   └── schema.prisma                 ← Data Model Definition
├── public/                           ← Static Assets & PWA Manifest
│   ├── manifest.json                 ← Web App Manifest PWA
│   └── sw.js                         ← Service Worker Caching Script
├── AGENTS.md                         ← Panduan aturan operasional ini
├── README.md                         ← Panduan instalasi dan operasional
└── package.json                      ← Dependensi proyek
```

---

## 📐 3. Aturan Arsitektur yang TIDAK BOLEH Dilanggar (Hard Boundaries)

### A. Aturan Basis Data & Integritas Transaksi (Database Boundaries)
- ❌ **Dilarang keras** mengubah rumus atau nama field statistik inti yang telah ditentukan dalam spesifikasi acuan (`SA`, `SM`, `RIA`, `RIM`, `FG %`, `RI %`, `Positive`, `Negative`, `Total Score`, `Efisiensi`).
- ❌ **Dilarang** menghapus riwayat event pertandingan (`match_events`) tanpa memperbarui running score dan agregat statistik secara atomik.
- ✅ Setiap mutasi data pertandingan yang melibatkan multi-tabel (`matches` + `match_events` + `player_game_stats`) **WAJIB** dieksekusi dalam transaksi database atomik (`prisma.$transaction`).
- ✅ Setiap event aksi pertandingan lokal **WAJIB** memiliki `client_event_id` unik (UUIDv4) untuk menjamin idempoten saat sinkronisasi background ke server cloud.

### B. Batasan Antarmuka & Logika Bisnis (Presentation & Symmetry Boundary)
- ❌ **Dilarang keras** meng-hardcode formula kalkulasi yang berbeda antara frontend client dan backend server. Seluruh komputasi performa atlet **WAJIB** bersumber dari modul pustaka bersama `src/lib/korf-engine/korf-calculator.ts`.
- ❌ **Dilarang** memblokir interaksi pencatatan lapangan saat perangkat luring (*offline*). Pencatatan event wajib selalu berhasil tersimpan di IndexedDB terlepas dari status koneksi internet.
- ✅ Aksi **Quick Undo** wajib membatalkan aksi secara instan baik pada UI, state lokal, maupun antrean sinkronisasi.

### C. Manajemen Konfigurasi & Kredensial (Configuration Security)
- ❌ **Dilarang keras** menulis hardcoded connection string Neon DB, API key, atau kredensial rahasia di dalam source code repository!
- ✅ Seluruh parameter koneksi basis data **WAJIB** dibaca melalui variabel lingkungan `.env` (`DATABASE_URL`, `DIRECT_URL`).

---

## 🗄️ 4. Skema Database Referensi (PostgreSQL / Neon)

```sql
-- 1. TABEL TIM
CREATE TABLE teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL PEMAIN / ATLET
CREATE TABLE players (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    nickname VARCHAR(50),
    jersey_number INT NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('MALE', 'FEMALE')),
    jersey_size VARCHAR(10),
    primary_position VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_team_jersey UNIQUE (team_id, jersey_number)
);

-- 3. TABEL PERTANDINGAN
CREATE TABLE matches (
    id VARCHAR(36) PRIMARY KEY,
    match_code VARCHAR(50) NOT NULL UNIQUE,
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    venue VARCHAR(100),
    format VARCHAR(10) NOT NULL CHECK (format IN ('K4', 'K8')),
    team_structure VARCHAR(20) NOT NULL CHECK (team_structure IN ('TWO_TEAM', 'THREE_TEAM')),
    team_a_id VARCHAR(36) NOT NULL REFERENCES teams(id),
    team_b_id VARCHAR(36) NOT NULL REFERENCES teams(id),
    team_c_id VARCHAR(36) REFERENCES teams(id),
    periods INT DEFAULT 2,
    period_duration_minutes INT DEFAULT 20,
    status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'LIVE', 'COMPLETED')),
    score_team_a INT DEFAULT 0,
    score_team_b INT DEFAULT 0,
    score_team_c INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL LINEUP PERTANDINGAN
CREATE TABLE match_lineups (
    id VARCHAR(36) PRIMARY KEY,
    match_id VARCHAR(36) NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id VARCHAR(36) NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_id VARCHAR(36) NOT NULL REFERENCES teams(id),
    is_starter BOOLEAN DEFAULT FALSE,
    is_on_court BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_match_player UNIQUE (match_id, player_id)
);

-- 5. TABEL EVENT AKSI PERTANDINGAN (EVENT SOURCING LOG)
CREATE TABLE match_events (
    id VARCHAR(36) PRIMARY KEY,
    client_event_id VARCHAR(64) NOT NULL UNIQUE,
    match_id VARCHAR(36) NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id VARCHAR(36) REFERENCES players(id),
    team_id VARCHAR(36) NOT NULL REFERENCES teams(id),
    period INT NOT NULL,
    game_time_seconds INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    shot_position INT, -- 1 s/d 8
    shot_distance_meter INT, -- 2, 4, 6, 8
    turnover_type VARCHAR(20), -- TO_BP, TO_BI, TO_T, TO_DD, TO_DRI, TO_C
    opponent_player_id VARCHAR(36) REFERENCES players(id),
    points_awarded INT DEFAULT 0,
    running_score_a INT DEFAULT 0,
    running_score_b INT DEFAULT 0,
    running_score_c INT DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_match_events_match ON match_events(match_id, recorded_at);

-- 6. TABEL AGREGAT STATISTIK PEMAIN PER PERTANDINGAN
CREATE TABLE player_game_stats (
    id VARCHAR(36) PRIMARY KEY,
    match_id VARCHAR(36) NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id VARCHAR(36) NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    sa INT DEFAULT 0,
    sm INT DEFAULT 0,
    ria INT DEFAULT 0,
    rim INT DEFAULT 0,
    fpa INT DEFAULT 0,
    fpm INT DEFAULT 0,
    pa INT DEFAULT 0,
    pm INT DEFAULT 0,
    fsa INT DEFAULT 0,
    fsm INT DEFAULT 0,
    reb_off INT DEFAULT 0,
    reb_def INT DEFAULT 0,
    assist INT DEFAULT 0,
    intercept INT DEFAULT 0,
    defended INT DEFAULT 0,
    to_sum INT DEFAULT 0,
    fouls INT DEFAULT 0,
    fg_percentage DOUBLE PRECISION DEFAULT 0.0,
    ri_percentage DOUBLE PRECISION DEFAULT 0.0,
    positive_score DOUBLE PRECISION DEFAULT 0.0,
    negative_score DOUBLE PRECISION DEFAULT 0.0,
    total_score DOUBLE PRECISION DEFAULT 0.0,
    total_positive_actions INT DEFAULT 0,
    efficiency DOUBLE PRECISION DEFAULT 0.0,
    total_points INT DEFAULT 0,
    CONSTRAINT uq_player_match_stat UNIQUE (match_id, player_id)
);
```

---

## 🔌 5. Kontrak API Minimum (API Contracts)

| Method | Endpoint | Deskripsi Fungsi | Payload Utama | Response Code & Output |
|---|---|---|---|---|
| `GET` | `/api/teams` | Ambil semua data tim | - | `200 OK`: `[{ id, name, code }]` |
| `POST` | `/api/teams` | Tambah tim baru | `{ name, code }` | `201 Created`: `{ success: true, data }` |
| `GET` | `/api/players` | Daftar pemain (filter team_id / gender) | `?team_id=&gender=` | `200 OK`: `[ Player ]` |
| `POST` | `/api/players` | Tambah pemain baru | `{ team_id, full_name, jersey_number, gender }` | `201 Created`: `{ success: true }` |
| `GET` | `/api/matches` | Daftar pertandingan | `?status=` | `200 OK`: `[ Match ]` |
| `POST` | `/api/matches` | Inisialisasi pertandingan baru | `{ match_code, format, team_structure, team_a_id, team_b_id }` | `201 Created`: `{ matchId }` |
| `GET` | `/api/matches/{id}` | Detail lengkap laga & lineup | Path `id` | `200 OK`: `{ match, lineups, events }` |
| `POST` | `/api/sync/events` | Batch sinkronisasi event offline | `{ matchId, events: [ MatchEvent ] }` | `200 OK`: `{ syncedCount, acknowledgedIds }` |
| `POST` | `/api/matches/{id}/undo` | Membatalkan event terakhir | Path `id` | `200 OK`: `{ success: true, restoredScores }` |
| `GET` | `/api/analytics/rankings` | Leaderboard seleksi tim ofisial | `?gender=MALE&weight_config_id=` | `200 OK`: `{ rankings: [...] }` |
| `GET` | `/api/reports/{id}/scoresheet` | Unduh file Excel Score Sheet cetak | `?format=xlsx` | `200 OK`: Binary Stream (`application/vnd.openxmlformats...`) |
| `POST` | `/api/import/excel` | Impor data dari file Excel Bantul | `FormData (file: .xlsx)` | `200 OK`: `{ importedPlayers, importedMatches }` |

---

## ✅ 6. Aturan Bisnis Inti (Business Rules)

| Kode Rule | Pernyataan Aturan | Penegakan | Penanganan / Perilaku Sistem |
|---|---|---|---|
| **BR-01** | Nomor punggung pemain wajib unik dalam satu tim yang sama | API + IndexedDB | Tolak simpan dengan pesan error validasi nomor punggung duplikat. |
| **BR-02** | Pemain aktif di lapangan tidak boleh melebihi kuota format (K4 = 4 atlet; K8 = 8 atlet: 4 pria, 4 wanita) | Client & Engine | Substitusi wajib memilih pemain keluar sebelum pemain baru masuk. |
| **BR-03** | Jumlah Made (M) selalu otomatis menambah Attempt (A), sehingga nilai $M \le A$ selalu konsisten | Match Engine | Mencatat gol otomatis menginkremen counter Attempt secara bersamaan. |
| **BR-04** | Perhitungan formula statistik wajib 100% konsisten dengan lembar acuan Excel Bantul | Core Engine | Menggunakan fungsi kalkulator simetris terpusat (`korf-calculator.ts`). |
| **BR-05** | Seluruh aksi live match wajib tersimpan di IndexedDB sebelum dikirim ke API backend | Client Storage | Menjamin zero data loss saat perangkat berada di area tanpa koneksi internet. |
| **BR-06** | Aksi Quick Undo membatalkan mutasi skor dan log event secara atomik | Match Engine | Mengurangi skor tim pencetak, membatalkan event terakhir, dan memperbarui tampilan UI seketika. |
| **BR-07** | Pertandingan 3 Tim (*triangular scrimmage*) mencatat skor berjalan untuk 3 tim secara independen | Match Engine | Running score dihitung per tim (A, B, dan C) sesuai keterlibatan aksi gol. |
| **BR-08** | Papan peringkat seleksi tim ofisial wajib dipisahkan ketat berdasarkan gender (Putra vs Putri) | Analytics Engine | Menyediakan tabel ranking terpisah kategori Male dan Female. |
| **BR-09** | Ekspor berkas score sheet wajib mereplikasi struktur baris, kolom, dan warna yellow highlight borang cetak asli | ExcelJS Service | Menggunakan layout visual yang presisi sesuai file `PRINT SCORE SHEET.xlsx`. |

---

## 🚦 7. Urutan Implementasi yang Direkomendasikan (Step-by-Step)

```
Langkah 1: Setup Proyek Next.js 14, Tailwind CSS, Lucide Icons, & Konfigurasi TypeScript
Langkah 2: Setup Database Neon PostgreSQL (Prisma schema & Database/schema.sql)
Langkah 3: Pustaka Inti Korfball Engine (src/lib/korf-engine/korf-calculator.ts) + Unit Tests
Langkah 4: Setup Client Local Database (Dexie.js schema & Offline Sync Manager)
Langkah 5: Halaman Master Roster Pemain & Setup Pertandingan (K4/K8, 2/3 Tim)
Langkah 6: Layar Live Match Recording: Scoreboard, Timer, Action Pad, & Quick Undo
Langkah 7: Komponen Radial Shot Spot Selector 360° & Diagram Heatmap
Langkah 8: Borang View (Replika Tampilan Lembar Skor Fisik di Layar)
Langkah 9: Engine Ekspor ExcelJS (Score Sheet 2 Team, 3 Team, & Rekap Statistik)
Langkah 10: Modul Analisis Statistik, Leaderboard Putra/Putri, & Custom Weighting
Langkah 11: Modul Impor Excel untuk migrasi data historis
Langkah 12: Konfigurasi PWA (Manifest, Icons, & Service Worker Offline Caching)
Langkah 13: Audit Kepatuhan AGENTS.md, Validasi Formula Excel, & Deployment
```

---

## 📚 8. Tautan Dokumen Referensi Proyek

- [`docs/PRD.md`](docs/PRD.md) — Product Requirements Document Lengkap
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Desain Arsitektur Sistem, ERD, dan Sequence Flows
- [`docs/PROGRESS.md`](docs/PROGRESS.md) — Pelacak Progres Pelaksanaan & Checklist Fase
