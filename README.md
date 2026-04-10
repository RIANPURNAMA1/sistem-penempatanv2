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

### 1. Siapkan Database MySQL

```bash
# Masuk ke MySQL
mysql -u root -p

# Import schema
source /path/to/kandidat-system/backend/database.sql
```

### 2. Setup Backend

```bash
cd kandidat-system/backend

# Install dependencies
npm install

# Salin dan isi konfigurasi
cp .env.example .env
# Edit .env sesuai konfigurasi MySQL Anda

# Jalankan server
npm run dev
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

### 3. Setup Frontend

```bash
cd kandidat-system/frontend

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Buka browser: **http://localhost:5173**

---

## 🔐 Akun Default

Setelah import database.sql, tersedia akun:

| Email | Password | Role |
|-------|----------|------|
| `admin@kandidat.com` | `password` | Admin Penempatan |
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
│   │   └── routes/          # API routes
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
- `GET /api/kandidat/my-profile` — Profil kandidat sendiri
- `PUT /api/kandidat/my-profile` — Update profil
- `POST /api/kandidat/submit` — Kirim formulir
- `POST /api/kandidat/upload-dokumen` — Upload dokumen
- `GET /api/kandidat/:id` — Detail kandidat (admin)
- `PATCH /api/kandidat/:id/status` — Update status (admin)

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