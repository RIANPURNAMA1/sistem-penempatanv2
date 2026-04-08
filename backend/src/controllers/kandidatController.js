const pool = require('../config/database');

// Get all kandidat (admin penempatan = semua, admin cabang = cabangnya saja)
const getAll = async (req, res) => {
  try {
    const { search, status, cabang_id, jenis_kelamin, umur_min, umur_max, bidang_ssw, status_progres, jenjang } = req.query;
    const user = req.user;
    let query = `
      SELECT kp.*, u.nama, u.email, u.status as user_status, c.nama_cabang, kp.pendidikan_terakhir,
        (SELECT path_file FROM kandidat_dokumen WHERE kandidat_id = kp.id AND jenis_dokumen = 'pas_foto' LIMIT 1) as pas_foto
      FROM kandidat_profil kp
      JOIN users u ON kp.user_id = u.id
      LEFT JOIN cabang c ON kp.cabang_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (user.role === 'admin_cabang') {
      query += ' AND kp.cabang_id = ?';
      params.push(user.cabang_id);
    } else if (cabang_id) {
      query += ' AND kp.cabang_id = ?';
      params.push(cabang_id);
    }
    if (search) { query += ' AND (u.nama LIKE ? OR kp.nama_romaji LIKE ? OR kp.nama_katakana LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (status) { query += ' AND kp.status_formulir = ?'; params.push(status); }
    if (jenis_kelamin) { query += ' AND kp.jenis_kelamin = ?'; params.push(jenis_kelamin); }
    if (umur_min) { query += ' AND kp.umur >= ?'; params.push(parseInt(umur_min)); }
    if (umur_max) { query += ' AND kp.umur <= ?'; params.push(parseInt(umur_max)); }
    if (status_progres) { query += ' AND kp.status_progres = ?'; params.push(status_progres); }
    if (bidang_ssw) { query += ' AND kp.sertifikat_ssw LIKE ?'; params.push(`%${bidang_ssw}%`); }
    if (jenjang) { query += ' AND kp.pendidikan_terakhir = ?'; params.push(jenjang); }
    query += ' ORDER BY kp.updated_at DESC';
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getById = async (req, res) => {
  try {
    const user = req.user;
    const [profil] = await pool.query(`
      SELECT kp.*, u.nama, u.email, c.nama_cabang
      FROM kandidat_profil kp
      JOIN users u ON kp.user_id = u.id
      LEFT JOIN cabang c ON kp.cabang_id = c.id
      WHERE kp.id = ?
    `, [req.params.id]);
    if (!profil.length) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    if (user.role === 'admin_cabang' && profil[0].cabang_id !== user.cabang_id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }
    const [pendidikan] = await pool.query('SELECT * FROM kandidat_pendidikan WHERE kandidat_id = ? ORDER BY FIELD(jenjang,"SD","SMP","SMA/SMK","Perguruan Tinggi")', [profil[0].id]);
    const [pengalaman] = await pool.query('SELECT * FROM kandidat_pengalaman_kerja WHERE kandidat_id = ? ORDER BY tahun_masuk DESC', [profil[0].id]);
    const [keluarga] = await pool.query('SELECT * FROM kandidat_keluarga WHERE kandidat_id = ? ORDER BY FIELD(hubungan,"Ayah","Ibu","Kakak","Adik","Lainnya"), urutan', [profil[0].id]);
    const [dokumen] = await pool.query('SELECT * FROM kandidat_dokumen WHERE kandidat_id = ?', [profil[0].id]);
    res.json({ success: true, data: { ...profil[0], pendidikan, pengalaman, keluarga, dokumen } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const [profil] = await pool.query(`
      SELECT kp.*, u.nama, u.email, c.nama_cabang
      FROM kandidat_profil kp
      JOIN users u ON kp.user_id = u.id
      LEFT JOIN cabang c ON kp.cabang_id = c.id
      WHERE kp.user_id = ?
    `, [req.user.id]);
    if (!profil.length) return res.status(404).json({ success: false, message: 'Profil tidak ditemukan' });
    const [pendidikan] = await pool.query('SELECT * FROM kandidat_pendidikan WHERE kandidat_id = ?', [profil[0].id]);
    const [pengalaman] = await pool.query('SELECT * FROM kandidat_pengalaman_kerja WHERE kandidat_id = ?', [profil[0].id]);
    const [keluarga] = await pool.query('SELECT * FROM kandidat_keluarga WHERE kandidat_id = ? ORDER BY FIELD(hubungan,"Ayah","Ibu","Kakak","Adik","Lainnya"), urutan', [profil[0].id]);
    const [dokumen] = await pool.query('SELECT * FROM kandidat_dokumen WHERE kandidat_id = ?', [profil[0].id]);
    res.json({ success: true, data: { ...profil[0], pendidikan, pengalaman, keluarga, dokumen } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateMyProfile = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { pendidikan, pengalaman, keluarga, penghasilan_keluarga, ...profileData } = req.body;
    const [existing] = await conn.query('SELECT id FROM kandidat_profil WHERE user_id = ?', [req.user.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Profil tidak ditemukan' });
    const kandidatId = existing[0].id;

    // Build dynamic update
    const allowedFields = [
      'nama_katakana','nama_romaji','tempat_lahir','tanggal_lahir','umur','jenis_kelamin',
      'status_pernikahan','jumlah_anak','agama','tinggi_badan','berat_badan','golongan_darah',
      'tangan_dominan','ukuran_baju','lingkar_pinggang','panjang_telapak_kaki','sim_dimiliki',
      'nomor_hp','email_kontak','alamat_lengkap','kontak_ortu_nama','kontak_ortu_hp',
      'sudah_vaksin','penglihatan_kanan','penglihatan_kiri','berkacamata','lensa_kontak',
      'buta_warna','kondisi_kesehatan','riwayat_penyakit','bertato','merokok','minum_alkohol','intensitas_alkohol',
      'pendidikan_terakhir',
      'pernah_ke_jepang','keluarga_di_jepang','hubungan_keluarga_jepang','status_kerabat_jepang',
      'kontak_keluarga_jepang','kenalan_di_jepang','kenalan_jepang_detail',
      'level_jlpt','level_jft','sertifikat_ssw','lama_belajar_jepang','level_bahasa_jepang','id_prometric','password_prometric',
      'tujuan_ke_jepang','alasan_ke_jepang','cita_cita_setelah_jepang','rencana_pengiriman_uang',
      'kelebihan_diri','kekurangan_diri','hobi','keahlian','bersedia_shift','bersedia_lembur',
      'bersedia_hari_libur','lama_tinggal_jepang','lama_kerja_perusahaan','rencana_pulang',
      'sumber_biaya','biaya_disiapkan','status_formulir'
    ];
    const updates = {};
    allowedFields.forEach(f => { if (profileData[f] !== undefined) updates[f] = profileData[f]; });
    if (penghasilan_keluarga !== undefined) updates['penghasilan_keluarga'] = penghasilan_keluarga;

    if (Object.keys(updates).length > 0) {
      const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      await conn.query(`UPDATE kandidat_profil SET ${setClause} WHERE id = ?`, [...Object.values(updates), kandidatId]);
    }

    // Update pendidikan
    if (pendidikan && Array.isArray(pendidikan)) {
      await conn.query('DELETE FROM kandidat_pendidikan WHERE kandidat_id = ?', [kandidatId]);
      for (const p of pendidikan) {
        if (p.nama_sekolah || p.jenjang) {
          await conn.query('INSERT INTO kandidat_pendidikan (kandidat_id, jenjang, nama_sekolah, bulan_masuk, tahun_masuk, bulan_lulus, tahun_lulus, jurusan) VALUES (?,?,?,?,?,?,?,?)',
            [kandidatId, p.jenjang, p.nama_sekolah, p.bulan_masuk, p.tahun_masuk, p.bulan_lulus, p.tahun_lulus, p.jurusan]);
        }
      }
    }

    // Update pengalaman
    if (pengalaman && Array.isArray(pengalaman)) {
      await conn.query('DELETE FROM kandidat_pengalaman_kerja WHERE kandidat_id = ?', [kandidatId]);
      for (const p of pengalaman) {
        if (p.nama_perusahaan) {
          await conn.query('INSERT INTO kandidat_pengalaman_kerja (kandidat_id, nama_perusahaan, alamat_perusahaan, posisi, bulan_masuk, tahun_masuk, bulan_keluar, tahun_keluar, masih_bekerja, deskripsi_pekerjaan) VALUES (?,?,?,?,?,?,?,?,?,?)',
            [kandidatId, p.nama_perusahaan, p.alamat_perusahaan, p.posisi, p.bulan_masuk, p.tahun_masuk, p.bulan_keluar, p.tahun_keluar, p.masih_bekerja || false, p.deskripsi_pekerjaan]);
        }
      }
    }

    // Update keluarga
    if (keluarga && Array.isArray(keluarga)) {
      await conn.query('DELETE FROM kandidat_keluarga WHERE kandidat_id = ?', [kandidatId]);
      for (const k of keluarga) {
        if (k.nama || k.hubungan) {
          await conn.query('INSERT INTO kandidat_keluarga (kandidat_id, hubungan, nama, usia, pekerjaan, urutan) VALUES (?,?,?,?,?,?)',
            [kandidatId, k.hubungan, k.nama, k.usia, k.pekerjaan, k.urutan || 1]);
        }
      }
    }

    await conn.commit();
    res.json({ success: true, message: 'Profil berhasil diupdate' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status_formulir, catatan_admin } = req.body;
    const validStatus = ['draft', 'submitted', 'reviewed', 'approved', 'rejected'];
    if (!validStatus.includes(status_formulir)) return res.status(400).json({ success: false, message: 'Status tidak valid' });
    await pool.query('UPDATE kandidat_profil SET status_formulir = ?, catatan_admin = ? WHERE id = ?', [status_formulir, catatan_admin, req.params.id]);
    res.json({ success: true, message: 'Status berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateProgres = async (req, res) => {
  try {
    const { status_progres, catatan_progres } = req.body;
    const validProgres = ['Job Matching', 'Pending', 'lamar ke perusahaan', 'Interview', 'Jadwalkan Interview Ulang', 'Lulus interview', 'Gagal Interview', 'Pemberkasan', 'Berangkat', 'Ditolak'];
    if (!validProgres.includes(status_progres)) return res.status(400).json({ success: false, message: 'Status progres tidak valid' });
    await pool.query('UPDATE kandidat_profil SET status_progres = ?, catatan_progres = ? WHERE id = ?', [status_progres, catatan_progres, req.params.id]);
    res.json({ success: true, message: 'Progres berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const submitForm = async (req, res) => {
  try {
    const [profil] = await pool.query('SELECT id FROM kandidat_profil WHERE user_id = ?', [req.user.id]);
    if (!profil.length) return res.status(404).json({ success: false, message: 'Profil tidak ditemukan' });
    await pool.query('UPDATE kandidat_profil SET status_formulir = "submitted" WHERE id = ?', [profil[0].id]);
    res.json({ success: true, message: 'Formulir berhasil dikirim' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const uploadDokumen = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'File tidak ditemukan' });
    const { jenis_dokumen } = req.body;
    const [profil] = await pool.query('SELECT id FROM kandidat_profil WHERE user_id = ?', [req.user.id]);
    if (!profil.length) return res.status(404).json({ success: false, message: 'Profil tidak ditemukan' });
    // Normalize path for Windows (replace backslash with forward slash)
    const normalizedPath = req.file.path.replace(/\\/g, '/');
    // Delete old if exists
    await pool.query('DELETE FROM kandidat_dokumen WHERE kandidat_id = ? AND jenis_dokumen = ?', [profil[0].id, jenis_dokumen]);
    await pool.query(
      'INSERT INTO kandidat_dokumen (kandidat_id, jenis_dokumen, nama_file, path_file, ukuran_file, mime_type) VALUES (?,?,?,?,?,?)',
      [profil[0].id, jenis_dokumen, req.file.originalname, normalizedPath, req.file.size, req.file.mimetype]
    );
    res.json({ success: true, message: 'Dokumen berhasil diupload', path: normalizedPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getStats = async (req, res) => {
  try {
    const user = req.user;
    let whereClause = '';
    const params = [];
    if (user.role === 'admin_cabang') { whereClause = 'WHERE kp.cabang_id = ?'; params.push(user.cabang_id); }

    const [total] = await pool.query(`SELECT COUNT(*) as total FROM kandidat_profil kp ${whereClause}`, params);
    const [byStatus] = await pool.query(`SELECT status_formulir, COUNT(*) as count FROM kandidat_profil kp ${whereClause} GROUP BY status_formulir`, params);
    const [byCabang] = await pool.query(`SELECT c.nama_cabang, COUNT(kp.id) as count FROM kandidat_profil kp LEFT JOIN cabang c ON kp.cabang_id = c.id ${whereClause} GROUP BY kp.cabang_id, c.nama_cabang`, params);
    
    const [allProfiles] = await pool.query(`
      SELECT kp.sertifikat_ssw, kp.jenis_kelamin 
      FROM kandidat_profil kp 
      ${whereClause}
    `, params);

    const sswList = ['Pengolahan Makanan', 'Pertanian', 'Kaigo (perawat)', 'Building Cleaning', 'Restoran', 'Driver'];
    const bySSWGender = [];
    
    sswList.forEach(ssw => {
      const laki = allProfiles.filter(p => {
        if (!p.sertifikat_ssw || !p.jenis_kelamin) return false;
        const sswArray = p.sertifikat_ssw.split(',').map(s => s.trim());
        return sswArray.includes(ssw) && p.jenis_kelamin === 'Laki-laki';
      }).length;
      
      const perempuan = allProfiles.filter(p => {
        if (!p.sertifikat_ssw || !p.jenis_kelamin) return false;
        const sswArray = p.sertifikat_ssw.split(',').map(s => s.trim());
        return sswArray.includes(ssw) && p.jenis_kelamin === 'Perempuan';
      }).length;
      
      bySSWGender.push({ ssw, laki, perempuan });
    });

    res.json({ success: true, data: { total: total[0].total, byStatus, byCabang, bySSWGender } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAll, getById, getMyProfile, updateMyProfile, updateStatus, updateProgres, submitForm, uploadDokumen, getStats };
