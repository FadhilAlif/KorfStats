# TEMPLATE: PRODUCT REQUIREMENTS DOCUMENT (PRD)
<!-- 
================================================================================
🤖 INSTRUKSI UNTUK AI AGENT (PANDUAN OPERASIONAL):
1. MODE PEMBUATAN DOKUMEN (GENERATION):
   - Ganti semua token di dalam kurung siku `[ ... ]` dengan data proyek aktual.
   - Hapus atau pertahankan komentar `<!-- Petunjuk & Contoh -->` sesuai kebutuhan user.
   - Pastikan aturan bisnis (BR-XX) bernomor urut konsisten dan dapat diverifikasi (testable).
   - Setiap tabel harus diisi spesifik, hindari frasa ambigu seperti "dsb.", "sesuai kebutuhan".

2. MODE PENILAIAN / ASESMEN (ASSESSMENT):
   - Gunakan Bagian 9 (Rubrik Asesmen AI) di bagian bawah dokumen untuk mengevaluasi kelengkapan PRD.
   - Verifikasi apakah setiap fitur fungsional memiliki: Form/UI spec, Data source, Validasi, dan Business Rules yang jelas.
================================================================================
-->

## [NAMA SISTEM / PRODUK]
### [Sub-judul / Deskripsi Singkat Sistem]

| Metadata Dokumen | Nilai |
|------------------|-------|
| **Versi** | 1.0 <!-- Contoh: 1.0, 1.1-draft --> |
| **Tanggal Terbit** | YYYY-MM-DD <!-- Contoh: 2026-10-02 --> |
| **Status** | Draft / In Review / Approved / Active <!-- Pilih salah satu --> |
| **Penulis / Pemilik** | [Nama / Tim Pembuat Dokumen] |
| **Target Release / Deadline** | [Target Tanggal atau Durasi Pengerjaan] |

---

## 1. Latar Belakang & Masalah Bisnis

### 1.1 Latar Belakang
<!-- 
[PETUNJUK & CONTOH]:
Jelaskan konteks munculnya kebutuhan sistem ini. Mengapa sistem ini dibangun? Masalah apa yang sedang dihadapi user atau organisasi?
Contoh:
"Sales Order Management System (SOMS) dibangun sebagai bagian dari modernisasi operasional penjualan. 
Saat ini proses pencatatan pesanan masih menggunakan spreadsheet manual yang rentan terhadap inkonsistensi nomor pesanan, 
keterlambatan rekapitulasi penjualan, dan kesulitan pelacakan status order secara real-time."
-->
[Tuliskan latar belakang masalah, urgensi, dan konteks mengapa sistem ini dibuat di sini]

### 1.2 Pendekatan Solusi
<!-- 
Contoh:
"Sistem dirancang berbasis web modular dengan pendekatan microservices untuk memisahkan domain data master pelanggan 
dan transaksi sales order, memastikan skalabilitas dan isolasi kegagalan sistem."
-->
[Jelaskan pendekatan umum solusi teknis/bisnis yang diajukan]

---

## 2. Tujuan Produk & Indikator Keberhasilan

| Kode | Tujuan Produk (Goal) | Deskripsi | Indikator Keberhasilan (Success Metric / KPI) |
|------|----------------------|-----------|------------------------------------------------|
| G-01 | [Nama Tujuan 1] | <!-- Contoh: Memungkinkan staf mengelola pesanan penjualan secara end-to-end --> [Deskripsi tujuan] | <!-- Contoh: Order dapat dibuat < 1 menit, 0 duplicate order ID --> [Metrik terukur] |
| G-02 | [Nama Tujuan 2] | [Deskripsi tujuan] | [Metrik terukur] |
| G-03 | [Nama Tujuan 3] | [Deskripsi tujuan] | [Metrik terukur] |

---

## 3. Pengguna Target & Persona

| Role Pengguna | Deskripsi Tanggung Jawab | Kebutuhan Utama pada Sistem | Hak Akses |
|---------------|--------------------------|-----------------------------|-----------|
| **[Nama Role 1, misal: Staf Admin / Sales]** | <!-- Contoh: Menginput transaksi harian pelanggan --> [Tugas utama] | <!-- Contoh: Input cepat, validasi real-time, pencarian instan --> [Kebutuhan] | Read, Create, Update, Delete |
| **[Nama Role 2, misal: Supervisor / Manager]** | <!-- Contoh: Meninjau laporan dan approval order --> [Tugas utama] | <!-- Contoh: Filter tanggal, ekspor file Excel, audit log --> [Kebutuhan] | Read, Export, Approve |

---

## 4. Ruang Lingkup Proyek (Scope)

### 4.1 Dalam Ruang Lingkup (In-Scope)
<!-- Daftar fitur dan kapabilitas yang WAJIB ada pada versi/fase ini -->
- [ ] [Fitur 1 - Contoh: Manajemen data master pelanggan (CRUD / Read-only)]
- [ ] [Fitur 2 - Contoh: Pembuatan transaksi dengan multi line items dinamis]
- [ ] [Fitur 3 - Contoh: Filter dan pencarian data multi-kriteria]
- [ ] [Fitur 4 - Contoh: Ekspor data hasil filter ke format file (.xlsx / .pdf)]
- [ ] [Fitur 5 - Contoh: Validasi integritas transaksi secara atomik (database transaction)]

### 4.2 Di Luar Ruang Lingkup (Out-of-Scope)
<!-- Batasan tegas fitur yang TIDAK dikerjakan pada rilis ini untuk mencegah scope-creep -->
- ⛔ [Fitur yang tidak dikerjakan - Contoh: Sistem pembayaran payment gateway otomatis]
- ⛔ [Fitur yang tidak dikerjakan - Contoh: Modul manajemen inventori dan stok gudang otomatis]
- ⛔ [Fitur yang tidak dikerjakan - Contoh: Otentikasi multi-tenant / Single Sign-On kompleks]
- ⛔ [Fitur yang tidak dikerjakan - Contoh: Aplikasi mobile native (iOS / Android)]

---

## 5. Spesifikasi Fungsional

<!-- Ulangi sub-bab 5.x untuk setiap halaman, modul, atau fungsionalitas utama -->

### 5.1 [Nama Modul / Halaman 1, misal: Halaman Daftar Transaksi / List View]

**Tujuan**: [Jelaskan tujuan utama layar/fitur ini, misal: Menampilkan ringkasan data transaksi, pencarian, dan opsi tindakan CRUD].

#### A. Komponen Antarmuka (UI Components)
| Komponen UI | Tipe Elemen | Fungsi & Perilaku (Behavior) |
|-------------|-------------|------------------------------|
| [Tabel Data / Grid] | Data Table | Menampilkan daftar record dengan paginasi / sorting |
| [Field Cari Keyword] | Text Input | Filter berdasarkan [Nama Kolom 1] ATAU [Nama Kolom 2] (case-insensitive) |
| [Filter Periode] | Date Picker / Range | Filter data berdasarkan tanggal awal dan tanggal akhir |
| [Tombol Tambah] | Primary Button | Navigasi ke form pembuatan data baru |
| [Tombol Export] | Secondary Button | Unduh data yang sedang aktif difilter ke file Excel/CSV |
| [Aksi Edit Baris] | Action Button | Buka data terpilih pada form pengeditan |
| [Aksi Hapus Baris] | Danger Button | Munculkan dialog konfirmasi hapus berisi identifier spesifik |

#### B. Struktur Kolom Grid / Tampilan Data
| Nama Kolom UI | Sumber Data (Field/DB) | Tipe Data | Format / Rumus Tampilan |
|---------------|------------------------|-----------|-------------------------|
| [Label Kolom 1] | `[TABLE.COLUMN_1]` | String | Teks biasa |
| [Label Kolom 2] | `[TABLE.COLUMN_2]` | DateTime | `YYYY-MM-DD HH:mm` |
| [Label Kolom 3] | `[TABLE.COLUMN_3]` | Decimal / Currency | Format mata uang (contoh: `Rp #,##0`) |
| [Grand Total] | `SUM(QTY * PRICE)` | Decimal | Dihitung di server |

---

### 5.2 [Nama Modul / Halaman 2, misal: Form Input Transaksi — Mode Create & Edit]

**Tujuan**: [Jelaskan tujuan form, misal: Menginput pesanan baru atau memperbarui data pesanan yang ada].

#### A. Field Header Form
| Nama Field | Tipe Input | Wajib (Mandatory) | Aturan Validasi | Nilai Default / Sumber Opsi |
|------------|------------|-------------------|-----------------|-----------------------------|
| [Kode Transaksi] | Text Input | Ya | Unik, alphanumeric, maks 20 karakter | Auto-generated atau manual unik |
| [Tanggal] | Date Picker | Ya | Tidak boleh tanggal di masa depan | Tanggal hari ini (`TODAY`) |
| [Entitas Relasi] | Dropdown / Select | Ya | ID harus valid dan aktif di DB | Diambil dari Service/Tabel referensi |
| [Catatan / Alamat] | Textarea | Tidak | Maks 500 karakter | Kosong |

#### B. Tabel Detail / Line Items Dinamis
| Nama Kolom Item | Tipe Input | Wajib | Validasi & Batasan | Catatan Logika |
|-----------------|------------|-------|--------------------|----------------|
| [Nama Barang] | Text Input / Autocomplete | Ya | Min 3 karakter | Harus dipilih dari katalog jika ada |
| [Jumlah / Qty] | Number Input | Ya | Integer, > 0 | Tidak boleh nilai 0 atau minus |
| [Harga Satuan] | Number Input | Ya | Decimal, > 0 | Format angka positif |
| [Subtotal] | Readonly Display | - | Auto-calculate | **Dihitung di backend**: `Qty * Harga` |

#### C. Kontrol & Aksi Form
- **Tambah Baris**: Menambahkan item baru (minimal 1 baris item harus ada saat simpan).
- **Hapus Baris**: Menghapus item tertentu (validasi sisa baris >= 1).
- **Kalkulasi Total**: Ringkasan Subtotal, Pajak, dan Grand Total ditampilkan secara read-only berdasarkan kalkulasi backend.
- **Tombol Simpan**: Mengirim payload ke backend (`POST` untuk Create / `PUT` untuk Edit).
- **Tombol Batal**: Konfirmasi pembatalan jika ada perubahan yang belum disimpan, lalu kembali ke halaman list.

---

### 5.3 Aturan Bisnis Utama (Business Rules)

<!-- 
Tuliskan aturan bisnis dengan kode unik BR-XX agar mudah dilacak pada Unit Test dan Implementation Layer 
-->
| Kode Rule | Pernyataan Aturan Bisnis (Rule Statement) | Lapisan Penegakan (Enforcement Layer) | Penanganan Jika Melanggar (Error Response) |
|-----------|------------------------------------------|---------------------------------------|--------------------------------------------|
| **BR-01** | Identifier transaksi (misal: Nomor SO) tidak boleh duplikat di sistem | Backend Service + DB Unique Index | HTTP 400/409: "Nomor transaksi sudah digunakan." |
| **BR-02** | Tanggal transaksi tidak boleh lebih besar dari tanggal hari ini (`<= NOW()`) | Backend Validation Service | HTTP 400: "Tanggal tidak boleh di masa depan." |
| **BR-03** | Transaksi wajib memiliki minimal 1 (satu) line item | Backend Service | HTTP 400: "Minimal satu item wajib diisi." |
| **BR-04** | Nilai kuantitas dan harga satuan wajib lebih besar dari 0 | Backend Service | HTTP 400: "Kuantitas dan harga harus lebih besar dari 0." |
| **BR-05** | Seluruh perhitungan nominal (Subtotal, Diskon, Grand Total) dilakukan di server, BUKAN di frontend client | Backend Service Logic | Mencegah manipulasi nominal dari sisi browser |
| **BR-06** | Penghapusan data induk harus menghapus data anak secara atomik (All-or-Nothing) | Database Transaction (`BEGIN ... COMMIT`) | HTTP 500 & Rollback jika salah satu query gagal |
| **BR-07** | Ekspor data hanya memproses record yang sesuai dengan filter aktif saat tombol ditekan | Backend Query Generator | Hasil unduhan sinkron dengan tampilan UI saat itu |

---

## 6. Spesifikasi Non-Fungsional (NFR)

| Dimensi | Parameter | Spesifikasi / Target |
|---------|-----------|----------------------|
| **Teknologi Backend** | Runtime & Framework | [Contoh: .NET 8 / Node.js 20 / Go 1.22] |
| **Teknologi Frontend** | Web Framework | [Contoh: ASP.NET MVC / React 18 / Vue 3] |
| **Penyimpanan Data** | Database Engine | [Contoh: SQL Server 2022 / PostgreSQL 16] |
| **Protokol Komunikasi** | API Format | RESTful JSON API via HTTP/HTTPS |
| **Performa & Response Time** | SLA API | < 500ms untuk query reguler; < 2s untuk ekspor data 1.000 baris |
| **Keamanan (Security)** | Autentikasi / Otorisasi | [Contoh: API Key header `X-Api-Key` atau JWT Bearer token] |
| **Integritas Data** | Konsistensi Transaksi | ACID Compliant, Foreign Key constraints, DB Transactions |
| **Kualitas Kode & Testing** | Unit Testing & Clean Code | Cakupan unit test pada kalkulasi bisnis & validasi inti |

---

## 7. Ketentuan Deliverables & Struktur Penyerahan

| Item Deliverable | Format / Path | Status Wajib |
|------------------|---------------|--------------|
| Source Code Aplikasi | Git Repository (Monorepo / Multirepo) | **Wajib** |
| Database Initialization Script | `/Database/schema.sql` (bisa dieksekusi clean dari nol) | **Wajib** |
| Dokumentasi Setup & Run | `README.md` (Langkah jelas dari klon repo sampai running) | **Wajib** |
| Catatan Desain & Arsitektur | `CATATAN-DESAIN.md` atau `docs/ARCHITECTURE.md` | **Wajib** |
| Stored Procedures / Views (jika ada) | `/Database/*.sql` terpisah per objek | Kondisional |
| Unit Test Suite | Proyek test terpisah (misal: `*.Tests`) | Nilai Plus / Wajib |

---

## 8. Kriteria Penerimaan (Acceptance Criteria & Definition of Done)

### 8.1 Kriteria Minimum (Minimum Viable - Wajib Terpenuhi)
- [ ] Database schema dapat diinisialisasi tanpa error dari script `schema.sql`.
- [ ] Seluruh endpoint CRUD inti berfungsi sesuai spesifikasi kontrak API.
- [ ] Tampilan antarmuka berhasil terhubung dengan backend tanpa error CORS/koneksi.
- [ ] Filter pencarian dan pagination/grid berfungsi akurat.
- [ ] Operasi simpan, ubah, dan hapus data berjalan atomik dan konsisten.
- [ ] File export (.xlsx/.csv) dapat diunduh dan datanya sesuai dengan filter aktif.
- [ ] Dokumentasi `README.md` telah diuji dan dapat direplikasi oleh pihak ketiga.

### 8.2 Kriteria Tingkat Lanjut (Advanced / Nilai Plus)
- [ ] Proteksi keamanan aktif (autentikasi JWT / API Key middleware).
- [ ] Unit test mencakup edge cases: duplikasi ID, angka negatif, transaksi kosong.
- [ ] Error handling menghasilkan format JSON standar yang seragam (`ApiResponse<T>`).
- [ ] UI dilengkapi handling loading state, toast notification, dan modal konfirmasi interaktif.

---

## 9. 🤖 Rubrik Asesmen Kelengkapan PRD oleh AI Agent

Gunakan checklist penilaian ini saat AI Agent mengevaluasi apakah dokumen PRD yang dibuat user sudah lengkap dan siap diimplementasikan:

```markdown
### [AI AGENT PRD AUDIT REPORT]
- [ ] **Konteks & Scope Jelas**: Apakah In-Scope vs Out-of-Scope tegas dan tidak ambigu?
- [ ] **Spesifikasi Data Lengkap**: Apakah tipe data, batas karakter, dan nullability dicantumkan?
- [ ] **Business Rules Unik**: Apakah setiap aturan bisnis memiliki kode (BR-XX) dan enforcement layer?
- [ ] **Pencegahan Kalkulasi Client**: Apakah aturan melarang kalkulasi nominal di sisi frontend dicatat?
- [ ] **Non-Functional Spec Realistis**: Apakah target response time, framework, dan DB engine terdefinisi?
- [ ] **Acceptance Criteria Testable**: Apakah setiap butir checklist dapat diuji secara objektif (bisa lolos/gagal)?

Skor Kelengkapan: [X / 100]
Rekomendasi Perbaikan: [Catatan actionable untuk menyempurnakan PRD jika ada celah spesifikasi]
```
