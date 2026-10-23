const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
require('../services/exceljsPatch');
const pool = require('../config/database');
const { detectPlaceholders } = require('../services/cvPlaceholderParser');
const { getKandidatFull } = require('../services/cvDataFetcher');
const { renderTemplate, previewValues } = require('../services/cvTemplateRenderer');
const { daftarBahasa, normalisasiBahasa, siapkanTerjemahan, terapkanTerjemahan, ambilTerjemahan, simpanTerjemahan, FIELD_BEBAS, translateValue, terapkanOverride } = require('../services/cvTranslator');
const { catalogList, GROUP_FIELDS } = require('../config/cvFields');

/** Label bahasa untuk ditampilkan di respons/riwayat. */
const labelBahasa = (code) => {
  const found = daftarBahasa().find((b) => b.code === code);
  return found ? found.label : code;
};

const ROOT = path.join(__dirname, '..', '..');
const UPLOAD_DIR = path.join(ROOT, 'uploads', 'cv-templates');
const GEN_DIR = path.join(ROOT, 'uploads', 'cv-generated');

const ensureDir = (d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
};
ensureDir(UPLOAD_DIR);
ensureDir(GEN_DIR);

/* ------------------------------------------------------------------ *
 * Util
 * ------------------------------------------------------------------ */

/** Validasi file .xlsx (bukan sekadar ekstensi): harus zip yang berisi workbook. */
function isValidXlsx(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(4);
    fs.readSync(fd, buf, 0, 4, 0);
    fs.closeSync(fd);
    // "PK\x03\x04" -> signature zip (xlsx adalah arsip zip)
    if (buf[0] !== 0x50 || buf[1] !== 0x4b) return false;
    return fs.statSync(filePath).size > 0;
  } catch (e) {
    return false;
  }
}

const relFromRoot = (abs) => path.relative(ROOT, abs).replace(/\\/g, '/');

const getTemplateById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM cv_template WHERE id = ?', [id]);
  return rows[0] || null;
};

/* ------------------------------------------------------------------ *
 * Endpoint
 * ------------------------------------------------------------------ */

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cv_template ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

const getById = async (req, res) => {
  try {
    const tpl = await getTemplateById(req.params.id);
    if (!tpl) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
    res.json({ success: true, data: tpl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};
const upload = async (req, res) => {
  try {
    if (!req.file) {
      const ct = req.headers['content-type'] || '(tidak ada)';
      const bodyKeys = req.body && typeof req.body === 'object' ? Object.keys(req.body) : [];
      return res.status(400).json({
        success: false,
        message:
          `File template (.xlsx) tidak diterima. Content-Type: ${ct}.` +
          (bodyKeys.length
            ? ` Body terbaca sebagai JSON (${bodyKeys.join(', ')}) — file dikirim sebagai multipart/form-data.`
            : ' Pastikan file dikirim sebagai multipart/form-data dengan field "template".'),
      });
    }
    if (!isValidXlsx(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        /* abaikan */
      }
      return res.status(400).json({
        success: false,
        message:
          'File bukan .xlsx yang valid (tidak berformat Excel). Pastikan template dibuat dengan Microsoft Excel / LibreOffice Calc dan disimpan ulang sebagai .xlsx.',
      });
    }

    const nama = (req.body.nama_template || req.file.originalname.replace(/\.xlsx$/i, '')).trim();
    const rel = relFromRoot(req.file.path);

    let detected;
    try {
      detected = await detectPlaceholders(req.file.path);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: `Template tidak dapat dibaca: ${e.message}`,
      });
    }

    if (!detected.placeholders.length && !detected.groups.length) {
      return res.status(400).json({
        success: false,
        message:
          'Tidak ada placeholder ditemukan pada template. Tulis penanda seperti {nama_romaji} atau {tanggal_lahir_jp} di dalam sel (tanpa spasi, huruf kecil).',
      });
    }

    // Template pertama otomatis menjadi aktif.
    const [cnt] = await pool.query('SELECT COUNT(*) as c FROM cv_template');
    const makeActive = Number(cnt[0].c) === 0 ? 1 : 0;

    const [result] = await pool.query(
      `INSERT INTO cv_template (nama_template, file_name, path_file, mime_type, ukuran_file, jumlah_placeholder, mapping, is_active, created_by)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        nama,
        req.file.originalname,
        rel,
        req.file.mimetype || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        req.file.size,
        detected.placeholders.length,
        JSON.stringify({ placeholders: detected.placeholders, groups: detected.groups }),
        makeActive,
        req.user ? req.user.id : null,
      ]
    );

    res.json({
      success: true,
      message: 'Template berhasil diupload',
      id: result.insertId,
      detected: {
        placeholders: detected.placeholders,
        groups: detected.groups,
        total: detected.placeholders.length,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

const previewPlaceholders = async (req, res) => {
  try {
    const tpl = await getTemplateById(req.params.id);
    if (!tpl) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
    const filePath = path.resolve(ROOT, tpl.path_file);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File template tidak ditemukan di server' });
    }
    const detected = await detectPlaceholders(filePath);
    res.json({ success: true, data: detected });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

const setActive = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE cv_template SET is_active = 0');
    await conn.query('UPDATE cv_template SET is_active = 1 WHERE id = ?', [req.params.id]);
    await conn.commit();
    res.json({ success: true, message: 'Template aktif berhasil diubah' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  } finally {
    conn.release();
  }
};

const remove = async (req, res) => {
  try {
    const tpl = await getTemplateById(req.params.id);
    if (!tpl) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
    await pool.query('DELETE FROM cv_template WHERE id = ?', [req.params.id]);
    // Hapus berkas fisik template (hasil generate tetap disimpan).
    try {
      const filePath = path.resolve(ROOT, tpl.path_file);
      if (fs.existsSync(filePath) && filePath.startsWith(UPLOAD_DIR)) fs.unlinkSync(filePath);
    } catch (e) {
      /* abaikan */
    }
    res.json({ success: true, message: 'Template berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

const downloadTemplate = async (req, res) => {
  try {
    const tpl = await getTemplateById(req.params.id);
    if (!tpl) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
    const filePath = path.resolve(ROOT, tpl.path_file);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File template tidak ditemukan di server' });
    }
    res.download(filePath, tpl.file_name);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

/** Resolve template dari id yang dipilih, atau pakai template aktif terakhir. */
const resolveTemplate = async (tplId) => {
  let tpl = null;
  if (tplId) tpl = await getTemplateById(tplId);
  if (!tpl) {
    const [rows] = await pool.query(
      'SELECT * FROM cv_template WHERE is_active = 1 ORDER BY id DESC LIMIT 1'
    );
    if (rows.length) tpl = rows[0];
  }
  return tpl;
};

/**
 * Generate satu CV kandidat memakai template tertentu.
 * Dipakai oleh generate satuan maupun generate massal (batch).
 */
const generateForKandidat = async ({ kandidatId, tpl, bahasa, overrides, createdBy }) => {
  const kandidat = await getKandidatFull(kandidatId);
  if (!kandidat) {
    const err = new Error('Kandidat tidak ditemukan');
    err.status = 404;
    throw err;
  }

  // Terjemahkan isian teks bebas ke bahasa CV yang dipilih.
  const terjemahan = await siapkanTerjemahan(kandidat, bahasa);
  terapkanTerjemahan(kandidat.profil, terjemahan.map);
  // Nilai yang dikoreksi admin di pratinjau dipakai apa adanya.
  const fixedKeys = new Set([...(terjemahan.fixed || []), ...terapkanOverride(kandidat.profil, overrides)]);

  const tplPath = path.resolve(ROOT, tpl.path_file);
  if (!fs.existsSync(tplPath)) {
    const err = new Error('File template tidak ditemukan di server.');
    err.status = 400;
    throw err;
  }

  const rawName = kandidat.profil.nama_romaji || kandidat.profil.user_nama || 'CV';
  const safeName = String(rawName).replace(/[^A-Za-z0-9 _.-]+/g, '_').trim() || 'CV';
  // Nama file hasil generate: "CV_Nama Kandidat.xlsx" (tanpa angka timestamp).
  let outName = `CV_${safeName}.xlsx`;
  // Kalau nama itu sudah dipakai kandidat lain, pakai nama unik supaya file tidak tertimpa.
  const [pemakai] = await pool.query(
    'SELECT id FROM cv_generated WHERE file_name = ? AND kandidat_id <> ? LIMIT 1',
    [outName, kandidatId]
  );
  if (pemakai.length > 0) outName = `CV_${safeName}_${Date.now()}.xlsx`;
  const outPath = path.join(GEN_DIR, outName);
  const relOut = relFromRoot(outPath);

  const result = await renderTemplate(tplPath, kandidat, outPath, { bahasa, fixedKeys });
  if (terjemahan.warning) {
    result.warnings = [terjemahan.warning, ...(result.warnings || [])];
  }

  const [insert] = await pool.query(
    `INSERT INTO cv_generated (kandidat_id, cv_template_id, file_name, path_file, warnings, bahasa, created_by)
     VALUES (?,?,?,?,?,?,?)`,
    [
      kandidatId,
      tpl.id,
      outName,
      relOut,
      JSON.stringify(result.warnings || []),
      bahasa,
      createdBy || null,
    ]
  );

  return {
    id: insert.insertId,
    kandidat_id: Number(kandidatId),
    nama: rawName,
    file_name: outName,
    path_file: relOut,
    outPath,
    warnings: result.warnings || [],
    missing: result.missing || [],
    filled: result.filled || 0,
  };
};

const generate = async (req, res) => {
  try {
    const kandidatId = req.params.kandidatId || req.params.id;
    const tplId = req.body.cv_template_id || req.query.cv_template_id;
    const bahasa = normalisasiBahasa(req.body.bahasa || req.query.bahasa);
    const overrides = (req.body.overrides && typeof req.body.overrides === 'object') ? req.body.overrides : {};

    const tpl = await resolveTemplate(tplId);
    if (!tpl) {
      return res.status(400).json({
        success: false,
        message: 'Belum ada template CV. Upload template CV terlebih dahulu.',
      });
    }

    const hasil = await generateForKandidat({
      kandidatId,
      tpl,
      bahasa,
      overrides,
      createdBy: req.user ? req.user.id : null,
    });

    res.json({
      success: true,
      message: 'CV berhasil digenerate',
      data: {
        id: hasil.id,
        cv_template_id: tpl.id,
        template_nama: tpl.nama_template,
        kandidat_id: hasil.kandidat_id,
        bahasa,
        bahasa_label: labelBahasa(bahasa),
        file_name: hasil.file_name,
        path_file: hasil.path_file,
        download_url: `/uploads/cv-generated/${hasil.file_name}`,
        warnings: hasil.warnings,
        missing: hasil.missing,
        filled: hasil.filled,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
};

/**
 * Generate CV untuk banyak kandidat sekaligus dengan satu template yang sama.
 * Hasilnya dikemas dalam satu file ZIP (berisi .xlsx per kandidat + _ringkasan.txt).
 * Body: { cv_template_id?, bahasa?, kandidat_ids: number[] }
 */
const generateBatch = async (req, res) => {
  const archiver = require('archiver');
  try {
    const body = req.body || {};
    const tplId = body.cv_template_id || req.query.cv_template_id;
    const bahasa = normalisasiBahasa(body.bahasa || req.query.bahasa);
    const createdBy = req.user ? req.user.id : null;

    let ids = body.kandidat_ids || body.ids || [];
    if (!Array.isArray(ids)) ids = [ids];
    ids = [...new Set(ids.map(Number).filter((n) => Number.isInteger(n) && n > 0))];
    if (!ids.length) {
      return res.status(400).json({ success: false, message: 'Pilih minimal satu kandidat.' });
    }
    if (ids.length > 200) {
      return res.status(400).json({ success: false, message: 'Maksimal 200 kandidat sekali generate.' });
    }

    const tpl = await resolveTemplate(tplId);
    if (!tpl) {
      return res.status(400).json({
        success: false,
        message: 'Belum ada template CV. Upload template CV terlebih dahulu.',
      });
    }

    const tplPath = path.resolve(ROOT, tpl.path_file);
    if (!fs.existsSync(tplPath)) {
      return res.status(400).json({ success: false, message: 'File template tidak ditemukan di server.' });
    }

    const berhasil = [];
    const gagal = [];
    for (const id of ids) {
      try {
        const hasil = await generateForKandidat({
          kandidatId: id,
          tpl,
          bahasa,
          overrides: {},
          createdBy,
        });
        berhasil.push(hasil);
      } catch (err) {
        gagal.push({ kandidat_id: id, message: err.message || 'Gagal generate' });
      }
    }

    if (!berhasil.length) {
      return res.status(400).json({
        success: false,
        message: `Semua kandidat gagal digenerate (${gagal.length}).`,
        data: { gagal },
      });
    }

    // Ringkasan ikut di dalam ZIP supaya admin tahu kandidat mana yang gagal.
    const ringkasan = [
      `Template : ${tpl.nama_template}`,
      `Tanggal  : ${new Date().toLocaleString('id-ID')}`,
      `Bahasa   : ${labelBahasa(bahasa)}`,
      `Berhasil : ${berhasil.length}`,
      `Gagal    : ${gagal.length}`,
      '',
      '=== BERHASIL ===',
      ...berhasil.map((h, i) => `${i + 1}. ${h.nama} -> ${h.file_name}`),
    ];
    if (gagal.length) {
      ringkasan.push('', '=== GAGAL ===');
      gagal.forEach((g, i) => ringkasan.push(`${i + 1}. Kandidat ID ${g.kandidat_id}: ${g.message}`));
    }

    const stamp = new Date().toISOString().slice(0, 10);
    const zipName = `CV_Massal_${stamp}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);
    res.setHeader('X-CV-Batch-Success', String(berhasil.length));
    res.setHeader('X-CV-Batch-Failed', String(gagal.length));

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.on('warning', (err) => console.warn('ZIP warning:', err));
    archive.on('error', (err) => {
      console.error('ZIP error:', err);
      try {
        res.destroy(err);
      } catch (e) {
        /* abaikan */
      }
    });

    archive.pipe(res);
    for (const h of berhasil) {
      archive.file(h.outPath, { name: h.file_name });
    }
    archive.append(ringkasan.join('\r\n'), { name: '_ringkasan.txt' });
    await archive.finalize();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }
};

const history = async (req, res) => {
  try {
    const kandidatId = req.params.kandidatId || req.params.id;
    const [rows] = await pool.query(
      `SELECT g.*, t.nama_template
       FROM cv_generated g
       LEFT JOIN cv_template t ON t.id = g.cv_template_id
       WHERE g.kandidat_id = ?
       ORDER BY g.created_at DESC`,
      [kandidatId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

const downloadGenerated = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cv_generated WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'File tidak ditemukan' });
    const file = rows[0];
    const filePath = path.resolve(ROOT, file.path_file);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File tidak ditemukan di server' });
    }
    res.download(filePath, file.file_name);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

/**
 * Pratinjau nilai yang akan diisikan ke template, untuk kandidat tertentu.
 */
const preview = async (req, res) => {
  try {
    const kandidatId = req.params.kandidatId || req.params.id;
    const tplId = req.body.cv_template_id || req.query.cv_template_id;
    const bahasa = normalisasiBahasa(req.body.bahasa || req.query.bahasa);
    const overrides = (req.body.overrides && typeof req.body.overrides === 'object') ? req.body.overrides : {};
    if (!tplId) return res.status(400).json({ success: false, message: 'cv_template_id wajib diisi' });

    const tpl = await getTemplateById(tplId);
    if (!tpl) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });

    const kandidat = await getKandidatFull(kandidatId);
    if (!kandidat) return res.status(404).json({ success: false, message: 'Kandidat tidak ditemukan' });

    const terjemahan = await siapkanTerjemahan(kandidat, bahasa);
    terapkanTerjemahan(kandidat.profil, terjemahan.map);
    const fixedKeys = new Set([...(terjemahan.fixed || []), ...terapkanOverride(kandidat.profil, overrides)]);

    const filePath = path.resolve(ROOT, tpl.path_file);
    let keys = [];
    const optionsMap = {};
    if (fs.existsSync(filePath)) {
      const detected = await detectPlaceholders(filePath);
      keys = detected.placeholders.map((p) => p.name);
      detected.placeholders.forEach((p) => {
        if (p.options && p.options.length) optionsMap[p.name] = p.options;
      });
      detected.groups.forEach((g) => {
        Object.entries(g.opts || {}).forEach(([row, subs]) => {
          Object.entries(subs || {}).forEach(([sub, options]) => {
            if (options && options.length) optionsMap[`${g.group}_${row}_${sub}`] = options;
          });
        });
        g.rows.forEach((row) => {
          Object.keys(GROUP_FIELDS[g.group].sub).forEach((sub) => {
            keys.push(`${g.group}_${row}_${sub}`);
          });
        });
      });
    }

    res.json({
      success: true,
      data: {
        kandidat_id: Number(kandidatId),
        template: { id: tpl.id, nama: tpl.nama_template },
        bahasa,
        bahasa_label: labelBahasa(bahasa),
        values: previewValues(kandidat, keys, optionsMap, bahasa, fixedKeys),
        overrides,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

/**
 * Daftar bahasa isian CV yang bisa dipilih.
 */
const bahasa = async (req, res) => {
  try {
    res.json({ success: true, data: daftarBahasa() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

/**
 * Terjemahan isian kandidat (teks bebas) untuk bahasa tertentu.
 * GET  /terjemahan/:kandidatId -> daftar field + terjemahan tersimpan
 * PUT  /terjemahan/:kandidatId -> simpan terjemahan manual
 * POST /terjemahan/:kandidatId/auto -> terjemahkan otomatis (AI) & simpan
 */
const getTerjemahan = async (req, res) => {
  try {
    const kandidatId = Number(req.params.kandidatId);
    const bahasaCode = normalisasiBahasa(req.query.bahasa || 'ja');
    const kandidat = await getKandidatFull(kandidatId);
    if (!kandidat) return res.status(404).json({ success: false, message: 'Kandidat tidak ditemukan' });

    const tersimpan = await ambilTerjemahan(kandidatId, bahasaCode);
    const prof = kandidat.profil || {};

    // Nilai terstruktur (agama, jenis kelamin, dll) diterjemahkan via kamus.
    const nilai = {};
    Object.keys(prof).forEach((key) => {
      const v = prof[key];
      if (v === null || v === undefined || v === '') return;
      const t = translateValue(key, v, bahasaCode);
      if (t !== v) nilai[key] = t;
    });

    const fields = FIELD_BEBAS.map((f) => ({
      key: f.key,
      label: f.label,
      asal: prof[f.key] || '',
      terjemahan: tersimpan[f.key] ? tersimpan[f.key].teks : '',
      sumber: tersimpan[f.key] ? tersimpan[f.key].sumber : null,
    })).filter((f) => f.asal || f.terjemahan);

    res.json({
      success: true,
      data: {
        kandidat_id: kandidatId,
        bahasa: bahasaCode,
        fields,
        nilai,
        ai_tersedia: await require('../services/aiClient').tersedia(),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

const simpanTerjemahanManual = async (req, res) => {
  try {
    const kandidatId = Number(req.params.kandidatId);
    const bahasaCode = normalisasiBahasa(req.body.bahasa || 'ja');
    const translations = req.body.translations || {};
    const items = Object.keys(translations).filter((k) => String(translations[k] || '').trim() !== '');
    if (!items.length) {
      return res.status(400).json({ success: false, message: 'Tidak ada terjemahan untuk disimpan' });
    }
    for (const key of items) {
      await simpanTerjemahan(kandidatId, key, bahasaCode, String(translations[key]).trim(), 'manual');
    }
    res.json({ success: true, message: `${items.length} terjemahan disimpan`, data: { jumlah: items.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

const terjemahkanOtomatis = async (req, res) => {
  try {
    const kandidatId = Number(req.params.kandidatId);
    const bahasaCode = normalisasiBahasa(req.body.bahasa || 'ja');
    const ai = require('../services/aiClient');
    if (!(await ai.tersedia())) {
      return res.status(400).json({
        success: false,
        message:
          'Terjemahan otomatis butuh GROQ_API_KEY di backend/.env. Isi manual di kolom Bahasa Jepang.',
      });
    }
    const kandidat = await getKandidatFull(kandidatId);
    if (!kandidat) return res.status(404).json({ success: false, message: 'Kandidat tidak ditemukan' });

    const hasil = await siapkanTerjemahan(kandidat, bahasaCode);
    const tersimpan = await ambilTerjemahan(kandidatId, bahasaCode);
    res.json({
      success: true,
      message: `Terjemahan otomatis selesai (${Object.keys(tersimpan).length} isian)`,
      data: { fields: Object.keys(tersimpan).map((k) => ({ key: k, ...tersimpan[k] })) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

/**
 * Daftar lengkap placeholder yang tersedia (referensi untuk admin).
 */
const catalog = async (req, res) => {
  try {
    res.json({ success: true, data: catalogList() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

/**
 * Buat berkas template contoh berisi seluruh placeholder yang tersedia.
 */
const sampleTemplate = async (req, res) => {
  try {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Sistem Penempatan';
    const ws = wb.addWorksheet('CV');

    ws.columns = [
      { key: 'label', width: 34 },
      { key: 'value', width: 46 },
    ];

    const title = ws.getCell('A1');
    title.value = 'CONTOH TEMPLATE CV - isi sel kolom B dengan penanda {nama_placeholder}';
    title.font = { bold: true, size: 12 };
    ws.mergeCells('A1:B1');

    const head = ws.getRow(3);
    head.values = ['Keterangan', 'Placeholder'];
    head.font = { bold: true };

    let row = 4;
    const entries = catalogList().filter((f) => !f.repeatable);
    entries.forEach((f) => {
      const r = ws.getRow(row);
      r.getCell(1).value = f.label;
      r.getCell(2).value = `{${f.key}}`;
      r.getCell(2).font = { color: { argb: 'FF1E3A5F' } };
      row++;
    });

    // Contoh grup berulang
    const grpTitle = ws.getRow(row + 1);
    grpTitle.getCell(1).value = 'Riwayat (berulang, isi sesuai jumlah baris template)';
    grpTitle.getCell(1).font = { bold: true };
    row += 2;
    Object.keys(GROUP_FIELDS).forEach((group) => {
      Object.keys(GROUP_FIELDS[group].sub).forEach((sub) => {
        const r = ws.getRow(row);
        r.getCell(1).value = `${GROUP_FIELDS[group].label}: ${GROUP_FIELDS[group].sub[sub].label}`;
        r.getCell(2).value = `{${group}_1_${sub}}`;
        r.getCell(2).font = { color: { argb: 'FF1E3A5F' } };
        row++;
      });
    });

    const fileName = 'contoh-template-cv.xlsx';
    const outPath = path.join(GEN_DIR, fileName);
    await wb.xlsx.writeFile(outPath);
    res.download(outPath, fileName);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

module.exports = {
  getAll,
  getById,
  upload,
  previewPlaceholders,
  setActive,
  remove,
  downloadTemplate,
  generate,
  generateBatch,
  history,
  downloadGenerated,
  preview,
  catalog,
  bahasa,
  getTerjemahan,
  simpanTerjemahanManual,
  terjemahkanOtomatis,
  sampleTemplate,
};
