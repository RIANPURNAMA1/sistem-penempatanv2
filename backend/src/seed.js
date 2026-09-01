/**
 * KANDIDAT SEEDER - 300 DATA FAKE
 * RUN: node src/seed.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// =======================
// DATA GENERATOR
// =======================
const firstNames = ['Ahmad', 'Budi', 'Dedi', 'Eko', 'Fajar', 'Galih', 'Hadi', 'Indra', 'Joko', 'Kurnia', 'Lukman', 'Nico', 'Oki', 'Putra', 'Rian', 'Sandi', 'Toni', 'Umar', 'Vino', 'Wibowo'];
const lastNames = ['Saputra', 'Wijaya', 'Kurniawan', 'Setiawan', 'Pratama', 'Santosa', 'Utomo', 'Hermawan', 'Susanto', 'Nugroho'];
const femaleNames = ['Anita', 'Bella', 'Citra', 'Dewi', 'Eka', 'Fitri', 'Gita', 'Hani', 'Intan', 'Jasmine', 'Kartika', 'Lina', 'Maryam', 'Nadia', 'Olivia', 'Putri', 'Rina', 'Siti', 'Tika', 'Vina'];
const femaleLastNames = ['Saputri', 'Wijayanti', 'Kurniasih', 'Setiawati', 'Pratika', 'Santika', 'Utami', 'Hermawati', 'Susanti', 'Nugroho'];
const cities = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang', 'Tangerang', 'Depok', 'Bekasi', 'Bogor', 'Yogyakarta', 'Malang', 'Solo'];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBool = (p = 0.5) => Math.random() < p;

const generateNama = (isFemale = false) =>
  isFemale
    ? `${randomChoice(femaleNames)} ${randomChoice(femaleLastNames)}`
    : `${randomChoice(firstNames)} ${randomChoice(lastNames)}`;

const generateNoHP = () => `08${randomInt(7, 9)}${randomInt(100000000, 999999999)}`;
const generateEmail = (nama) => {
  const clean = nama.toLowerCase().replace(/ /g, '.');
  const unique = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  return `${clean}_${unique}@gmail.com`;
};

// =======================
// MAIN SEEDER
// =======================
async function runSeeder() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kandidat_db'
  });

  console.log('🗑️ Deleting existing kandidat data...');
  await db.execute('DELETE FROM kandidat_keluarga');
  await db.execute('DELETE FROM kandidat_pengalaman_kerja');
  await db.execute('DELETE FROM kandidat_pendidikan');
  await db.execute('DELETE FROM kandidat_profil');
  await db.execute('DELETE FROM users WHERE role = "kandidat"');
  console.log('✅ Existing data deleted');

  const [cabangRows] = await db.execute('SELECT id FROM cabang LIMIT 1');
  const cabangId = cabangRows[0]?.id || 1;

  console.log('🌱 Seeding 300 kandidat data...');

  for (let i = 1; i <= 300; i++) {
    const isFemale = randomBool(0.4);
    const nama = generateNama(isFemale);
    const kandidatEmail = generateEmail(nama);
    const kota = randomChoice(cities);
    const umur = randomInt(18, 35);

    const tgllahir = `${new Date().getFullYear() - umur}-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`;

    // =======================
    // INSERT USERS (FIX insertId)
    // =======================
    const [userResult] = await db.query(
      `INSERT INTO users (nama, email, password, role, cabang_id, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nama, kandidatEmail, '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP', 'kandidat', cabangId, 'aktif']
    );

    const userId = userResult.insertId;

const ssw_options = [
      "Pengolahan Makanan",
      "Pertanian",
      "Gaishoku",
      "Kaigo (perawat)",
      "Building Cleaning",
      "Restoran",
      "Driver",
      "Perhotelah",
      "Perikanan",
      "Perbaikan dan Perawatan Mobil",
      "Konstruksi",
    ];

    const sswValue = randomChoice(ssw_options);
    const shiftValue = randomBool(0.7) ? 1 : 0;
    const lemburValue = randomBool(0.7) ? 1 : 0;
    const statusFormulir = randomChoice(['draft', 'submitted', 'reviewed', 'approved']);
    const statusProgres = randomChoice(['Job Matching', 'Pending', 'lamar ke perusahaan', 'Interview', 'Pemberkasan']);
    const jkValue = randomChoice(['Laki-laki', 'Perempuan']);
    const nikahValue = randomChoice(['Menikah', 'Belum Menikah']);
    const agamaValue = randomChoice(['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha']);
    const jlptValue = randomChoice(['N5', 'N4', 'N3', 'N2']);
    const jftValue = randomChoice(['EFT-1', 'EFT-2']);

    await db.query(
      `INSERT INTO kandidat_profil (
        user_id, cabang_id, nama_romaji, tempat_lahir, tanggal_lahir, umur,
        jenis_kelamin, status_pernikahan, jumlah_anak,
        agama, tinggi_badan, berat_badan, nomor_hp, email_kontak,
        level_jlpt, level_jft, sertifikat_ssw, bersedia_shift, bersedia_lembur,
        status_formulir, status_progres, password_akun
      ) VALUES (${userId}, ${cabangId}, '${nama}', '${kota}', '${tgllahir}', ${umur}, '${jkValue}', '${nikahValue}', ${randomInt(0, 3)}, '${agamaValue}', ${randomInt(155, 180)}, ${randomInt(45, 80)}, '${generateNoHP()}', '${kandidatEmail}', '${jlptValue}', '${jftValue}', '${sswValue}', ${shiftValue}, ${lemburValue}, '${statusFormulir}', '${statusProgres}', '12345678')`
    );

    const [profilResult] = await db.query('SELECT LAST_INSERT_ID() as id');
    const kandidatProfilId = profilResult[0].id;

    // =======================
    // PENDIDIKAN
    // =======================
    const numPendidikan = randomInt(1, 2);
    for (let j = 0; j < numPendidikan; j++) {
      const thnMasuk = randomInt(2010, 2022);
      await db.query(
        `INSERT INTO kandidat_pendidikan 
        (kandidat_id, jenjang, nama_sekolah, tahun_masuk, tahun_lulus) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          kandidatProfilId,
          randomChoice(['SD', 'SMP', 'SMA/SMK', 'Perguruan Tinggi']),
          `SMA/N ${randomChoice(cities)}`,
          thnMasuk,
          thnMasuk + randomInt(3, 6)
        ]
      );
    }

    if (randomBool(0.6)) {
      const num = randomInt(1, 2);
      for (let j = 0; j < num; j++) {
        const thnMasuk = randomInt(2015, 2023);
        const masih = j === 0 && randomBool(0.3);

        await db.query(
          `INSERT INTO kandidat_pengalaman_kerja 
          (kandidat_id, nama_perusahaan, posisi, tahun_masuk, tahun_keluar, masih_bekerja) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            kandidatProfilId,
            `PT ${randomChoice(['Maju', 'Sejahtera', 'Jaya', 'Makmur'])}`,
            randomChoice(['Operator', 'Staff', 'Marketing', 'Admin']),
            thnMasuk,
            masih ? null : thnMasuk + randomInt(1, 4),
            masih ? 1 : 0
          ]
        );
      }
    }

    const numKeluarga = randomInt(2, 4);
    const hubArr = ['Ayah', 'Ibu'];
    if (randomBool(0.3)) hubArr.push('Kakak');
    if (randomBool(0.3)) hubArr.push('Adik');

    for (let j = 0; j < numKeluarga; j++) {
      await db.query(
        `INSERT INTO kandidat_keluarga 
        (kandidat_id, hubungan, nama, usia, pekerjaan) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          kandidatProfilId,
          hubArr[j] || 'Lainnya',
          generateNama(false),
          randomInt(40, 70),
          randomChoice(['Petani', 'Wiraswasta', 'Karyawan', 'IRT'])
        ]
      );
    }

    if (i % 50 === 0) console.log(`✅ Seeded ${i} kandidat...`);
  }

  console.log('🎉 Successfully seeded 300 kandidat data!');
  await db.end();
}

runSeeder().catch(err => {
  console.error('❌ Seeder error:', err);
  process.exit(1);
});