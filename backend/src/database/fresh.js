const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kandidat_db',
  waitForConnections: true,
  connectionLimit: 10,
});

const migrations = [
  `CREATE TABLE IF NOT EXISTS cabang (
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
  )`,
  `CREATE TABLE IF NOT EXISTS perusahaan (
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
  )`,
  `CREATE TABLE IF NOT EXISTS users (
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
  )`,
  `CREATE TABLE IF NOT EXISTS kandidat_profil (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    cabang_id INT,
    nama_katakana VARCHAR(200),
    nama_romaji VARCHAR(200),
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    umur INT,
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
    nomor_hp VARCHAR(20),
    email_kontak VARCHAR(100),
    alamat_lengkap TEXT,
    kontak_ortu_nama VARCHAR(200),
    kontak_ortu_hp VARCHAR(20),
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
    pernah_ke_jepang BOOLEAN DEFAULT FALSE,
    keluarga_di_jepang BOOLEAN DEFAULT FALSE,
    hubungan_keluarga_jepang VARCHAR(100),
    status_kerabat_jepang VARCHAR(100),
    kontak_keluarga_jepang VARCHAR(100),
    kenalan_di_jepang BOOLEAN DEFAULT FALSE,
    kenalan_jepang_detail TEXT,
    level_jlpt VARCHAR(20),
    level_jft VARCHAR(20),
    sertifikat_ssw TEXT,
    lama_belajar_jepang VARCHAR(50),
    level_bahasa_jepang ENUM('Dasar', 'Menengah', 'Lancar'),
    id_prometric VARCHAR(100),
    password_prometric VARCHAR(100),
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
    status_formulir ENUM('draft', 'submitted', 'reviewed', 'approved', 'rejected') DEFAULT 'draft',
    status_progres ENUM('Job Matching', 'Pending', 'lamar ke perusahaan', 'Interview', 'Jadwalkan Interview Ulang', 'Lulus interview', 'Gagal Interview', 'Pemberkasan', 'Berangkat', 'Ditolak') DEFAULT 'Job Matching',
    catatan_admin TEXT,
    catatan_progres TEXT,
    pendidikan_terakhir VARCHAR(50),
    status_keberangkatan ENUM('stay', 'keluar', 'terbang') DEFAULT NULL,
    status_kandidat VARCHAR(50) DEFAULT NULL,
    nama_perusahaan VARCHAR(255) DEFAULT NULL,
    bidang_ssw VARCHAR(255) DEFAULT NULL,
    detail_pekerjaan TEXT DEFAULT NULL,
    jadwal_interview DATE DEFAULT NULL,
    catatan_interview TEXT DEFAULT NULL,
    tgl_setsumeikai DATE DEFAULT NULL,
    tgl_mensetsu_1 DATE DEFAULT NULL,
    tgl_mensetsu_2 DATE DEFAULT NULL,
    catatan_mensetsu TEXT DEFAULT NULL,
    biaya_pemberkasan VARCHAR(50) DEFAULT NULL,
    adm_tahap_1 VARCHAR(50) DEFAULT NULL,
    adm_tahap_2 VARCHAR(50) DEFAULT NULL,
    dokumen_dikirim DATE DEFAULT NULL,
    terbit_kontrak DATE DEFAULT NULL,
    kontrak_dikirim_tsk DATE DEFAULT NULL,
    terbit_paspor DATE DEFAULT NULL,
    masuk_imigrasi DATE DEFAULT NULL,
    coe_terbit DATE DEFAULT NULL,
    ektkln_pembuatan DATE DEFAULT NULL,
    dokumen_dikirim_2 DATE DEFAULT NULL,
    visa DATE DEFAULT NULL,
    jadwal_penerbangan DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cabang_id) REFERENCES cabang(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS kandidat_pendidikan (
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
  )`,
  `CREATE TABLE IF NOT EXISTS kandidat_pengalaman_kerja (
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
  )`,
  `CREATE TABLE IF NOT EXISTS kandidat_keluarga (
    id INT PRIMARY KEY AUTO_INCREMENT,
    kandidat_id INT NOT NULL,
    hubungan ENUM('Ayah', 'Ibu', 'Suami', 'Istri', 'Kakak', 'Adik', 'Lainnya') NOT NULL,
    nama VARCHAR(200),
    usia INT,
    pekerjaan VARCHAR(150),
    penghasilan VARCHAR(50),
    urutan INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kandidat_id) REFERENCES kandidat_profil(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS kandidat_dokumen (
    id INT PRIMARY KEY AUTO_INCREMENT,
    kandidat_id INT NOT NULL,
    jenis_dokumen VARCHAR(50) NOT NULL,
    nama_file VARCHAR(255),
    path_file VARCHAR(500),
    ukuran_file INT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kandidat_id) REFERENCES kandidat_profil(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS job_order (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nomor VARCHAR(50),
    perusahaan_id INT,
    tanggal_terbit DATE,
    detail_job_order TEXT,
    bidang_ssw VARCHAR(100),
    nama_grup VARCHAR(200),
    link_grup VARCHAR(500),
    biaya_awal DECIMAL(15,2) DEFAULT 0,
    biaya_akhir DECIMAL(15,2) DEFAULT 0,
    tanggal_cv DATE,
    pic_cv VARCHAR(100),
    tanggal_mensetsu_1 DATE,
    tanggal_mensetsu_2 DATE,
    tanggal_mensetsu_3 DATE,
    status_kelulusan ENUM('Menunggu', 'Lulus', 'Tidak Lulus', 'Tidak Hadir') DEFAULT 'Menunggu',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (perusahaan_id) REFERENCES perusahaan(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS job_order_kandidat (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_order_id INT NOT NULL,
    kandidat_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_order_id) REFERENCES job_order(id) ON DELETE CASCADE,
    FOREIGN KEY (kandidat_id) REFERENCES kandidat_profil(id) ON DELETE CASCADE,
    UNIQUE KEY unique_job_kandidat (job_order_id, kandidat_id)
  )`,
  `CREATE TABLE IF NOT EXISTS cv_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    email VARCHAR(150),
    cabang_id INT,
    batch VARCHAR(50),
    no_telepon VARCHAR(20),
    no_orang_tua VARCHAR(20),
    bidang_sertifikasi VARCHAR(100),
    bidang_sertifikasi_lainnya VARCHAR(200),
    program_pertanian_kawakami VARCHAR(10),
    sertifikat_files TEXT,
    pas_foto TEXT,
    pas_foto_cv VARCHAR(500),
    nama_lengkap_romaji VARCHAR(200),
    nama_lengkap_katakana VARCHAR(200),
    nama_panggilan_romaji VARCHAR(100),
    nama_panggilan_katakana VARCHAR(100),
    jenis_kelamin VARCHAR(50),
    agama VARCHAR(50),
    agama_lainnya VARCHAR(100),
    tanggal_lahir DATE,
    tempat_lahir VARCHAR(100),
    usia VARCHAR(10),
    alamat_lengkap TEXT,
    provinsi VARCHAR(100),
    kabupaten VARCHAR(100),
    kecamatan VARCHAR(100),
    kelurahan VARCHAR(100),
    email_aktif VARCHAR(150),
    status_perkawinan VARCHAR(50),
    status_perkawinan_lainnya VARCHAR(100),
    golongan_darah VARCHAR(10),
    surat_izin_mengimori VARCHAR(10),
    jenis_sim VARCHAR(50),
    merokok VARCHAR(10),
    minum_alkohol VARCHAR(10),
    bertato VARCHAR(10),
    tinggi_badan VARCHAR(10),
    berat_badan VARCHAR(10),
    ukuran_pinggang VARCHAR(10),
    ukuran_sepatu VARCHAR(10),
    ukuran_atasan_baju VARCHAR(10),
    ukuran_atasan_baju_lainnya VARCHAR(50),
    ukuran_celana VARCHAR(10),
    tangan_dominan VARCHAR(20),
    kemampuan_penglihatan_mata VARCHAR(50),
    kemampuan_pendengaran VARCHAR(50),
    kemampuan_penglihatan_mata_lainnya VARCHAR(50),
    sudah_vaksin_berapa_kali VARCHAR(50),
    sudah_vaksin_berapa_kali_lainnya VARCHAR(100),
    kesehatan_badan VARCHAR(50),
    penyakit_cedera_masa_lalu TEXT,
    hobi TEXT,
    rencana_sumber_biaya_keberangkatan VARCHAR(100),
    perkiraan_biaya VARCHAR(100),
    Biaya_keberangkatan_sebelumnya_jisshu VARCHAR(100),
    lama_belajar_di_mendunia VARCHAR(100),
    kemampuan_bahasa_jepang VARCHAR(10),
    kemampuan_pemahaman_ssw VARCHAR(10),
    kelincahan_dalam_bekerja VARCHAR(10),
    kekuatan_tindakan VARCHAR(10),
    kemampuan_berbahasa_inggris VARCHAR(10),
    kemampuan_berbahasa_inggris_lainnya VARCHAR(50),
    kebugaran_jasmani_seminggu VARCHAR(50),
    kebugaran_jasmani_seminggu_lainnya VARCHAR(100),
    bersedia_kerja_shift VARCHAR(10),
    bersedia_lembur VARCHAR(10),
    bersedia_hari_libur VARCHAR(10),
    menggunakan_kacamata VARCHAR(10),
    ada_keluarga_di_jepang VARCHAR(10),
    hubungan_keluarga_di_jepang VARCHAR(100),
    status_kerabat_di_jepang VARCHAR(100),
    status_kerabat_di_jepang_lainnya VARCHAR(100),
    ingin_bekerja_berapa_tahun VARCHAR(50),
    ingin_bekerja_berapa_tahun_lainnya VARCHAR(100),
    ingin_pulang_berapa_kali VARCHAR(50),
    kelebihan_diri TEXT,
    komentar_guru_kelebihan_diri TEXT,
    kekurangan_diri TEXT,
    komentar_guru_kekurangan_diri TEXT,
    ketertarikan_terhadap_jepang TEXT,
    orang_yang_dihormati TEXT,
    point_plus_diri TEXT,
    keahlian_khusus TEXT,
    istri_nama VARCHAR(200),
    istri_usia VARCHAR(10),
    istri_pekerjaan VARCHAR(100),
    anak_nama VARCHAR(200),
    anak_jenis_kelamin VARCHAR(20),
    anak_usia VARCHAR(10),
    anak_pendidikan VARCHAR(100),
    ibu_nama VARCHAR(200),
    ibu_usia VARCHAR(10),
    ibu_pekerjaan VARCHAR(100),
    ayah_nama VARCHAR(200),
    ayah_usia VARCHAR(10),
    ayah_pekerjaan VARCHAR(100),
    kakak_nama VARCHAR(200),
    kakak_usia VARCHAR(10),
    kakak_jenis_kelamin VARCHAR(20),
    kakak_pekerjaan VARCHAR(100),
    kakak_status VARCHAR(50),
    adik_nama VARCHAR(200),
    adik_usia VARCHAR(10),
    adik_jenis_kelamin VARCHAR(20),
    adik_pekerjaan VARCHAR(100),
    adik_status VARCHAR(50),
    rata_rata_penghasilan_keluarga VARCHAR(50),
    gaji_keluarga VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
  )`,
  `CREATE TABLE IF NOT EXISTS pendaftaran_sistem_lama (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(200) NOT NULL,
    nik VARCHAR(50) NOT NULL UNIQUE,
    jenis_kelamin ENUM('Laki-laki', 'Perempuan') NULL,
    agama VARCHAR(50) NULL,
    tempat_lahir VARCHAR(100) NULL,
    tempat_tanggal_lahir VARCHAR(100) NULL,
    pendidikan_terakhir VARCHAR(100) NULL,
    status VARCHAR(50) NULL,
    id_prometric VARCHAR(100) NULL,
    status_jft VARCHAR(50) NULL,
    status_ssw VARCHAR(50) NULL,
    verifikasi VARCHAR(50) NULL,
    foto VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    cabang_id INT NULL,
    FOREIGN KEY (cabang_id) REFERENCES cabang(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS notification_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone_number VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS kandidat_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    kandidat_id INT NOT NULL,
    admin_id INT,
    admin_nama VARCHAR(200),
    action_type ENUM('create', 'update', 'delete', 'status_change', 'dokumen', 'interview', 'komentar') NOT NULL,
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kandidat_id) REFERENCES kandidat_profil(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS migrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`
];

const seeds = [
  `INSERT INTO cabang (nama_cabang, kode_cabang, kota, status) VALUES 
    ('Kantor Pusat', 'PUSAT', 'Jakarta', 'aktif'),
    ('Cabang Bandung', 'BDG', 'Bandung', 'aktif'),
    ('Cabang Surabaya', 'SBY', 'Surabaya', 'aktif')`,
  `INSERT INTO users (nama, email, password, role, cabang_id) VALUES 
    ('Admin Penempatan', 'admin@kandidat.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin_penempatan', NULL),
    ('Admin Bandung', 'admin.bdg@kandidat.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin_cabang', 2)`
];

async function dropAllTables(conn) {
  const [tables] = await conn.query('SHOW TABLES');
  if (tables.length === 0) {
    console.log('📭 No tables to drop.');
    return;
  }

  console.log(`🗑️  Dropping ${tables.length} table(s)...`);
  
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  
  for (const table of tables) {
    const tableName = Object.values(table)[0];
    await conn.query(`DROP TABLE IF EXISTS \`${tableName}\``);
    console.log(`   Dropped: ${tableName}`);
  }
  
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('✅ All tables dropped.\n');
}

async function runMigrations(conn) {
  console.log('📦 Creating tables...\n');
  
  for (const sql of migrations) {
    const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
    console.log(`▶ Creating: ${tableName}`);
    await conn.query(sql);
    console.log(`   ✅ Done\n`);
  }
  
  console.log('🌱 Running seeds...\n');
  
  for (const sql of seeds) {
    console.log(`▶ Seeding data...`);
    await conn.query(sql);
    console.log(`   ✅ Done\n`);
  }
  
  console.log('🎉 migrate:fresh completed!');
}

async function fresh() {
  let connection;
  try {
    console.log('🔄 Starting migrate:fresh...\n');
    connection = await pool.getConnection();
    
    await dropAllTables(connection);
    await runMigrations(connection);
    
  } catch (error) {
    console.error('❌ Fresh migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
}

fresh();
