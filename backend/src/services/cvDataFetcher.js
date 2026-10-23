const pool = require('../config/database');
const { CATALOG, GROUP_FIELDS } = require('../config/cvFields');
const fmt = require('./cvFormatter');

const emptyToNull = (v) => {
  if (v === undefined || v === null) return null;
  if (typeof v === 'string' && v.trim() === '') return null;
  return v;
};

/**
 * Ambil data kandidat lengkap untuk keperluan generate CV.
 * Mengembalikan object profil datar (semua placeholder terisi) + array anak.
 */
async function getKandidatFull(kandidatId) {
  const conn = pool;

  // Profil + user + cabang
  const [profilRows] = await conn.query(
    `SELECT kp.*,
            u.nama AS user_nama,
            u.email AS user_email,
            c.nama_cabang AS cabang
     FROM kandidat_profil kp
     JOIN users u ON u.id = kp.user_id
     LEFT JOIN cabang c ON c.id = kp.cabang_id
     WHERE kp.id = ?`,
    [kandidatId]
  );
  if (profilRows.length === 0) return null;
  const profil = profilRows[0];

  // Foto utama: prefer pas_foto, fallback ke foto full body / dokumen gambar lain.
  const [fotoRows] = await conn.query(
    `SELECT path_file, mime_type, nama_file, jenis_dokumen
     FROM kandidat_dokumen
     WHERE kandidat_id = ? AND jenis_dokumen IN ('pas_foto', 'foto_full_body')
     ORDER BY FIELD(jenis_dokumen, 'pas_foto', 'foto_full_body'), uploaded_at DESC
     LIMIT 1`,
    [kandidatId]
  );
  let foto = fotoRows[0] || null;
  if (!foto) {
    const [imgRows] = await conn.query(
      `SELECT path_file, mime_type, nama_file, jenis_dokumen
       FROM kandidat_dokumen
       WHERE kandidat_id = ? AND mime_type LIKE 'image/%'
       ORDER BY uploaded_at DESC
       LIMIT 1`,
      [kandidatId]
    );
    foto = imgRows[0] || null;
  }

  // Semua dokumen
  const [dokumenRows] = await conn.query(
    `SELECT * FROM kandidat_dokumen WHERE kandidat_id = ? ORDER BY uploaded_at DESC`,
    [kandidatId]
  );

  // Anak-anak
  const [pendidikanRows] = await conn.query(
    `SELECT * FROM kandidat_pendidikan WHERE kandidat_id = ?
     ORDER BY FIELD(jenjang, "SD","SMP","SMA/SMK","Perguruan Tinggi"), tahun_lulus DESC`,
    [kandidatId]
  );
  const [pengalamanRows] = await conn.query(
    `SELECT * FROM kandidat_pengalaman_kerja WHERE kandidat_id = ?
     ORDER BY tahun_masuk DESC`,
    [kandidatId]
  );
  const [keluargaRows] = await conn.query(
    `SELECT * FROM kandidat_keluarga WHERE kandidat_id = ?
     ORDER BY FIELD(hubungan, "Ayah","Ibu","Suami","Istri","Kakak","Adik","Lainnya"), urutan`,
    [kandidatId]
  );

  const data = { ...profil };

  // ---- Dokumen upload -> placeholder {dokumen_<jenis_dokumen>} ----
  // Jenis dokumen pertama (paling baru) dipakai bila ada duplikat.
  const dokumenMap = {};
  dokumenRows.forEach((row) => {
    const jenis = String(row.jenis_dokumen || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');
    if (!jenis || dokumenMap[jenis]) return;
    const doc = {
      id: row.id,
      jenis_dokumen: jenis,
      nama_file: row.nama_file || null,
      path_file: row.path_file || null,
      mime_type: row.mime_type || null,
    };
    dokumenMap[jenis] = doc;
    data[`dokumen_${jenis}`] = doc;
  });
  // Sertifikat SSW pertama juga bisa dipakai lewat placeholder generik.
  if (!data.dokumen_sertifikat_ssw && data.dokumen_ssw_1) {
    data.dokumen_sertifikat_ssw = data.dokumen_ssw_1;
  }

  // ---- Alias umum yang sering dipakai di template ----
  data.nama = profil.nama_romaji || profil.user_nama || null;
  data.email = profil.email_kontak || profil.user_email || null;
  data.alamat = profil.alamat_lengkap || null;
  data.no_hp = profil.nomor_hp || null;
  data.tinggi = profil.tinggi_badan;
  data.berat = profil.berat_badan;
  data.status_nikah = profil.status_pernikahan || null;
  data.sim_status = profil.sim_dimiliki || null;
  data.kontak_darurat_telp = profil.kontak_ortu_hp || null;
  data.kontak_darurat_hubungan = null; // ditentukan setelah data keluarga diambil
  data.kelebihan = profil.kelebihan_diri || null;
  data.kekurangan = profil.kekurangan_diri || null;
  data.jlpt_level = profil.level_jlpt || null;
  data.nama_cv = profil.nama_romaji || profil.user_nama || null;

  // ---- Nilai turunan ----
  const birth = fmt.parseDate(profil.tanggal_lahir);
  data.tanggal_lahir_parsed = birth;
  data.usia = birth ? fmt.age(birth) : (profil.umur ?? null);

  // ---- Nilai khusus placeholder (tidak punya kolom sendiri di profil) ----
  data.ukuran_sepatu = profil.panjang_telapak_kaki ?? null;
  data.paspor = profil.terbit_paspor ? 'Sudah punya' : 'Belum punya';
  const jlpt = String(profil.level_jlpt || '').trim();
  data.jlpt_ada = jlpt && !/belum|tidak ada|none|nihil|tanpa/i.test(jlpt) ? 'Ada' : 'Tidak ada';
  data.kerabat_usia = null;
  // Riwayat kriminal / operasi: tidak ada di model data → dianggap "tidak ada".
  data.kriminal_ada = 'Tidak';
  data.kriminal_detail = null;
  data.operasi_ada = 'Tidak';
  data.operasi_detail = null;
  // Riwayat penyakit: diturunkan dari kolom riwayat_penyakit.
  const penyakit = String(profil.riwayat_penyakit || '').trim();
  data.penyakit_ada = !penyakit || /tidak ada|nihil|none|tidak/i.test(penyakit) ? 'Tidak' : 'Ada';
  // Data paspor & nomor peserta: belum tersedia di model data.
  data.nomor_paspor = null;
  data.paspor_kadaluarsa = null;
  data.nomor_peserta = null;
  data.tanggal_buat_bulan = null;
  data.tanggal_buat_tahun = null;
  data.tanggal_buat_hari = null;
  // LPK = cabang tempat kandidat terdaftar.
  data.lpk_nama = profil.cabang || null;
  data.lpk_mulai_bulan = null;
  data.lpk_mulai_tahun = null;
  data.lpk_selesai_bulan = null;
  data.lpk_selesai_tahun = null;

  // Alias profile field -> kunci kanonik, supaya {alias} dan {kanonik} sama-sama jalan.
  Object.entries(CATALOG).forEach(([key, meta]) => {
    if (meta.source !== 'profile' || !meta.aliasOf) return;
    if (emptyToNull(data[key]) === null && emptyToNull(data[meta.aliasOf]) !== null) {
      data[key] = data[meta.aliasOf];
    }
  });

  // ---- Data grup berulang ----
  const setGroup = (group, index, canonicalSub, value, aliasSubs = []) => {
    data[`${group}_${index}_${canonicalSub}`] = value;
    aliasSubs.forEach((a) => {
      data[`${group}_${index}_${a}`] = value;
    });
  };

  pendidikanRows.slice(0, GROUP_FIELDS.pendidikan.max).forEach((row, i) => {
    const n = i + 1;
    const mulai = { bulan: row.bulan_masuk, tahun: row.tahun_masuk };
    const selesai = { bulan: row.bulan_lulus, tahun: row.tahun_lulus };
    // Untuk perguruan tinggi, jenjang yang tampil = tingkat (D3/D4/S1/S2/S3).
    const jenjang =
      row.jenjang === 'Perguruan Tinggi' && row.jenjang_detail
        ? row.jenjang_detail
        : row.jenjang || null;
    setGroup('pendidikan', n, 'jenjang', jenjang);
    setGroup('pendidikan', n, 'nama_sekolah', row.nama_sekolah || null, ['sekolah']);
    setGroup('pendidikan', n, 'jurusan', row.jurusan || null);
    setGroup('pendidikan', n, 'mulai', mulai);
    setGroup('pendidikan', n, 'selesai', selesai);
    setGroup('pendidikan', n, 'periode', { mulai, selesai });
  });

  pengalamanRows.slice(0, GROUP_FIELDS.kerja.max).forEach((row, i) => {
    const n = i + 1;
    const mulai = { bulan: row.bulan_masuk, tahun: row.tahun_masuk };
    const selesai = row.masih_bekerja
      ? { bulan: null, tahun: null, masih_bekerja: true }
      : { bulan: row.bulan_keluar, tahun: row.tahun_keluar };
    setGroup('kerja', n, 'perusahaan', row.nama_perusahaan || null, ['nama_perusahaan']);
    setGroup('kerja', n, 'posisi', row.posisi || null, ['jenis']);
    setGroup('kerja', n, 'deskripsi', row.deskripsi_pekerjaan || null, ['deskripsi_pekerjaan']);
    setGroup('kerja', n, 'mulai', mulai);
    setGroup('kerja', n, 'selesai', selesai);
    setGroup('kerja', n, 'periode', { mulai, selesai });
  });

  keluargaRows.slice(0, GROUP_FIELDS.keluarga.max).forEach((row, i) => {
    const n = i + 1;
    setGroup('keluarga', n, 'hubungan', row.hubungan || null);
    setGroup('keluarga', n, 'nama', row.nama || null);
    setGroup('keluarga', n, 'usia', row.usia ?? null);
    setGroup('keluarga', n, 'pekerjaan', row.pekerjaan || null);
    setGroup('keluarga', n, 'penghasilan', row.penghasilan || null, ['gaji']);
  });

  // Hubungan kontak darurat: cari di daftar keluarga (Ayah/Ibu) bila namanya cocok.
  if (profil.kontak_ortu_nama) {
    const target = String(profil.kontak_ortu_nama).trim().toLowerCase();
    const match = keluargaRows.find(
      (row) => String(row.nama || '').trim().toLowerCase() === target
    );
    if (match && match.hubungan) data.kontak_darurat_hubungan = match.hubungan;
    else data.kontak_darurat_hubungan = 'Orang Tua';
  }

  return {
    kandidatId,
    profil: data,
    foto,
    pendidikan: pendidikanRows,
    pengalaman: pengalamanRows,
    keluarga: keluargaRows,
    dokumen: dokumenRows,
  };
}

module.exports = { getKandidatFull };
