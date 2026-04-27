require('dotenv').config();
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────────
// KONFIGURASI
// ─────────────────────────────────────────────────────────────────
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

// Daftar bidang SSW — sinkron dengan getStats() di kandidatController
const SSW_LIST = [
  'Pengolahan Makanan', 'Pertanian', 'Gaishoku', 'Kaigo (perawat)',
  'Building Cleaning', 'Restoran', 'Driver', 'Perhotelah',
  'Perbaikan dan Perawatan Mobil', 'Konstruksi', 'Perikanan',
];

// ─────────────────────────────────────────────────────────────────
// DATABASE: Ambil statistik lengkap (selaras dengan kandidatController)
// ─────────────────────────────────────────────────────────────────
const getDbStats = async () => {
  const mysql = require('mysql2/promise');
  const pool  = mysql.createPool({
    host            : process.env.DB_HOST     || 'localhost',
    user            : process.env.DB_USER     || 'root',
    password        : process.env.DB_PASSWORD || '',
    database        : process.env.DB_NAME     || 'kandidat_db',
    waitForConnections: true,
    connectionLimit : 5,
    queueLimit      : 0,
    charset         : 'utf8mb4',
  });

  const q = (sql, params = []) => pool.query(sql, params).then(([rows]) => rows);

  try {
    const [
      // ── Totals & Status Formulir ────────────────────────────────
      [{ total }],
      statusRows,

      // ── Sertifikat ──────────────────────────────────────────────
      [{ sertifikat_ssw }],
      [{ sertifikat_jft }],

      // ── Status Progres ──────────────────────────────────────────
      progresRows,

      // ── Keberangkatan ───────────────────────────────────────────
      keberangkatanRows,
      [{ berangkat }],
      [{ stay }],
      [{ keluar }],

      // ── Gender & Demografi ──────────────────────────────────────
      genderRows,
      pendidikanRows,
      [{ usia_bawah_30 }],

      // ── Cabang ──────────────────────────────────────────────────
      cabangRows,
      semuaCabangRows,

      // ── SSW detail ──────────────────────────────────────────────
      sswGenderRows,
      sswProgresRows,

      // ── Interview dari riwayat history ──────────────────────────
      [{ total_interview }],
      [{ total_jadwalkan }],
      [{ total_lulus_interview }],
      [{ total_gagal_interview }],

      // ── Progres per Cabang ──────────────────────────────────────
      progresCabangRows,

      // ── JFT & SSW per Cabang ────────────────────────────────────
      jftCabangRows,
      sswCabangRows,

      // ── Tren Pendaftaran ────────────────────────────────────────
      bulanRows,

      // ── Perusahaan aktif ────────────────────────────────────────
      perusahaanRows,

    ] = await Promise.all([

      q('SELECT COUNT(*) as total FROM kandidat_profil'),

      q('SELECT status_formulir, COUNT(*) as count FROM kandidat_profil GROUP BY status_formulir'),

      q("SELECT COUNT(*) as sertifikat_ssw FROM kandidat_profil WHERE sertifikat_ssw IS NOT NULL AND sertifikat_ssw != ''"),

      q("SELECT COUNT(DISTINCT kandidat_id) as sertifikat_jft FROM kandidat_dokumen WHERE jenis_dokumen = 'sertifikat_jft'"),

      q(`SELECT status_progres, COUNT(*) as count
         FROM kandidat_profil
         WHERE status_progres IS NOT NULL
         GROUP BY status_progres
         ORDER BY count DESC`),

      q(`SELECT status_keberangkatan, COUNT(*) as count
         FROM kandidat_profil
         WHERE status_keberangkatan IS NOT NULL
         GROUP BY status_keberangkatan`),

      q("SELECT COUNT(*) as berangkat FROM kandidat_profil WHERE status_keberangkatan = 'terbang'"),
      q("SELECT COUNT(*) as stay FROM kandidat_profil WHERE status_keberangkatan = 'stay'"),
      q("SELECT COUNT(*) as keluar FROM kandidat_profil WHERE status_keberangkatan = 'keluar'"),

      q('SELECT jenis_kelamin, COUNT(*) as count FROM kandidat_profil GROUP BY jenis_kelamin'),

      q(`SELECT pendidikan_terakhir, COUNT(*) as count
         FROM kandidat_profil
         WHERE pendidikan_terakhir IS NOT NULL
         GROUP BY pendidikan_terakhir
         ORDER BY count DESC`),

      q('SELECT COUNT(*) as usia_bawah_30 FROM kandidat_profil WHERE TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) < 30'),

      q(`SELECT TRIM(c.nama_cabang) as nama_cabang, COUNT(kp.id) as count
         FROM kandidat_profil kp
         LEFT JOIN cabang c ON kp.cabang_id = c.id
         GROUP BY kp.cabang_id, c.nama_cabang
         ORDER BY count DESC LIMIT 20`),

      q('SELECT TRIM(nama_cabang) as nama_cabang FROM cabang ORDER BY nama_cabang'),

      // SSW per bidang × gender (field sertifikat_ssw bisa multi-value CSV)
      q(`SELECT sertifikat_ssw, jenis_kelamin, COUNT(*) as count
         FROM kandidat_profil
         WHERE sertifikat_ssw IS NOT NULL AND sertifikat_ssw != ''
         GROUP BY sertifikat_ssw, jenis_kelamin`),

      // SSW per bidang × progres
      q(`SELECT sertifikat_ssw, status_progres, COUNT(*) as count
         FROM kandidat_profil
         WHERE sertifikat_ssw IS NOT NULL AND sertifikat_ssw != ''
           AND status_progres IS NOT NULL
         GROUP BY sertifikat_ssw, status_progres`),

      // Interview history (sumber kebenaran untuk tracking historis)
      q(`SELECT COUNT(DISTINCT kandidat_id) as total_interview
         FROM kandidat_history
         WHERE field_name = 'status_progres' AND new_value = 'Interview'`),

      q(`SELECT COUNT(DISTINCT kandidat_id) as total_jadwalkan
         FROM kandidat_history
         WHERE field_name = 'status_progres' AND new_value = 'Jadwalkan Interview Ulang'`),

      q(`SELECT COUNT(DISTINCT kandidat_id) as total_lulus_interview
         FROM kandidat_history
         WHERE field_name = 'status_progres' AND new_value = 'Lulus interview'`),

      q(`SELECT COUNT(DISTINCT kandidat_id) as total_gagal_interview
         FROM kandidat_history
         WHERE field_name = 'status_progres' AND new_value = 'Gagal Interview'`),

      // Progres per cabang (hanya approved)
      q(`SELECT TRIM(c.nama_cabang) as nama_cabang, kp.status_progres, COUNT(kp.id) as count
         FROM kandidat_profil kp
         LEFT JOIN cabang c ON kp.cabang_id = c.id
         WHERE kp.status_formulir = 'approved' AND kp.status_progres IS NOT NULL
         GROUP BY kp.cabang_id, c.nama_cabang, kp.status_progres
         ORDER BY c.nama_cabang, kp.status_progres`),

      // JFT per cabang
      q(`SELECT TRIM(c.nama_cabang) as nama_cabang,
           COUNT(DISTINCT CASE WHEN jft.id IS NOT NULL THEN kp.id END) as has_jft,
           COUNT(DISTINCT CASE WHEN jft.id IS NULL     THEN kp.id END) as no_jft
         FROM kandidat_profil kp
         LEFT JOIN kandidat_dokumen jft ON jft.kandidat_id = kp.id AND jft.jenis_dokumen = 'sertifikat_jft'
         LEFT JOIN cabang c ON kp.cabang_id = c.id
         GROUP BY kp.cabang_id, c.nama_cabang
         ORDER BY c.nama_cabang`),

      // SSW per cabang
      q(`SELECT TRIM(c.nama_cabang) as nama_cabang,
           COUNT(DISTINCT CASE WHEN ssw.id IS NOT NULL THEN kp.id END) as has_ssw,
           COUNT(DISTINCT CASE WHEN ssw.id IS NULL     THEN kp.id END) as no_ssw
         FROM kandidat_profil kp
         LEFT JOIN kandidat_dokumen ssw ON ssw.kandidat_id = kp.id AND ssw.jenis_dokumen LIKE 'ssw_%'
         LEFT JOIN cabang c ON kp.cabang_id = c.id
         GROUP BY kp.cabang_id, c.nama_cabang
         ORDER BY c.nama_cabang`),

      q(`SELECT DATE_FORMAT(created_at, '%Y-%m') as bulan, COUNT(*) as count
         FROM kandidat_profil
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
         GROUP BY bulan ORDER BY bulan`),

      q(`SELECT nama_perusahaan, bidang_ssw, COUNT(*) as count
         FROM kandidat_profil
         WHERE nama_perusahaan IS NOT NULL AND nama_perusahaan != ''
         GROUP BY nama_perusahaan, bidang_ssw
         ORDER BY count DESC LIMIT 15`),
    ]);

    // ── Bangun map status progres ──────────────────────────────
    const progresMap = {};
    progresRows.forEach(r => { progresMap[r.status_progres] = r.count; });

    // ── Bangun SSW stats per bidang ────────────────────────────
    const sswStats = SSW_LIST.map(ssw => {
      const gData = sswGenderRows.filter(r =>
        r.sertifikat_ssw?.split(',').map(s => s.trim()).includes(ssw)
      );
      const laki      = gData.filter(r => r.jenis_kelamin === 'Laki-laki').reduce((a, b) => a + b.count, 0);
      const perempuan = gData.filter(r => r.jenis_kelamin === 'Perempuan').reduce((a, b) => a + b.count, 0);

      const pData = sswProgresRows.filter(r =>
        r.sertifikat_ssw?.split(',').map(s => s.trim()).includes(ssw)
      );
      const progresDetail = {};
      pData.forEach(r => { progresDetail[r.status_progres] = (progresDetail[r.status_progres] || 0) + r.count; });

      return { bidang: ssw, laki, perempuan, total: laki + perempuan, progres: progresDetail };
    }).filter(s => s.total > 0);

    return {
      total,
      status          : statusRows,
      sertifikat_ssw,
      sertifikat_jft,
      progres_map     : progresMap,
      job_matching    : progresMap['Job Matching']            ?? 0,
      pending         : progresMap['Pending']                 ?? 0,
      lamar           : progresMap['lamar ke perusahaan']     ?? 0,
      interview       : (progresMap['Interview'] ?? 0) + (progresMap['Jadwalkan Interview Ulang'] ?? 0),
      lulus           : progresMap['Lulus interview']         ?? 0,
      gagal           : progresMap['Gagal Interview']         ?? 0,
      pemberkasan     : progresMap['Pemberkasan']             ?? 0,
      berangkat_progres: progresMap['Berangkat']              ?? 0,
      ditolak         : progresMap['Ditolak']                 ?? 0,
      interview_history: {
        total_interview  : total_interview,
        total_jadwalkan  : total_jadwalkan,
        total_lulus      : total_lulus_interview,
        total_gagal      : total_gagal_interview,
        persentase_lulus : (total_interview + total_jadwalkan) > 0
          ? Math.round((total_lulus_interview / (total_interview + total_jadwalkan)) * 100)
          : 0,
      },
      keberangkatanRows,
      berangkat,
      stay,
      keluar,
      gender          : genderRows,
      usia_bawah_30,
      pendidikan      : pendidikanRows,
      per_cabang      : cabangRows,
      semua_cabang    : semuaCabangRows.map(c => c.nama_cabang),
      progres_cabang  : progresCabangRows,
      jft_cabang      : jftCabangRows,
      ssw_cabang      : sswCabangRows,
      ssw_stats       : sswStats,
      bidang_ssw_aktif: sswStats.map(s => s.bidang),
      tren_bulanan    : bulanRows,
      perusahaan      : perusahaanRows,
    };

  } catch (err) {
    console.error('[getDbStats] Error:', err.message);
    return null;
  } finally {
    await pool.end();
  }
};

// ─────────────────────────────────────────────────────────────────
// SYSTEM PROMPT: Konteks lengkap untuk AI
// ─────────────────────────────────────────────────────────────────
const buildSystemPrompt = (s, kandidatData = null) => {
  const statusMap = {};
  s.status.forEach(r => { statusMap[r.status_formulir] = r.count; });

  const genderMap = {};
  s.gender.forEach(g => { genderMap[(g.jenis_kelamin || '').toLowerCase()] = g.count; });
  const lakiLaki  = genderMap['laki-laki'] ?? genderMap['l'] ?? 0;
  const perempuan = genderMap['perempuan'] ?? genderMap['p'] ?? 0;

  const cabangLines = s.per_cabang
    .map(c => `  ${c.nama_cabang || 'Tidak Diketahui'}: ${c.count} kandidat`)
    .join('\n');

  const pendidikanStr = s.pendidikan
    .map(p => `${p.pendidikan_terakhir}: ${p.count}`)
    .join(', ') || '-';

  const keberangkatanStr = s.keberangkatanRows
    .map(k => `${k.status_keberangkatan}: ${k.count}`)
    .join(', ') || '-';

  const trenStr = s.tren_bulanan
    .map(t => `${t.bulan}: ${t.count} kandidat baru`)
    .join(', ') || '-';

  const sswLines = s.ssw_stats.length
    ? s.ssw_stats.map(b => `  ${b.bidang}: total ${b.total} orang (L:${b.laki} P:${b.perempuan})`).join('\n')
    : '  (tidak ada data)';

  const progresCabangMap = {};
  s.progres_cabang.forEach(r => {
    if (!progresCabangMap[r.nama_cabang]) progresCabangMap[r.nama_cabang] = {};
    progresCabangMap[r.nama_cabang][r.status_progres] = r.count;
  });
  const progresCabangLines = Object.entries(progresCabangMap).length
    ? Object.entries(progresCabangMap)
        .map(([cabang, pMap]) => `  ${cabang}: ${Object.entries(pMap).map(([k, v]) => `${k}:${v}`).join(', ')}`)
        .join('\n')
    : '  (tidak ada data)';

  const jftCabangLines = s.jft_cabang.length
    ? s.jft_cabang.map(c => `  ${c.nama_cabang}: punya JFT ${c.has_jft}, belum ${c.no_jft}`).join('\n')
    : '  (tidak ada data)';

  const sswCabangLines = s.ssw_cabang.length
    ? s.ssw_cabang.map(c => `  ${c.nama_cabang}: punya SSW ${c.has_ssw}, belum ${c.no_ssw}`).join('\n')
    : '  (tidak ada data)';

  const perusahaanLines = s.perusahaan.length
    ? s.perusahaan.map(p => `  ${p.nama_perusahaan} (${p.bidang_ssw || '-'}): ${p.count} kandidat`).join('\n')
    : '  (tidak ada data)';

  const ih = s.interview_history;

  return `Anda adalah Asisten AI resmi untuk sistem manajemen penempatan kerja ke Jepang (Program SSW/TKI).

══════════════════════════════════════════════════════
DATA REAL-TIME DATABASE — ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
══════════════════════════════════════════════════════

[RINGKASAN FORMULIR KANDIDAT]
Total Kandidat Terdaftar : ${s.total} orang
Status Draft             : ${statusMap['draft']     ?? 0} orang
Status Submitted         : ${statusMap['submitted'] ?? 0} orang
Status Reviewed          : ${statusMap['reviewed']  ?? 0} orang
Status Approved          : ${statusMap['approved']  ?? 0} orang
Status Rejected          : ${statusMap['rejected']  ?? 0} orang

[SERTIFIKASI]
Memiliki Sertifikat SSW  : ${s.sertifikat_ssw} orang
Memiliki Sertifikat JFT  : ${s.sertifikat_jft} orang
Bidang SSW yang Ada      : ${s.bidang_ssw_aktif.join(', ') || '-'}

[STATUS PROGRES KANDIDAT — kondisi saat ini]
Job Matching             : ${s.job_matching} orang
Pending                  : ${s.pending} orang
Lamar ke Perusahaan      : ${s.lamar} orang
Sedang Interview         : ${s.interview} orang
Lulus Interview          : ${s.lulus} orang
Gagal Interview          : ${s.gagal} orang
Pemberkasan              : ${s.pemberkasan} orang
Berangkat                : ${s.berangkat_progres} orang
Ditolak                  : ${s.ditolak} orang

[STATISTIK INTERVIEW — berdasarkan riwayat perubahan status]
Total pernah di-Interview       : ${ih.total_interview} kandidat
Total pernah Dijadwalkan Ulang  : ${ih.total_jadwalkan} kandidat
Total pernah Lulus Interview    : ${ih.total_lulus} kandidat
Total pernah Gagal Interview    : ${ih.total_gagal} kandidat
Persentase Kelulusan Interview  : ${ih.persentase_lulus}%

[KEBERANGKATAN]
Status Terbang (sudah berangkat): ${s.berangkat} orang
Status Stay                      : ${s.stay} orang
Status Keluar                    : ${s.keluar} orang
Detail Status Keberangkatan      : ${keberangkatanStr}

[DEMOGRAFI]
Laki-laki                : ${lakiLaki} orang
Perempuan                : ${perempuan} orang
Usia di bawah 30 tahun   : ${s.usia_bawah_30} orang
Pendidikan Terakhir      : ${pendidikanStr}

[DISTRIBUSI KANDIDAT PER CABANG]
${cabangLines}
Seluruh Cabang Terdaftar : ${s.semua_cabang.join(', ')}

[PROGRES KANDIDAT APPROVED PER CABANG]
${progresCabangLines}

[KEPEMILIKAN SERTIFIKAT JFT PER CABANG]
${jftCabangLines}

[KEPEMILIKAN SERTIFIKAT SSW PER CABANG]
${sswCabangLines}

[KANDIDAT PER BIDANG SSW x GENDER]
${sswLines}

[PERUSAHAAN YANG SEDANG DILAMAR]
${perusahaanLines}

[TREN PENDAFTARAN 6 BULAN TERAKHIR]
${trenStr}

[DATA RIWAYAT PERUBAHAN KANDIDAT]
Riwayat perubahan status kandidat (progres, interview, keberangkatan, dll) tercatat di tabel kandidat_history. Jika ada pertanyaan tentang history atau perubahan status seorang kandidat, data tersebut berasal dari tabel kandidat_history yang menyimpan record perubahan dari tabel kandidat_profil.

${kandidatData ? `
══════════════════════════════════════════════════════
DATA KANDIDAT YANG DICARI (jika ada dalam pertanyaan)
══════════════════════════════════════════════════════
${formatKandidatHistory(kandidatData)}
` : ''}

══════════════════════════════════════════════════════
ATURAN MENJAWAB — WAJIB DIIKUTI SEPENUHNYA
══════════════════════════════════════════════════════
1. Jawab HANYA berdasarkan data di atas. Dilarang keras mengarang atau menebak angka.
2. Gunakan bahasa Indonesia yang natural, hangat, dan profesional.
3. DILARANG menggunakan: **, ##, *, tanda hubung sebagai bullet, penomoran di depan kalimat, atau format Markdown apapun.
4. Tulis dalam kalimat utuh dan paragraf. Jawaban sederhana cukup 1-3 kalimat; jawaban kompleks boleh sampai 5 kalimat.
5. Jika ditanya angka, sebutkan angkanya secara langsung dan spesifik.
6. Jika relevan, tambahkan konteks tambahan seperti persentase, perbandingan antar cabang, atau catatan tren.
7. Jika pertanyaan di luar konteks sistem penempatan kerja ini, jawab: "Maaf, saya hanya dapat membantu pertanyaan seputar sistem penempatan kerja ini."
8. Jika data yang ditanyakan tidak tersedia dalam sistem, katakan terus terang: "Data tersebut tidak tersedia dalam sistem saat ini."
9. Jika ditanya tentang history atau perubahan status kandidat tertentu, gunakan data kandidat yang tersedia di section "DATA KANDIDAT YANG DICARI" jika ada. Jawab berdasarkan data riwayat tersebut secara lengkap.`;
};

// Cari kandidat berdasarkan nama dan ambil profil + history
const searchKandidatByName = async (nama) => {
  try {
    const [kandidat] = await pool.query(`
      SELECT kp.id, kp.nama_lengkap, kp.status_formulir, kp.status_progres,
             kp.status_keberangkatan, kp.sertifikat_ssw, kp.nama_perusahaan,
             kp.bidang_ssw, kp.jenis_kelamin, kp.pendidikan_terakhir,
             c.nama_cabang as cabang
      FROM kandidat_profil kp
      LEFT JOIN cabang c ON kp.cabang_id = c.id
      WHERE kp.nama_lengkap LIKE ?
      ORDER BY kp.created_at DESC
      LIMIT 5
    `, [`%${nama}%`]);

    if (!kandidat.length) return null;

    const kandidatId = kandidat[0].id;
    const [history] = await pool.query(`
      SELECT field_name, old_value, new_value, created_at
      FROM kandidat_history
      WHERE kandidat_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `, [kandidatId]);

    return { ...kandidat[0], history };
  } catch (err) {
    console.error('[searchKandidatByName] Error:', err);
    return null;
  }
};

// Format history kandidat untuk system prompt
const formatKandidatHistory = (k) => {
  if (!k) return '';
  const historyLines = k.history.map(h =>
    `[${new Date(h.created_at).toLocaleDateString('id-ID')}] ${h.field_name}: "${h.old_value || '-'}" → "${h.new_value}"`
  ).join('\n');
  return `
[NAMA] ${k.nama_lengkap}
[CABANG] ${k.cabang || '-'}
[STATUS FORMULIR] ${k.status_formulir || '-'}
[STATUS PROGRES] ${k.status_progres || '-'}
[STATUS KEBERANGKATAN] ${k.status_keberangkatan || '-'}
[SERTIFIKAT SSW] ${k.sertifikat_ssw || '-'}
[BIDANG SSW] ${k.bidang_ssw || '-'}
[PERUSAHAAN] ${k.nama_perusahaan || '-'}
[PENDIDIKAN] ${k.pendidikan_terakhir || '-'}
[RIWAYAT PERUBAHAN STATUS]
${historyLines || '(tidak ada riwayat)'}`.trim();
};

// ─────────────────────────────────────────────────────────────────
// GROQ: Kirim pesan + sistem prompt ke LLM
// ─────────────────────────────────────────────────────────────────
const chatWithGroq = async (message, dbStats, kandidatData = null) => {
  if (!dbStats) {
    return 'Maaf, sistem tidak dapat mengakses database saat ini. Silakan coba beberapa saat lagi.';
  }

  const systemPrompt = buildSystemPrompt(dbStats, kandidatData);

  try {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model      : 'llama-3.1-8b-instant',
        messages   : [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: message },
        ],
        temperature: 0.15,
        max_tokens : 400,
        top_p      : 0.85,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[chatWithGroq] Groq API error:', errText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data  = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) throw new Error('Empty response from Groq');
    return reply;

  } catch (err) {
    console.error('[chatWithGroq] Error:', err.message);
    return 'Maaf, terjadi gangguan pada sistem AI. Silakan coba lagi dalam beberapa saat.';
  }
};

// Ekstrak nama kandidat dari pesan (kira-kira)
const extractKandidatName = (message) => {
  const patterns = [
    /riwayat\s+(?:kandidat\s+)?(.+?)(?:\s|$)/i,
    /profile\s+(?:kandidat\s+)?(.+?)(?:\s|$)/i,
    /info\s+(?:kandidat\s+)?(.+?)(?:\s|$)/i,
    /tentang\s+(.+?)(?:\s|$)/i,
  ];
  for (const p of patterns) {
    const m = message.match(p);
    if (m && m[1] && m[1].length > 2 && m[1].length < 50) return m[1].trim();
  }
  return null;
};

router.post('/chat', authenticate, authorize('admin_penempatan', 'admin_cabang'), async (req, res) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong.' });
    }

    const cleanMessage = message.trim().slice(0, 600);
    const dbStats = await getDbStats();
    
    // Cari data kandidat jika pesan mengandung permintaan info kandidat
    const kandidatName = extractKandidatName(cleanMessage);
    let kandidatData = null;
    if (kandidatName) {
      kandidatData = await searchKandidatByName(kandidatName);
    }

    const reply = await chatWithGroq(cleanMessage, dbStats, kandidatData);

    return res.json({ success: true, message: reply });

  } catch (err) {
    console.error('[POST /chat] Error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/ai/stats — Statistik mentah (debug / dashboard)
// ─────────────────────────────────────────────────────────────────
router.get('/stats', authenticate, authorize('admin_penempatan', 'admin_cabang'), async (req, res) => {
  try {
    const stats = await getDbStats();
    if (!stats) {
      return res.status(503).json({ success: false, message: 'Database tidak tersedia saat ini.' });
    }
    return res.json({ success: true, data: stats });
  } catch (err) {
    console.error('[GET /stats] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/ai/history — Placeholder riwayat chat
// ─────────────────────────────────────────────────────────────────
router.get('/history', authenticate, authorize('admin_penempatan', 'admin_cabang'), async (req, res) => {
  return res.json({ success: true, history: [] });
});

module.exports = router;