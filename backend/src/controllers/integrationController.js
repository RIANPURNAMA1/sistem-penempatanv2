const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const cache = require('../utils/cache');

// ============================================================
// HELPER UNTUK INPUT DATA FORMULIR (via API key)
// ============================================================

const toNull = (val) => (val === '' || val === undefined || val === null ? null : val);

const toDateOnly = (val) => {
  if (!val || val === '') return null;
  try {
    return new Date(val).toISOString().split('T')[0];
  } catch {
    return null;
  }
};

const toBool = (val) => {
  if (val === true || val === 1 || val === '1' || val === 'true') return 1;
  if (val === false || val === 0 || val === '0' || val === 'false') return 0;
  return null;
};

const BOOL_FIELDS = [
  'sudah_vaksin', 'berkacamata', 'lensa_kontak', 'buta_warna', 'bertato',
  'merokok', 'minum_alkohol', 'pernah_ke_jepang', 'keluarga_di_jepang',
  'kenalan_di_jepang', 'bersedia_shift', 'bersedia_lembur', 'bersedia_hari_libur',
];

const PROFIL_FIELDS = [
  'cabang_id', 'nama_katakana', 'nama_romaji', 'tempat_lahir', 'tanggal_lahir',
  'umur', 'jenis_kelamin', 'status_pernikahan', 'jumlah_anak', 'agama',
  'tinggi_badan', 'berat_badan', 'golongan_darah', 'tangan_dominan', 'ukuran_baju',
  'lingkar_pinggang', 'panjang_telapak_kaki', 'sim_dimiliki', 'nomor_hp',
  'email_kontak', 'alamat_lengkap', 'kontak_ortu_nama', 'kontak_ortu_hp',
  'sudah_vaksin', 'penglihatan_kanan', 'penglihatan_kiri', 'berkacamata',
  'lensa_kontak', 'buta_warna', 'kondisi_kesehatan', 'riwayat_penyakit',
  'bertato', 'merokok', 'minum_alkohol', 'intensitas_alkohol', 'pendidikan_terakhir',
  'pernah_ke_jepang', 'keluarga_di_jepang', 'hubungan_keluarga_jepang',
  'status_kerabat_jepang', 'kontak_keluarga_jepang', 'kenalan_di_jepang',
  'kenalan_jepang_detail', 'level_jlpt', 'level_jft', 'sertifikat_ssw',
  'lama_belajar_jepang', 'level_bahasa_jepang', 'id_prometric', 'password_prometric',
  'tujuan_ke_jepang', 'alasan_ke_jepang', 'cita_cita_setelah_jepang',
  'rencana_pengiriman_uang', 'kelebihan_diri', 'kekurangan_diri', 'hobi',
  'keahlian', 'bersedia_shift', 'bersedia_lembur', 'bersedia_hari_libur',
  'lama_tinggal_jepang', 'lama_kerja_perusahaan', 'rencana_pulang',
  'sumber_biaya', 'biaya_disiapkan', 'status_formulir', 'status_progres',
];

const saveKandidatData = async (conn, kandidatId, body) => {
  const { pendidikan, pengalaman, keluarga, penghasilan_keluarga, ...profileData } = body;

  if (Array.isArray(profileData.sertifikat_ssw)) {
    profileData.sertifikat_ssw = profileData.sertifikat_ssw.join(', ');
  }

  const updates = {};
  PROFIL_FIELDS.forEach((f) => {
    if (profileData[f] === undefined) return;
    if (f === 'tanggal_lahir') updates[f] = toDateOnly(profileData[f]);
    else if (BOOL_FIELDS.includes(f)) updates[f] = toBool(profileData[f]);
    else updates[f] = toNull(profileData[f]);
  });
  if (penghasilan_keluarga !== undefined) updates['penghasilan_keluarga'] = toNull(penghasilan_keluarga);

  if (Object.keys(updates).length) {
    const setClause = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
    await conn.query(
      `UPDATE kandidat_profil SET ${setClause} WHERE id = ?`,
      [...Object.values(updates), kandidatId]
    );
  }

  if (pendidikan && Array.isArray(pendidikan)) {
    await conn.query('DELETE FROM kandidat_pendidikan WHERE kandidat_id = ?', [kandidatId]);
    for (const p of pendidikan) {
      if (p.nama_sekolah || p.jenjang) {
        await conn.query(
          `INSERT INTO kandidat_pendidikan
           (kandidat_id, jenjang, nama_sekolah, bulan_masuk, tahun_masuk, bulan_lulus, tahun_lulus, jurusan)
           VALUES (?,?,?,?,?,?,?,?)`,
          [
            kandidatId,
            p.jenjang || null,
            p.nama_sekolah || null,
            p.bulan_masuk || null,
            toNull(p.tahun_masuk),
            p.bulan_lulus || null,
            toNull(p.tahun_lulus),
            p.jurusan || null,
          ]
        );
      }
    }
  }

  if (pengalaman && Array.isArray(pengalaman)) {
    await conn.query('DELETE FROM kandidat_pengalaman_kerja WHERE kandidat_id = ?', [kandidatId]);
    for (const p of pengalaman) {
      if (p.nama_perusahaan) {
        await conn.query(
          `INSERT INTO kandidat_pengalaman_kerja
           (kandidat_id, nama_perusahaan, alamat_perusahaan, posisi, bulan_masuk, tahun_masuk, bulan_keluar, tahun_keluar, masih_bekerja, deskripsi_pekerjaan)
           VALUES (?,?,?,?,?,?,?,?,?,?)`,
          [
            kandidatId,
            p.nama_perusahaan || null,
            p.alamat_perusahaan || null,
            p.posisi || null,
            p.bulan_masuk || null,
            toNull(p.tahun_masuk),
            p.bulan_keluar || null,
            toNull(p.tahun_keluar),
            toBool(p.masih_bekerja),
            p.deskripsi_pekerjaan || null,
          ]
        );
      }
    }
  }

  if (keluarga && Array.isArray(keluarga)) {
    await conn.query('DELETE FROM kandidat_keluarga WHERE kandidat_id = ?', [kandidatId]);
    for (const k of keluarga) {
      if (k.nama || k.hubungan) {
        await conn.query(
          `INSERT INTO kandidat_keluarga
           (kandidat_id, hubungan, nama, usia, pekerjaan, penghasilan, urutan)
           VALUES (?,?,?,?,?,?,?)`,
          [
            kandidatId,
            k.hubungan || null,
            k.nama || null,
            toNull(k.usia),
            k.pekerjaan || null,
            toNull(k.penghasilan),
            k.urutan || 1,
          ]
        );
      }
    }
  }
};

// ============================================================
// BUAT / ISI FORMULIR PENDAFTARAN KANDIDAT BARU
// POST /api/integrasi/kandidat
// ============================================================
const createKandidat = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { email, nama_romaji, nama_katakana, cabang_id } = req.body;

    if (!nama_romaji && !nama_katakana) {
      return res.status(400).json({ success: false, message: 'nama_romaji atau nama_katakana wajib diisi' });
    }

    await conn.beginTransaction();

    const namaUser = nama_romaji || nama_katakana;
    let userId = null;

    if (email) {
      const [userRows] = await conn.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
      if (userRows.length) {
        userId = userRows[0].id;
      } else {
        const [newUser] = await conn.query(
          'INSERT INTO users (email, nama, password, role) VALUES (?, ?, ?, ?)',
          [email, namaUser, await bcrypt.hash('12345678', 10), 'kandidat']
        );
        userId = newUser.insertId;
      }
    } else {
      const dummyEmail = `${namaUser.replace(/\s+/g, '').toLowerCase()}_${Date.now()}@kandidat.com`;
      const [newUser] = await conn.query(
        'INSERT INTO users (email, nama, password, role) VALUES (?, ?, ?, ?)',
        [dummyEmail, namaUser, await bcrypt.hash('12345678', 10), 'kandidat']
      );
      userId = newUser.insertId;
    }

    const [existingProfil] = await conn.query(
      'SELECT id FROM kandidat_profil WHERE user_id = ?',
      [userId]
    );

    let kandidatId;
    if (existingProfil.length) {
      kandidatId = existingProfil[0].id;
      await saveKandidatData(conn, kandidatId, req.body);
    } else {
      const [insert] = await conn.query(
        `INSERT INTO kandidat_profil
         (user_id, cabang_id, nama_romaji, nama_katakana, status_formulir, status_progres)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          toNull(cabang_id),
          toNull(nama_romaji),
          toNull(nama_katakana),
          req.body.status_formulir || 'draft',
          req.body.status_progres || 'Pending',
        ]
      );
      kandidatId = insert.insertId;
      await saveKandidatData(conn, kandidatId, req.body);
    }

    await conn.commit();
    await cache.delByPrefix('kandidat');

    res.status(201).json({
      success: true,
      message: 'Data formulir kandidat berhasil disimpan',
      data: { id: kandidatId },
    });
  } catch (err) {
    await conn.rollback();
    console.error('[INTEGRASI] Error createKandidat:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
};

// ============================================================
// UPDATE DATA FORMULIR KANDIDAT BY ID
// PUT /api/integrasi/kandidat/:id
// ============================================================
const updateKandidatById = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const kandidatId = parseInt(req.params.id);
    if (!kandidatId) {
      return res.status(400).json({ success: false, message: 'ID kandidat tidak valid' });
    }

    const [rows] = await conn.query(
      'SELECT id FROM kandidat_profil WHERE id = ? AND deleted_at IS NULL',
      [kandidatId]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Kandidat tidak ditemukan' });
    }

    await conn.beginTransaction();
    await saveKandidatData(conn, kandidatId, req.body);
    await conn.commit();
    await cache.delByPrefix('kandidat');

    res.json({
      success: true,
      message: 'Data formulir kandidat berhasil diupdate',
      data: { id: kandidatId },
    });
  } catch (err) {
    await conn.rollback();
    console.error('[INTEGRASI] Error updateKandidatById:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
};

// ============================================================
// UPLOAD DOKUMEN KANDIDAT
// POST /api/integrasi/kandidat/:id/upload-dokumen?jenis_dokumen=...
// (multipart/form-data, field: file)
// ============================================================
const uploadDokumen = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File tidak ditemukan' });
    }

    const kandidatId = parseInt(req.params.id);
    const jenis_dokumen = req.body.jenis_dokumen || req.query.jenis_dokumen;

    if (!jenis_dokumen) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'jenis_dokumen wajib diisi' });
    }

    const [kandidat] = await pool.query(
      'SELECT id FROM kandidat_profil WHERE id = ? AND deleted_at IS NULL',
      [kandidatId]
    );
    if (!kandidat.length) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Kandidat tidak ditemukan' });
    }

    const normalizedPath = req.file.path
      .replace(/\\/g, '/')
      .replace(/^.*?uploads\//, '');

    await pool.query(
      'DELETE FROM kandidat_dokumen WHERE kandidat_id = ? AND jenis_dokumen = ?',
      [kandidatId, jenis_dokumen]
    );

    await pool.query(
      'INSERT INTO kandidat_dokumen (kandidat_id, jenis_dokumen, nama_file, path_file, ukuran_file, mime_type) VALUES (?,?,?,?,?,?)',
      [kandidatId, jenis_dokumen, req.file.originalname, normalizedPath, req.file.size, req.file.mimetype]
    );

    await cache.delByPrefix('kandidat');

    res.json({
      success: true,
      message: 'Dokumen berhasil diupload',
      path: normalizedPath,
      size: `${(req.file.size / 1024).toFixed(2)} KB`,
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('[INTEGRASI] Error uploadDokumen:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// HAPUS DOKUMEN KANDIDAT
// DELETE /api/integrasi/kandidat/:id/dokumen?jenis_dokumen=...
// ============================================================
const deleteDokumen = async (req, res) => {
  try {
    const kandidatId = parseInt(req.params.id);
    const jenis_dokumen = req.query.jenis_dokumen;

    if (!jenis_dokumen) {
      return res.status(400).json({ success: false, message: 'jenis_dokumen wajib diisi' });
    }

    const [docs] = await pool.query(
      'SELECT id, path_file FROM kandidat_dokumen WHERE kandidat_id = ? AND jenis_dokumen = ?',
      [kandidatId, jenis_dokumen]
    );
    if (!docs.length) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }

    const filePath = path.join(__dirname, '..', '..', 'uploads', docs[0].path_file);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query('DELETE FROM kandidat_dokumen WHERE id = ?', [docs[0].id]);
    await cache.delByPrefix('kandidat');

    res.json({ success: true, message: 'Dokumen berhasil dihapus' });
  } catch (err) {
    console.error('[INTEGRASI] Error deleteDokumen:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const PUBLIC_FIELDS = `
  kp.id,
  kp.nama_katakana,
  kp.nama_romaji,
  kp.tempat_lahir,
  kp.tanggal_lahir,
  kp.umur,
  kp.jenis_kelamin,
  kp.status_pernikahan,
  kp.jumlah_anak,
  kp.agama,
  kp.tinggi_badan,
  kp.berat_badan,
  kp.golongan_darah,
  kp.nomor_hp,
  kp.email_kontak,
  kp.alamat_lengkap,
  kp.pendidikan_terakhir,
  kp.level_jlpt,
  kp.level_jft,
  kp.sertifikat_ssw,
  kp.level_bahasa_jepang,
  kp.status_formulir,
  kp.status_progres,
  kp.status_keberangkatan,
  kp.nama_perusahaan,
  kp.bidang_ssw,
  kp.institusi,
  kp.created_at,
  kp.updated_at,
  TRIM(c.nama_cabang) as nama_cabang
`;

const getKandidat = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      status,
      status_progres,
      jenis_kelamin,
      cabang_id,
      bidang_ssw,
      jenjang,
    } = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 50, 1), 200);
    const offset = (pageNum - 1) * limitNum;

    let where = 'WHERE kp.deleted_at IS NULL';
    const params = [];

    if (search) {
      where += ' AND (kp.nama_romaji LIKE ? OR kp.nama_katakana LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      where += ' AND kp.status_formulir = ?';
      params.push(status);
    }
    if (status_progres) {
      where += ' AND kp.status_progres = ?';
      params.push(status_progres);
    }
    if (jenis_kelamin) {
      where += ' AND kp.jenis_kelamin = ?';
      params.push(jenis_kelamin);
    }
    if (cabang_id) {
      where += ' AND kp.cabang_id = ?';
      params.push(cabang_id);
    }
    if (bidang_ssw) {
      where += ' AND kp.sertifikat_ssw LIKE ?';
      params.push(`%${bidang_ssw}%`);
    }
    if (jenjang) {
      where += ' AND kp.pendidikan_terakhir = ?';
      params.push(jenjang);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM kandidat_profil kp ${where}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT ${PUBLIC_FIELDS}
       FROM kandidat_profil kp
       LEFT JOIN cabang c ON kp.cabang_id = c.id
       ${where}
       ORDER BY kp.updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('[INTEGRASI] Error getKandidat:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getKandidatById = async (req, res) => {
  try {
    const cacheKey = `integrasi_kandidat:${req.params.id}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const [rows] = await pool.query(
      `SELECT kp.*, TRIM(c.nama_cabang) as nama_cabang
       FROM kandidat_profil kp
       LEFT JOIN cabang c ON kp.cabang_id = c.id
       WHERE kp.id = ? AND kp.deleted_at IS NULL`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }

    const id = req.params.id;

    const [pendidikan] = await pool.query(
      'SELECT jenjang, nama_sekolah, jurusan, bulan_masuk, tahun_masuk, bulan_lulus, tahun_lulus FROM kandidat_pendidikan WHERE kandidat_id = ? ORDER BY FIELD(jenjang,"SD","SMP","SMA/SMK","Perguruan Tinggi")',
      [id]
    );

    const [pengalaman] = await pool.query(
      'SELECT nama_perusahaan, alamat_perusahaan, posisi, bulan_masuk, tahun_masuk, bulan_keluar, tahun_keluar, masih_bekerja, deskripsi_pekerjaan FROM kandidat_pengalaman_kerja WHERE kandidat_id = ? ORDER BY tahun_masuk DESC',
      [id]
    );

    const [keluarga] = await pool.query(
      'SELECT hubungan, nama, usia, pekerjaan, penghasilan FROM kandidat_keluarga WHERE kandidat_id = ? ORDER BY FIELD(hubungan,"Suami","Istri","Ayah","Ibu","Kakak","Adik","Lainnya")',
      [id]
    );

    const [dokumenRows] = await pool.query(
      'SELECT jenis_dokumen, nama_file, path_file, mime_type, ukuran_file, uploaded_at FROM kandidat_dokumen WHERE kandidat_id = ? ORDER BY uploaded_at DESC',
      [id]
    );

    const fileBase = `${req.protocol}://${req.get('host')}`;
    const dokumen = dokumenRows.map(d => {
      const normalized = String(d.path_file || '').replace(/\\/g, '/').replace(/^\.\//, '');
      const rel = normalized.startsWith('uploads/') ? `/${normalized}` : `/uploads/${normalized}`;
      return { ...d, file_url: `${fileBase}${rel}` };
    });

    const result = { ...rows[0], nama_cabang: rows[0].nama_cabang || null, pendidikan, pengalaman, keluarga, dokumen };
    await cache.set(cacheKey, result, 30);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[INTEGRASI] Error getKandidatById:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// DAFTAR CABANG
// GET /api/integrasi/cabang
// ============================================================
const getCabang = async (req, res) => {
  try {
    const { search, status } = req.query;

    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (nama_cabang LIKE ? OR kode_cabang LIKE ? OR kota LIKE ? OR provinsi LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      where += ' AND status = ?';
      params.push(status);
    }

    const [rows] = await pool.query(
      `SELECT id, nama_cabang, kode_cabang, alamat, kota, provinsi, telepon, email, status
       FROM cabang
       ${where}
       ORDER BY nama_cabang ASC`,
      params
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[INTEGRASI] Error getCabang:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// DETAIL CABANG
// GET /api/integrasi/cabang/:id
// ============================================================
const getCabangById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nama_cabang, kode_cabang, alamat, kota, provinsi, telepon, email, status
       FROM cabang
       WHERE id = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Cabang tidak ditemukan' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[INTEGRASI] Error getCabangById:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// DASHBOARD / STATISTIK
// GET /api/integrasi/dashboard
// ============================================================
const getDashboard = async (req, res) => {
  try {
    const { start_date, end_date, filter_type, cabang_id } = req.query;

    let dateFilter = '';
    const dateParams = [];

    if (filter_type === 'today') {
      dateFilter = ' AND DATE(kp.created_at) = ?';
      dateParams.push(new Date().toISOString().split('T')[0]);
    } else if (filter_type === 'yesterday') {
      dateFilter = ' AND DATE(kp.created_at) = ?';
      dateParams.push(new Date(Date.now() - 86400000).toISOString().split('T')[0]);
    } else if (filter_type === 'week') {
      dateFilter = ' AND DATE(kp.created_at) >= ?';
      dateParams.push(new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);
    } else if (filter_type === 'month') {
      dateFilter = ' AND DATE(kp.created_at) >= ?';
      dateParams.push(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]);
    } else if (start_date && end_date) {
      dateFilter = ' AND DATE(kp.created_at) BETWEEN ? AND ?';
      dateParams.push(start_date, end_date);
    }

    let whereClause = dateFilter ? `WHERE 1=1${dateFilter}` : '';
    const params = [...dateParams];

    if (cabang_id) {
      whereClause += whereClause ? ' AND kp.cabang_id = ?' : 'WHERE kp.cabang_id = ?';
      params.push(cabang_id);
    }

    const [total] = await pool.query(
      `SELECT COUNT(*) as total FROM kandidat_profil kp ${whereClause}`,
      params
    );

    const allStatusWhere = whereClause || 'WHERE 1=1';
    const [byStatus] = await pool.query(
      `SELECT status_formulir, COUNT(*) as count FROM kandidat_profil kp ${allStatusWhere} GROUP BY status_formulir`,
      params
    );

    const approvedWhere = whereClause
      ? whereClause + ` AND kp.status_formulir = ${pool.escape('approved')}`
      : `WHERE kp.status_formulir = ${pool.escape('approved')}`;

    const [byCabang] = await pool.query(
      `SELECT TRIM(c.nama_cabang) as nama_cabang, COUNT(kp.id) as count
       FROM kandidat_profil kp
       LEFT JOIN cabang c ON kp.cabang_id = c.id
       ${approvedWhere}
       GROUP BY kp.cabang_id, c.nama_cabang`,
      params
    );

    const [allProfiles] = await pool.query(
      `SELECT kp.sertifikat_ssw, kp.jenis_kelamin, kp.status_progres, c.nama_cabang
       FROM kandidat_profil kp
       LEFT JOIN cabang c ON kp.cabang_id = c.id
       ${approvedWhere}`,
      params
    );

    const sswList = [
      'Pengolahan Makanan', 'Pertanian', 'Gaishoku', 'Kaigo (perawat)',
      'Building Cleaning', 'Restoran', 'Driver', 'Perhotelah',
      'Perbaikan dan Perawatan Mobil', 'Konstruksi', 'Perikanan',
    ];
    const progresList = [
      'Job Matching', 'Pending', 'lamar ke perusahaan', 'Interview',
      'Jadwalkan Interview Ulang', 'Lulus interview', 'Gagal Interview',
      'Pemberkasan', 'Berangkat', 'Ditolak',
    ];

    const bySSWGender = [];
    const bySSWProgres = [];

    sswList.forEach((ssw) => {
      const bySSW = allProfiles.filter((p) => {
        if (!p.sertifikat_ssw) return false;
        return p.sertifikat_ssw.split(',').map((s) => s.trim()).includes(ssw);
      });
      const laki = bySSW.filter((p) => p.jenis_kelamin === 'Laki-laki').length;
      const perempuan = bySSW.filter((p) => p.jenis_kelamin === 'Perempuan').length;
      bySSWGender.push({ ssw, laki, perempuan, total: laki + perempuan });

      const progresCounts = Object.fromEntries(progresList.map((p) => [p, 0]));
      bySSW.forEach((p) => {
        const key = p.status_progres || 'Pending';
        if (progresCounts[key] !== undefined) progresCounts[key]++;
      });
      bySSWProgres.push({
        ssw,
        progres: Object.entries(progresCounts).map(([status, count]) => ({ status, count })),
      });
    });

    const [byCabangProgres] = await pool.query(
      `SELECT TRIM(c.nama_cabang) as nama_cabang, kp.status_progres, COUNT(kp.id) as count
       FROM kandidat_profil kp
       LEFT JOIN cabang c ON kp.cabang_id = c.id
       ${whereClause} AND kp.status_formulir = 'approved'
       GROUP BY kp.cabang_id, c.nama_cabang, kp.status_progres
       ORDER BY c.nama_cabang, kp.status_progres`,
      params
    );

    const jftWhere = whereClause ? whereClause : 'WHERE 1=1';

    const [jftByGender] = await pool.query(
      `SELECT kp.jenis_kelamin,
        COUNT(DISTINCT CASE WHEN jft.id IS NOT NULL THEN kp.id END) as has_jft,
        COUNT(DISTINCT CASE WHEN jft.id IS NULL THEN kp.id END) as no_jft
       FROM kandidat_profil kp
       LEFT JOIN kandidat_dokumen jft ON jft.kandidat_id = kp.id AND jft.jenis_dokumen = 'sertifikat_jft'
       ${jftWhere} GROUP BY kp.jenis_kelamin`,
      params
    );

    const [jftByCabang] = await pool.query(
      `SELECT c.nama_cabang,
        COUNT(DISTINCT CASE WHEN jft.id IS NOT NULL THEN kp.id END) as has_jft,
        COUNT(DISTINCT CASE WHEN jft.id IS NULL THEN kp.id END) as no_jft
       FROM kandidat_profil kp
       LEFT JOIN kandidat_dokumen jft ON jft.kandidat_id = kp.id AND jft.jenis_dokumen = 'sertifikat_jft'
       LEFT JOIN cabang c ON kp.cabang_id = c.id
       ${whereClause} GROUP BY kp.cabang_id, c.nama_cabang ORDER BY c.nama_cabang`,
      params
    );

    const [sswByGender] = await pool.query(
      `SELECT kp.jenis_kelamin,
        COUNT(DISTINCT CASE WHEN ssw.id IS NOT NULL THEN kp.id END) as has_ssw,
        COUNT(DISTINCT CASE WHEN ssw.id IS NULL THEN kp.id END) as no_ssw
       FROM kandidat_profil kp
       LEFT JOIN kandidat_dokumen ssw ON ssw.kandidat_id = kp.id AND ssw.jenis_dokumen LIKE 'ssw_%'
       ${jftWhere} GROUP BY kp.jenis_kelamin`,
      params
    );

    const [sswByCabang] = await pool.query(
      `SELECT c.nama_cabang,
        COUNT(DISTINCT CASE WHEN ssw.id IS NOT NULL THEN kp.id END) as has_ssw,
        COUNT(DISTINCT CASE WHEN ssw.id IS NULL THEN kp.id END) as no_ssw
       FROM kandidat_profil kp
       LEFT JOIN kandidat_dokumen ssw ON ssw.kandidat_id = kp.id AND ssw.jenis_dokumen LIKE 'ssw_%'
       LEFT JOIN cabang c ON kp.cabang_id = c.id
       ${whereClause} GROUP BY kp.cabang_id, c.nama_cabang ORDER BY c.nama_cabang`,
      params
    );

    let interviewFilter = '';
    const interviewParams = [];

    if (filter_type === 'today') {
      interviewFilter = ' AND DATE(kh.created_at) = ?';
      interviewParams.push(new Date().toISOString().split('T')[0]);
    } else if (filter_type === 'yesterday') {
      interviewFilter = ' AND DATE(kh.created_at) = ?';
      interviewParams.push(new Date(Date.now() - 86400000).toISOString().split('T')[0]);
    } else if (filter_type === 'week') {
      interviewFilter = ' AND DATE(kh.created_at) >= ?';
      interviewParams.push(new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);
    } else if (filter_type === 'month') {
      interviewFilter = ' AND DATE(kh.created_at) >= ?';
      interviewParams.push(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]);
    } else if (start_date && end_date) {
      interviewFilter = ' AND DATE(kh.created_at) BETWEEN ? AND ?';
      interviewParams.push(start_date, end_date);
    }

    if (cabang_id) {
      interviewFilter += ' AND kp.cabang_id = ?';
      interviewParams.push(cabang_id);
    }

    const [interviewByCabang] = await pool.query(
      `SELECT c.nama_cabang,
        COUNT(DISTINCT CASE WHEN kh.field_name = 'status_progres' AND kh.new_value = 'Interview' AND kp.jenis_kelamin = 'Laki-laki' THEN kh.kandidat_id END) as interview_laki,
        COUNT(DISTINCT CASE WHEN kh.field_name = 'status_progres' AND kh.new_value = 'Interview' AND kp.jenis_kelamin = 'Perempuan' THEN kh.kandidat_id END) as interview_perempuan,
        COUNT(DISTINCT CASE WHEN kh.field_name = 'status_progres' AND kh.new_value = 'Jadwalkan Interview Ulang' AND kp.jenis_kelamin = 'Laki-laki' THEN kh.kandidat_id END) as jadwalkan_laki,
        COUNT(DISTINCT CASE WHEN kh.field_name = 'status_progres' AND kh.new_value = 'Jadwalkan Interview Ulang' AND kp.jenis_kelamin = 'Perempuan' THEN kh.kandidat_id END) as jadwalkan_perempuan,
        COUNT(DISTINCT CASE WHEN kh.field_name = 'status_progres' AND kh.new_value = 'Lulus interview' AND kp.jenis_kelamin = 'Laki-laki' THEN kh.kandidat_id END) as lulus_laki,
        COUNT(DISTINCT CASE WHEN kh.field_name = 'status_progres' AND kh.new_value = 'Lulus interview' AND kp.jenis_kelamin = 'Perempuan' THEN kh.kandidat_id END) as lulus_perempuan
       FROM kandidat_history kh
       JOIN kandidat_profil kp ON kh.kandidat_id = kp.id
       LEFT JOIN cabang c ON kp.cabang_id = c.id
       WHERE kh.field_name = 'status_progres' ${interviewFilter}
       GROUP BY kp.cabang_id, c.nama_cabang
       ORDER BY c.nama_cabang`,
      interviewParams
    );

    const [interviewByGender] = await pool.query(
      `SELECT kp.jenis_kelamin,
        COUNT(DISTINCT CASE WHEN kp.status_progres IN ('Interview', 'Jadwalkan Interview Ulang') THEN kp.id END) as interview,
        COUNT(DISTINCT CASE WHEN kp.status_progres = 'Lulus interview' THEN kp.id END) as lulus
       FROM kandidat_profil kp
       ${jftWhere}
       GROUP BY kp.jenis_kelamin`,
      params
    );

    const result = {
      total: total[0].total,
      byStatus,
      byCabang,
      bySSWGender,
      bySSWProgres,
      byCabangProgres,
      jftByGender,
      jftByCabang,
      sswByGender,
      sswByCabang,
      interviewByCabang,
      interviewByGender,
    };

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[INTEGRASI] Error getDashboard:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getApiClients = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, nama_sistem, api_key, active, last_used_at, created_at, updated_at
      FROM api_clients
      ORDER BY created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[API KEY] Error getApiClients:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createApiClient = async (req, res) => {
  try {
    const { nama_sistem } = req.body;
    if (!nama_sistem || !nama_sistem.trim()) {
      return res.status(400).json({ success: false, message: 'Nama sistem wajib diisi' });
    }

    const apiKey = `mendunia_${crypto.randomBytes(24).toString('hex')}`;

    const [result] = await pool.query(
      'INSERT INTO api_clients (nama_sistem, api_key) VALUES (?, ?)',
      [nama_sistem.trim(), apiKey]
    );

    res.status(201).json({
      success: true,
      message: 'API key berhasil dibuat',
      data: {
        id: result.insertId,
        nama_sistem: nama_sistem.trim(),
        api_key: apiKey,
        active: 1,
      },
    });
  } catch (err) {
    console.error('[API KEY] Error createApiClient:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateApiClient = async (req, res) => {
  try {
    const { nama_sistem, active } = req.body;
    const [existing] = await pool.query('SELECT id FROM api_clients WHERE id = ?', [req.params.id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'API key tidak ditemukan' });
    }

    const updates = [];
    const values = [];

    if (nama_sistem !== undefined) {
      if (!nama_sistem.trim()) {
        return res.status(400).json({ success: false, message: 'Nama sistem tidak boleh kosong' });
      }
      updates.push('nama_sistem = ?');
      values.push(nama_sistem.trim());
    }
    if (active !== undefined) {
      updates.push('active = ?');
      values.push(active ? 1 : 0);
    }

    if (updates.length) {
      values.push(req.params.id);
      await pool.query(`UPDATE api_clients SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    res.json({ success: true, message: 'API key berhasil diupdate' });
  } catch (err) {
    console.error('[API KEY] Error updateApiClient:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const regenerateApiKey = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM api_clients WHERE id = ?', [req.params.id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'API key tidak ditemukan' });
    }

    const apiKey = `mendunia_${crypto.randomBytes(24).toString('hex')}`;
    await pool.query('UPDATE api_clients SET api_key = ? WHERE id = ?', [apiKey, req.params.id]);

    res.json({ success: true, message: 'API key berhasil digenerate ulang', api_key: apiKey });
  } catch (err) {
    console.error('[API KEY] Error regenerateApiKey:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteApiClient = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM api_clients WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'API key tidak ditemukan' });
    }
    res.json({ success: true, message: 'API key berhasil dihapus' });
  } catch (err) {
    console.error('[API KEY] Error deleteApiClient:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getKandidat, getKandidatById, createKandidat, updateKandidatById, uploadDokumen, deleteDokumen, getCabang, getCabangById, getDashboard, getApiClients, createApiClient, updateApiClient, regenerateApiKey, deleteApiClient };
