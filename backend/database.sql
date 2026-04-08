-- =============================================
-- SISTEM PENEMPATAN KANDIDAT - DATABASE SCHEMA
-- =============================================

CREATE DATABASE IF NOT EXISTS kandidat_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kandidat_db;

-- ============ TABEL CABANG ============
CREATE TABLE IF NOT EXISTS cabang (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama_cabang VARCHAR(200) NOT NULL,
  kode_cabang VARCHAR(20) UNIQUE NOT NULL,
  alamat TEXT,
  kota VARCHAR(100),
  provinsi VARCHAR(100),
  telepon VARCHAR(20),
  email VARCHAR(100),
  status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============ TABEL PERUSAHAAN ============
CREATE TABLE IF NOT EXISTS perusahaan (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama_perusahaan VARCHAR(200) NOT NULL,
  nama_jepang VARCHAR(200),
  bidang_usaha VARCHAR(200),
  alamat_indonesia TEXT,
  alamat_jepang TEXT,
  kota VARCHAR(100),
  negara VARCHAR(100) DEFAULT 'Jepang',
  kontak_pic VARCHAR(100),
  telepon VARCHAR(50),
  email VARCHAR(100),
  website VARCHAR(200),
  quota_ssw INT DEFAULT 0,
  status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============ TABEL USERS ============
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(200) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('kandidat', 'admin_cabang', 'admin_penempatan') NOT NULL DEFAULT 'kandidat',
  cabang_id INT NULL,
  status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cabang_id) REFERENCES cabang(id) ON DELETE SET NULL
);

-- ============ TABEL KANDIDAT DATA DIRI ============
CREATE TABLE IF NOT EXISTS kandidat_profil (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  cabang_id INT,
  
  -- Data Diri
  nama_katakana VARCHAR(200),
  nama_romaji VARCHAR(200),
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  umur INT,
  pendidikan_terakhir ENUM('SD', 'SMP', 'SMA/SMK', 'Perguruan Tinggi'),
  jenis_kelamin ENUM('Laki-laki', 'Perempuan'),
  status_pernikahan ENUM('Menikah', 'Belum Menikah'),
  jumlah_anak INT DEFAULT 0,
  agama VARCHAR(50),
  tinggi_badan INT,
  berat_badan INT,
  golongan_darah ENUM('A', 'B', 'AB', 'O', 'Tidak Tahu'),
  tangan_dominan ENUM('Kanan', 'Kiri'),
  ukuran_baju ENUM('S', 'M', 'L', 'XL', 'XXL', 'Lainnya'),
  lingkar_pinggang DECIMAL(5,1),
  panjang_telapak_kaki DECIMAL(5,1),
  sim_dimiliki VARCHAR(100),
  
  -- Kontak & Alamat
  nomor_hp VARCHAR(20),
  email_kontak VARCHAR(100),
  alamat_lengkap TEXT,
  kontak_ortu_nama VARCHAR(200),
  kontak_ortu_hp VARCHAR(20),
  
  -- Kondisi Fisik & Kesehatan
  sudah_vaksin BOOLEAN DEFAULT FALSE,
  penglihatan_kanan VARCHAR(50),
  penglihatan_kiri VARCHAR(50),
  berkacamata BOOLEAN DEFAULT FALSE,
  lensa_kontak BOOLEAN DEFAULT FALSE,
  buta_warna BOOLEAN DEFAULT FALSE,
  kondisi_kesehatan ENUM('Sehat', 'Tidak Sehat') DEFAULT 'Sehat',
  riwayat_penyakit TEXT,
  bertato BOOLEAN DEFAULT FALSE,
  merokok BOOLEAN DEFAULT FALSE,
  minum_alkohol BOOLEAN DEFAULT FALSE,
  intensitas_alkohol VARCHAR(100),
  
  -- Informasi Jepang
  pernah_ke_jepang BOOLEAN DEFAULT FALSE,
  keluarga_di_jepang BOOLEAN DEFAULT FALSE,
  hubungan_keluarga_jepang VARCHAR(100),
  status_kerabat_jepang VARCHAR(100),
  kontak_keluarga_jepang VARCHAR(100),
  kenalan_di_jepang BOOLEAN DEFAULT FALSE,
  kenalan_jepang_detail TEXT,
  
  -- Kemampuan
  level_jlpt VARCHAR(20),
  level_jft VARCHAR(20),
  sertifikat_ssw TEXT,
  lama_belajar_jepang VARCHAR(50),
  level_bahasa_jepang ENUM('Dasar', 'Menengah', 'Lancar'),
  id_prometric VARCHAR(100),
  password_prometric VARCHAR(100),
  
  -- Motivasi
  tujuan_ke_jepang TEXT,
  alasan_ke_jepang TEXT,
  cita_cita_setelah_jepang TEXT,
  rencana_pengiriman_uang INT,
  kelebihan_diri TEXT,
  kekurangan_diri TEXT,
  hobi TEXT,
  keahlian TEXT,
  bersedia_shift BOOLEAN DEFAULT FALSE,
  bersedia_lembur BOOLEAN DEFAULT FALSE,
  bersedia_hari_libur BOOLEAN DEFAULT FALSE,
  lama_tinggal_jepang ENUM('2-3 tahun', '3-5 tahun'),
  lama_kerja_perusahaan ENUM('1-2 tahun', '2-3 tahun', '3-5 tahun'),
  rencana_pulang ENUM('1-2 kali', '3-4 kali', 'Lainnya'),
  sumber_biaya ENUM('Dana Pribadi', 'Dana Talang LPK'),
  biaya_disiapkan ENUM('10-20 Juta', '20-30 Juta', '40-50 Juta', 'Lainnya'),
  
  -- Status
  status_formulir ENUM('draft', 'submitted', 'reviewed', 'approved', 'rejected') DEFAULT 'draft',
  status_progres ENUM('Job Matching', 'Pending', 'lamar ke perusahaan', 'Interview', 'Jadwalkan Interview Ulang', 'Lulus interview', 'Gagal Interview', 'Pemberkasan', 'Berangkat', 'Ditolak') DEFAULT 'Job Matching',
  catatan_admin TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (cabang_id) REFERENCES cabang(id) ON DELETE SET NULL
);

-- ============ TABEL PENDIDIKAN ============
CREATE TABLE IF NOT EXISTS kandidat_pendidikan (
  id INT PRIMARY KEY AUTO_INCREMENT,
  kandidat_id INT NOT NULL,
  jenjang ENUM('SD', 'SMP', 'SMA/SMK', 'Perguruan Tinggi') NOT NULL,
  nama_sekolah VARCHAR(200),
  bulan_masuk VARCHAR(20),
  tahun_masuk YEAR,
  bulan_lulus VARCHAR(20),
  tahun_lulus YEAR,
  jurusan VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kandidat_id) REFERENCES kandidat_profil(id) ON DELETE CASCADE
);

-- ============ TABEL PENGALAMAN KERJA ============
CREATE TABLE IF NOT EXISTS kandidat_pengalaman_kerja (
  id INT PRIMARY KEY AUTO_INCREMENT,
  kandidat_id INT NOT NULL,
  nama_perusahaan VARCHAR(200),
  alamat_perusahaan TEXT,
  posisi VARCHAR(150),
  bulan_masuk VARCHAR(20),
  tahun_masuk YEAR,
  bulan_keluar VARCHAR(20),
  tahun_keluar YEAR,
  masih_bekerja BOOLEAN DEFAULT FALSE,
  deskripsi_pekerjaan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kandidat_id) REFERENCES kandidat_profil(id) ON DELETE CASCADE
);

-- ============ TABEL DATA KELUARGA ============
CREATE TABLE IF NOT EXISTS kandidat_keluarga (
  id INT PRIMARY KEY AUTO_INCREMENT,
  kandidat_id INT NOT NULL,
  hubungan ENUM('Ayah', 'Ibu', 'Kakak', 'Adik', 'Lainnya') NOT NULL,
  nama VARCHAR(200),
  usia INT,
  pekerjaan VARCHAR(150),
  urutan INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kandidat_id) REFERENCES kandidat_profil(id) ON DELETE CASCADE
);

-- ============ TABEL DOKUMEN KANDIDAT ============
CREATE TABLE IF NOT EXISTS kandidat_dokumen (
  id INT PRIMARY KEY AUTO_INCREMENT,
  kandidat_id INT NOT NULL,
  jenis_dokumen VARCHAR(50) NOT NULL,
  nama_file VARCHAR(255),
  path_file VARCHAR(500),
  ukuran_file INT,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kandidat_id) REFERENCES kandidat_profil(id) ON DELETE CASCADE
);

-- ============ UPDATE JENIS DOKUMEN ============
ALTER TABLE kandidat_dokumen MODIFY COLUMN jenis_dokumen VARCHAR(50) NOT NULL;

-- ============ TABEL PENGHASILAN KELUARGA ============
ALTER TABLE kandidat_profil ADD COLUMN penghasilan_keluarga BIGINT DEFAULT 0;

-- ============ KOLOM PROGRES KANDIDAT ============
ALTER TABLE kandidat_profil ADD COLUMN status_progres ENUM('Job Matching', 'Pending', 'lamar ke perusahaan', 'Interview', 'Jadwalkan Interview Ulang', 'Lulus interview', 'Gagal Interview', 'Pemberkasan', 'Berangkat', 'Ditolak') DEFAULT 'Job Matching';
ALTER TABLE kandidat_profil ADD COLUMN catatan_progres TEXT;

-- ============ KOLOM PENDIDIKAN TERAKHIR ============
ALTER TABLE kandidat_profil ADD COLUMN pendidikan_terakhir ENUM('SD', 'SMP', 'SMA/SMK', 'Perguruan Tinggi');

-- ============ INDEX ============
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_kandidat_cabang ON kandidat_profil(cabang_id);
CREATE INDEX idx_kandidat_status ON kandidat_profil(status_formulir);

-- ============ DEFAULT ADMIN PENEMPATAN ============
-- Password: Admin@123 (hashed)
INSERT INTO cabang (nama_cabang, kode_cabang, kota, status) VALUES 
('Kantor Pusat', 'PUSAT', 'Jakarta', 'aktif'),
('Cabang Bandung', 'BDG', 'Bandung', 'aktif'),
('Cabang Surabaya', 'SBY', 'Surabaya', 'aktif');

INSERT INTO users (nama, email, password, role, cabang_id) VALUES 
('Admin Penempatan', 'admin@kandidat.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin_penempatan', NULL),
('Admin Bandung', 'admin.bdg@kandidat.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin_cabang', 2);

-- Note: Default password for both admins is "password"

-- ============ TABEL JOB ORDER / MENSETSU ============
CREATE TABLE IF NOT EXISTS job_order (
  id INT PRIMARY KEY AUTO_INCREMENT,
  kandidat_id INT NOT NULL,
  perusahaan_id INT,
  
  -- Job Order Info
  nomor VARCHAR(50),
  tanggal_terbit DATE,
  detail_job_order TEXT,
  bidang_ssw VARCHAR(200),
  nama_grup VARCHAR(255),
  link_grup VARCHAR(500),
  biaya_awal DECIMAL(15,2) DEFAULT 0,
  biaya_akhir DECIMAL(15,2) DEFAULT 0,
  
  -- CV Info
  tanggal_cv DATE,
  pic_cv VARCHAR(100),
  
  -- Mensetsu Dates
  tanggal_mensetsu_1 DATE,
  tanggal_mensetsu_2 DATE,
  tanggal_mensetsu_3 DATE,
  
  -- Status
  status_kelulusan ENUM('Lulus', 'Tidak Lulus', 'Menunggu', 'Tidak Hadir') DEFAULT 'Menunggu',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (kandidat_id) REFERENCES kandidat_profil(id) ON DELETE CASCADE,
  FOREIGN KEY (perusahaan_id) REFERENCES perusahaan(id) ON DELETE SET NULL
);

-- ============ INDEX ============
CREATE INDEX idx_job_order_kandidat ON job_order(kandidat_id);
CREATE INDEX idx_job_order_perusahaan ON job_order(perusahaan_id);
