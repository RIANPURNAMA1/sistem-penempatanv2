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
    
    const [old] = await pool.query('SELECT status_formulir FROM kandidat_profil WHERE id = ?', [req.params.id]);
    const oldValue = old.length ? old[0].status_formulir : null;
    
    await pool.query('UPDATE kandidat_profil SET status_formulir = ?, catatan_admin = ? WHERE id = ?', [status_formulir, catatan_admin, req.params.id]);
    
    await addHistory(
      req.params.id,
      req.user?.id || null,
      req.user?.nama || 'System',
      'status_formulir',
      'status_formulir',
      oldValue,
      status_formulir,
      `Mengubah status formulir dari "${oldValue}" menjadi "${status_formulir}"`
    );
    
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
    
    const [old] = await pool.query('SELECT status_progres FROM kandidat_profil WHERE id = ?', [req.params.id]);
    const oldValue = old.length ? old[0].status_progres : null;
    
    await pool.query('UPDATE kandidat_profil SET status_progres = ?, catatan_progres = ? WHERE id = ?', [status_progres, catatan_progres, req.params.id]);
    
    await addHistory(
      req.params.id,
      req.user?.id || null,
      req.user?.nama || 'System',
      'status_progres',
      'status_progres',
      oldValue,
      status_progres,
      `Mengubah progres dari "${oldValue || 'null'}" menjadi "${status_progres}"`
    );
    
    res.json({ success: true, message: 'Progres berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateKeberangkatan = async (req, res) => {
  try {
    const { status_keberangkatan } = req.body;
    const validStatus = ['stay', 'keluar', 'terbang'];
    if (!validStatus.includes(status_keberangkatan)) {
      return res.status(400).json({ success: false, message: 'Status keberangkatan tidak valid' });
    }
    
    const [old] = await pool.query('SELECT status_keberangkatan FROM kandidat_profil WHERE id = ?', [req.params.id]);
    const oldValue = old.length ? old[0].status_keberangkatan : null;
    
    await pool.query('UPDATE kandidat_profil SET status_keberangkatan = ? WHERE id = ?', [status_keberangkatan, req.params.id]);
    
    await addHistory(
      req.params.id,
      req.user?.id || null,
      req.user?.nama || 'System',
      'status_keberangkatan',
      'status_keberangkatan',
      oldValue,
      status_keberangkatan,
      `Mengubah status keberangkatan dari "${oldValue || 'null'}" menjadi "${status_keberangkatan}"`
    );
    
    res.json({ success: true, message: 'Status keberangkatan berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateProgresLengkap = async (req, res) => {
  try {
    const fields = [
      'status_progres', 'nama_perusahaan', 'bidang_ssw', 'detail_pekerjaan',
      'jadwal_interview', 'catatan_interview', 'tgl_setsumeikai', 'tgl_mensetsu_1',
      'tgl_mensetsu_2', 'catatan_mensetsu', 'biaya_pemberkasan', 'adm_tahap_1',
      'adm_tahap_2', 'dokumen_dikirim', 'terbit_kontrak', 'kontrak_dikirim_tsk',
      'terbit_paspor', 'masuk_imigrasi', 'coe_terbit', 'ektkln_pembuatan',
      'dokumen_dikirim_2', 'visa', 'jadwal_penerbangan'
    ];
    
    const updates = [];
    const values = [];
    
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data untuk diupdate' });
    }
    
    values.push(req.params.id);
    await pool.query(`UPDATE kandidat_profil SET ${updates.join(', ')} WHERE id = ?`, values);
    
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        const fieldLabels = {
          status_progres: 'Status Progres',
          nama_perusahaan: 'Nama Perusahaan',
          bidang_ssw: 'Bidang SSW',
          detail_pekerjaan: 'Detail Pekerjaan',
          jadwal_interview: 'Jadwal Interview',
          catatan_interview: 'Catatan Interview',
          tgl_setsumeikai: 'TGL Setsumeikai',
          tgl_mensetsu_1: 'TGL Mensetsu 1',
          tgl_mensetsu_2: 'TGL Mensetsu 2',
          catatan_mensetsu: 'Catatan Mensetsu',
          biaya_pemberkasan: 'Biaya Pemberkasan',
          adm_tahap_1: 'ADM Tahap 1',
          adm_tahap_2: 'ADM Tahap 2',
          dokumen_dikirim: 'Dok. Dikirim',
          terbit_kontrak: 'Terbit Kontrak',
          kontrak_dikirim_tsk: 'Kontrak ke TSK',
          terbit_paspor: 'Terbit Paspor',
          masuk_imigrasi: 'Masuk Imigrasi',
          coe_terbit: 'COE Terbit',
          ektkln_pembuatan: 'E-KTKLN',
          dokumen_dikirim_2: 'Dok. Dikirim 2',
          visa: 'Visa',
          jadwal_penerbangan: 'Jadwal Penerbangan'
        };
        
        await addHistory(
          req.params.id,
          req.user?.id || null,
          req.user?.nama || 'System',
          'progres_lengkap',
          field,
          null,
          req.body[field],
          `Mengupdate ${fieldLabels[field] || field}`
        );
      }
    }
    
    res.json({ success: true, message: 'Data progres berhasil disimpan' });
  } catch (err) {
    console.error(err);
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
      SELECT kp.sertifikat_ssw, kp.jenis_kelamin, kp.status_progres 
      FROM kandidat_profil kp 
      ${whereClause}
    `, params);

    const sswList = ['Pengolahan Makanan', 'Pertanian', 'Kaigo (perawat)', 'Building Cleaning', 'Restoran', 'Driver'];
    const progresList = ['Job Matching', 'Pending', 'lamar ke perusahaan', 'Interview', 'Jadwalkan Interview Ulang', 'Lulus interview', 'Gagal Interview', 'Pemberkasan', 'Berangkat', 'Ditolak'];
    const bySSWGender = [];
    const bySSWProgres = [];
    
    sswList.forEach(ssw => {
      const profileBySSW = allProfiles.filter(p => {
        if (!p.sertifikat_ssw) return false;
        const sswArray = p.sertifikat_ssw.split(',').map(s => s.trim());
        return sswArray.includes(ssw);
      });
      
      const laki = profileBySSW.filter(p => p.jenis_kelamin === 'Laki-laki').length;
      const perempuan = profileBySSW.filter(p => p.jenis_kelamin === 'Perempuan').length;
      
      bySSWGender.push({ ssw, laki, perempuan, total: laki + perempuan });
      
      const progresCounts = {};
      progresList.forEach(progres => {
        progresCounts[progres] = 0;
      });
      
      profileBySSW.forEach(p => {
        const progres = p.status_progres || 'Pending';
        if (progresCounts[progres] !== undefined) {
          progresCounts[progres]++;
        }
      });
      
      bySSWProgres.push({
        ssw,
        progres: Object.entries(progresCounts).map(([status, count]) => ({ status, count }))
      });
    });

    const [byCabangProgres] = await pool.query(`
      SELECT 
        c.nama_cabang,
        kp.status_progres,
        COUNT(kp.id) as count
      FROM kandidat_profil kp 
      LEFT JOIN cabang c ON kp.cabang_id = c.id 
      ${whereClause}
      GROUP BY kp.cabang_id, c.nama_cabang, kp.status_progres
      ORDER BY c.nama_cabang, kp.status_progres
    `, params);

    const [jftByGender] = await pool.query(`
      SELECT 
        kp.jenis_kelamin,
        COUNT(DISTINCT CASE WHEN jft.id IS NOT NULL THEN kp.id END) as has_jft,
        COUNT(DISTINCT CASE WHEN jft.id IS NULL THEN kp.id END) as no_jft
      FROM kandidat_profil kp
      LEFT JOIN kandidat_dokumen jft ON jft.kandidat_id = kp.id AND jft.jenis_dokumen = 'sertifikat_jft'
      ${whereClause ? whereClause : 'WHERE 1=1'}
      GROUP BY kp.jenis_kelamin
    `, params);

    const [jftByCabang] = await pool.query(`
      SELECT 
        c.nama_cabang,
        COUNT(DISTINCT CASE WHEN jft.id IS NOT NULL THEN kp.id END) as has_jft,
        COUNT(DISTINCT CASE WHEN jft.id IS NULL THEN kp.id END) as no_jft
      FROM kandidat_profil kp
      LEFT JOIN kandidat_dokumen jft ON jft.kandidat_id = kp.id AND jft.jenis_dokumen = 'sertifikat_jft'
      LEFT JOIN cabang c ON kp.cabang_id = c.id
      ${whereClause}
      GROUP BY kp.cabang_id, c.nama_cabang
      ORDER BY c.nama_cabang
    `, params);

    const [sswByGender] = await pool.query(`
      SELECT 
        kp.jenis_kelamin,
        COUNT(DISTINCT CASE WHEN ssw.id IS NOT NULL THEN kp.id END) as has_ssw,
        COUNT(DISTINCT CASE WHEN ssw.id IS NULL THEN kp.id END) as no_ssw
      FROM kandidat_profil kp
      LEFT JOIN kandidat_dokumen ssw ON ssw.kandidat_id = kp.id AND ssw.jenis_dokumen LIKE 'ssw_%'
      ${whereClause ? whereClause : 'WHERE 1=1'}
      GROUP BY kp.jenis_kelamin
    `, params);

    const [sswByCabang] = await pool.query(`
      SELECT 
        c.nama_cabang,
        COUNT(DISTINCT CASE WHEN ssw.id IS NOT NULL THEN kp.id END) as has_ssw,
        COUNT(DISTINCT CASE WHEN ssw.id IS NULL THEN kp.id END) as no_ssw
      FROM kandidat_profil kp
      LEFT JOIN kandidat_dokumen ssw ON ssw.kandidat_id = kp.id AND ssw.jenis_dokumen LIKE 'ssw_%'
      LEFT JOIN cabang c ON kp.cabang_id = c.id
      ${whereClause}
      GROUP BY kp.cabang_id, c.nama_cabang
      ORDER BY c.nama_cabang
    `, params);

    res.json({ success: true, data: { 
      total: total[0].total, 
      byStatus, 
      byCabang, 
      bySSWGender, 
      bySSWProgres, 
      byCabangProgres,
      jftByGender,
      jftByCabang,
      sswByGender,
      sswByCabang
    } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addHistory = async (kandidatId, adminId, adminNama, actionType, fieldName, oldValue, newValue, description) => {
  try {
    console.log('Adding history:', { kandidatId, adminId, adminNama, actionType, fieldName, oldValue, newValue, description });
    const result = await pool.query(
      `INSERT INTO kandidat_history (kandidat_id, admin_id, admin_nama, action_type, field_name, old_value, new_value, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [kandidatId, adminId, adminNama, actionType, fieldName, oldValue, newValue, description]
    );
    console.log('History added successfully:', result[0].insertId);
  } catch (err) {
    console.error('Error adding history:', err);
  }
};

const getHistory = async (req, res) => {
  try {
    const kandidatId = req.params.id;
    console.log('Fetching history for kandidat_id:', kandidatId);
    
    const [history] = await pool.query(`
      SELECT kh.*, u.nama as admin_user_nama
      FROM kandidat_history kh
      LEFT JOIN users u ON kh.admin_id = u.id
      WHERE kh.kandidat_id = ?
      ORDER BY kh.created_at DESC
    `, [kandidatId]);
    
    console.log('Found history records:', history.length);
    res.json({ success: true, data: history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getInterviewStats = async (req, res) => {
  try {
    const user = req.user;
    const { start_date, end_date, filter_type } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (filter_type === 'today') {
      const today = new Date().toISOString().split('T')[0];
      dateFilter = ' AND DATE(kh.created_at) = ?';
      params.push(today);
    } else if (filter_type === 'yesterday') {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      dateFilter = ' AND DATE(kh.created_at) = ?';
      params.push(yesterday);
    } else if (filter_type === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      dateFilter = ' AND DATE(kh.created_at) >= ?';
      params.push(weekAgo);
    } else if (filter_type === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      dateFilter = ' AND DATE(kh.created_at) >= ?';
      params.push(monthAgo);
    } else if (start_date && end_date) {
      dateFilter = ' AND DATE(kh.created_at) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    if (user.role === 'admin_cabang') {
      dateFilter += ' AND kp.cabang_id = ?';
      params.push(user.cabang_id);
    }
    
    // Count Interview status changes
    const [interviewCount] = await pool.query(`
      SELECT COUNT(DISTINCT kh.kandidat_id) as count
      FROM kandidat_history kh
      JOIN kandidat_profil kp ON kh.kandidat_id = kp.id
      WHERE kh.field_name = 'status_progres' 
      AND kh.new_value = 'Interview'
      ${dateFilter}
    `, params);
    
    // Count Lulus Interview status changes
    const [lulusCount] = await pool.query(`
      SELECT COUNT(DISTINCT kh.kandidat_id) as count
      FROM kandidat_history kh
      JOIN kandidat_profil kp ON kh.kandidat_id = kp.id
      WHERE kh.field_name = 'status_progres' 
      AND kh.new_value = 'Lulus interview'
      ${dateFilter}
    `, params);
    
    const interviewNum = interviewCount[0]?.count || 0;
    const lulusNum = lulusCount[0]?.count || 0;
    const percentage = interviewNum > 0 ? Math.round((lulusNum / interviewNum) * 100) : 0;
    
    res.json({ 
      success: true, 
      data: { 
        interview_count: interviewNum, 
        lulus_count: lulusNum,
        percentage 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAll, getById, getMyProfile, updateMyProfile, updateStatus, updateProgres, updateKeberangkatan, updateProgresLengkap, submitForm, uploadDokumen, getStats, addHistory, getHistory, getInterviewStats };
