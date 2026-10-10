# TEMPLATE: AI AGENT SYSTEM RULES & PROJECT CONTEXT (AGENTS.md)
<!-- 
================================================================================
🤖 INSTRUKSI UNTUK AI CODING AGENT (PANDUAN OPERASIONAL & PERATURAN SISTEM):
1. FILE INI ADALAH ATURAN UTAMA (RULES OF ENGAGEMENT) UNTUK ANDA SEBAGAI AGENT:
   - Sebelum menulis atau memodifikasi kode apapun, BACA seluruh aturan di dokumen ini.
   - Jangan pernah melanggar aturan arsitektur bertanda ❌ di Bab 3.
   - Patuhi konvensi penamaan di Bab 9 dan urutan pengerjaan di Bab 10.
   - Setiap fitur yang selesai WAJIB diuji secara mandiri sebelum lanjut ke tahap berikutnya.

2. MODE ASESMEN AGENT (SELF-AUDIT SEBELUM MENYELESAIKAN TUGAS):
   - Gunakan Checklist di Bab 8 untuk memverifikasi apakah semua kriteria wajib telah terpenuhi.
   - Pastikan tidak ada secrets, connection string, atau URL yang di-hardcode di kode program.
================================================================================
-->

# AGENTS.md — [NAMA PROYEK / SISTEM]
### Panduan Arsitektur, Kontrak Teknis, dan Batasan Sistem untuk AI Agent

---

## 🎯 1. Konteks Proyek & Ringkasan Teknis

**[Nama Sistem / Proyek]** adalah sistem yang dibangun dengan spesifikasi teknis berikut:
- **Tujuan Sistem**: [Jelaskan ringkasan fungsi sistem, misal: Mengelola transaksi penjualan dan data master pelanggan secara terisolasi]
- **Arsitektur Utama**: [Microservices / Clean Architecture / Modular Monolith]
- **Backend Stack**: [Bahasa & Framework, misal: C# .NET Core 8+ / TypeScript Node.js / Go 1.22]
- **Database Engine**: [Engine DB, misal: SQL Server 2022 / PostgreSQL 16] (Konfigurasi: [Shared Instance / Separate DB per Service])
- **Frontend Presentation**: [Framework UI, misal: ASP.NET MVC / Razor Pages / React / Vue]
- **Protokol Komunikasi**: HTTP REST API (JSON payload)
- **Target Deadline / Batasan Waktu**: [Target Waktu, misal: 1 hari kerja]

> ⚠️ **Prioritas Eksekusi**: Selesaikan seluruh fitur **WAJIB (Must-Have)** terlebih dahulu sebelum mengerjakan fitur nilai plus / opsional.

---

## 📁 2. Struktur Direktori Repositori (Monorepo)

```
[NamaProyek]/
├── [Service_A_Master]/               ← Backend Service 1 (Port: [PORT_1])
├── [Service_B_Transaction]/          ← Backend Service 2 (Port: [PORT_2])
├── [FrontEnd_App]/                   ← Presentation UI (Port: [PORT_UI])
├── Database/                         ← Database Setup Scripts
│   ├── schema.sql                    ← WAJIB: DDL tabel, constraints & seed data awal
│   └── *.sql                         ← File skrip SQL per Stored Procedure / View
├── docs/                             ← Dokumentasi Lengkap
│   ├── PRD.md                        ← Product Requirements Document
│   ├── ARCHITECTURE.md               ← Desain Arsitektur & Sequence Flows
│   └── PROGRESS.md                   ← Pelacak Progres Pelaksanaan
├── tests/                            ← Unit & Integration Tests
│   └── [Service_B].Tests/            ← Proyek uji logika bisnis
├── AGENTS.md                         ← File panduan ini
├── README.md                         ← Panduan setup dan run untuk pihak ketiga
└── CATATAN-DESAIN.md                 ← Rationale keputusan desain arsitektur
```

---

## 📐 3. Aturan Arsitektur yang TIDAK BOLEH Dilanggar (Hard Boundaries)

### A. Aturan Basis Data (Database Boundaries)
- ❌ **Dilarang** mengubah, menghapus, atau mengganti nama kolom/tabel yang telah ditentukan dalam spesifikasi awal.
- ❌ **Dilarang** melakukan query lintas database secara langsung dari service yang bukan domain pemiliknya tanpa izin arsitektur.
- ✅ Boleh menambahkan Stored Procedure, View, Index, atau Function untuk optimasi performa.
- ✅ Setiap Stored Procedure / View baru **WAJIB** disimpan sebagai file `.sql` terpisah di folder `/Database/`.
- ✅ Operasi penghapusan data induk yang memiliki data anak **WAJIB** menggunakan Database Transaction atomik (`BEGIN TRANSACTION ... COMMIT`).

### B. Batasan Lapisan Frontend & Service (Presentation Boundary)
- ❌ **Dilarang keras** menghitung nominal transaksi (Subtotal, Diskon, Grand Total) di JavaScript/Frontend client!
- ❌ **Dilarang keras** mengakses koneksi basis data langsung dari layer antarmuka (Frontend).
- ✅ Seluruh perhitungan angka transaksi dan validasi integritas data **WAJIB** dilakukan di sisi Backend Service layer.
- ✅ Frontend murni berfungsi sebagai cangkang tampilan (Presentation Shell) dan penerus data via HTTP REST Client.

### C. Manajemen Konfigurasi & Kredensial (Configuration Security)
- ❌ **Dilarang keras** menulis hardcoded connection string, API key, JWT secret, atau port URL di kode program!
- ✅ Seluruh konfigurasi sensitif **WAJIB** ditempatkan di `appsettings.json`, `.env`, atau environment variables.

---

## 🗄️ 4. Skema Database Referensi

```sql
-- 1. TABEL MASTER / REFERENSI
CREATE TABLE [TABLE_MASTER] (
    [MASTER_ID]    INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [MASTER_NAME]  VARCHAR(100) NOT NULL
);

-- 2. TABEL TRANSAKSI INDUK (HEADER)
CREATE TABLE [TABLE_HEADER] (
    [HEADER_ID]    INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [TRANS_NO]     VARCHAR(20) NOT NULL,
    [TRANS_DATE]   DATETIME NOT NULL,
    [MASTER_ID]    INT NOT NULL,
    [REMARKS]      VARCHAR(500) NULL,
    CONSTRAINT FK_[HEADER]_[MASTER] FOREIGN KEY ([MASTER_ID])
        REFERENCES [TABLE_MASTER]([MASTER_ID])
);

-- 3. TABEL DETAIL TRANSAKSI (LINE ITEMS)
CREATE TABLE [TABLE_DETAIL] (
    [DETAIL_ID]    INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [HEADER_ID]    INT NOT NULL,
    [ITEM_NAME]    VARCHAR(100) NOT NULL,
    [QUANTITY]     INT NOT NULL,
    [PRICE]        DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_[DETAIL]_[HEADER] FOREIGN KEY ([HEADER_ID])
        REFERENCES [TABLE_HEADER]([HEADER_ID])
);
```

> **Aturan Komputasi Nilai**:
> `Subtotal = QUANTITY * PRICE` | `Grand Total = SUM(Subtotal seluruh line items)`
> Nilai di atas dihitung secara dinamis saat runtime, tidak disimpan sebagai kolom redundan.

---

## 🔌 5. Kontrak API Minimum (API Contracts)

### A. [Service 1 / Master Data] — `http://localhost:[PORT_1]`
| HTTP Method | Endpoint | Deskripsi Fungsi | Payload / Query | Response Code & Output |
|-------------|----------|------------------|-----------------|------------------------|
| `GET` | `/api/[entities]` | Ambil semua data master | - | `200 OK`: `[{ "id": 1, "name": "..." }]` |
| `GET` | `/api/[entities]/{id}` | Ambil data master by ID | Path `id` | `200 OK` / `404 Not Found` |

### B. [Service 2 / Transaction] — `http://localhost:[PORT_2]`
| HTTP Method | Endpoint | Deskripsi Fungsi | Payload / Query | Response Code & Output |
|-------------|----------|------------------|-----------------|------------------------|
| `GET` | `/api/[transactions]` | List transaksi + filter | `?keyword=&date=` | `200 OK`: List transaksi + Grand Total |
| `GET` | `/api/[transactions]/{id}`| Detail lengkap + line items | Path `id` | `200 OK`: Header + Items array |
| `POST` | `/api/[transactions]` | Buat transaksi baru | JSON Body | `201 Created`: `{ "success": true, "id": 101 }` |
| `PUT` | `/api/[transactions]/{id}` | Update transaksi | JSON Body | `200 OK`: `{ "success": true }` |
| `DELETE` | `/api/[transactions]/{id}` | Hapus transaksi (atomik) | Path `id` | `200 OK`: `{ "success": true }` |
| `GET` | `/api/[transactions]/export` | Ekspor ke file spreadsheet | `?keyword=&date=` | `200 OK`: Binary Stream (`.xlsx`/`.csv`) |

#### Format Standard Error Response (Wajib Konsisten)
```json
{
  "success": false,
  "message": "Pesan ringkas kegagalan validasi",
  "errors": [
    "Detail error spesifik 1",
    "Detail error spesifik 2"
  ]
}
```

---

## ✅ 6. Aturan Bisnis Inti (Business Rules)

AI Agent **WAJIB** menerapkan validasi aturan bisnis berikut pada Service Layer:

| Kode Rule | Pernyataan Aturan | Perilaku Jika Dilanggar |
|-----------|-------------------|-------------------------|
| **BR-01** | Identifier unik transaksi (Nomor Dokumen) tidak boleh duplikat di DB | Return HTTP `400 Bad Request` / `409 Conflict` |
| **BR-02** | Tanggal transaksi tidak boleh lebih besar dari hari ini (`<= TODAY`) | Return HTTP `400 Bad Request` |
| **BR-03** | Transaksi wajib memiliki minimal 1 (satu) line item | Return HTTP `400 Bad Request` |
| **BR-04** | Nilai Kuantitas (`Quantity`) wajib bilangan bulat > 0 | Return HTTP `400 Bad Request` |
| **BR-05** | Nilai Harga (`Price`) wajib angka nominal > 0 | Return HTTP `400 Bad Request` |
| **BR-06** | ID Relasi master wajib valid dan ada di tabel referensi | Return HTTP `400 Bad Request` |
| **BR-07** | Subtotal tiap baris item dihitung di server (`Qty * Price`) | Nilai dihitung runtime |
| **BR-08** | Grand Total dihitung di server (`SUM(Subtotal)`) | Nilai dihitung runtime |
| **BR-09** | Hapus transaksi: Hapus tabel Detail terlebih dahulu, lalu Header dalam 1 transaksi DB | Rollback jika ada langkah gagal |
| **BR-10** | Ekspor file hanya memproses data yang sesuai dengan filter pencarian aktif | Query ekspor memakai kriteria filter yang sama |
| **BR-11** | Dialog konfirmasi hapus pada UI wajib memuat nomor dokumen secara dinamis | Render ID spesifik di modal pop-up |

---

## 🏗️ 7. Pola Desain Internal Layanan (Layered Pattern)

Setiap backend service **WAJIB** mengikuti arsitektur berlapis:

```
[HTTP Request] 
      │
      ▼
Controller Layer   ──► Validasi DTO / ModelState, panggil Service, return HTTP ActionResult
      │
      ▼
Service Layer      ──► Implementasi interface I[Name]Service, validasi BR-XX, kalkulasi, transaksi
      │
      ▼
Repository Layer   ──► Implementasi interface I[Name]Repository, query database (Dapper/ORM/SP)
      │
      ▼
Database Storage   ──► SQL Server / PostgreSQL
```

- **Pemisahan Objek Data**: Pisahkan dengan jelas antara `Entity` (model basis data), `RequestDTO` (payload input), dan `ResponseDTO` (payload keluaran).

---

## 📦 8. Dependensi & Paket Library yang Diizinkan

### Backend Services
| Kategori | Nama Paket / Library yang Direkomendasikan | Kegunaan |
|----------|-------------------------------------------|----------|
| Database Driver | `Microsoft.Data.SqlClient` / `Npgsql` | Konektivitas database |
| Data Access | `Dapper` / `EF Core` | Query execution & mapping objek |
| Document Export | `ClosedXML` / `CsvHelper` | Pembuatan file Excel / CSV |
| Security (Auth) | `Microsoft.AspNetCore.Authentication.JwtBearer` | Otentikasi JWT Bearer token |

---

## 📋 9. Checklist Deliverables & Kriteria Penyerahan

### Deliverables Wajib
- [ ] Backend Service 1 berfungsi penuh pada port yang ditentukan.
- [ ] Backend Service 2 berfungsi penuh dengan seluruh endpoint CRUD dan Export.
- [ ] Antarmuka web terhubung ke kedua service dan menampilkan data secara akurat.
- [ ] File `/Database/schema.sql` siap dieksekusi clean dari nol (sudah mencakup seed data).
- [ ] Berkas `README.md` memuat panduan instalasi, konfigurasi, dan cara menjalankan sistem.
- [ ] Berkas `CATATAN-DESAIN.md` menjelaskan keputusan arsitektur secara lugas.

### Deliverables Nilai Plus (Advanced)
- [ ] Minimal 1 endpoint diproteksi otentikasi (API Key / JWT Bearer).
- [ ] Unit test mencakup logika kalkulasi dan validasi input.
- [ ] Stored Procedure digunakan untuk operasi query atau manipulasi utama.

---

## 🔑 10. Konvensi Penamaan & Standar Kode

| Elemen Pemrograman | Konvensi Standar | Contoh Penggunaan |
|--------------------|------------------|-------------------|
| Class / Struct | PascalCase | `SalesOrderService`, `CustomerRepository` |
| Method / Fungsi | PascalCase | `GetOrderById`, `CalculateGrandTotal` |
| Variabel Lokal & Parameter | camelCase | `salesSoId`, `grandTotal` |
| Interface | Awalan `I` + PascalCase | `IOrderService`, `ICustomerRepository` |
| Request DTO | Suffix `Request` | `CreateOrderRequest`, `UpdateOrderRequest` |
| Response DTO | Suffix `Response` / Model | `OrderListResponse`, `ApiResponse` |
| Skrip Database SQL | snake_case | `schema.sql`, `sp_get_orders.sql` |
| Route Endpoint REST | lowercase kebab-case / plural | `/api/orders`, `/api/orders/export` |

---

## 🚦 11. Urutan Implementasi yang Direkomendasikan (Step-by-Step)

```
Langkah 1: Setup Database & schema.sql           (Fondasi seluruh data)
Langkah 2: Service Master (Customer/Product)     (Endpoint sederhana untuk dropdown)
Langkah 3: Service Transaksi - Data Access Layer (Repository & Models)
Langkah 4: Service Transaksi - Business Logic    (Validasi BR-01 s/d BR-08)
Langkah 5: Service Transaksi - Controller & Test (Uji POST, GET, PUT, DELETE)
Langkah 6: Service Transaksi - Fitur Export      (ClosedXML workbook download)
Langkah 7: FrontEnd - Halaman Daftar Transaksi   (Grid & Filter pencarian)
Langkah 8: FrontEnd - Form Tambah & Edit         (Dropdown & dynamic items)
Langkah 9: Security Middleware (Nilai Plus)      (JWT / API Key)
Langkah 10: Unit Testing (Nilai Plus)            (Test runner & verifikasi green)
Langkah 11: Finalisasi Dokumentasi               (README.md & CATATAN-DESAIN.md)
```

---

## 📚 12. Tautan Dokumen Referensi Proyek

- [`docs/PRD.md`](docs/PRD.md) — Dokumen Kebutuhan Produk & Aturan Fungsional Lengkap
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Diagram Arsitektur, ERD, dan Sequence Flows
- [`docs/PROGRESS.md`](docs/PROGRESS.md) — Lembar Tracking Progres & Checklist Fase
- [`README.md`](README.md) — Panduan Operasional & Setup Lingkungan Proyek
