# 🇯🇵 Sistem Penempatan Kandidat

Sistem manajemen penempatan kandidat kerja ke Jepang, dengan fitur lengkap CRUD cabang, perusahaan, manajemen user, dan formulir pendaftaran kandidat multi-step.

---

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui |
| State | Zustand |
| Backend | Node.js + Express |
| Database | MySQL |
| Auth | JWT |
| Upload | Multer |

---

## 👥 Role & Akses

| Role | Akses |
|------|-------|
| **Kandidat** | Register, Login, Isi formulir lengkap, Upload dokumen |
| **Admin Cabang** | Lihat data kandidat cabangnya saja, update status |
| **Admin Penempatan** | Akses penuh semua fitur (CRUD cabang, perusahaan, user, semua kandidat) |

---

## 🚀 Cara Instalasi

### 1. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Salin dan isi konfigurasi
cp .env.example .env
# Edit .env sesuai konfigurasi MySQL Anda
```

Isi file `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password_mysql_anda
DB_NAME=kandidat_db
JWT_SECRET=ganti_dengan_secret_yang_kuat
UPLOAD_DIR=uploads
```

### 2. Setup Database

```bash
# Reset & buat schema dari awal
npm run db:fresh

# Seed akun admin
npm run db:seed:admin

# (Opsional) Isi data dummy untuk testing
npm run db:seed
```

### 3. Jalankan Server

```bash
# Jalankan server development
npm run dev
```

### 4. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Buka browser: **http://localhost:5173**

---

## 📋 Database Commands

Semua command dijalankan dari folder `backend/`:

```bash
cd backend
```

### `npm run db:fresh`

**Drop semua tabel → Buat ulang dari awal → Seed data awal**

Command ini akan:
1. Menghapus semua tabel yang ada (drop)
2. Membuat ulang semua tabel sesuai schema terbaru
3. Menambahkan data awal (3 cabang + 2 user admin)

**Kapan digunakan:** Saat pertama kali setup, atau ingin reset total database.

```bash
npm run db:fresh
```

> ⚠️ **Peringatan:** Semua data akan hilang! Jangan jalankan di production kecuali Anda benar-benar ingin reset.

---

### `npm run db:seed:admin`

**Seed akun admin penempatan + data cabang**

Command ini akan:
1. Menambahkan 3 cabang (Kantor Pusat, Cabang Bandung, Cabang Surabaya)
2. Membuat/overwrite akun `admin_penempatan` dengan email `adminpenempatan@gmail.com`

```bash
npm run db:seed:admin
```

**Akun yang dibuat:**

| Email | Password | Role |
|-------|----------|------|
| `adminpenempatan@gmail.com` | `admin123` | Admin Penempatan |

**Kapan digunakan:** Saat butuh akun admin untuk login pertama kali, atau setelah `db:fresh` yang tidak berhasil seed admin.

---

### `npm run db:seed`

**Generate 300 data kandidat palsu (fake data)**

Command ini akan:
1. Menghapus semua data kandidat yang ada
2. Membuat 300 kandidat dengan data random (nama, umur, pendidikan, pengalaman kerja, keluarga, dll)

```bash
npm run db:seed
```

> ⚠️ **Syarat:** Pastikan tabel `cabang` sudah ada (jalankan `db:fresh` atau `db:seed:admin` dulu).

**Kapan digunakan:** Untuk testing/development, mengisi database agar tampilan tidak kosong.

---

### `npm run db:truncate` / `npm run db:fresh` (truncate mode)

**Kosongkan semua data tanpa menghapus tabel**

Command ini akan `TRUNCATE` semua tabel (hapus isi data, struktur tabel tetap):
- `notification_logs`
- `pendaftaran_sistem_lama`
- `cv_data`
- `job_order_kandidat`
- `job_order`
- `kandidat_dokumen`
- `kandidat_keluarga`
- `kandidat_pengalaman_kerja`
- `kandidat_pendidikan`
- `kandidat_profil`
- `users`
- `perusahaan`
- `cabang`

```bash
npm run db:truncate
```

**Kapan digunakan:** Saat ingin bersih-bersih data tapi tidak ingin drop tabel.

---

### `npm run db`

**Inisialisasi database (legacy)**

Menjalankan script `src/database.js` untuk inisialisasi tabel-tabel dasar.

```bash
npm run db
```

---

### Alur Setup Database yang Disarankan

```bash
# 1. Reset & buat schema dari awal
npm run db:fresh

# 2. Pastikan akun admin tersedia
npm run db:seed:admin

# 3. (Opsional) Isi data dummy untuk testing
npm run db:seed
```

---

## 🔐 Akun Default

| Email | Password | Role |
|-------|----------|------|
| `adminpenempatan@gmail.com` | `admin123` | Admin Penempatan |
| `admin.bdg@kandidat.com` | `password` | Admin Cabang (Bandung) |

> ⚠️ **Penting:** Ganti password default segera setelah instalasi!

---

## 📁 Struktur Folder

```
kandidat-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & multer config
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth middleware
│   │   └── routes/ 

         # API routes
│   ├── uploads/             # File uploads (auto-created)
│   ├── database.sql         # Schema MySQL
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/      # Sidebar, ProtectedRoute
    │   │   └── ui/          # shadcn components
    │   ├── hooks/           # useToast
    │   ├── lib/             # axios instance, utils
    │   ├── pages/
    │   │   ├── admin/       # Dashboard, Kandidat, Cabang, Perusahaan, Users
    │   │   ├── kandidat/    # Formulir multi-step
    │   │   └── auth/        # Login, Register
    │   ├── store/           # Zustand auth store
    │   ├── App.tsx          # Router
    │   └── main.tsx
    └── package.json
```

---

## 📋 API Endpoints

### Auth
- `POST /api/auth/register` — Daftar kandidat baru
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Info user login
- `GET /api/auth/cabang-list` — List cabang (public)

### Kandidat
- `GET /api/kandidat` — List semua kandidat (admin)
- `GET /api/kandidat/stats` — Statistik (admin)
- `GET /api/kandidat/interview-stats` — Statistik interview (admin)
- `GET /api/kandidat/my-profile` — Profil kandidat sendiri
- `PUT /api/kandidat/my-profile` — Update profil
- `POST /api/kandidat/submit` — Kirim formulir
- `POST /api/kandidat/upload-dokumen` — Upload dokumen
- `POST /api/kandidat/import` — Import kandidat dari Excel (admin)
- `GET /api/kandidat/:id` — Detail kandidat (admin)
- `GET /api/kandidat/:id/history` — History kandidat (admin)
- `PATCH /api/kandidat/:id/status` — Update status formulir (admin)
- `PATCH /api/kandidat/:id/progres` — Update status progres (admin)
- `PATCH /api/kandidat/:id/keberangkatan` — Update status keberangkatan (admin)
- `PATCH /api/kandidat/:id/progres-lengkap` — Update progres lengkap (admin)
- `PATCH /api/kandidat/:id/screening` — Screening/approve kandidat (admin)
- `POST /api/kandidat/batch-screening` — Auto-approve semua kandidat (admin)
- `PUT /api/kandidat/:id/update-profile` — Update profil oleh admin (admin)
- `GET /api/kandidat/file-limits` — Info limit ukuran file upload

### Cabang (Admin Penempatan only untuk CUD)
- `GET /api/cabang`
- `POST /api/cabang`
- `PUT /api/cabang/:id`
- `DELETE /api/cabang/:id`

### Perusahaan (Admin Penempatan only untuk CUD)
- `GET /api/perusahaan`
- `POST /api/perusahaan`
- `PUT /api/perusahaan/:id`
- `DELETE /api/perusahaan/:id`

### Users (Admin Penempatan only)
- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

---

## 📝 Formulir Kandidat (9 Step)

1. **Data Diri** — Info personal, kontak, alamat
2. **Kesehatan** — Kondisi fisik, riwayat penyakit
3. **Pendidikan** — SD, SMP, SMA/SMK, Perguruan Tinggi
4. **Pengalaman Kerja** — Riwayat pekerjaan
5. **Kemampuan** — JLPT, JFT, SSW, level bahasa
6. **Keluarga** — Data orang tua, kakak, adik, penghasilan
7. **Informasi Jepang** — Riwayat ke Jepang, kenalan
8. **Motivasi** — Tujuan, alasan, rencana, preferensi kerja
9. **Dokumen** — Upload KTP, KK, Ijazah, Foto, Video, Sertifikat

---

## 📥📤 Import & Export Kandidat

### Export
- Klik tombol **Export** di halaman Kandidat List
- Data akan diunduh sebagai file `.xlsx` (Excel)
- Kolom yang diexport: No, Nama Romaji, Nama Katakana, Email, Jenis Kelamin, Umur, Cabang, Pendidikan Terakhir, Status Formulir, Status Progres, Status Keberangkatan, Bidang SSW, Level Bahasa Jepang, Tanggal Update

### Import
- Klik tombol **Import** di halaman Kandidat List
- Pilih file `.xlsx` atau `.xls`
- Format kolom yang diharapkan:

| Kolom | Keterangan |
|-------|------------|
| Nama Romaji | **Wajib** (salah satu Nama Romaji atau Katakana) |
| Nama Katakana | Nama dalam katakana |
| Email | Email kandidat (jika sudah ada, data akan diupdate) |
| Jenis Kelamin | Laki-laki / Perempuan |
| Umur | Angka |
| Cabang | Nama cabang (jika belum ada, akan dibuat otomatis) |
| Pendidikan Terakhir | SD / SMP / SMA/SMK / Perguruan Tinggi |
| Status Formulir | draft / submitted / reviewed / approved / rejected |
| Status Progres | Job Matching / Pending / Interview / dll |
| Status Keberangkatan | stay / keluar / terbang |
| Bidang SSW | Nama bidang SSW |
| Level Bahasa Jepang | Dasar / Menengah / Lancar |

> 💡 Jika email sudah terdaftar, data kandidat akan diupdate. Jika belum ada, user baru akan dibuat otomatis dengan password default `<nama>123`.

---

## 🏗 Build Production

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
# Output di dist/ folder
```



<!-- fitur pada penempatan perusahaan -->

1. nama perusahaan
2. alamat
3. kontak
4. email
5. website
6. status -> [aktif, nonaktif]
7. keterangan