# TEMPLATE: PROJECT PROGRESS TRACKER (PROGRESS.md)
<!-- 
================================================================================
🤖 INSTRUKSI UNTUK AI AGENT (PANDUAN OPERASIONAL TRACKING):
1. MODE UPDATE PROGRES (EXECUTION):
   - Setiap kali menyelesaikan sebuah task atau fase, ubah tanda `- [ ]` menjadi `- [x]`.
   - Update tabel "Ringkasan Progress" (ubah status 🔴/🟡/🟢 dan waktu aktual).
   - Tambahkan entri ringkas pada "Log Aktivitas / Harian" setelah setiap milestone penting.
   - Jika mengalami error atau blocker, catat segera di tabel "Kendala & Blocker" beserta resolusinya.

2. MODE ASESMEN STATUS (AUDIT & HEALTH-CHECK):
   - Evaluasi apakah waktu aktual melebihi estimasi secara signifikan (> 2x).
   - Cek apakah ada task prasyarat (prerequisite) yang belum tercentang sebelum fase berikutnya dimulai.
   - Laporkan persentase kelulusan Checklist Minimum Viable vs Advanced.
================================================================================
-->

## [NAMA SISTEM / REPOSITORI] — Tracking Progres Pengerjaan
### [Sub-judul / Deskripsi Singkat Milestone Proyek]

| Metadata Pelaksanaan | Nilai |
|----------------------|-------|
| **Tanggal Mulai** | YYYY-MM-DD <!-- Contoh: 2026-10-02 --> |
| **Target Selesai / Deadline** | [Target Waktu, misal: 1 hari kerja / 2 minggu] |
| **Status Keseluruhan** | 🟡 In Progress <!-- 🔴 Belum / 🟡 In Progress / 🟢 Selesai / ⚠️ Blocked --> |
| **Persentase Selesai** | [0% - 100%] |
| **PIC / Penanggung Jawab** | [Nama Developer / Lead Agent] |

---

## 📊 Ringkasan Progress

| Fase | Komponen / Fokus Kerja | Status | Estimasi Waktu | Waktu Aktual | PIC / Agent |
|------|------------------------|--------|----------------|--------------|-------------|
| **0** | Setup Lingkungan & Repositori | 🟢 Selesai | 30 mnt | 20 mnt | Developer / AI Agent |
| **1** | Database & Migrasi Skema | 🟢 Selesai | 45 mnt | 30 mnt | Developer / AI Agent |
| **2** | [Komponen / Service Master] | 🟡 In Progress | 60 mnt | 45 mnt | Developer / AI Agent |
| **3** | [Komponen / Service Transaksi] | 🔴 Belum | 3-4 jam | - | Developer / AI Agent |
| **4** | [FrontEnd UI & Integrasi API] | 🔴 Belum | 2-3 jam | - | Developer / AI Agent |
| **5** | [Security & Middleware Auth] | 🔴 Belum | 30 mnt | - | Developer / AI Agent |
| **6** | [Unit Testing & Validasi] | 🔴 Belum | 45 mnt | - | Developer / AI Agent |
| **7** | [Dokumentasi & Readme Setup] | 🔴 Belum | 30 mnt | - | Developer / AI Agent |
| **8** | [Final Audit & Deployment/Submit] | 🔴 Belum | 30 mnt | - | Developer / AI Agent |

> **Indikator Status**: 🔴 Belum Dimulai | 🟡 Sedang Berjalan (In Progress) | 🟢 Selesai (Completed) | ⚠️ Terkendala (Blocked)

---

## FASE 0 — Setup Lingkungan & Inisialisasi Repositori

**Status**: 🟢 Selesai  
**Target Selesai**: [YYYY-MM-DD]

### Prerequisites & Tools
- [x] Runtime & SDK utama terverifikasi (contoh: `.NET 8 SDK`, `Node.js 20`, `Go 1.22`).
- [x] Database engine lokal / kontainer Docker aktif dan dapat diakses.
- [x] Database GUI client (DBeaver, SSMS, PgAdmin, TablePlus) terhubung.
- [x] Git terkonfigurasi (nama user, email, dan branch utama `main`).

### Struktur Repositori & Workspace
- [x] Repositori Git dibuat (public/private sesuai instruksi).
- [x] Struktur folder awal dibentuk sesuai arsitektur monorepo/multirepo.
- [x] Initial commit dan push pertama ke remote repository.

---

## FASE 1 — Database Setup & Seed Data

**Status**: 🟢 Selesai  
**Target Selesai**: [YYYY-MM-DD]

### Skema & Migrasi Awal
- [x] Database utama dibuat: `[NAMA_DATABASE]`
- [x] File skrip `/Database/schema.sql` ditulis lengkap:
  - [x] DDL Tabel Master (`[TABLE_MASTER]`)
  - [x] DDL Tabel Transaksi Induk (`[TABLE_HEADER]`)
  - [x] DDL Tabel Detail Item (`[TABLE_DETAIL]`)
  - [x] Foreign Key constraints dan Unique Indexes terpasang
  - [x] Seed data awal (minimal 3 record referensi wajib) disertakan
- [x] Skrip berhasil dieksekusi clean dari nol tanpa error.

### Database Objects Tambahan (Stored Procedures / Views)
- [ ] File terpisah untuk Stored Procedure: `/Database/[sp_nama_prosedur].sql`
- [ ] Skrip query telah diuji coba langsung di database client.

---

## FASE 2 — [Nama Komponen / Service 1, misal: Master Service]

**Status**: 🟡 In Progress  
**Target Selesai**: [YYYY-MM-DD]

### Setup Proyek & Konfigurasi
- [x] Inisialisasi proyek service: `[Perintah inisialisasi framework]`
- [x] Library pihak ketiga ditambahkan (driver DB, ORM/Micro-ORM, dll.).
- [x] Konfigurasi environment (`appsettings.json` / `.env`) tersambung ke DB.

### Implementasi Layer
- [x] Data Model & Entity class: `[NamaModel].cs`
- [x] Data Access Interface & Repository: `I[Domain]Repository`
- [x] Business Logic Service Layer: `I[Domain]Service`
- [ ] API Controller / Route Handler: `GET /api/[entity]`
- [ ] Konfigurasi CORS & Dependency Injection.

### Pengujian & Verifikasi Endpoint
- [ ] Service berjalan pada port lokal: `[PORT_SERVICE_1]`
- [ ] Endpoint `GET /api/[entity]` mengembalikan data valid (Status 200 OK).
- [ ] Response DTO sesuai dengan kontrak API yang disepakati.

**Catatan Pelaksanaan**:
> _(Catat kendala, keputusan penyesuaian dependensi, atau detail penting di sini)_

---

## FASE 3 — [Nama Komponen / Service 2, misal: Transaction Service]

**Status**: 🔴 Belum  
**Target Selesai**: [YYYY-MM-DD]

### Setup & Model
- [ ] Inisialisasi proyek dan dependency pendukung.
- [ ] Request & Response DTO (CreateRequest, UpdateRequest, DetailResponse).
- [ ] Model data header dan line items.

### Repository & Integritas Transaksional
- [ ] Query baca daftar dengan filter multi-kriteria dan paginasi.
- [ ] Query detail tunggal beserta list line items.
- [ ] Operasi simpan transaksi (Insert Header + Bulk Insert Line Items).
- [ ] Operasi update (Update Header + Sinkronisasi Line Items dalam transaksi).
- [ ] Operasi delete atomik (`BEGIN TRANSACTION ... COMMIT` untuk child & parent).

### Validasi Business Rules (Service Layer)
- [ ] **BR-01**: Cek duplikasi nomor dokumen transaksi unik.
- [ ] **BR-02**: Validasi tanggal transaksi (tidak boleh masa depan).
- [ ] **BR-03**: Validasi kuantitas item (minimal 1 baris item terisi).
- [ ] **BR-04**: Validasi angka kuantitas & harga satuan (> 0).
- [ ] **BR-05**: Kalkulasi nominal dilakukan di server.
- [ ] Ekspor file laporan (.xlsx / .pdf) menggunakan filter aktif.

### Pengujian Endpoint
- [ ] `GET /api/[transaksi]` — List data terfilter berfungsi.
- [ ] `POST /api/[transaksi]` — 201 Created saat valid, 400 Bad Request saat data salah.
- [ ] `PUT /api/[transaksi]/{id}` — 200 OK saat update berhasil.
- [ ] `DELETE /api/[transaksi]/{id}` — 200 OK dan terhapus bersih dari DB.
- [ ] `GET /api/[transaksi]/export` — File berhasil di-generate dan dapat dibuka.

---

## FASE 4 — FrontEnd Web & Integrasi Antarmuka

**Status**: 🔴 Belum  
**Target Selesai**: [YYYY-MM-DD]

### Kerangka Tampilan & Styling
- [ ] Inisialisasi proyek antarmuka (MVC / Razor / React / Vue).
- [ ] Konfigurasi client HTTP terpusat menuju Service 1 dan Service 2.
- [ ] Desain tata letak responsif (Navbar, Sidebar, Kontainer, Typography).

### Integrasi Halaman Utama
- [ ] **Halaman Daftar Data (List View)**:
  - [ ] Tabel/Grid menampilkan ringkasan data.
  - [ ] Komponen pencarian keyword dan filter tanggal aktif.
  - [ ] Tombol tindakan Edit & Hapus per baris.
  - [ ] Modal dialog konfirmasi hapus menampilkan nomor dokumen dinamis.
  - [ ] Tombol trigger ekspor data terfilter.
- [ ] **Halaman Form Input (Create Mode)**:
  - [ ] Header form dengan validasi form kontrol.
  - [ ] Dropdown relasi terisi otomatis dari Service Master.
  - [ ] Tabel dinamis untuk menambah / menghapus baris item.
  - [ ] Subtotal & Grand Total ditampilkan secara read-only.
- [ ] **Halaman Form Input (Edit Mode)**:
  - [ ] Mengambil dan memuat ulang data yang ada (pre-populated).
  - [ ] Mengirim payload pembaruan data secara utuh.

---

## FASE 5 — Keamanan & Middleware Tambahan (Nilai Plus)

**Status**: 🔴 Belum  
**Target Selesai**: [YYYY-MM-DD]

- [ ] Proteksi endpoint sensitif (API Key header atau JWT Bearer Token).
- [ ] Middleware verifikasi otorisasi/autentikasi terpasang pada pipeline HTTP.
- [ ] Penanganan kasus tanpa token / kredensial tidak valid (HTTP 401 Unauthorized).
- [ ] Uji coba panggilan menggunakan Postman / curl dengan dan tanpa header auth.

---

## FASE 6 — Unit Testing & Quality Assurance (Nilai Plus)

**Status**: 🔴 Belum  
**Target Selesai**: [YYYY-MM-DD]

- [ ] Project unit test terpisah diinisialisasi (misal: `*.Tests`).
- [ ] Unit Test 1: Kalkulasi matematis nominal & pajak.
- [ ] Unit Test 2: Validasi pencegahan duplikasi data unik.
- [ ] Unit Test 3: Validasi pencegahan nilai minus / baris item kosong.
- [ ] Seluruh unit test lulus 100% (*all green*).

---

## FASE 7 — Dokumentasi & Panduan Replikasi

**Status**: 🔴 Belum  
**Target Selesai**: [YYYY-MM-DD]

- [ ] `README.md` ditulis lengkap dan terstruktur:
  - [ ] Kebutuhan sistem & prasyarat environment.
  - [ ] Panduan inisialisasi basis data.
  - [ ] Perintah menjalankan masing-masing service dan frontend (termasuk port).
  - [ ] URL akses lokal dan panduan pengujian endpoint aman.
- [ ] `CATATAN-DESAIN.md`: Ringkasan keputusan arsitektur, trade-offs, dan kendala terselesaikan.

---

## FASE 8 — Finalisasi & Penyerahan (Submission)

**Status**: 🔴 Belum  
**Target Selesai**: [YYYY-MM-DD]

### Checklist Verifikasi Akhir
- [ ] Seluruh endpoint API teruji lulus melalui API Client.
- [ ] Antarmuka web terhubung mulus tanpa error CORS atau koneksi jaringan.
- [ ] Skrip `/Database/schema.sql` sukses dijalankan pada mesin/lingkungan bersih.
- [ ] Tidak ada password, secret key, atau connection string yang di-hardcode.
- [ ] Tidak ada business logic nominal yang dihitung pada JavaScript browser.
- [ ] Repositori di-push ke remote Git dan dapat diakses publik.

---

## 📝 Log Aktivitas & Harian

<!-- 
AI Agent / Developer mencatat kronologis pencapaian di sini secara berkala 
-->
### [YYYY-MM-DD]
- [Jam:Menit] Analisis spesifikasi kebutuhan sistem selesai dilakukan.
- [Jam:Menit] Pembentukan template dokumentasi dan repositori awal.
- [Jam:Menit] Eksekusi inisialisasi skema basis data berhasil.

---

## 🚧 Kendala & Blocker

| Tanggal | Komponen / Modul | Kendala / Masalah yang Dihadapi | Tindakan Resolusi | Status |
|---------|------------------|---------------------------------|-------------------|--------|
| YYYY-MM-DD | [Nama Komponen] | <!-- Contoh: Error CORS saat frontend memanggil Service A --> [Deskripsi masalah] | <!-- Contoh: Tambahkan konfigurasi WithOrigins pada Program.cs --> [Solusi yang diterapkan] | Teratasi / Pending |

---

## 💡 Keputusan Teknis yang Diambil Saat Implementasi

| Tanggal | Keputusan Teknis | Alasan & Rasionalisasi | Dampak terhadap Sistem |
|---------|------------------|------------------------|------------------------|
| YYYY-MM-DD | [Contoh: Menggunakan Dapper alih-alih EF Core] | Membutuhkan performa cepat dan kontrol SQL langsung untuk Stored Procedure | Query ditulis manual, footprint memori lebih kecil |
