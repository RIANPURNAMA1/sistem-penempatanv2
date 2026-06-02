const pool = require('../config/database');
const axios = require('axios');
const cache = require('../utils/cache');

const INVALIDATE_PREFIXES = ['stats', 'kandidat_list', 'kandidat:'];

const invalidateKandidatCache = async (kandidatId) => {
  for (const prefix of INVALIDATE_PREFIXES) {
    await cache.delByPrefix(prefix);
  }
  if (kandidatId) {
    await cache.del(`kandidat:${kandidatId}`);
  }
};

// ============================================================
// KONFIGURASI STARSENDER
// ============================================================
const STARSENDER_CONFIG = {
  API_URL: 'https://api.starsender.online/api/send',
  DEVICE_API_KEY: '1d58b1c1-4b15-4089-a9be-8f3fd2174651',
  ACCOUNT_API_KEY: 'f272bd85-1ea1-4bcc-9d88-b585b2bda634',
  ADMIN_PHONE: '089662695289',
};

// ============================================================
// HELPER: Kirim WhatsApp via StarSender
// ============================================================
const sendWhatsApp = async (phoneNumber, message) => {
  try {
    const payload = {
      messageType: 'text',
      to: phoneNumber,
      body: message,
    };

    const response = await axios.post(STARSENDER_CONFIG.API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': STARSENDER_CONFIG.DEVICE_API_KEY,
      },
      timeout: 10000,
    });

    console.log(`[WHATSAPP] Berhasil kirim ke ${phoneNumber}:`, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    const errMsg = error.response?.data || error.message;
    console.error(`[WHATSAPP] Gagal kirim ke ${phoneNumber}:`, errMsg);
    return { success: false, error: errMsg };
  }
};

// ============================================================
// HELPER: Simpan log notifikasi ke database
// ============================================================
const saveNotificationLog = async (phoneNumber, message, status, errorMessage = null) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_logs (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        phone_number  VARCHAR(20)  NOT NULL,
        message       TEXT         NOT NULL,
        status        ENUM('sent','failed','pending') DEFAULT 'pending',
        error_message TEXT         NULL,
        created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(
      'INSERT INTO notification_logs (phone_number, message, status, error_message) VALUES (?, ?, ?, ?)',
      [phoneNumber, message, status, errorMessage]
    );
  } catch (err) {
    console.error('[NOTIFICATION LOG] Gagal simpan log:', err.message);
  }
};

// ============================================================
// HELPER: Kirim notifikasi + log hasilnya
// ============================================================
const sendWhatsAppNotification = async (candidateName) => {
  const adminPhone = STARSENDER_CONFIG.ADMIN_PHONE;

  const adminMessage =
    `*Notifikasi Formulir Baru* 🗒️\n\n` +
    `Kandidat ${candidateName} baru saja mengisi dan mengirimkan formulir pendaftaran.\n\n` +
    `Silakan login ke sistem untuk meninjau dan memproses data kandidat tersebut.\n\n` +
    `_Pesan otomatis dari sistem._`;

  const adminResult = await sendWhatsApp(adminPhone, adminMessage);

  await saveNotificationLog(
    adminPhone,
    adminMessage,
    adminResult.success ? 'sent' : 'failed',
    adminResult.success ? null : JSON.stringify(adminResult.error)
  );
};

// ============================================================
// GET ALL KANDIDAT (FIXED & CLEAN)
// ============================================================
const getAll = async (req, res) => {
  try {
    const {
      search,
      status,
      cabang_id,
      jenis_kelamin,
      umur_min,
      umur_max,
      bidang_ssw,
      status_progres,
      jenjang,
      status_keberangkatan,
    } = req.query;

    const user = req.user;

    const cacheKey = cache.generateKey('kandidat_list', req);
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    // 🔥 BASE URL DINAMIS (AUTO DETECT)
    const BASE_URL = `${req.protocol}://${req.get("host")}`;

    let query = `
      SELECT 
        kp.*, 
        u.nama, 
        u.email, 
        u.status as user_status, 
        TRIM(c.nama_cabang) as nama_cabang, 
        kp.pendidikan_terakhir,
        (
          SELECT kd.path_file
          FROM kandidat_dokumen kd 
          WHERE kd.kandidat_id = kp.id 
          AND kd.jenis_dokumen = 'pas_foto' 
          LIMIT 1
        ) as pas_foto
      FROM kandidat_profil kp
      JOIN users u ON kp.user_id = u.id
      LEFT JOIN cabang c ON kp.cabang_id = c.id
      WHERE 1=1
      AND kp.deleted_at IS NULL
    `;

    const params = [];

    // ============================================================
    // FILTER ROLE
    // ============================================================
    if (user.role === "admin_cabang") {
      query += " AND kp.cabang_id = ?";
      params.push(user.cabang_id);
    } else if (cabang_id) {
      query += " AND kp.cabang_id = ?";
      params.push(cabang_id);
    }

    // ============================================================
    // FILTER LAINNYA
    // ============================================================
    if (search) {
      query += ` AND (
        u.nama LIKE ? 
        OR kp.nama_romaji LIKE ? 
        OR kp.nama_katakana LIKE ?
      )`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      query += " AND kp.status_formulir = ?";
      params.push(status);
    }

    if (jenis_kelamin) {
      query += " AND kp.jenis_kelamin = ?";
      params.push(jenis_kelamin);
    }

    if (umur_min) {
      query += " AND kp.umur >= ?";
      params.push(parseInt(umur_min));
    }

    if (umur_max) {
      query += " AND kp.umur <= ?";
      params.push(parseInt(umur_max));
    }

    if (status_progres) {
      query += " AND kp.status_progres = ?";
      params.push(status_progres);
    }

    if (bidang_ssw) {
      query += " AND kp.sertifikat_ssw LIKE ?";
      params.push(`%${bidang_ssw}%`);
    }

    if (jenjang) {
      query += " AND kp.pendidikan_terakhir = ?";
      params.push(jenjang);
    }

    if (status_keberangkatan) {
      query += " AND kp.status_keberangkatan = ?";
      params.push(status_keberangkatan);
    }

    query += " ORDER BY kp.updated_at DESC";

    // ============================================================
    // EXECUTE QUERY
    // ============================================================
    const [rows] = await pool.query(query, params);

    // ============================================================
    // 🔥 FORMAT URL FOTO (INI KUNCI UTAMA)
    // ============================================================
    const data = rows.map((item) => {
      let fotoUrl = null;

      if (item.pas_foto) {
        // bersihin path
        let cleanPath = item.pas_foto.replace(/\\/g, "/");
        cleanPath = cleanPath.replace(/^uploads\//, "");

        fotoUrl = `${BASE_URL}/uploads/${cleanPath}`;
      }

      return {
        ...item,
        pas_foto: fotoUrl,
      };
    });

    await cache.set(cacheKey, data, 15);

    res.json({ success: true, data });

  } catch (err) {
    console.error("ERROR GET ALL KANDIDAT:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============================================================
// GET BY ID (FIXED + FOTO SUPPORT)
// ============================================================
const getById = async (req, res) => {
  try {
    const user = req.user;

    const cacheKey = `kandidat:${req.params.id}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      if (
        user.role === "admin_cabang" &&
        cached.cabang_id !== user.cabang_id
      ) {
        return res.status(403).json({ success: false, message: "Akses ditolak" });
      }
      return res.json({ success: true, data: cached });
    }

    // 🔥 BASE URL DINAMIS
    const BASE_URL = `${req.protocol}://${req.get("host")}`;

    // ============================================================
    // GET PROFIL + FOTO
    // ============================================================
    const [profil] = await pool.query(`
      SELECT 
        kp.*, 
        u.nama, 
        u.email, 
        c.nama_cabang,
        (
          SELECT kd.path_file
          FROM kandidat_dokumen kd
          WHERE kd.kandidat_id = kp.id 
          AND kd.jenis_dokumen = 'pas_foto'
          LIMIT 1
        ) as pas_foto
      FROM kandidat_profil kp
      JOIN users u ON kp.user_id = u.id
      LEFT JOIN cabang c ON kp.cabang_id = c.id
      WHERE kp.id = ?
    `, [req.params.id]);

    // ============================================================
    // VALIDASI DATA
    // ============================================================
    if (!profil.length) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan",
      });
    }

    const dataProfil = profil[0];

    // ============================================================
    // VALIDASI AKSES
    // ============================================================
    if (
      user.role === "admin_cabang" &&
      dataProfil.cabang_id !== user.cabang_id
    ) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    // ============================================================
    // 🔥 FORMAT URL FOTO (INI KUNCI UTAMA)
    // ============================================================
    let fotoUrl = null;

    if (dataProfil.pas_foto) {
      let cleanPath = dataProfil.pas_foto.replace(/\\/g, "/");

      // hilangkan jika ada "uploads/"
      cleanPath = cleanPath.replace(/^uploads\//, "");

      fotoUrl = `${BASE_URL}/uploads/${cleanPath}`;
    }

    dataProfil.pas_foto = fotoUrl;

    // ============================================================
    // DATA TAMBAHAN
    // ============================================================
    const [pendidikan] = await pool.query(
      `SELECT * FROM kandidat_pendidikan 
       WHERE kandidat_id = ? 
       ORDER BY FIELD(jenjang,"SD","SMP","SMA/SMK","Perguruan Tinggi")`,
      [dataProfil.id]
    );

    const [pengalaman] = await pool.query(
      `SELECT * FROM kandidat_pengalaman_kerja 
       WHERE kandidat_id = ? 
       ORDER BY tahun_masuk DESC`,
      [dataProfil.id]
    );

    const [keluarga] = await pool.query(
      `SELECT * FROM kandidat_keluarga 
       WHERE kandidat_id = ? 
       ORDER BY FIELD(hubungan,"Ayah","Ibu","Kakak","Adik","Lainnya"), urutan`,
      [dataProfil.id]
    );

    const [dokumen] = await pool.query(
      `SELECT * FROM kandidat_dokumen 
       WHERE kandidat_id = ?`,
      [dataProfil.id]
    );

    const result = {
      ...dataProfil,
      pendidikan,
      pengalaman,
      keluarga,
      dokumen,
    };

    await cache.set(cacheKey, result, 30);

    res.json({ success: true, data: result });

  } catch (err) {
    console.error("ERROR GET BY ID:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// ============================================================
// GET MY PROFILE
// ============================================================
const getMyProfile = async (req, res) => {
  try {
    const [profil] = await pool.query(`
      SELECT kp.*, u.nama, u.email, c.nama_cabang
      FROM kandidat_profil kp
      JOIN users u ON kp.user_id = u.id
      LEFT JOIN cabang c ON kp.cabang_id = c.id
      WHERE kp.user_id = ?
    `, [req.user.id]);

    if (!profil.length)
      return res.status(404).json({ success: false, message: 'Profil tidak ditemukan' });

    const kandidatId = profil[0].id;

    const [pendidikan] = await pool.query('SELECT * FROM kandidat_pendidikan WHERE kandidat_id = ?', [kandidatId]);
    const [pengalaman] = await pool.query('SELECT * FROM kandidat_pengalaman_kerja WHERE kandidat_id = ?', [kandidatId]);
    const [keluarga] = await pool.query(
      'SELECT * FROM kandidat_keluarga WHERE kandidat_id = ? ORDER BY FIELD(hubungan,"Ayah","Ibu","Kakak","Adik","Lainnya"), urutan',
      [kandidatId]
    );
    const [dokumen] = await pool.query('SELECT * FROM kandidat_dokumen WHERE kandidat_id = ?', [kandidatId]);

    // ✅ FIX: path_file di DB sudah bersih tanpa /uploads/, jadi prefix di sini
    const pasFotoObj = dokumen.find(d => d.jenis_dokumen === 'pas_foto');
    const pasFotoPath = pasFotoObj ? `/uploads/${pasFotoObj.path_file}` : null;

    res.json({
      success: true,
      data: {
        ...profil[0],
        pendidikan,
        pengalaman,
        keluarga,
        dokumen,
        pas_foto: pasFotoPath,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// UPDATE MY PROFILE
// ============================================================
// ============================================================
// UPDATE MY PROFILE (FIXED & SAFE)
// ============================================================

const updateMyProfile = async (req, res) => {
  const conn = await pool.getConnection();

  // 🔥 Helpers
  const toNull = (val) => (val === '' || val === undefined ? null : val);

  // ✅ FIX: Konversi ISO date string ke format YYYY-MM-DD yang diterima MySQL
  const toDateOnly = (val) => {
    if (!val || val === '') return null;
    try {
      return new Date(val).toISOString().split('T')[0];
    } catch {
      return null;
    }
  };

  try {
    await conn.beginTransaction();

    const { pendidikan, pengalaman, keluarga, penghasilan_keluarga, ...profileData } = req.body;

    const [existing] = await conn.query(
      'SELECT id FROM kandidat_profil WHERE user_id = ?',
      [req.user.id]
    );

    if (!existing.length) {
      return res.status(404).json({
        success: false,
        message: 'Profil tidak ditemukan'
      });
    }

    const kandidatId = existing[0].id;

    // ============================================================
    // UPDATE PROFIL UTAMA
    // ============================================================

    const allowedFields = [
      'cabang_id','nama_katakana','nama_romaji','tempat_lahir','tanggal_lahir','umur','jenis_kelamin',
      'status_pernikahan','jumlah_anak','agama','tinggi_badan','berat_badan','golongan_darah',
      'tangan_dominan','ukuran_baju','lingkar_pinggang','panjang_telapak_kaki','sim_dimiliki',
      'nomor_hp','email_kontak','alamat_lengkap','kontak_ortu_nama','kontak_ortu_hp',
      'sudah_vaksin','penglihatan_kanan','penglihatan_kiri','berkacamata','lensa_kontak',
      'buta_warna','kondisi_kesehatan','riwayat_penyakit','bertato','merokok','minum_alkohol',
      'intensitas_alkohol','pendidikan_terakhir',
      'pernah_ke_jepang','keluarga_di_jepang','hubungan_keluarga_jepang','status_kerabat_jepang',
      'kontak_keluarga_jepang','kenalan_di_jepang','kenalan_jepang_detail',
      'level_jlpt','level_jft','sertifikat_ssw','lama_belajar_jepang','level_bahasa_jepang',
      'id_prometric','password_prometric',
      'tujuan_ke_jepang','alasan_ke_jepang','cita_cita_setelah_jepang','rencana_pengiriman_uang',
      'kelebihan_diri','kekurangan_diri','hobi','keahlian','bersedia_shift','bersedia_lembur',
      'bersedia_hari_libur','lama_tinggal_jepang','lama_kerja_perusahaan','rencana_pulang',
      'sumber_biaya','biaya_disiapkan','status_formulir',
    ];

    // Field yang bertipe DATE — perlu konversi khusus
    const dateFields = ['tanggal_lahir'];

    let updates = {};

    allowedFields.forEach((f) => {
      if (profileData[f] !== undefined) {
        // ✅ FIX: Gunakan toDateOnly untuk field date
        if (dateFields.includes(f)) {
          updates[f] = toDateOnly(profileData[f]);
        } else {
          updates[f] = toNull(profileData[f]);
        }
      }
    });

    // ✅ FIX: penghasilan_keluarga dihandle terpisah karena di-destructure dari req.body
    if (penghasilan_keluarga !== undefined) {
      updates['penghasilan_keluarga'] = toNull(penghasilan_keluarga);
    }

    if (Object.keys(updates).length > 0) {
      const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      await conn.query(
        `UPDATE kandidat_profil SET ${setClause} WHERE id = ?`,
        [...Object.values(updates), kandidatId]
      );
    }

    // ============================================================
    // PENDIDIKAN
    // ============================================================

    if (pendidikan && Array.isArray(pendidikan)) {
      await conn.query(
        'DELETE FROM kandidat_pendidikan WHERE kandidat_id = ?',
        [kandidatId]
      );

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
              p.jurusan || null
            ]
          );
        }
      }
    }

    // ============================================================
    // PENGALAMAN
    // ============================================================

    if (pengalaman && Array.isArray(pengalaman)) {
      await conn.query(
        'DELETE FROM kandidat_pengalaman_kerja WHERE kandidat_id = ?',
        [kandidatId]
      );

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
              p.masih_bekerja || false,
              p.deskripsi_pekerjaan || null
            ]
          );
        }
      }
    }

    // ============================================================
    // KELUARGA
    // ============================================================

    if (keluarga && Array.isArray(keluarga)) {
      await conn.query(
        'DELETE FROM kandidat_keluarga WHERE kandidat_id = ?',
        [kandidatId]
      );

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
              k.urutan || 1
            ]
          );
        }
      }
    }

    await conn.commit();

    res.json({
      success: true,
      message: 'Profil berhasil diupdate'
    });

  } catch (err) {
    await conn.rollback();
    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });

  } finally {
    conn.release();
  }
};
// ============================================================
// UPDATE STATUS FORMULIR (oleh admin) + NOTIFIKASI WA
// ============================================================
const updateStatus = async (req, res) => {
  try {
    const { status_formulir, catatan_admin } = req.body;
    const validStatus = ['draft', 'submitted', 'reviewed', 'approved', 'rejected'];

    if (!validStatus.includes(status_formulir))
      return res.status(400).json({ success: false, message: 'Status tidak valid' });

    const [kandidat] = await pool.query(
      'SELECT nama_romaji, nomor_hp, status_formulir FROM kandidat_profil WHERE id = ?',
      [req.params.id]
    );

    if (!kandidat.length)
      return res.status(404).json({ success: false, message: 'Kandidat tidak ditemukan' });

    const { nama_romaji, nomor_hp, status_formulir: oldValue } = kandidat[0];

    await pool.query(
      'UPDATE kandidat_profil SET status_formulir = ?, catatan_admin = ? WHERE id = ?',
      [status_formulir, catatan_admin, req.params.id]
    );

    await addHistory(
      req.params.id, req.user?.id || null, req.user?.nama || 'System',
      'status_change', 'status_formulir', oldValue, status_formulir,
      `Mengubah status formulir dari "${oldValue}" menjadi "${status_formulir}"`
    );

    if (nomor_hp) {
      const statusLabels = {
        'submitted': 'Terkirim',
        'reviewed': 'Sedang Ditinjau',
        'approved': 'Diterima/Disetujui ✅',
        'rejected': 'Ditolak ❌',
      };

      const pesanWA =
        `Halo ${nama_romaji}, 👋\n\n` +
        `Update terbaru untuk pengajuan formulir Anda:\n\n` +
        `Status: *${statusLabels[status_formulir] || status_formulir}*\n` +
        (catatan_admin ? `Catatan Admin: _${catatan_admin}_\n\n` : `\n`) +
        `Silakan cek dashboard sistem untuk informasi lebih lengkap.\n\n` +
        `_Pesan otomatis dari Sistem Penempatan Kandidat._`;

      await sendWhatsApp(nomor_hp, pesanWA);
    }

    await invalidateKandidatCache(req.params.id);
    res.json({ success: true, message: 'Status berhasil diupdate dan notifikasi dikirim' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// UPDATE PROGRES
// ============================================================
const updateProgres = async (req, res) => {
  try {
    const { status_progres, catatan_progres } = req.body;
    const validProgres = [
      'Job Matching', 'Pending', 'lamar ke perusahaan', 'Interview',
      'Jadwalkan Interview Ulang', 'Lulus interview', 'Gagal Interview',
      'Pemberkasan', 'Berangkat', 'Ditolak',
    ];

    if (!validProgres.includes(status_progres))
      return res.status(400).json({ success: false, message: 'Status progres tidak valid' });

    const [old] = await pool.query(
      'SELECT status_progres FROM kandidat_profil WHERE id = ?', [req.params.id]
    );
    const oldValue = old.length ? old[0].status_progres : null;

    await pool.query(
      'UPDATE kandidat_profil SET status_progres = ?, catatan_progres = ? WHERE id = ?',
      [status_progres, catatan_progres, req.params.id]
    );

    await addHistory(
      req.params.id, req.user?.id || null, req.user?.nama || 'System',
      'status_change', 'status_progres', oldValue, status_progres,
      `Mengubah progres dari "${oldValue || 'null'}" menjadi "${status_progres}"`
    );

    await invalidateKandidatCache(req.params.id);
    res.json({ success: true, message: 'Progres berhasil diupdate' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// UPDATE KEBERANGKATAN
// ============================================================
const updateKeberangkatan = async (req, res) => {
  try {
    const { status_keberangkatan } = req.body;
    const validStatus = ['stay', 'keluar', 'terbang'];

    if (!validStatus.includes(status_keberangkatan))
      return res.status(400).json({ success: false, message: 'Status keberangkatan tidak valid' });

    const [old] = await pool.query(
      'SELECT status_keberangkatan FROM kandidat_profil WHERE id = ?', [req.params.id]
    );
    const oldValue = old.length ? old[0].status_keberangkatan : null;

    await pool.query(
      'UPDATE kandidat_profil SET status_keberangkatan = ? WHERE id = ?',
      [status_keberangkatan, req.params.id]
    );

    await addHistory(
      req.params.id, req.user?.id || null, req.user?.nama || 'System',
      'status_change', 'status_keberangkatan', oldValue, status_keberangkatan,
      `Mengubah status keberangkatan dari "${oldValue || 'null'}" menjadi "${status_keberangkatan}"`
    );

    await invalidateKandidatCache(req.params.id);
    res.json({ success: true, message: 'Status keberangkatan berhasil diupdate' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



// ============================================================
// UPDATE PROGRES LENGKAP (FINAL FIX - ANTI ERROR)
// ============================================================
const updateProgresLengkap = async (req, res) => {
try {
const fields = [
'status_progres','nama_perusahaan','institusi','bidang_ssw','detail_pekerjaan',
'jadwal_interview','catatan_interview','tgl_setsumeikai','tgl_mensetsu_1',
'tgl_mensetsu_2','catatan_mensetsu','biaya_pemberkasan','adm_tahap_1',
'adm_tahap_2','dokumen_dikirim','terbit_kontrak','kontrak_dikirim_tsk',
'terbit_paspor','masuk_imigrasi','coe_terbit','ektkln_pembuatan',
'dokumen_dikirim_2','visa','jadwal_penerbangan',
];


// 🔥 DATE FIELDS (FIX FINAL)
const dateFields = [
'jadwal_interview',
'tgl_setsumeikai',
'tgl_mensetsu_1',
'tgl_mensetsu_2',

// ✅ tambahan yang kamu minta
'dokumen_dikirim',
'terbit_kontrak',
'kontrak_dikirim_tsk',
'terbit_paspor',
'masuk_imigrasi',
'coe_terbit',
'ektkln_pembuatan',
'dokumen_dikirim_2',
'visa',
'jadwal_penerbangan',
];

// 🔥 helper biar aman
const normalizeDate = (value) => {
if (!value || value === '') return null;

// handle ISO (2026-04-25T00:00:00.000Z)
if (typeof value === 'string' && value.includes('T')) {
return value.split('T')[0];
}

return value;
};


const numberFields = [
  'biaya_pemberkasan','adm_tahap_1','adm_tahap_2'
];

const isValidDate = (val) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(val);
};

const updates = [];
const values = [];

for (const field of fields) {
  if (req.body[field] !== undefined) {
    let value = req.body[field];

    // =========================
    // HANDLE DATE
    // =========================
    if (dateFields.includes(field)) {
      if (!value || value === '') {
        value = null;
      } else {
        // normalize ISO → YYYY-MM-DD
        if (value.includes('T')) {
          value = value.split('T')[0];
        }

        if (!isValidDate(value)) {
          return res.status(400).json({
            success: false,
            message: `Format tanggal salah pada field ${field}`
          });
        }
      }
    }

    // =========================
    // HANDLE NUMBER
    // =========================
    if (numberFields.includes(field)) {
      value = value === '' ? null : Number(value);

      if (value !== null && isNaN(value)) {
        return res.status(400).json({
          success: false,
          message: `Field ${field} harus berupa angka`
        });
      }
    }

    updates.push(`${field} = ?`);
    values.push(value);
  }
}

if (updates.length === 0) {
  return res.status(400).json({
    success: false,
    message: 'Tidak ada data untuk diupdate'
  });
}

const [kandidat] = await pool.query(
  'SELECT nama_romaji, nomor_hp, status_progres FROM kandidat_profil WHERE id = ?',
  [req.params.id]
);

if (!kandidat.length) {
  return res.status(404).json({
    success: false,
    message: 'Kandidat tidak ditemukan'
  });
}

const { nama_romaji, nomor_hp, oldStatus } = kandidat[0];
const newStatus = req.body.status_progres || null;

if (newStatus && oldStatus !== newStatus) {
  await addHistory(req.params.id, req.user?.id || null, req.user?.nama || 'System', 'status_change', 'status_progres', oldStatus, newStatus, `Progres diubah ke ${newStatus}`);
}

values.push(req.params.id);

await pool.query(
  `UPDATE kandidat_profil SET ${updates.join(', ')} WHERE id = ?`,
  values
);

// =========================
// WHATSAPP
// =========================
if (nomor_hp) {
  const status = req.body.status_progres || 'Update terbaru';

  let pesanWA =
    `Halo ${nama_romaji}, 👋\n\n` +
    `Ada pembaruan progres Anda:\n\n` +
    `*STATUS:* ${status}\n\n` +
    `_Pesan otomatis sistem_`;

  await sendWhatsApp(nomor_hp, pesanWA);
}

await invalidateKandidatCache(req.params.id);
res.json({
  success: true,
  message: 'Berhasil update tanpa error'
});


} catch (err) {
console.error('❌ ERROR:', err);

res.status(500).json({
  success: false,
  message: err.sqlMessage || err.message
});

}
};



// ============================================================
// SUBMIT FORM
// ============================================================
const submitForm = async (req, res) => {
  try {
    const [profil] = await pool.query(
      'SELECT id, nama_romaji, nama_katakana, nomor_hp FROM kandidat_profil WHERE user_id = ?',
      [req.user.id]
    );

    if (!profil.length)
      return res.status(404).json({ success: false, message: 'Profil tidak ditemukan' });

    const kandidatId = profil[0].id;

    await pool.query(
      'UPDATE kandidat_profil SET status_formulir = "submitted" WHERE id = ?',
      [kandidatId]
    );

    const candidateName =
      profil[0].nama_romaji ||
      profil[0].nama_katakana ||
      req.user.nama ||
      'Kandidat';

    sendWhatsAppNotification(candidateName).catch(err =>
      console.error('[WHATSAPP] Gagal mengirim notifikasi:', err.message)
    );

    await invalidateKandidatCache(kandidatId);
    res.json({ success: true, message: 'Formulir berhasil dikirim', status: 'submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// SCREENING KANDIDAT (APPROVE)
// ============================================================
const screeningKandidat = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const adminNama = req.user.nama || req.user.email;

    const [profil] = await pool.query(
      'SELECT id, nama_romaji, status_formulir FROM kandidat_profil WHERE id = ?',
      [id]
    );

    if (!profil.length)
      return res.status(404).json({ success: false, message: 'Kandidat tidak ditemukan' });

    if (profil[0].status_formulir === 'approved')
      return res.status(400).json({ success: false, message: 'Kandidat sudah disetujui' });

    const [dokumen] = await pool.query(
      'SELECT jenis_dokumen FROM kandidat_dokumen WHERE kandidat_id = ?',
      [id]
    );

    const hasJft = dokumen.some(d => d.jenis_dokumen === 'sertifikat_jft');
    const hasSsw = dokumen.some(d => d.jenis_dokumen && d.jenis_dokumen.startsWith('ssw_'));

    let message = 'Kandidat berhasil disetujui melalui screening';
    if (hasJft && hasSsw) {
      message = 'Kandidat disetujui (Sertifikat JFT & SSW lengkap)';
    } else if (hasJft) {
      message = 'Kandidat disetujui (Sertifikat JFT lengkap)';
    } else if (hasSsw) {
      message = 'Kandidat disetujui (Sertifikat SSW lengkap)';
    } else {
      message = 'Kandidat disetujui (tanpa sertifikat)';
    }

    await pool.query(
      'UPDATE kandidat_profil SET status_formulir = "approved" WHERE id = ?',
      [id]
    );

    addHistory(id, adminId, adminNama, 'status_change', 'status_formulir', profil[0].status_formulir, 'approved', message);

    await invalidateKandidatCache(id);
    res.json({ success: true, message, hasJft, hasSsw });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// BATCH SCREENING - AUTO APPROVE BERDASARKAN SERTIFIKAT
// ============================================================
const batchScreening = async (req, res) => {
  try {
    const adminId = req.user.id;
    const adminNama = req.user.nama || req.user.email;

    const [kandidats] = await pool.query(
      `SELECT kp.id, kp.nama_romaji, kp.status_formulir 
       FROM kandidat_profil kp 
       WHERE kp.status_formulir IN ('draft', 'submitted', 'reviewed')`
    );

    let approved = 0;
    let skipped = 0;
    const results = [];

    for (const kandidat of kandidats) {
      const [dokumen] = await pool.query(
        'SELECT jenis_dokumen FROM kandidat_dokumen WHERE kandidat_id = ?',
        [kandidat.id]
      );

      const hasJft = dokumen.some(d => d.jenis_dokumen === 'sertifikat_jft');
      const hasSsw = dokumen.some(d => d.jenis_dokumen && d.jenis_dokumen.startsWith('ssw_'));

      if (hasJft || hasSsw) {
        let message = 'Auto-approved';
        if (hasJft && hasSsw) message = 'Sertifikat JFT & SSW lengkap';
        else if (hasJft) message = 'Sertifikat JFT lengkap';
        else if (hasSsw) message = 'Sertifikat SSW lengkap';

        await pool.query(
          'UPDATE kandidat_profil SET status_formulir = "approved" WHERE id = ?',
          [kandidat.id]
        );

        addHistory(kandidat.id, adminId, adminNama, 'status_change', 'status_formulir', kandidat.status_formulir, 'approved', message);
        
        approved++;
        results.push({ id: kandidat.id, nama: kandidat.nama_romaji, status: 'approved', reason: message });
      } else {
        skipped++;
      }
    }

    await invalidateKandidatCache();
    res.json({ 
      success: true, 
      message: `${approved} kandidat disetujui, ${skipped} dilewati (tidak ada sertifikat)`,
      approved,
      skipped,
      results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// ✅ UPLOAD DOKUMEN — FIXED PATH & SIZE LIMIT (500KB)
// ============================================================
const fs = require('fs');
const path = require('path');

// ============================================================
// UPLOAD DOKUMEN (KANDIDAT)
// ============================================================
const uploadDokumen = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'File tidak ditemukan' });

    // 🛑 VALIDASI UKURAN FILE (500KB = 500 * 1024 bytes)
    const MAX_SIZE = 500 * 1024;
    if (req.file.size > MAX_SIZE) {
      // Hapus file yang sudah terlanjur diupload ke folder uploads agar tidak nyampah
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false, 
        message: 'Ukuran file terlalu besar. Maksimal 500KB' 
      });
    }

    const { jenis_dokumen } = req.body;
    const [profil] = await pool.query(
      'SELECT id FROM kandidat_profil WHERE user_id = ?', [req.user.id]
    );

    if (!profil.length) {
      // Hapus file jika profil tidak ditemukan
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Profil tidak ditemukan' });
    }

    // ✅ FIX: Normalisasi path
    const normalizedPath = req.file.path
      .replace(/\\/g, '/')           
      .replace(/^.*?uploads\//, ''); 

    console.log('[UPLOAD] req.file.path:', req.file.path);
    console.log('[UPLOAD] normalizedPath:', normalizedPath);

    // Hapus data dokumen lama dengan jenis yang sama dari database
    await pool.query(
      'DELETE FROM kandidat_dokumen WHERE kandidat_id = ? AND jenis_dokumen = ?',
      [profil[0].id, jenis_dokumen]
    );

    // Simpan data baru
    await pool.query(
      'INSERT INTO kandidat_dokumen (kandidat_id, jenis_dokumen, nama_file, path_file, ukuran_file, mime_type) VALUES (?,?,?,?,?,?)',
      [profil[0].id, jenis_dokumen, req.file.originalname, normalizedPath, req.file.size, req.file.mimetype]
    );

    const kandidatId = profil[0].id;
    await invalidateKandidatCache(kandidatId);
    res.json({ 
      success: true, 
      message: 'Dokumen berhasil diupload', 
      path: normalizedPath,
      size: `${(req.file.size / 1024).toFixed(2)} KB`
    });
  } catch (err) {
    // Jika terjadi error, coba hapus file yang gagal diproses
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// UPLOAD DOKUMEN (ADMIN)
// ============================================================
const adminUploadDokumen = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'File tidak ditemukan' });

    const kandidatId = req.params.id;
    const { jenis_dokumen } = req.body;

    const [kandidat] = await pool.query('SELECT id FROM kandidat_profil WHERE id = ?', [kandidatId]);
    if (!kandidat.length) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
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

    await invalidateKandidatCache(kandidatId);
    res.json({
      success: true,
      message: 'Dokumen berhasil diupload',
      path: normalizedPath,
      size: `${(req.file.size / 1024).toFixed(2)} KB`
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// DELETE DOKUMEN (ADMIN)
// ============================================================
const adminDeleteDokumen = async (req, res) => {
  try {
    const kandidatId = req.params.id;
    const { jenis_dokumen } = req.query;

    if (!jenis_dokumen)
      return res.status(400).json({ success: false, message: 'jenis_dokumen required' });

    const [docs] = await pool.query(
      'SELECT id, path_file FROM kandidat_dokumen WHERE kandidat_id = ? AND jenis_dokumen = ?',
      [kandidatId, jenis_dokumen]
    );

    if (!docs.length)
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });

    const filePath = path.join(__dirname, '../../uploads', docs[0].path_file);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query('DELETE FROM kandidat_dokumen WHERE id = ?', [docs[0].id]);

    await invalidateKandidatCache(kandidatId);
    res.json({ success: true, message: 'Dokumen berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// GET STATS
// ============================================================
const getStats = async (req, res) => {
  try {
    const user = req.user;
    const { start_date, end_date, filter_type } = req.query;

    const cacheKey = cache.generateKey('stats', req);
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, fromCache: true });
    }
    
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

    if (user.role === 'admin_cabang') {
      whereClause += whereClause ? ' AND kp.cabang_id = ?' : 'WHERE kp.cabang_id = ?';
      params.push(user.cabang_id);
    }

    const [total]    = await pool.query(`SELECT COUNT(*) as total FROM kandidat_profil kp ${whereClause}`, params);
    
    const allStatusWhere = whereClause || 'WHERE 1=1';
    const [byStatus] = await pool.query(`SELECT status_formulir, COUNT(*) as count FROM kandidat_profil kp ${allStatusWhere} GROUP BY status_formulir`, params);
    
    const approvedWhere = whereClause ? whereClause + ' AND kp.status_formulir = ' + pool.escape('approved') : 'WHERE kp.status_formulir = ' + pool.escape('approved');
    const [byCabang] = await pool.query(`SELECT TRIM(c.nama_cabang) as nama_cabang, COUNT(kp.id) as count FROM kandidat_profil kp LEFT JOIN cabang c ON kp.cabang_id = c.id ${approvedWhere} GROUP BY kp.cabang_id, c.nama_cabang`, params);

    const approvedProfilesWhere = whereClause ? whereClause + ' AND kp.status_formulir = ' + pool.escape('approved') : 'WHERE kp.status_formulir = ' + pool.escape('approved');
    const [allProfiles] = await pool.query(
      `SELECT kp.sertifikat_ssw, kp.jenis_kelamin, kp.status_progres, c.nama_cabang FROM kandidat_profil kp LEFT JOIN cabang c ON kp.cabang_id = c.id ${approvedProfilesWhere}`,
      params
    );

    const sswList     = ['Pengolahan Makanan','Pertanian','Gaishoku','Kaigo (perawat)','Building Cleaning','Restoran','Driver','Perhotelah','Perbaikan dan Perawatan Mobil','Konstruksi','Perikanan'];
    const progresList = ['Job Matching','Pending','lamar ke perusahaan','Interview','Jadwalkan Interview Ulang','Lulus interview','Gagal Interview','Pemberkasan','Berangkat','Ditolak'];
    const bySSWGender  = [];
    const bySSWProgres = [];

    sswList.forEach(ssw => {
      const bySSW = allProfiles.filter(p => {
        if (!p.sertifikat_ssw) return false;
        return p.sertifikat_ssw.split(',').map(s => s.trim()).includes(ssw);
      });
      const laki      = bySSW.filter(p => p.jenis_kelamin === 'Laki-laki').length;
      const perempuan = bySSW.filter(p => p.jenis_kelamin === 'Perempuan').length;
      bySSWGender.push({ ssw, laki, perempuan, total: laki + perempuan });

      const progresCounts = Object.fromEntries(progresList.map(p => [p, 0]));
      bySSW.forEach(p => {
        const key = p.status_progres || 'Pending';
        if (progresCounts[key] !== undefined) progresCounts[key]++;
      });
      bySSWProgres.push({ ssw, progres: Object.entries(progresCounts).map(([status, count]) => ({ status, count })) });
    });

    const [byCabangProgres] = await pool.query(`
      SELECT TRIM(c.nama_cabang) as nama_cabang, kp.status_progres, COUNT(kp.id) as count
      FROM kandidat_profil kp
      LEFT JOIN cabang c ON kp.cabang_id = c.id
      ${whereClause} AND kp.status_formulir = 'approved'
      GROUP BY kp.cabang_id, c.nama_cabang, kp.status_progres
      ORDER BY c.nama_cabang, kp.status_progres
    `, params);

    const jftWhere = whereClause ? whereClause : 'WHERE 1=1';

    const [jftByGender] = await pool.query(`
      SELECT kp.jenis_kelamin,
        COUNT(DISTINCT CASE WHEN jft.id IS NOT NULL THEN kp.id END) as has_jft,
        COUNT(DISTINCT CASE WHEN jft.id IS NULL     THEN kp.id END) as no_jft
      FROM kandidat_profil kp
      LEFT JOIN kandidat_dokumen jft ON jft.kandidat_id = kp.id AND jft.jenis_dokumen = 'sertifikat_jft'
      ${jftWhere} GROUP BY kp.jenis_kelamin
    `, params);

    const [jftByCabang] = await pool.query(`
      SELECT c.nama_cabang,
        COUNT(DISTINCT CASE WHEN jft.id IS NOT NULL THEN kp.id END) as has_jft,
        COUNT(DISTINCT CASE WHEN jft.id IS NULL     THEN kp.id END) as no_jft
      FROM kandidat_profil kp
      LEFT JOIN kandidat_dokumen jft ON jft.kandidat_id = kp.id AND jft.jenis_dokumen = 'sertifikat_jft'
      LEFT JOIN cabang c ON kp.cabang_id = c.id
      ${whereClause} GROUP BY kp.cabang_id, c.nama_cabang ORDER BY c.nama_cabang
    `, params);

    const [sswByGender] = await pool.query(`
      SELECT kp.jenis_kelamin,
        COUNT(DISTINCT CASE WHEN ssw.id IS NOT NULL THEN kp.id END) as has_ssw,
        COUNT(DISTINCT CASE WHEN ssw.id IS NULL     THEN kp.id END) as no_ssw
      FROM kandidat_profil kp
      LEFT JOIN kandidat_dokumen ssw ON ssw.kandidat_id = kp.id AND ssw.jenis_dokumen LIKE 'ssw_%'
      ${jftWhere} GROUP BY kp.jenis_kelamin
    `, params);

    const [sswByCabang] = await pool.query(`
      SELECT c.nama_cabang,
        COUNT(DISTINCT CASE WHEN ssw.id IS NOT NULL THEN kp.id END) as has_ssw,
        COUNT(DISTINCT CASE WHEN ssw.id IS NULL     THEN kp.id END) as no_ssw
      FROM kandidat_profil kp
      LEFT JOIN kandidat_dokumen ssw ON ssw.kandidat_id = kp.id AND ssw.jenis_dokumen LIKE 'ssw_%'
      LEFT JOIN cabang c ON kp.cabang_id = c.id
      ${whereClause} GROUP BY kp.cabang_id, c.nama_cabang ORDER BY c.nama_cabang
    `, params);

// Interview & Lulus by Cabin with Gender breakdown (use kandidat_history like the stats)
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

    if (user.role === 'admin_cabang') {
      interviewFilter += ' AND kp.cabang_id = ?';
      interviewParams.push(user.cabang_id);
    }

    const [interviewByCabang] = await pool.query(`
      SELECT c.nama_cabang,
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
      ORDER BY c.nama_cabang
    `, interviewParams);

    // Interview & Lulus by Gender
    const [interviewByGender] = await pool.query(`
      SELECT kp.jenis_kelamin,
        COUNT(DISTINCT CASE WHEN kp.status_progres IN ('Interview', 'Jadwalkan Interview Ulang') THEN kp.id END) as interview,
        COUNT(DISTINCT CASE WHEN kp.status_progres = 'Lulus interview' THEN kp.id END) as lulus
      FROM kandidat_profil kp
      ${jftWhere}
      GROUP BY kp.jenis_kelamin
    `, params);

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
      allProfiles
    };

    await cache.set(cacheKey, result, 30);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// ADD HISTORY
// ============================================================
const addHistory = async (kandidatId, adminId, adminNama, actionType, fieldName, oldValue, newValue, description) => {
  try {
    await pool.query(
      `INSERT INTO kandidat_history (kandidat_id, admin_id, admin_nama, action_type, field_name, old_value, new_value, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [kandidatId, adminId, adminNama, actionType, fieldName, oldValue, newValue, description]
    );
  } catch (err) {
    console.error('Error adding history:', err.message);
  }
};

// ============================================================
// GET HISTORY
// ============================================================
const getHistory = async (req, res) => {
  try {
    const [history] = await pool.query(`
      SELECT kh.*, u.nama as admin_user_nama
      FROM kandidat_history kh
      LEFT JOIN users u ON kh.admin_id = u.id
      WHERE kh.kandidat_id = ?
      ORDER BY kh.created_at DESC
    `, [req.params.id]);

    res.json({ success: true, data: history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET MY HISTORY (for kandidat)
// ============================================================
const getMyHistory = async (req, res) => {
  try {
    const [profil] = await pool.query(
      'SELECT id FROM kandidat_profil WHERE user_id = ?',
      [req.user.id]
    );

    if (!profil.length) {
      return res.json({ success: true, data: [] });
    }

    const kandidatId = profil[0].id;

    const [history] = await pool.query(`
      SELECT kh.*
      FROM kandidat_history kh
      WHERE kh.kandidat_id = ?
      ORDER BY kh.created_at DESC
      LIMIT 50
    `, [kandidatId]);

    res.json({ success: true, data: history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// GET INTERVIEW STATS
// ============================================================
const getInterviewStats = async (req, res) => {
  try {
    const user = req.user;
    const { start_date, end_date, filter_type } = req.query;

    let dateFilter = '';
    const params = [];

    if (filter_type === 'today') {
      dateFilter = ' AND DATE(kh.created_at) = ?';
      params.push(new Date().toISOString().split('T')[0]);
    } else if (filter_type === 'yesterday') {
      dateFilter = ' AND DATE(kh.created_at) = ?';
      params.push(new Date(Date.now() - 86400000).toISOString().split('T')[0]);
    } else if (filter_type === 'week') {
      dateFilter = ' AND DATE(kh.created_at) >= ?';
      params.push(new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);
    } else if (filter_type === 'month') {
      dateFilter = ' AND DATE(kh.created_at) >= ?';
      params.push(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]);
    } else if (start_date && end_date) {
      dateFilter = ' AND DATE(kh.created_at) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    if (user.role === 'admin_cabang') {
      dateFilter += ' AND kp.cabang_id = ?';
      params.push(user.cabang_id);
    }

    const [interviewCount] = await pool.query(`
      SELECT COUNT(DISTINCT kh.kandidat_id) as count
      FROM kandidat_history kh
      JOIN kandidat_profil kp ON kh.kandidat_id = kp.id
      WHERE kh.field_name = 'status_progres' AND kh.new_value = 'Interview' ${dateFilter}
    `, params);

    const [jadwalkanCount] = await pool.query(`
      SELECT COUNT(DISTINCT kh.kandidat_id) as count
      FROM kandidat_history kh
      JOIN kandidat_profil kp ON kh.kandidat_id = kp.id
      WHERE kh.field_name = 'status_progres' AND kh.new_value = 'Jadwalkan Interview Ulang' ${dateFilter}
    `, params);

    const [lulusCount] = await pool.query(`
      SELECT COUNT(DISTINCT kh.kandidat_id) as count
      FROM kandidat_history kh
      JOIN kandidat_profil kp ON kh.kandidat_id = kp.id
      WHERE kh.field_name = 'status_progres' AND kh.new_value = 'Lulus interview' ${dateFilter}
    `, params);

    const interviewNum = interviewCount[0]?.count || 0;
    const jadwalkanNum = jadwalkanCount[0]?.count || 0;
    const lulusNum = lulusCount[0]?.count || 0;
    const totalInterview = interviewNum + jadwalkanNum;
    const percentage = totalInterview > 0 ? Math.round((lulusNum / totalInterview) * 100) : 0;

    res.json({ success: true, data: { interview_count: interviewNum, jadwalkan_count: jadwalkanNum, lulus_count: lulusNum, percentage } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// IMPORT KANDIDAT DARI DATA
// ============================================================
const importKandidat = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      nama_romaji,
      nama_katakana,
      email,
      jenis_kelamin,
      umur,
      nama_cabang,
      pendidikan_terakhir,
      status_formulir,
      status_progres,
      status_keberangkatan,
      sertifikat_ssw,
      level_bahasa_jepang,
    } = req.body;

    if (!nama_romaji && !nama_katakana) {
      return res.status(400).json({ success: false, message: 'Nama romaji atau katakana harus diisi' });
    }

    let cabangId = null;
    if (nama_cabang) {
      const [cabangRows] = await conn.query('SELECT id FROM cabang WHERE nama_cabang = ? LIMIT 1', [nama_cabang.trim()]);
      if (cabangRows.length > 0) {
        cabangId = cabangRows[0].id;
      } else {
        const [newCabang] = await conn.query('INSERT INTO cabang (nama_cabang) VALUES (?)', [nama_cabang.trim()]);
        cabangId = newCabang.insertId;
      }
    }

    let userId = null;
    if (email) {
      const [userRows] = await conn.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
      if (userRows.length > 0) {
        userId = userRows[0].id;
      } else {
        const defaultPassword = email.split('@')[0] + '123';
        const [newUser] = await conn.query(
          'INSERT INTO users (email, nama, password, role) VALUES (?, ?, ?, ?)',
          [email, nama_romaji || nama_katakana, defaultPassword, 'kandidat']
        );
        userId = newUser.insertId;
      }
    }

    if (!userId) {
      const defaultEmail = `${nama_romaji || nama_katakana}_${Date.now()}@temp.com`;
      const defaultPassword = (nama_romaji || nama_katakana) + '123';
      const [newUser] = await conn.query(
        'INSERT INTO users (email, nama, password, role) VALUES (?, ?, ?, ?)',
        [defaultEmail, nama_romaji || nama_katakana, defaultPassword, 'kandidat']
      );
      userId = newUser.insertId;
    }

    const [existingProfil] = await conn.query('SELECT id FROM kandidat_profil WHERE user_id = ?', [userId]);
    
    if (existingProfil.length > 0) {
      await conn.query(
        `UPDATE kandidat_profil SET 
          nama_romaji = ?, nama_katakana = ?, jenis_kelamin = ?, umur = ?,
          cabang_id = ?, pendidikan_terakhir = ?, status_formulir = ?,
          status_progres = ?, status_keberangkatan = ?, sertifikat_ssw = ?,
          level_bahasa_jepang = ?
        WHERE user_id = ?`,
        [
          nama_romaji || null,
          nama_katakana || null,
          jenis_kelamin || null,
          umur || null,
          cabangId,
          pendidikan_terakhir || null,
          status_formulir || 'draft',
          status_progres || 'Pending',
          status_keberangkatan || null,
          sertifikat_ssw || null,
          level_bahasa_jepang || null,
          userId,
        ]
      );
    } else {
      await conn.query(
        `INSERT INTO kandidat_profil (
          user_id, nama_romaji, nama_katakana, jenis_kelamin, umur,
          cabang_id, pendidikan_terakhir, status_formulir, status_progres,
          status_keberangkatan, sertifikat_ssw, level_bahasa_jepang
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          nama_romaji || null,
          nama_katakana || null,
          jenis_kelamin || null,
          umur || null,
          cabangId,
          pendidikan_terakhir || null,
          status_formulir || 'draft',
          status_progres || 'Pending',
          status_keberangkatan || null,
          sertifikat_ssw || null,
          level_bahasa_jepang || null,
        ]
      );
    }

    await conn.commit();
    await invalidateKandidatCache();
    res.json({ success: true, message: 'Kandidat berhasil diimport' });

  } catch (err) {
    await conn.rollback();
    console.error('Import error:', err);
    res.status(500).json({ success: false, message: 'Gagal mengimport kandidat', error: err.message });
  } finally {
    conn.release();
  }
};

// ============================================================
// UPDATE PROFILE BY ADMIN
// ============================================================
const updateProfileByAdmin = async (req, res) => {
  const conn = await pool.getConnection();
  const toNull = (val) => (val === '' || val === undefined ? null : val);
  try {
    const kandidatId = parseInt(req.params.id);
    const { pendidikan, pengalaman, keluarga, penghasilan_keluarga, ...profileData } = req.body;

    await conn.beginTransaction();

    const allowedFields = [
      'nama_katakana','nama_romaji','tempat_lahir','tanggal_lahir','umur','jenis_kelamin',
      'status_pernikahan','jumlah_anak','agama','tinggi_badan','berat_badan','golongan_darah',
      'tangan_dominan','ukuran_baju','lingkar_pinggang','panjang_telapak_kaki','sim_dimiliki',
      'nomor_hp','email_kontak','alamat_lengkap','kontak_ortu_nama','kontak_ortu_hp',
      'sudah_vaksin','penglihatan_kanan','penglihatan_kiri','berkacamata','lensa_kontak',
      'buta_warna','kondisi_kesehatan','riwayat_penyakit','bertato','merokok','minum_alkohol',
      'intensitas_alkohol','pendidikan_terakhir',
      'level_jlpt','level_jft','lama_belajar_jepang','level_bahasa_jepang',
      'pernah_ke_jepang','keluarga_di_jepang','tujuan_ke_jepang','alasan_ke_jepang',
      'cita_cita_setelah_jepang','rencana_pengiriman_uang','kelebihan_diri','kekurangan_diri',
      'hobi','keahlian','bersedia_shift','bersedia_lembur','bersedia_hari_libur',
      'lama_tinggal_jepang','lama_kerja_perusahaan','rencana_pulang','sumber_biaya','biaya_disiapkan',
    ];

    const updates = {};
    allowedFields.forEach(f => {
      if (profileData[f] !== undefined) updates[f] = toNull(profileData[f]);
    });

    if (penghasilan_keluarga !== undefined) {
      updates['penghasilan_keluarga'] = toNull(penghasilan_keluarga);
    }

    if (Object.keys(updates).length > 0) {
      if (updates.tanggal_lahir && typeof updates.tanggal_lahir === 'string') {
        updates.tanggal_lahir = updates.tanggal_lahir.split('T')[0];
      }

      const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      await conn.query(
        `UPDATE kandidat_profil SET ${setClause} WHERE id = ?`,
        [...Object.values(updates), kandidatId]
      );

      await conn.query(
        `INSERT INTO kandidat_history (kandidat_id, admin_id, field_name, old_value, new_value, description) VALUES (?,?,?,?,?,?)`,
        [kandidatId, req.user.id, 'update_profile', '-', '-', 'Admin mengupdate data kandidat']
      );
    }

    // ============================================================
    // PENDIDIKAN
    // ============================================================

    if (pendidikan && Array.isArray(pendidikan)) {
      await conn.query(
        'DELETE FROM kandidat_pendidikan WHERE kandidat_id = ?',
        [kandidatId]
      );

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
              p.jurusan || null
            ]
          );
        }
      }
    }

    // ============================================================
    // PENGALAMAN
    // ============================================================

    if (pengalaman && Array.isArray(pengalaman)) {
      await conn.query(
        'DELETE FROM kandidat_pengalaman_kerja WHERE kandidat_id = ?',
        [kandidatId]
      );

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
              p.masih_bekerja || false,
              p.deskripsi_pekerjaan || null
            ]
          );
        }
      }
    }

    // ============================================================
    // KELUARGA
    // ============================================================

    if (keluarga && Array.isArray(keluarga)) {
      await conn.query(
        'DELETE FROM kandidat_keluarga WHERE kandidat_id = ?',
        [kandidatId]
      );

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
              k.urutan || 1
            ]
          );
        }
      }
    }

    await conn.commit();

    res.json({ success: true, message: 'Data berhasil disimpan' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
};

// ============================================================
// SOFT DELETE
// ============================================================
const softDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query(
      'SELECT id, nama_romaji FROM kandidat_profil WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Kandidat tidak ditemukan' });
    }

    await pool.query(
      'UPDATE kandidat_profil SET deleted_at = NOW() WHERE id = ?',
      [id]
    );

    await addHistory(id, req.user?.id || null, req.user?.nama || 'System', 'delete', null, null, null, 'Kandidat dihapus (soft delete)');

    await invalidateKandidatCache(id);
    res.json({ success: true, message: 'Kandidat berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// RESTORE
// ============================================================
const restore = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query(
      'SELECT id, nama_romaji FROM kandidat_profil WHERE id = ? AND deleted_at IS NOT NULL',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Kandidat dihapus tidak ditemukan' });
    }

    await pool.query(
      'UPDATE kandidat_profil SET deleted_at = NULL WHERE id = ?',
      [id]
    );

    await addHistory(id, req.user?.id || null, req.user?.nama || 'System', 'update', null, null, null, 'Kandidat dipulihkan dari hapus');

    await invalidateKandidatCache(id);
    res.json({ success: true, message: 'Kandidat berhasil dipulihkan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// PERMANENT DELETE
// ============================================================
const permanentDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query(
      'SELECT id, nama_romaji FROM kandidat_profil WHERE id = ? AND deleted_at IS NOT NULL',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Kandidat dihapus tidak ditemukan' });
    }

    await pool.query('DELETE FROM kandidat_profil WHERE id = ?', [id]);

    res.json({ success: true, message: 'Kandidat berhasil dihapus permanen' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// LIST DELETED
// ============================================================
const getDeleted = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT kp.id, kp.user_id, kp.nama_romaji, kp.nama_katakana, kp.jenis_kelamin, kp.umur,
              TRIM(c.nama_cabang) as nama_cabang, kp.status_formulir, kp.status_progres, kp.updated_at,
              kp.level_bahasa_jepang, kp.sertifikat_ssw, kp.pendidikan_terakhir,
              kp.status_keberangkatan, kp.deleted_at,
              u.email,
              (
                SELECT kd.path_file
                FROM kandidat_dokumen kd 
                WHERE kd.kandidat_id = kp.id 
                AND kd.jenis_dokumen = 'pas_foto' 
                LIMIT 1
              ) as pas_foto
       FROM kandidat_profil kp
       LEFT JOIN users u ON kp.user_id = u.id
       LEFT JOIN cabang c ON kp.cabang_id = c.id
       WHERE kp.deleted_at IS NOT NULL
       ORDER BY kp.deleted_at DESC`,
      []
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// RESTORE ALL DELETED
// ============================================================
const restoreAllDeleted = async (req, res) => {
  try {
    const user = req.user;
    let whereClause = 'deleted_at IS NOT NULL';
    const params = [];

    if (user.role === 'admin_cabang') {
      whereClause += ' AND cabang_id = ?';
      params.push(user.cabang_id);
    }

    const [rows] = await pool.query(`SELECT id FROM kandidat_profil WHERE ${whereClause}`, params);

    if (rows.length === 0) {
      return res.json({ success: true, message: 'Tidak ada data yang perlu dipulihkan', count: 0 });
    }

    await pool.query(`UPDATE kandidat_profil SET deleted_at = NULL WHERE ${whereClause}`, params);

    for (const row of rows) {
      await addHistory(row.id, user.id || null, user.nama || 'System', 'update', null, null, null, 'Kandidat dipulihkan dari hapus massal');
    }

    await invalidateKandidatCache();
    res.json({ success: true, message: `${rows.length} kandidat berhasil dipulihkan`, count: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// PERMANENT DELETE ALL DELETED
// ============================================================
const permanentAllDeleted = async (req, res) => {
  try {
    const user = req.user;
    let whereClause = 'deleted_at IS NOT NULL';
    const params = [];

    if (user.role === 'admin_cabang') {
      whereClause += ' AND cabang_id = ?';
      params.push(user.cabang_id);
    }

    const [rows] = await pool.query(`SELECT id FROM kandidat_profil WHERE ${whereClause}`, params);

    if (rows.length === 0) {
      return res.json({ success: true, message: 'Tidak ada data yang perlu dihapus', count: 0 });
    }

    const ids = rows.map(r => r.id);
    await pool.query(`DELETE FROM kandidat_profil WHERE id IN (${ids.map(() => '?').join(',')})`, ids);

    res.json({ success: true, message: `${rows.length} kandidat berhasil dihapus permanen`, count: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  getAll,
  getById,
  getMyProfile,
  updateMyProfile,
  updateStatus,
  updateProgres,
  updateKeberangkatan,
  updateProgresLengkap,
  screeningKandidat,
  batchScreening,
  uploadDokumen,
  adminUploadDokumen,
  adminDeleteDokumen,
  getStats,
  getInterviewStats,
  getHistory,
  getMyHistory,
  submitForm,
  addHistory,
  updateProfileByAdmin,
  importKandidat,
  softDelete,
  restore,
  permanentDelete,
  getDeleted,
  restoreAllDeleted,
  permanentAllDeleted,
};