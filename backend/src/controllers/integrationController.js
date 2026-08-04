const crypto = require('crypto');
const pool = require('../config/database');
const cache = require('../utils/cache');

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

module.exports = { getKandidat, getKandidatById, getApiClients, createApiClient, updateApiClient, regenerateApiKey, deleteApiClient };
