# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## KorfStats Bantul — Digitalisasi Pencatatan Pertandingan & Lembar Skor Korfball Bantul

| Metadata Dokumen | Nilai |
|---|---|
| **Versi** | 1.1 (Streamlined MVP Focus) |
| **Tanggal Terbit** | 2026-10-10 |
| **Status** | Approved |
| **Penulis / Pemilik** | Tim Statistik & Kepelatihan Korfball Kabupaten Bantul |
| **Target Release** | Fase 1 MVP |

---

## 1. Latar Belakang & Pendekatan Fase 1 MVP

### 1.1 Latar Belakang
Tim Statistik Korfball Bantul saat ini mencatat pertandingan di pinggir lapangan secara manual menggunakan kertas dan pena dengan template cetak **PRINT SCORE SHEET** (format 2 Tim dan 3 Tim). Pencatatan manual ini rawan salah hitung, membuat pencatat kelelahan saat tempo cepat, dan membutuhkan penyalinan ulang yang memakan waktu.

### 1.2 Pendekatan Fase 1 MVP (Lean & Focused)
Untuk mencegah *overengineering*, **Fase 1 MVP difokuskan secara tajam untuk mendigitalisasi proses pencatatan skor di lapangan dan menghasilkan ekspor Excel yang 100% presisi sesuai format lembar cetak fisik `PRINT SCORE SHEET.xlsx`**:
- **Digital Match Recording Court-side**: Menggantikan kertas dengan web app responsif (bisa dibuka di tablet, laptop, atau smartphone).
- **Aturan Poin Korfball Baku**: Setiap tembakan yang masuk (**Made**) bernilai tepat **1 poin** (tidak ada 2 atau 3 poin seperti bola basket).
- **5 Tombol Aksi Tembakan Eksplisit**: Mengakomodasi 5 kategori tembakan resmi:
  1. **Shoot** (Tembakan jarak jauh/luar)
  2. **Running In** (Tembakan lay-up/penetrasi masuk ke tiang korf)
  3. **Penalty** (Tembakan penalti)
  4. **Free Pass** (Operan bebas)
  5. **Free Shot** (Tembakan bebas)
  *(Pada ekspor lembar cetak borang, kolom PINALTY/FS secara otomatis mengakumulasikan Penalty, Free Pass, dan Free Shot)*.
- **Aksi Non-Tembakan**: Rebound (Offensive & Defensive), Assist, Intercept, Turnover, dan Foul.
- **Kolom DP (Defended)**: Kolom DP pada running score mencatat nama atau nomor pemain lawan yang sedang menjaga (*defended*) saat gol tersebut dicetak.
- **Dukungan 2 Format Lembar Skor**:
  1. **SCORE SHEET 2 TEAM**: Format standar K8 (8 pemain inti on-court: 4 putra & 4 putri + cadangan) atau K4 (4 pemain), 2 tim bertanding.
  2. **SCORE SHEET 3 TEAM**: Format latihan/scrimmage K4 (3 tim: A, B, C bertanding bergantian, dengan blok Tim D opsional).
- **Quick Undo**: Tombol pembatal aksi terakhir instan untuk koreksi kesalahan salah tekan.
- **Ekspor Excel High-Fidelity**: Menghasilkan file Excel (.xlsx) dengan struktur baris, border, font, dan highlight kuning kolom skor yang identik dengan file asli `PRINT SCORE SHEET.xlsx`.
- **Kompatibilitas Fase 2 (Extensible Foundation)**: Struktur event log menyimpan data mentah secara modular dan granular sehingga siap dihubungkan dengan 18 sheet formula statistik `STATISTIK GAME BANTUL.xlsx` (shot chart spot 1-8, jarak 2-8M, rating Positive/Negative, dan perangkingan seleksi tim ofisial) pada Fase 2 tanpa perlu mengubah skema inti.

---

## 2. Tujuan MVP & Kriteria Keberhasilan

| Kode | Tujuan MVP | Deskripsi | KPI / Kriteria Lulus |
|---|---|---|---|
| **G-01** | Digitalisasi Borang Lapangan | Menggantikan kertas `PRINT SCORE SHEET` dengan UI sentuh cepat di perangkat tablet/laptop. | Pencatatan per event < 2 detik; responsivitas instan tanpa jeda. |
| **G-02** | Akurasi Skor & Running Score Otomatis | Mengeliminasi salah hitung skor; setiap gol menambah 1 poin dan mencatat running score beserta pemain penjaga (DP). | Skor tim dan running score selalu 100% konsisten secara real-time. |
| **G-03** | Ekspor Excel Identik | Mengunduh hasil pertandingan langsung ke file `.xlsx` dengan template visual identik borang cetak. | File Excel yang dihasilkan dapat langsung dicetak di printer format A4 tanpa merapikan kolom. |
| **G-04** | Fondasi Data Siap Analitik Lanjut | Skema penyimpanan menyimpan data per aksi (event sourcing) secara modular. | Data Fase 1 dapat diolah oleh mesin analitik Fase 2 (`STATISTIK GAME BANTUL`). |

---

## 3. Ruang Lingkup Proyek (Scope)

### 3.1 Dalam Ruang Lingkup Fase 1 MVP (In-Scope)
- [x] **Setup Pertandingan & Roster**:
  - Pilihan format: 2 Team Match (K8 / K4) atau 3 Team Scrimmage (K4).
  - Input nama tim dan daftar pemain (Nomor Punggung dan Nama Pemain).
- [x] **Antarmuka Pencatatan Live Match**:
  - Scoreboard tim dan Game Clock digital (Play / Pause / Period).
  - Kartu Pemain di Lapangan (Lineup aktif) untuk penargetan aksi.
  - Action Pad:
    - *Shooting*: Shoot (M/A), Running In (M/A), Penalty (M/A), Free Pass (M/A), Free Shot (M/A).
    - *Ball Control & Defense*: Rebound Off, Rebound Def, Assist, Intercept.
    - *Disiplin & Kesalahan*: Turnover, Foul.
  - Saat gol (Made) dicatat: Pop-up cepat/input pemain lawan yang menjaga (**DP - Defended**).
  - Tombol **Quick Undo** untuk koreksi seketika.
  - Feed **Running Score** otomatis (DP, TIME, NAME, SCORE) tersusun per tim.
- [x] **Borang Live View**:
  - Layar pratinjau matriks digital yang menampilkan akumulasi statistik pemain (M/A, OFF/DEF, AS, I, TO, F) dan running score bersebelahan.
- [x] **Mesin Ekspor Excel (ExcelJS)**:
  - Generate file Excel persis layout `SCORE SHEET 2 TEAM` (Sheet 1).
  - Generate file Excel persis layout `SCORE SHEET 3 TEAM` (Sheet 2).
  - Pewarnaan sel kuning (`#FFFF00`) pada kolom SCORE di running score.

### 3.2 Di Luar Lingkup Fase 1 (Dikerjakan pada Fase 2)
- ⛔ Diagram radial 360° SVG pemilih spot tembakan (Pos 1–8) dan jarak (2M, 4M, 6M, 8M).
- ⛔ Formula evaluasi kompleks dan leaderboard seleksi tim ofisial (Positive, Negative, Efisiensi, Rank Male/Female).
- ⛔ Modul parser impor file spreadsheet 18 sheet `STATISTIK GAME BANTUL.xlsx`.
- ⛔ Manajemen otentikasi login multi-role (RBAC).

---

## 4. Spesifikasi Fungsional Fase 1 MVP

### 4.1 Halaman Setup Pertandingan (`/matches/new`)
- **Pilihan Template**:
  - `SCORE SHEET 2 TEAM` (Team A vs Team B)
  - `SCORE SHEET 3 TEAM` (Team A, Team B, Team C)
- **Informasi Laga**: Tanggal, Tempat/GOR, Durasi Babak (default 20 menit), Jumlah Babak (default 2 babak).
- **Pengisian Roster Tim**:
  - Formulir input cepat: Nomor Punggung & Nama Atlet per tim.
  - Kapasitas: Hingga 12 pemain per tim untuk 2 Team; 4 pemain per tim untuk 3 Team (K4).

### 4.2 Halaman Live Scorekeeper (`/matches/[id]`)
- **Header**: Nama Tim, Skor Terkini (Tim A vs Tim B atau A vs B vs C), Stopwatch Waktu Pertandingan, Tombol Ganti Babak.
- **Panel Pemain Aktif**: Daftar pemain tim yang sedang bermain di lapangan.
- **Panel Tombol Aksi (Action Pad)**:
  - Tombol Tembakan (Hijau untuk Made, Abu-abu untuk Attempt):
    - `Shoot M` / `Shoot A`
    - `Running In M` / `Running In A`
    - `Penalty M` / `Penalty A`
    - `Free Pass M` / `Free Pass A`
    - `Free Shot M` / `Free Shot A`
  - Tombol Statistik Lain:
    - `Rebound Off` / `Rebound Def`
    - `Assist`
    - `Intercept`
    - `Turnover`
    - `Foul`
- **Alur Pencatatan Gol (Made)**:
  1. Klik nama pemain -> Klik tombol `Shoot M` (atau tembakan lain).
  2. Skor tim otomatis bertambah **+1 poin**. Attempt tembakan otomatis bertambah **+1**.
  3. Dialog cepat (1 klik) muncul: *"Siapa penjaga (DP)?"* -> Klik nama pemain lawan atau pilih *Tanpa Penjaga (-)*.
  4. Baris Running Score baru otomatis tercatat: `[DP] [TIME] [PLAYER_NAME] [RUNNING_SCORE]`.
- **Tombol Quick Undo**:
  - Membatalkan event terakhir: mengurangi kembali skor tim (-1 jika gol), mengurangi counter attempt/made, dan menghapus entri running score terakhir.
- **Tampilan Borang (Matrix View)**:
  - Tabel matriks real-time yang memperlihatkan angka M dan A per pemain persis kolom lembar borang kertas.

### 4.3 Fitur Ekspor Excel (`/api/matches/[id]/export`)
- Menggunakan pustaka **ExcelJS**.
- Membangun workbook dengan struktur sel, border, teks judul `"STATISTIK GAME"`, subjudul `"TEAM A"`, `"TEAM B"`, `"RUNNING SCORE"`, serta kolom skor berwarna kuning **#FFFF00**.
- Mapping Kolom Ekspor:
  - Kolom SHOOT $M/A \leftarrow$ `Shoot Made / Attempt`
  - Kolom RUNNING IN $M/A \leftarrow$ `Running In Made / Attempt`
  - Kolom PINALTY/FS $M/A \leftarrow$ `(Penalty + Free Pass + Free Shot) Made / Attempt`
  - Kolom REBOUND OFF/DEF $\leftarrow$ `Rebound Off / Def`
  - Kolom ASSIST, INTERCEPT, TURN OVER, FOUL $\leftarrow$ masing-masing nilai agregat
  - Kolom RUNNING SCORE $\leftarrow$ urutan running score `DP | TIME | NAME | SCORE`.

---

## 5. Aturan Bisnis Inti (Business Rules)

| Kode Rule | Pernyataan Aturan | Penegakan | Penanganan Sistem |
|---|---|---|---|
| **BR-01** | Nilai setiap gol korfball adalah tepat 1 poin | Core Engine | Penambahan skor selalu bernilai 1 untuk semua tipe tembakan. |
| **BR-02** | Setiap aksi Made (M) otomatis menginkremen Attempt (A) | Core Engine | Tombol Made mencatat 1 Made dan 1 Attempt sekaligus ($M \le A$ selalu konsisten). |
| **BR-03** | Kolom DP wajib menyimpan identifier/nama pemain lawan penjaga saat gol terjadi | Match Engine | Menyimpan relasi `opponent_player_id` atau inisial penjaga pada event gol. |
| **BR-04** | Aksi Quick Undo membatalkan mutasi secara atomik | Core Engine | Mengurangi skor tim pencetak, membatalkan event terakhir, dan memperbarui tampilan UI seketika. |
| **BR-05** | Ekspor Excel wajib menghasilkan tampilan yang identik dengan file `PRINT SCORE SHEET.xlsx` | ExcelJS Service | Mengikuti template grid, lebar kolom, dan pewarnaan sel kuning #FFFF00. |
| **BR-06** | Data pertandingan disimpan dengan format event log terurut | Data Layer | Menjamin integritas dan kesiapan data untuk diolah ke formula analitik `STATISTIK GAME BANTUL` pada Fase 2. |

---

## 6. Spesifikasi Non-Fungsional (NFR)

| Dimensi | Parameter | Spesifikasi MVP |
|---|---|---|
| **Framework UI** | Frontend | Next.js 14+ (App Router), React, Tailwind CSS, Lucide Icons |
| **Penyimpanan Data** | Database | Neon PostgreSQL (Serverless) via Prisma ORM + Client Cache |
| **Pustaka Excel** | Spreadsheet Engine | **ExcelJS** |
| **Performa UI** | Latensi Input | Respons sentuhan tombol < 50ms |
| **Kompatibilitas Layar** | Responsive Design | Nyaman digunakan di Tablet (10"), Laptop (13"-15"), dan Smartphone |
