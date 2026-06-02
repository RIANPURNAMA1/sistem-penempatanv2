# Sistem Penempatan Kandidat Kerja ke Jepang

Aplikasi manajemen penempatan kandidat kerja ke Jepang (Program SSW / Tokutei Gino) berbasis web. Mengelola siklus penuh pendaftaran kandidat mulai dari registrasi, seleksi, interview, pemberkasan, hingga keberangkatan.

---

## Daftar Isi

- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Arsitektur Aplikasi](#arsitektur-aplikasi)
- [Struktur Proyek](#struktur-proyek)
- [Persyaratan Sistem](#persyaratan-sistem)
- [Instalasi Manual](#instalasi-manual)
- [Instalasi Docker](#instalasi-docker)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Database](#database)
- [Akun Default](#akun-default)
- [Sistem Role & Hak Akses](#sistem-role--hak-akses)
- [Pipeline Penempatan](#pipeline-penempatan)
- [Formulir Kandidat (9 Step)](#formulir-kandidat-9-step)
- [API Endpoints](#api-endpoints)
- [Import & Export Kandidat](#import--export-kandidat)
- [AI Assistant (Groq)](#ai-assistant-groq)
- [Notifikasi WhatsApp](#notifikasi-whatsapp)
- [Auto-Screening](#auto-screening)
- [Caching Redis](#caching-redis)
- [Build Production](#build-production)
- [Pengembangan](#pengembangan)
- [Troubleshooting](#troubleshooting)

---

## Fitur

### Manajemen Kandidat
- Formulir pendaftaran multi-step (9 tahap) dengan validasi
- Upload dokumen (KTP, KK, Ijazah, Pas Foto, Video, Sertifikat)
- Pipeline progres penempatan dari Job Matching hingga Keberangkatan
- Riwayat perubahan status (audit trail)
- Soft delete dengan restore
- Screening & auto-approve

### Manajemen Data Master
- Cabang (Pusat, Bandung, Surabaya, dll)
- Perusahaan Jepang dengan kuota SSW
- User dengan 3 level role
- Job Order dengan penugasan kandidat
- Institusi/Sendai

### Dashboard & Analitik
- Statistik real-time (total kandidat, status, gender, pendidikan)
- Grafik distribusi cabang, sertifikasi, progres per cabang
- Statistik interview (lulus/gagal/persentase)
- Tren pendaftaran 6 bulan
- AI Assistant berbasis Groq LLaMA 3.1

### Import / Export
- Export kandidat ke Excel (.xlsx)
- Import kandidat dari Excel (.xlsx / .xls)
- Generate CV dalam format PDF & Excel

### Lainnya
- Autentikasi JWT + Google OAuth
- CAPTCHA pada halaman login
- Lupa password via OTP email
- Notifikasi WhatsApp (StarSender API)
- Auto-scheduling screening berkala
- Redis caching untuk optimalisasi performa
- Deploy dengan Docker Compose

---

## Tech Stack

| **Layer** | **Teknologi** |
|-----------|---------------|
| **Frontend** | React 19, TypeScript, Vite 8 |
| **UI Framework** | Tailwind CSS 3 + shadcn/ui (Radix UI) |
| **State Management** | Zustand 5 |
| **Backend** | Node.js, Express.js (CommonJS) |
| **Database** | MySQL 8 (mysql2/promise) |
| **Caching** | Redis 7 (ioredis, opsional) |
| **Autentikasi** | JWT (jsonwebtoken), bcryptjs, Google OAuth |
| **File Upload** | Multer |
| **Charts** | ApexCharts (react-apexcharts) |
| **PDF/Excel** | jsPDF, html2canvas, xlsx, docx |
| **AI** | Groq API (LLaMA 3.1-8B) |
| **Email** | Nodemailer (SMTP Gmail) |
| **WhatsApp** | StarSender API |
| **Container** | Docker, Docker Compose |
| **Testing** | Vitest |

---

## Arsitektur Aplikasi

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │─────▶│   Backend    │─────▶│    MySQL     │
│  React + Vite│      │ Express.js   │      │   (Port 3306)│
│  (Port 5175) │◀─────│  (Port 5005) │◀─────│              │
└──────────────┘      └──────┬───────┘      └──────────────┘
                             │
                     ┌───────┴────────┐
                     │    Redis 7     │
                     │  (Port 6379)   │
                     └────────────────┘
```

**Docker Deployment:**
```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  Nginx   │─────▶│ Backend  │─────▶│  MySQL 8 │      │  Redis 7 │
│ (Port 80)│      │(Port 5000)│     │(Port 3306)│      │(Port 6379)│
└──────────┘      └──────────┘      └──────────┘      └──────────┘
```

---

## Struktur Proyek

```
sistem-penempatanv2/
│
├── backend/                          # Express.js API Server
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js           # Koneksi MySQL (pool)
│   │   │   ├── multer.js             # Konfigurasi upload file
│   │   │   └── redis.js              # Koneksi Redis
│   │   ├── controllers/
│   │   │   ├── authController.js     # Register, Login, Google OAuth, OTP
│   │   │   ├── kandidatController.js # CRUD kandidat, stats, screening
│   │   │   ├── cabangController.js   # CRUD cabang
│   │   │   ├── perusahaanController.js  # CRUD perusahaan
│   │   │   ├── userController.js     # CRUD user
│   │   │   ├── cvController.js       # Data CV
│   │   │   ├── institusiController.js# CRUD institusi
│   │   │   └── ...                   # Controller lainnya
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT verify + role authorization
│   │   ├── routes/                   # Definisi route per modul
│   │   ├── utils/
│   │   │   ├── cache.js              # Helper Redis caching
│   │   │   ├── email.js              # Nodemailer OTP
│   │   │   └── screeningScheduler.js # Auto-screening scheduler
│   │   ├── database.js               # Migration runner (npm run db)
│   │   ├── seed.js                   # Seeder 300 kandidat dummy
│   │   ├── seed-admin.js             # Seeder admin
│   │   ├── truncate.js               # Truncate semua tabel
│   │   ├── index.js                  # Entry point server
│   │   └── database/                 # Schema legacy
│   ├── database.sql                  # Full schema dump
│   ├── uploads/                      # File uploads per user ID
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
│
├── frontend/                         # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/               # Layout, Sidebar, ProtectedRoute
│   │   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── dashboard/            # Dashboard widgets
│   │   │   ├── form-kandidat/        # Multi-step form (Step 1-9)
│   │   │   └── kandidat/             # Tabel, filter, detail
│   │   ├── pages/
│   │   │   ├── admin/                # Admin pages (dashboard, kandidat, dll)
│   │   │   ├── kandidat/             # Kandidat pages (form, profil)
│   │   │   └── auth/                 # Login, Register, Forgot Password
│   │   ├── lib/
│   │   │   ├── api.ts                # Axios instance + interceptors
│   │   │   ├── utils.ts              # Utility functions
│   │   │   ├── cvGenerator.ts        # Generate CV (PDF/Excel)
│   │   │   └── pendaftaranGenerator.ts
│   │   ├── store/
│   │   │   └── authStore.ts          # Zustand auth store
│   │   ├── hooks/
│   │   │   └── useToast.ts           # Toast notification
│   │   ├── App.tsx                   # Router config
│   │   └── main.tsx                  # Entry point React
│   ├── public/images/
│   ├── nginx.conf                    # Nginx reverse proxy
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml                # Orchestrasi container
├── .gitignore
└── README.md
```

---

## Persyaratan Sistem

### Manual (tanpa Docker)
| **Kebutuhan** | **Versi Minimal** |
|---------------|-------------------|
| Node.js | 18.x (recommended 20.x) |
| MySQL | 8.0 |
| Redis | 7.x (opsional) |
| npm | 9.x |

### Docker
| **Kebutuhan** | **Versi Minimal** |
|---------------|-------------------|
| Docker Engine | 24.x |
| Docker Compose | 2.20.x |

---

## Instalasi Manual

### 1. Clone & Persiapan Backend

```bash
# Clone repositori
git clone <repo-url>
cd sistem-penempatanv2

# Setup backend
cd backend
npm install

# Konfigurasi environment
cp .env.example .env
# Edit .env sesuai dengan environment Anda
```

### 2. Konfigurasi Database

Buat database MySQL terlebih dahulu:

```sql
CREATE DATABASE IF NOT EXISTS kandidat_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 3. Setup Database & Seed

```bash
cd backend

# Opsi 1: Setup dari awal (hapus semua + buat ulang)
npm run db:fresh

# Opsi 2: Seed akun admin saja (jika tabel sudah ada)
npm run db:seed:admin

# Opsi 3: Generate data dummy (300 kandidat untuk testing)
npm run db:seed
```

### 4. Jalankan Backend

```bash
cd backend

# Development (dengan auto-reload)
npm run dev

# Production
npm start
```

Server backend berjalan di: `http://localhost:5005`

### 5. Setup & Jalankan Frontend

```bash
cd frontend
npm install

# Konfigurasi API URL
cp .env.example .env
# Isi VITE_API_URL=http://localhost:5005

# Development
npm run dev

# Build production
npm run build
```

Server frontend berjalan di: `http://localhost:5175`

---

## Instalasi Docker

### Quick Start

```bash
# Build dan jalankan semua service
docker-compose up -d --build

# Lihat logs
docker-compose logs -f

# Stop semua service
docker-compose down
```

### Service yang Tersedia

| **Service** | **Port** | **Deskripsi** |
|-------------|----------|---------------|
| `frontend` | 3000 | Nginx serving React build |
| `backend` | 5000 | Express API server |
| `mysql` | 3306 | MySQL 8 database |
| `redis` | 6379 | Redis 7 cache |

### Perintah Docker Berguna

```bash
# Reset database (hapus volume)
docker-compose down -v
docker-compose up -d

# Rebuild service tertentu
docker-compose up -d --build backend

# Lihat logs service
docker-compose logs backend
docker-compose logs mysql
docker-compose logs frontend
```

### Akses Aplikasi

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Database (external): `localhost:3306` — user: `kandidat_user`, password: `kandidat_password`

---

## Konfigurasi Environment

### Backend (`backend/.env`)

| **Variabel** | **Deskripsi** | **Default** |
|-------------|---------------|-------------|
| `PORT` | Port server backend | `5000` |
| `DB_HOST` | Host MySQL | `localhost` |
| `DB_USER` | User MySQL | `root` |
| `DB_PASSWORD` | Password MySQL | — |
| `DB_NAME` | Nama database | `kandidat_db` |
| `DB_PORT` | Port MySQL | `3306` |
| `JWT_SECRET` | Secret key JWT (ganti dengan kuat) | — |
| `UPLOAD_DIR` | Direktori upload file | `uploads` |
| `REDIS_URL` | URL Redis (opsional) | — |
| `GROQ_API_KEY` | API Key Groq (AI Assistant) | — |
| `STARSENDER_API_KEY` | API Key StarSender (WhatsApp) | — |
| `STARSENDER_SENDER` | Nomor pengirim WhatsApp | — |
| `STARSENDER_GROUP_ID` | Group ID tujuan notifikasi | — |
| `EMAIL_USER` | Email Gmail untuk Nodemailer | — |
| `EMAIL_PASS` | App Password Gmail | — |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | — |

### Frontend (`frontend/.env`)

| **Variabel** | **Deskripsi** | **Default** |
|-------------|---------------|-------------|
| `VITE_API_URL` | Base URL Backend API | `http://localhost:5005` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | — |

---

## Database

### Skema Database

Database `kandidat_db` (MySQL 8, charset `utf8mb4`).

| **Tabel** | **Fungsi** |
|-----------|------------|
| `users` | Seluruh user (kandidat, admin_cabang, admin_penempatan) |
| `cabang` | Cabang/perwakilan |
| `perusahaan` | Perusahaan Jepang |
| `kandidat_profil` | Profil utama kandidat (70+ kolom) |
| `kandidat_pendidikan` | Riwayat pendidikan |
| `kandidat_pengalaman_kerja` | Riwayat pekerjaan |
| `kandidat_keluarga` | Data keluarga |
| `kandidat_dokumen` | Dokumen upload |
| `kandidat_history` | Audit trail perubahan status |
| `job_order` | Job order dari perusahaan |
| `job_order_kandidat` | Relasi job order <-> kandidat |
| `cv_data` | Data CV (100+ kolom, legacy) |
| `pendaftaran_sistem_lama` | Data legacy |
| `notification_logs` | Log notifikasi WhatsApp |
| `password_resets` | OTP reset password |
| `sys_settings` | Konfigurasi sistem |
| `institusi` | Institusi/sendai |

### Perintah Database

Semua perintah dijalankan dari folder `backend/`:

| **Perintah** | **Deskripsi** |
|-------------|---------------|
| `npm run db:fresh` | Drop semua tabel → Buat ulang → Seed data awal (3 cabang + 2 admin) |
| `npm run db:seed:admin` | Seed akun admin penempatan + data cabang |
| `npm run db:seed` | Generate 300 data kandidat dummy |
| `npm run db:truncate` | Kosongkan data semua tabel (struktur tetap) |
| `npm run db` | Inisialisasi database legacy |

**Alur setup yang disarankan:**

```bash
npm run db:fresh       # 1. Reset database
npm run db:seed:admin  # 2. Seed akun admin
npm run db:seed        # 3. (Opsional) Data dummy testing
```

---

## Akun Default

| **Email** | **Password** | **Role** |
|-----------|-------------|----------|
| `adminpenempatan@gmail.com` | `admin123` | Admin Penempatan |
| `admin.bdg@kandidat.com` | `password` | Admin Cabang (Bandung) |

> **Penting:** Segera ganti password default setelah instalasi pertama!

---

## Sistem Role & Hak Akses

### Tiga Level Role

| **Role** | **Hak Akses** |
|----------|---------------|
| **Kandidat** | Registrasi, login, isi formulir 9 step, upload dokumen, lihat profil & history sendiri, edit profil |
| **Admin Cabang** | Lihat kandidat di cabangnya sendiri, update status & progres kandidat, screening, dashboard terbatas |
| **Admin Penempatan** | Akses penuh semua fitur: CRUD cabang, perusahaan, user, semua kandidat, job order, settings, AI chat, import/export, batch operations |

### Proteksi Route

- **Backend:** Middleware `authenticate` (JWT) + `authorize(roles)` pada tiap route
- **Frontend:** Komponen `ProtectedRoute` dengan pengecekan `isAuthenticated` + `user.role`

---

## Pipeline Penempatan

### Status Formulir

```
Draft → Submitted → Reviewed → Approved / Rejected
```

### Status Progres

```
Job Matching
  ↓
Pending
  ↓
Lamar ke Perusahaan
  ↓
Interview ←→ Jadwalkan Interview Ulang
  ↓
Lulus Interview / Gagal Interview
  ↓
Pemberkasan
  ↓
Berangkat / Ditolak
```

### Status Keberangkatan

| **Status** | **Keterangan** |
|------------|----------------|
| `stay` | Kandidat masih dalam proses |
| `keluar` | Kandidat keluar/dikeluarkan dari program |
| `terbang` | Kandidat sudah berangkat ke Jepang |

### Detail Pemberkasan (Pre-Departure)

Pipeline pemberkasan mencatat tanggal untuk setiap tahapan:
1. Setsumeikai
2. Mensetsu (Interview)
3. Biaya Pemberkasan
4. Dokumen
5. Kontrak
6. Paspor
7. Imigrasi
8. COE (Certificate of Eligibility)
9. Visa
10. Jadwal Penerbangan

---

## Formulir Kandidat (9 Step)

| **Step** | **Nama** | **Isi** |
|----------|----------|---------|
| **1** | Data Diri | Nama (Romaji, Katakana), tempat/tanggal lahir, jenis kelamin, agama, kewarganegaraan, alamat lengkap, kontak (email, telepon), media sosial, cabang |
| **2** | Kesehatan | Tinggi, berat badan, golongan darah, riwayat penyakit, cacat fisik, operasi, alergi, buta warna, kondisi kesehatan lainnya |
| **3** | Pendidikan | SD, SMP, SMA/SMK, Perguruan Tinggi (nama sekolah, jurusan, tahun masuk-lulus, gelar, status) |
| **4** | Pengalaman Kerja | Nama perusahaan, posisi, bidang, lama kerja, alasan berhenti (bisa multiple) |
| **5** | Kemampuan | Level JLPT, JFT Basic, SSW (bidang + sertifikat), level bahasa Jepang (Dasar/Menengah/Lancar), pengalaman kursus |
| **6** | Keluarga | Ayah, Ibu, saudara kandung, pasangan, anak (nama, usia, pekerjaan, penghasilan) |
| **7** | Informasi Jepang | Riwayat ke Jepang, alasan ingin ke Jepang, kenalan/keluarga di Jepang |
| **8** | Motivasi | Tujuan, alasan memilih program, rencana setelah kembali, preferensi bidang, lokasi kerja, gaji harapan |
| **9** | Dokumen | Upload KTP, KK, Ijazah (SD-SMA/PT), Pas Foto, Video perkenalan, Sertifikat (JLPT, JFT, SSW, Keahlian), dokumen pendukung lainnya |

---

## Panduan Penggunaan Fitur

### Untuk Kandidat

#### Registrasi Akun
1. Buka halaman `/register`
2. Isi data diri: nama lengkap, email, password, konfirmasi password
3. Pilih cabang dari daftar yang tersedia
4. Klik **Daftar**
5. Login dengan email dan password yang telah didaftarkan

#### Mengisi Formulir Pendaftaran (9 Step)
1. Setelah login, Anda akan diarahkan ke halaman formulir
2. Isi setiap step secara berurutan:
   - **Step 1 - Data Diri**: Nama (Romaji & Katakana), tempat/tanggal lahir, jenis kelamin, agama, alamat, kontak
   - **Step 2 - Kesehatan**: Tinggi/berat badan, golongan darah, riwayat penyakit
   - **Step 3 - Pendidikan**: Riwayat pendidikan dari SD hingga Perguruan Tinggi
   - **Step 4 - Pengalaman Kerja**: Riwayat pekerjaan (jika ada)
   - **Step 5 - Kemampuan**: Level JLPT/JFT/SSW, sertifikat yang dimiliki
   - **Step 6 - Keluarga**: Data orang tua, saudara, pasangan, anak
   - **Step 7 - Informasi Jepang**: Riwayat ke Jepang, kenalan di Jepang
   - **Step 8 - Motivasi**: Tujuan, alasan, rencana, preferensi kerja
   - **Step 9 - Dokumen**: Upload dokumen yang diminta
3. Setiap step dapat disimpan sebagai **draft** terlebih dahulu
4. Setelah semua step selesai, klik **Submit** untuk mengirim formulir ke admin

#### Upload Dokumen
1. Pada Step 9, pilih jenis dokumen yang akan diupload
2. Klik tombol **Pilih File** dan pilih file dari komputer
3. Format yang didukung: JPG, PNG, PDF (untuk dokumen), MP4 (untuk video)
4. Perhatikan batas ukuran file:
   - Foto/scan dokumen: maksimal 500 KB
   - Foto full body: maksimal 3 MB
   - Video perkenalan: maksimal 20 MB
5. Klik **Upload** untuk mengirim file

#### Melihat Profil & History
1. Buka menu **Dashboard** untuk melihat ringkasan profil
2. Buka menu **History** untuk melihat riwayat perubahan status formulir
3. Buka menu **Profil** untuk mengedit data diri

#### Ganti Password
1. Buka menu **Profil**
2. Klik tab **Ubah Password**
3. Masukkan password lama, password baru, dan konfirmasi password baru
4. Klik **Simpan**

---

### Untuk Admin Cabang

#### Dashboard
1. Login dengan akun Admin Cabang
2. Halaman dashboard menampilkan:
   - Total kandidat di cabang Anda
   - Statistik status formulir (draft, submitted, reviewed, approved, rejected)
   - Statistik progres kandidat
   - Grafik distribusi

#### Melihat & Mencari Kandidat
1. Buka menu **Kandidat**
2. Gunakan filter untuk menyaring data:
   - Pencarian berdasarkan nama
   - Filter status formulir
   - Filter status progres
   - Filter status keberangkatan
3. Klik tombol **Cari** atau tekan Enter

#### Mengelola Status Formulir Kandidat
1. Dari halaman Kandidat List, klik nama kandidat untuk melihat detail
2. Pada bagian **Status Formulir**, Anda dapat mengubah status:
   - **Draft** → **Submitted** (jika kandidat sudah submit)
   - **Submitted** → **Reviewed** (setelah diperiksa)
   - **Reviewed** → **Approved** / **Rejected**
3. Setiap perubahan status akan tercatat di riwayat (history)

#### Mengelola Progres Kandidat
1. Buka halaman detail kandidat
2. Pada bagian **Status Progres**, pilih status baru dari dropdown:
   - Job Matching → Pending → Lamar ke Perusahaan → Interview → Lulus/Gagal → Pemberkasan → Berangkat/Ditolak
3. Klik **Simpan** untuk menyimpan perubahan
4. Untuk pipeline pemberkasan, isi tanggal-tanggal penting:
   - Setsumeikai, Mensetsu, Biaya, Dokumen, Kontrak, Paspor, Imigrasi, COE, Visa, Jadwal Penerbangan

#### Screening Kandidat
1. Buka halaman detail kandidat
2. Klik tombol **Screening** untuk langsung meng-approve kandidat
3. Sistem akan otomatis mengubah status formulir menjadi **approved**

---

### Untuk Admin Penempatan

*(Semua fitur Admin Cabang + fitur berikut)*

#### Manajemen Cabang

**Tambah Cabang Baru:**
1. Buka menu **Cabang**
2. Klik tombol **Tambah Cabang**
3. Isi form:
   - **Nama Cabang**: nama lengkap (contoh: Kantor Pusat, Cabang Bandung)
   - **Kode Cabang**: kode unik (contoh: PST, BDG)
   - **Alamat**: alamat lengkap
   - **Kontak**: nomor telepon
   - **Status**: Aktif / Nonaktif
4. Klik **Simpan**

**Edit/Hapus Cabang:**
1. Dari halaman Cabang List, klik ikon **Edit** pada cabang yang dituju
2. Ubah data yang diperlukan, klik **Simpan**
3. Untuk menghapus, klik ikon **Hapus** dan konfirmasi

#### Manajemen Perusahaan

**Tambah Perusahaan Baru:**
1. Buka menu **Perusahaan**
2. Klik tombol **Tambah Perusahaan**
3. Isi data perusahaan Jepang:
   - Nama Perusahaan (Latin & Kanji)
   - Alamat di Jepang
   - Kontak & Email
   - Website
   - Bidang SSW (kuota per bidang)
   - Status: Aktif / Nonaktif
   - Keterangan tambahan
4. Klik **Simpan**

#### Manajemen User

**Tambah User Baru:**
1. Buka menu **Users**
2. Klik tombol **Tambah User**
3. Isi form:
   - Nama lengkap
   - Email
   - Password
   - Role: Kandidat / Admin Cabang / Admin Penempatan
   - Cabang (jika role Admin Cabang)
   - Status: Aktif / Nonaktif
4. Klik **Simpan**

**Edit/Hapus User:**
1. Klik ikon **Edit** untuk mengubah data user
2. Klik ikon **Hapus** untuk menonaktifkan user (soft delete)

#### Job Order

**Tambah Job Order:**
1. Buka menu **Job Order**
2. Klik tombol **Tambah Job Order**
3. Isi data:
   - Pilih **Perusahaan**
   - Tanggal Mensetsu
   - Biaya / Fee
   - Bidang SSW
   - Jumlah kandidat dibutuhkan
   - Deskripsi pekerjaan
   - Status: Aktif / Selesai / Dibatalkan
4. Klik **Simpan**

**Assign Kandidat ke Job Order:**
1. Buka detail Job Order
2. Klik tombol **Assign Kandidat**
3. Cari dan pilih kandidat yang akan ditugaskan
4. Klik **Simpan**
5. Status progres kandidat akan berubah sesuai alur

#### Import Kandidat dari Excel

1. Buka menu **Kandidat**
2. Klik tombol **Import**
3. Pilih file `.xlsx` atau `.xls`
4. Pastikan format kolom sesuai (lihat bagian [Import & Export Kandidat](#import--export-kandidat))
5. Klik **Upload**
6. Sistem akan memproses dan menampilkan hasil import

#### Export Kandidat ke Excel

1. Buka menu **Kandidat**
2. Gunakan filter yang diinginkan (jika ingin mengexport data tertentu)
3. Klik tombol **Export**
4. File `.xlsx` akan otomatis terunduh

#### AI Assistant

1. Buka halaman **Dashboard**
2. Pada bagian **AI Assistant**, ketik pertanyaan di kolom chat
3. Contoh pertanyaan yang bisa diajukan:
   - *"Berapa total kandidat yang sudah approved?"*
   - *"Berapa kandidat cabang Bandung yang sedang interview?"*
   - *"Tampilkan tren pendaftaran 6 bulan terakhir"*
   - *"Riwayat kandidat [nama kandidat]"*
4. AI akan menjawab berdasarkan data real-time dari database

#### Settings Sistem (Auto-Screening)

1. Buka menu **Settings**
2. Aktifkan fitur **Auto-Screening**
3. Konfigurasi jadwal:
   - **Start Time**: jam mulai screening otomatis
   - **End Time**: jam selesai screening otomatis
   - **Interval**: interval pengecekan (dalam menit)
4. Sistem akan otomatis menscreening dan meng-approve kandidat yang memiliki sertifikat JFT/SSW dalam jadwal yang ditentukan
5. Klik **Simpan**

#### Data Sistem Lama

1. Buka menu **Data Sistem Lama**
2. Halaman ini menampilkan data kandidat dari sistem sebelumnya (legacy)
3. Data bersifat **read-only** untuk referensi

#### Delete & Restore Kandidat

**Soft Delete:**
1. Buka halaman detail kandidat atau dari Kandidat List
2. Klik tombol **Hapus**
3. Kandidat akan dipindahkan ke daftar terhapus (tidak hilang permanen)

**Melihat Kandidat Terhapus:**
1. Buka menu **Kandidat**
2. Klik tab **Sampah** atau filter **Deleted**
3. Daftar kandidat yang dihapus akan muncul

**Restore Kandidat:**
1. Dari daftar kandidat terhapus, klik tombol **Restore**
2. Kandidat akan kembali ke daftar aktif

**Hapus Permanen:**
1. Dari daftar kandidat terhapus, klik tombol **Hapus Permanen**
2. Data akan dihapus dari database dan **tidak bisa dikembalikan**

**Operasi Batch:**
- **Restore Semua**: mengembalikan semua kandidat terhapus sekaligus
- **Hapus Permanen Semua**: menghapus permanen semua kandidat terhapus

---

## API Endpoints

### Auth

| **Method** | **Endpoint** | **Deskripsi** | **Akses** |
|------------|-------------|---------------|-----------|
| `POST` | `/api/auth/register` | Registrasi kandidat baru | Public |
| `POST` | `/api/auth/login` | Login (email + password) | Public |
| `POST` | `/api/auth/google` | Login Google OAuth | Public |
| `GET` | `/api/auth/me` | Info user yang login | Authenticated |
| `PUT` | `/api/auth/profile` | Update profil user | Authenticated |
| `PUT` | `/api/auth/password` | Ganti password | Authenticated |
| `POST` | `/api/auth/forgot-password` | Lupa password (reset langsung) | Public |
| `POST` | `/api/auth/send-forgot-otp` | Kirim OTP ke email | Public |
| `POST` | `/api/auth/verify-otp` | Verifikasi OTP + reset password | Public |
| `GET` | `/api/auth/cabang-list` | List cabang aktif | Public |

### Kandidat

| **Method** | **Endpoint** | **Deskripsi** | **Akses** |
|------------|-------------|---------------|-----------|
| `GET` | `/api/kandidat` | List kandidat (dengan filter/search) | Admin |
| `GET` | `/api/kandidat/stats` | Statistik dashboard | Admin |
| `GET` | `/api/kandidat/interview-stats` | Statistik interview | Admin |
| `GET` | `/api/kandidat/deleted` | Kandidat yang dihapus | Admin Penempatan |
| `GET` | `/api/kandidat/my-profile` | Profil kandidat sendiri | Kandidat |
| `PUT` | `/api/kandidat/my-profile` | Update profil sendiri | Kandidat |
| `POST` | `/api/kandidat/submit` | Submit formulir | Kandidat |
| `POST` | `/api/kandidat/upload-dokumen` | Upload dokumen | Kandidat |
| `GET` | `/api/kandidat/:id` | Detail kandidat | Admin |
| `GET` | `/api/kandidat/:id/history` | History perubahan | Admin |
| `PATCH` | `/api/kandidat/:id/status` | Update status formulir | Admin |
| `PATCH` | `/api/kandidat/:id/progres` | Update progres | Admin |
| `PATCH` | `/api/kandidat/:id/keberangkatan` | Update keberangkatan | Admin |
| `PATCH` | `/api/kandidat/:id/progres-lengkap` | Update pipeline lengkap | Admin |
| `PATCH` | `/api/kandidat/:id/screening` | Screening/approve | Admin |
| `POST` | `/api/kandidat/batch-screening` | Auto-approve semua | Admin |
| `PUT` | `/api/kandidat/:id/update-profile` | Update profil oleh admin | Admin |
| `POST` | `/api/kandidat/:id/upload-dokumen` | Upload dokumen (admin) | Admin |
| `DELETE` | `/api/kandidat/:id/dokumen` | Hapus dokumen | Admin |
| `POST` | `/api/kandidat/import` | Import Excel | Admin Penempatan |
| `DELETE` | `/api/kandidat/:id` | Soft delete | Admin Penempatan |
| `PATCH` | `/api/kandidat/:id/restore` | Restore kandidat | Admin Penempatan |
| `DELETE` | `/api/kandidat/:id/permanent` | Hapus permanen | Admin Penempatan |
| `POST` | `/api/kandidat/restore-all-deleted` | Restore semua | Admin Penempatan |
| `DELETE` | `/api/kandidat/permanent-all-deleted` | Hapus permanen semua | Admin Penempatan |
| `GET` | `/api/kandidat/file-limits` | Limit ukuran file | Public |

### Cabang

| **Method** | **Endpoint** | **Deskripsi** | **Akses** |
|------------|-------------|---------------|-----------|
| `GET` | `/api/cabang` | List cabang | Authenticated |
| `POST` | `/api/cabang` | Tambah cabang | Admin Penempatan |
| `PUT` | `/api/cabang/:id` | Edit cabang | Admin Penempatan |
| `DELETE` | `/api/cabang/:id` | Hapus cabang | Admin Penempatan |

### Perusahaan

| **Method** | **Endpoint** | **Deskripsi** | **Akses** |
|------------|-------------|---------------|-----------|
| `GET` | `/api/perusahaan` | List perusahaan | Authenticated |
| `POST` | `/api/perusahaan` | Tambah perusahaan | Admin Penempatan |
| `PUT` | `/api/perusahaan/:id` | Edit perusahaan | Admin Penempatan |
| `DELETE` | `/api/perusahaan/:id` | Hapus perusahaan | Admin Penempatan |

### Users

| **Method** | **Endpoint** | **Deskripsi** | **Akses** |
|------------|-------------|---------------|-----------|
| `GET` | `/api/users` | List users | Admin Penempatan |
| `POST` | `/api/users` | Tambah user | Admin Penempatan |
| `PUT` | `/api/users/:id` | Edit user | Admin Penempatan |
| `DELETE` | `/api/users/:id` | Hapus user | Admin Penempatan |

### Job Order

| **Method** | **Endpoint** | **Deskripsi** | **Akses** |
|------------|-------------|---------------|-----------|
| `GET` | `/api/joborder` | List job order | Admin |
| `POST` | `/api/joborder` | Tambah job order | Admin Penempatan |
| `GET` | `/api/joborder/:id` | Detail job order | Admin |
| `PUT` | `/api/joborder/:id` | Edit job order | Admin Penempatan |
| `DELETE` | `/api/joborder/:id` | Hapus job order | Admin Penempatan |
| `POST` | `/api/joborder/:id/kandidat` | Assign kandidat ke job order | Admin Penempatan |
| `DELETE` | `/api/joborder/:id/kandidat/:kandidatId` | Hapus assign kandidat | Admin Penempatan |

### History

| **Method** | **Endpoint** | **Deskripsi** | **Akses** |
|------------|-------------|---------------|-----------|
| `GET` | `/api/history` | List history | Admin |

### CV

| **Method** | **Endpoint** | **Deskripsi** | **Akses** |
|------------|-------------|---------------|-----------|
| `GET` | `/api/cv` | List CV data | Admin |
| `GET` | `/api/cv/:id` | Detail CV | Admin |
| `POST` | `/api/cv` | Tambah CV | Admin |
| `PUT` | `/api/cv/:id` | Update CV | Admin |
| `DELETE` | `/api/cv/:id` | Hapus CV | Admin |
| `POST` | `/api/cv/import` | Import CV dari Excel | Admin |

### AI Assistant

| **Method** | **Endpoint** | **Deskripsi** | **Akses** |
|------------|-------------|---------------|-----------|
| `POST` | `/api/ai/chat` | Chat dengan AI (Groq LLaMA) | Admin |
| `GET` | `/api/ai/stats` | Data statistik mentah | Admin |
| `GET` | `/api/ai/history` | Riwayat chat (placeholder) | Admin |

### Settings & Institusi

| **Method** | **Endpoint** | **Deskripsi** | **Akses** |
|------------|-------------|---------------|-----------|
| `GET` | `/api/settings` | Ambil settings | Admin |
| `PUT` | `/api/settings` | Update settings | Admin Penempatan |
| `GET` | `/api/institusi` | List institusi | Authenticated |
| `POST` | `/api/institusi` | Tambah institusi | Admin Penempatan |
| `PUT` | `/api/institusi/:id` | Edit institusi | Admin Penempatan |
| `DELETE` | `/api/institusi/:id` | Hapus institusi | Admin Penempatan |

### Pendaftaran Sistem Lama

| **Method** | **Endpoint** | **Deskripsi** | **Akses** |
|------------|-------------|---------------|-----------|
| `GET` | `/api/pendaftaran` | List data registrasi legacy | Admin Penempatan |

---

## Import & Export Kandidat

### Export ke Excel

- Klik tombol **Export** di halaman Kandidat List
- File `.xlsx` akan terunduh dengan kolom:
  - No, Nama Romaji, Nama Katakana, Email, Jenis Kelamin, Umur
  - Cabang, Pendidikan Terakhir, Status Formulir, Status Progres
  - Status Keberangkatan, Bidang SSW, Level Bahasa Jepang, Tanggal Update

### Import dari Excel

- Klik tombol **Import** di halaman Kandidat List
- Format file: `.xlsx` atau `.xls`

| **Kolom** | **Keterangan** |
|-----------|----------------|
| Nama Romaji | Wajib (salah satu Nama Romaji atau Katakana) |
| Nama Katakana | Nama dalam katakana |
| Email | Jika sudah terdaftar, data akan di-update |
| Jenis Kelamin | Laki-laki / Perempuan |
| Umur | Angka |
| Cabang | Nama cabang (otomatis dibuat jika belum ada) |
| Pendidikan Terakhir | SD / SMP / SMA/SMK / Perguruan Tinggi |
| Status Formulir | draft / submitted / reviewed / approved / rejected |
| Status Progres | Job Matching / Pending / Interview / dll |
| Status Keberangkatan | stay / keluar / terbang |
| Bidang SSW | Nama bidang SSW |
| Level Bahasa Jepang | Dasar / Menengah / Lancar |

> **Catatan:** Jika email sudah terdaftar, data kandidat akan diupdate. Jika belum ada, user baru dibuat otomatis dengan password default `<nama>123`.

### Generate CV

Sistem dapat menghasilkan CV kandidat dalam format:
- **PDF** (via jsPDF + html2canvas)
- **Excel** (via xlsx + docx)

---

## AI Assistant (Groq)

Sistem dilengkapi **AI Assistant** terintegrasi dengan **Groq API** menggunakan model **LLaMA 3.1-8B**.

### Cara Kerja

1. Admin mengirim pertanyaan melalui chat di dashboard
2. Backend mengambil data statistik real-time dari database
3. Data dikirim sebagai system prompt ke Groq API
4. AI menjawab berdasarkan data yang tersedia

### Contoh Pertanyaan

- "Berapa total kandidat yang terdaftar?"
- "Berapa kandidat yang sudah lulus interview?"
- "Bagaimana distribusi kandidat per cabang?"
- "Berapa kandidat yang memiliki sertifikat SSW?"
- "Tren pendaftaran 6 bulan terakhir?"
- "Riwayat kandidat Budi Santoso"

### Konfigurasi

Set `GROQ_API_KEY` di `backend/.env` untuk mengaktifkan fitur ini.

---

## Notifikasi WhatsApp

Sistem mengirim notifikasi WhatsApp via **StarSender API** ketika kandidat submit formulir.

### Konfigurasi

```env
STARSENDER_API_KEY=api_key_anda
STARSENDER_SENDER=nomor_pengirim
STARSENDER_GROUP_ID=group_id_tujuan
```

---

## Auto-Screening

Sistem dapat melakukan screening otomatis secara terjadwal yang akan meng-approve kandidat yang memiliki sertifikat JFT atau SSW.

### Konfigurasi

Atur melalui menu **Settings** di aplikasi (hanya admin penempatan):

- **Waktu mulai** (jam:menit)
- **Waktu selesai** (jam:menit)
- **Interval** (menit)

Scheduler akan berjalan dalam range waktu yang ditentukan dan melakukan auto-approve terhadap kandidit yang memenuhi syarat.

---

## Caching Redis

Redis digunakan untuk caching data yang sering diakses:

- List cabang
- List perusahaan
- List users
- Data kandidat
- Settings sistem
- Job orders

Redis bersifat **opsional**. Jika Redis tidak tersedia, sistem akan tetap berjalan tanpa cache.

Konfigurasi: `REDIS_URL` di `backend/.env`

---

## Build Production

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
# Output: frontend/dist/
```

Untuk deployment production dengan Nginx, gunakan `frontend/nginx.conf` sebagai reverse proxy yang meneruskan `/api` ke backend.

---

## Pengembangan

### Backend Dev Server (dengan auto-reload)

```bash
cd backend
npm run dev
```

### Frontend Dev Server (HMR)

```bash
cd frontend
npm run dev
```

### Testing

```bash
cd frontend
npx vitest
```

---

## Troubleshooting

### Database: `ECONNREFUSED`

Pastikan MySQL berjalan dan kredensial di `.env` benar.

### File Upload Gagal

Periksa:
- Direktori `backend/uploads/` ada dan writable
- Ukuran file tidak melebihi limit
  - Foto: 500 KB
  - Video: 20 MB
  - Full body photo: 3 MB

### Redis Connection Error

Aplikasi tetap berjalan tanpa Redis. Nonaktifkan dengan mengosongkan `REDIS_URL`.

### Docker: Container MySQL unhealthy

```bash
docker-compose down -v && docker-compose up -d
```

### Reset Database di Docker

```bash
docker-compose exec backend npm run db:fresh
docker-compose exec backend npm run db:seed:admin
```

---

> **Catatan:** Sistem ini dikembangkan untuk program penempatan kerja ke Jepang (SSW / Tokutei Gino) dan dirancang untuk digunakan oleh LPK / perusahaan penempatan tenaga kerja Indonesia.
