# Panduan Integrasi AI Agent: Paket Dokumentasi Software Engineering (PRD, Architecture, AGENTS, PROGRESS)

Dokumen ini adalah panduan operasional (System Prompt, User Prompt Templates, dan Workflows) yang dirancang agar **AI Coding Agents** (seperti Antigravity, Claude 3.7 / 3.8, ChatGPT-4o, GitHub Copilot Workspace, Roo Code, dll.) dapat:
1. **Mengaudit & Menilai (Assess/Audit)** kualitas dan kesiapan implementasi proyek dari dokumen yang ada.
2. **Menghasilkan (Generate)** dokumen lengkap dari ide/kebutuhan kasar.
3. **Mengeksekusi Proyek Secara Mandiri (Autonomous Execution)** dengan kepatuhan ketat terhadap aturan arsitektur (`AGENTS.md`) dan pelacakan progres berkala (`PROGRESS.md`).

---

## 🗺️ Ekosistem 4 Pilar Dokumentasi

```
┌────────────────────────────────────────────────────────┐
│                   1. PRD_TEMPLATE.md                   │
│         (Kebutuhan Bisnis, Fitur, & Business Rules)    │
└───────────────────────────┬────────────────────────────┘
                            │ mendasari
                            ▼
┌────────────────────────────────────────────────────────┐
│               2. ARCHITECTURE_TEMPLATE.md              │
│       (Desain Sistem, ERD, Sequence Flows, & ADR)      │
└───────────────────────────┬────────────────────────────┘
                            │ diturunkan menjadi
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     3. AGENTS_TEMPLATE.md │ │   4. PROGRESS_TEMPLATE.md │
│   (Aturan Main, Batasan   │ │   (Tracking Real-Time,    │
│    Arsitektur, & Kontrak) │ │    Checklist, & Blocker)  │
└───────────────────────────┘ └───────────────────────────┘
```

---

## 🤖 1. Prompts untuk Mode Asesmen (Assessment & Audit Mode)

### A. Asesmen Dokumen PRD
```markdown
Anda bertindak sebagai Lead Product Manager & Quality Assurance Architect.
Tugas Anda adalah melakukan audit mendalam terhadap dokumen PRD berikut menggunakan standar PRD_TEMPLATE.md:

[TEMPELKAN DOKUMEN PRD YANG INGIN DI-AUDIT DI SINI]

Evaluasi dokumen tersebut berdasarkan kriteria:
1. Kejelasan Ruang Lingkup: Apakah batasan In-Scope vs Out-of-Scope tegas dan tidak memicu scope creep?
2. Detail Spesifikasi Fungsional: Apakah spesifikasi form, komponen UI, dan kolom data memiliki tipe dan validasi yang jelas?
3. Aturan Bisnis (Business Rules): Apakah setiap aturan memiliki kode unik (BR-XX), aturan yang tidak ambigu, serta lokasi validasi (Client vs Server vs Database)?
4. Aturan Pencegahan Manipulasi Client: Apakah kalkulasi penting (total, diskon, balance) diwajibkan di sisi server?
5. Kesiapan Testing: Apakah Acceptance Criteria dapat diverifikasi secara biner (Lulus/Gagal)?

Keluarkan laporan penilaian dengan format:
- Skor Kelengkapan (0 - 100)
- Temuan Kritis (Celah spesifikasi atau ambiguitas)
- Rekomendasi Revisi Spesifik (Actionable items)
```

### B. Asesmen Dokumen Arsitektur
```markdown
Anda bertindak sebagai Principal Software Architect.
Tugas Anda adalah mengaudit dokumen arsitektur berikut menggunakan standar ARCHITECTURE_TEMPLATE.md:

[TEMPELKAN DOKUMEN ARCHITECTURE.MD DI SINI]

Evaluasi dokumen tersebut terhadap prinsip:
1. Separation of Concerns & Boundary: Apakah lapisan tampilan (FrontEnd) benar-benar terisolasi dari akses langsung ke Database?
2. Integritas Transaksional: Apakah alur Create/Delete yang melibatkan data bertingkat (Header + Line Items) secara eksplisit menggunakan Database Transaction atomik?
3. Architecture Decision Records (ADR): Apakah keputusan teknis (database, ORM, framework) memiliki alasan dan pertimbangan trade-off yang matang?
4. Kelengkapan Kontrak Service: Apakah port, path endpoint, dan skema data per service terdokumentasi lengkap?
5. Skalabilitas & Single Point of Failure (SPOF): Identifikasi potensi bottleneck.

Keluarkan laporan penilaian:
- Skor Kelaikan Arsitektur (0 - 100)
- Daftar Risiko Arsitektural & Pelanggaran Pola
- Rekomendasi Solusi & Diagram Perbaikan
```

### C. Asesmen Aturan Agent (`AGENTS.md`)
```markdown
Anda bertindak sebagai AI Safety & Developer Experience Architect.
Tinjau file AGENTS.md terlampir untuk memastikan:
1. Apakah boundary aturan arsitektur (❌ LARANGAN) didefinisikan dengan tegas dan tidak dapat disalahartikan oleh AI?
2. Apakah kontrak API dan skema database sudah cukup detail sehingga AI tidak perlu berasumsi atau mengarang kolom/endpoint?
3. Apakah urutan pengerjaan bertahap (Phased Rollout) logis dan bebas dari circular dependency?
```

---

## 🛠️ 2. Prompts untuk Mode Pembuatan Dokumen Baru (Generation Mode)

### A. Membuat PRD & Architecture Sekaligus
```markdown
Anda bertindak sebagai Technical Lead & Product Architect.
Berdasarkan deskripsi proyek berikut:
"[DESKRIPSI PROYEK ATAU KEBUTUHAN ANDA]"

Buatkan 2 dokumen yang saling terhubung:
1. PRD.md — mengikuti struktur dari PRD_TEMPLATE.md (Bab 1 s/d 8 lengkap dengan aturan bisnis BR-XX).
2. ARCHITECTURE.md — mengikuti ARCHITECTURE_TEMPLATE.md lengkap dengan diagram Mermaid (C4 container, ERD, dan sequence flows) serta minimal 3 ADR.
```

### B. Menghasilkan File `AGENTS.md` & `PROGRESS.md`
```markdown
Berdasarkan file PRD.md dan ARCHITECTURE.md yang telah disetujui:
1. Buatkan file AGENTS.md menggunakan AGENTS_TEMPLATE.md sebagai panduan operasional AI Coding Agent (berisi larangan tegas, kontrak API, referensi skema, dan urutan pengerjaan).
2. Buatkan file PROGRESS.md menggunakan PROGRESS_TEMPLATE.md yang memecah seluruh pekerjaan menjadi fase-fase realistis dengan checklist siap centang (- [ ]) dan estimasi waktu per fase.
```

---

## ⚡ 3. Prompt untuk Menginstruksikan AI Agent Memulai Koding (Execution Mode)

Gunakan prompt ini ketika Anda siap memulai proses koding bersama AI Agent:

```markdown
Halo Agent, kita akan mengerjakan proyek ini.
Sebelum Anda menulis atau memodifikasi file kode apapun:
1. Baca dan pahami seluruh batasan pada AGENTS.md (khususnya Bab 3 mengenai aturan yang TIDAK BOLEH dilanggar).
2. Buka PROGRESS.md untuk melihat fase yang sedang aktif.
3. Kerjakan fase yang belum selesai secara berurutan.
4. Setiap kali Anda menyelesaikan sebuah task atau fase:
   - Centang checkbox terkait (- [x]) pada PROGRESS.md.
   - Perbarui status dan waktu aktual di tabel Ringkasan Progress.
   - Tambahkan entri ringkas pada Log Aktivitas dan tabel Keputusan Teknis/Blocker jika ada.
5. Uji coba kode Anda secara mandiri sebelum menyatakan fase selesai.

Mulai sekarang dengan Fase [NOMOR FASE, misal: Fase 0 dan Fase 1].
```

---

## 🔗 4. Matriks Keselarasan Antar Keempat Dokumen

| Aspek Proyek | PRD.md | ARCHITECTURE.md | AGENTS.md | PROGRESS.md |
|---|---|---|---|---|
| **Kebutuhan & Fitur** | Bab 4 & 5 (Scope & Func Spec) | Bab 2 (Service Catalog) | Bab 1 & 5 (Konteks & API) | Sub-tasks di tiap Fase |
| **Model Data & Kolom** | Bab 5 (Grid & Form Spec) | Bab 3 (ERD & Table Spec) | Bab 4 (Reference DDL SQL) | Fase 1 (Database) |
| **Aturan Bisnis (BR)** | Bab 5.3 (Tabel BR-01..BR-XX) | Bab 4 & 5 (Sequence Flow) | Bab 6 (Validation Rules) | Fase 3 (Service Layer) |
| **Larangan Arsitektur** | Bab 5.3 & 6 (Enforcement) | Bab 2.3 & 6 (ADR Boundary) | Bab 3 (Hard Boundaries ❌) | Final Checklist (Fase 8) |
| **Testing & Deliverable** | Bab 7 & 8 (Acceptance Criteria)| Bab 4.2 (Folder Tests) | Bab 9 (Deliverables List) | Fase 6 & 8 (QA & Submit) |
