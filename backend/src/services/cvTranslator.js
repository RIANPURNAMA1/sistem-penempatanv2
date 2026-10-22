/**
 * Terjemahan nilai profil untuk isi CV.
 *
 * Nilai profil tersimpan dalam bahasa Indonesia, sementara template CV SSW
 * memakai nilai dropdown berbahasa Jepang (未婚 / 女 / 無 / 不可). Modul ini
 * menerjemahkan nilai profil ke bahasa yang dipilih sebelum masuk ke template.
 *
 * Bahasa:
 *   auto : biarkan nilai apa adanya (pencocokan dropdown mencari yang terdekat)
 *   ja   : bahasa Jepang (sesuai template CV SSW)
 *   id   : bahasa Indonesia
 */

const {
  PETA_JA,
  PETA_ID,
  PETA_BOOLEAN,
  BOOLEAN_ID,
  FIELD_BOOLEAN,
} = require('../config/cvLanguages');
const { CATALOG } = require('../config/cvFields');

/** "keluarga_1_hubungan" -> "hubungan", "agama" -> "agama" */
function fieldFromKey(key) {
  const m = /_(\d+)_([a-z0-9_]+)$/.exec(String(key || ''));
  return m ? m[2] : String(key || '');
}

/**
 * Kandidat nama field untuk lookup kamus.
 * Placeholder bisa memakai alias (mis. {status_nikah} -> kolom status_pernikahan),
 * jadi coba beberapa varian nama field.
 */
function kandidatField(key) {
  const raw = String(key || '');
  const meta = CATALOG[raw];
  const canonical = meta && meta.aliasOf ? meta.aliasOf : raw;
  const out = [raw, canonical];
  const lastCanonical = fieldFromKey(canonical);
  const lastRaw = fieldFromKey(raw);
  if (lastCanonical && !out.includes(lastCanonical)) out.push(lastCanonical);
  if (lastRaw && !out.includes(lastRaw)) out.push(lastRaw);
  return out;
}

/** Index case-insensitive supaya "islam" tetap ketemu "Islam". */
function buildIndex(peta) {
  const index = {};
  Object.keys(peta).forEach((field) => {
    const inner = {};
    Object.keys(peta[field]).forEach((src) => {
      inner[String(src).toLowerCase()] = peta[field][src];
    });
    index[field] = inner;
  });
  return index;
}

const INDEX_JA = buildIndex(PETA_JA);
const INDEX_ID = buildIndex(PETA_ID);

/** "Ya/Tidak/Ada/Tidak ada/1/0" -> bentuk baku. */
function normalizeBool(value) {
  const s = String(value ?? '').trim().toLowerCase();
  if (s === '1' || s === 'true' || s === 'ya' || s === 'ada' || s === 'pernah' || s === 'sudah punya') {
    return 'Ya';
  }
  if (s === '0' || s === 'false' || s === 'tidak' || s === 'tidak ada' || s === 'belum pernah' || s === 'belum punya') {
    return 'Tidak';
  }
  return null;
}

/**
 * Terjemahkan nilai sebuah field.
 * @param {string} key    nama field / placeholder (mis. "agama", "keluarga_1_hubungan")
 * @param {*} value        nilai yang akan ditulis
 * @param {string} lang    "auto" | "ja" | "id"
 */
function translateValue(key, value, lang) {
  if (!lang || lang === 'auto') return value;
  if (value === null || value === undefined || value === '') return value;

  const s = String(value).trim();
  if (!s) return value;

  const index = lang === 'ja' ? INDEX_JA : INDEX_ID;
  const fields = kandidatField(key);

  // 1) nilai kategorikal (agama, jenis kelamin, status nikah, jenjang, ...)
  for (const field of fields) {
    if (index[field] && index[field][s.toLowerCase()]) {
      return index[field][s.toLowerCase()];
    }
  }

  // 2) nilai boolean (Ya/Tidak <-> 有/無)
  if (fields.some((f) => FIELD_BOOLEAN.includes(f))) {
    const bool = normalizeBool(s);
    if (bool) {
      if (lang === 'ja') return PETA_BOOLEAN[bool] || bool;
      return BOOLEAN_ID[bool] || bool;
    }
  }

  return value;
}

/** Daftar bahasa yang tersedia (untuk dikirim ke frontend). */
function daftarBahasa() {
  const { BAHASA } = require('../config/cvLanguages');
  return BAHASA;
}

/** Validasi kode bahasa; fallback ke "auto". */
function normalisasiBahasa(lang) {
  const code = String(lang || 'auto').toLowerCase();
  return ['auto', 'ja', 'id'].includes(code) ? code : 'auto';
}

/* ------------------------------------------------------------------ *
 * Teks bebas (tidak ada padanan dropdown) — perlu penerjemahan
 * ------------------------------------------------------------------ */

/** Field profil berisi teks bebas yang perlu diterjemahkan. */
const FIELD_BEBAS = [
  { key: 'tujuan_ke_jepang', label: 'Tujuan ke Jepang' },
  { key: 'alasan_ke_jepang', label: 'Alasan Ingin ke Jepang' },
  { key: 'cita_cita_setelah_jepang', label: 'Cita-cita Setelah Pulang' },
  { key: 'kelebihan_diri', label: 'Kelebihan Diri' },
  { key: 'kekurangan_diri', label: 'Kekurangan Diri' },
  { key: 'hobi', label: 'Hobi' },
  { key: 'keahlian', label: 'Keahlian' },
  { key: 'promosi_diri', label: 'Promosi Diri (自己PR)' },
  { key: 'catatan_tambahan', label: 'Catatan Tambahan (備考)' },
  { key: 'kerabat_alamat', label: 'Alamat Kerabat di Jepang' },
  { key: 'kenalan_jepang_detail', label: 'Detail Kenalan di Jepang' },
  { key: 'riwayat_penyakit', label: 'Riwayat Penyakit' },
  { key: 'kondisi_kesehatan', label: 'Kondisi Kesehatan' },
];

const FIELD_BEBAS_KEYS = FIELD_BEBAS.map((f) => f.key);

/**
 * Ambil terjemahan tersimpan (manual/AI) untuk kandidat.
 * @returns {Promise<Object>} map { field_key: { teks, sumber } }
 */
async function ambilTerjemahan(kandidatId, bahasa) {
  const pool = require('../config/database');
  const [rows] = await pool.query(
    `SELECT field_key, teks, sumber FROM kandidat_terjemahan
     WHERE kandidat_id = ? AND bahasa = ?`,
    [kandidatId, bahasa]
  );
  const out = {};
  rows.forEach((r) => {
    if (r.teks !== null && r.teks !== undefined && String(r.teks).trim() !== '') {
      out[r.field_key] = { teks: r.teks, sumber: r.sumber || 'manual' };
    }
  });
  return out;
}

/** Simpan terjemahan (upsert). */
async function simpanTerjemahan(kandidatId, fieldKey, bahasa, teks, sumber = 'manual') {
  const pool = require('../config/database');
  await pool.query(
    `INSERT INTO kandidat_terjemahan (kandidat_id, field_key, bahasa, teks, sumber)
     VALUES (?,?,?,?,?)
     ON DUPLICATE KEY UPDATE teks = VALUES(teks), sumber = VALUES(sumber)`,
    [kandidatId, fieldKey, bahasa, teks, sumber]
  );
}

/**
 * Siapkan terjemahan teks bebas untuk CV.
 * Urutan prioritas: terjemahan manual/AI tersimpan -> AI (bila ada kunci) -> teks asli.
 * @returns {Promise<{ map: Object, warning: string|null, belum: string[] }>}
 */
async function siapkanTerjemahan(kandidatFull, bahasa) {
  const kandidatId = kandidatFull.kandidatId;
  const prof = kandidatFull.profil || {};
  if (!bahasa || bahasa === 'auto' || !kandidatId) {
    return { map: {}, warning: null, belum: [], fixed: new Set() };
  }

  const tersimpan = await ambilTerjemahan(kandidatId, bahasa);
  const map = {};
  const fixed = new Set();
  const belum = [];
  const ai = require('./aiClient');
  let gagalAi = false;

  // 1) Terjemahan tersimpan (manual/AI) dipakai untuk semua key.
  Object.keys(tersimpan).forEach((key) => {
    map[key] = tersimpan[key].teks;
    fixed.add(key);
  });

  // Field statis + field grup bebas (mis. kerja_1_deskripsi)
  const target = FIELD_BEBAS.map((f) => ({ key: f.key, label: f.label }));
  Object.keys(prof).forEach((k) => {
    if (/^kerja_\d+_deskripsi$/.test(k)) target.push({ key: k, label: 'Deskripsi Pekerjaan' });
  });

  for (const field of target) {
    const asal = prof[field.key];
    if (!asal || !String(asal).trim()) continue;
    if (tersimpan[field.key]) continue; // sudah ada (manual/AI)

    belum.push(field.key);

    if (await ai.tersedia()) {
      const hasil = await ai.terjemahkan({
        teks: asal,
        ke: bahasa,
        konteks: `Field CV: ${field.label}`,
      });
      if (hasil) {
        map[field.key] = hasil;
        fixed.add(field.key);
        await simpanTerjemahan(kandidatId, field.key, bahasa, hasil, 'ai');
        belum.pop();
        continue;
      }
      gagalAi = true;
    }
  }

  const labelOf = (key) => {
    const found = target.find((t) => t.key === key);
    if (found) return found.label;
    const statis = FIELD_BEBAS.find((f) => f.key === key);
    return statis ? statis.label : key;
  };

  const warning =
    belum.length && bahasa === 'ja'
      ? `${belum.length} isian teks belum diterjemahkan (${belum.map(labelOf).join(', ')}). Isi manual di "Kelola Terjemahan" agar CV berbahasa Jepang.`
      : null;

  if (gagalAi && !warning) {
    return {
      map,
      fixed,
      warning: 'Terjemahan AI gagal diproses; sebagian isian tetap memakai bahasa asli.',
      belum,
    };
  }

  return { map, warning, belum, fixed };
}

/**
 * Terapkan override manual admin (nilai yang dikoreksi di pratinjau).
 * Nilai override dipakai apa adanya — tidak diterjemahkan lagi.
 * @returns {Set<string>} key yang di-override
 */
function terapkanOverride(prof, overrides) {
  const keys = new Set();
  if (!prof || !overrides || typeof overrides !== 'object') return keys;
  Object.keys(overrides).forEach((key) => {
    const value = overrides[key];
    if (value === undefined || value === null) return;
    prof[key] = value;
    keys.add(key);
  });
  return keys;
}

/**
 * Terapkan terjemahan ke objek profil (beserta alias placeholder-nya).
 */
function terapkanTerjemahan(prof, map) {
  if (!prof || !map) return;
  const { CATALOG: CAT } = require('../config/cvFields');
  Object.keys(map).forEach((key) => {
    if (!map[key]) return;
    prof[key] = map[key];
    // alias: {tujuan_setelah_pulang} <- cita_cita_setelah_jepang
    Object.keys(CAT).forEach((alias) => {
      const meta = CAT[alias];
      if (meta && meta.aliasOf === key) prof[alias] = map[key];
    });
  });
}

module.exports = {
  translateValue,
  fieldFromKey,
  normalizeBool,
  daftarBahasa,
  normalisasiBahasa,
  FIELD_BEBAS,
  FIELD_BEBAS_KEYS,
  ambilTerjemahan,
  simpanTerjemahan,
  siapkanTerjemahan,
  terapkanTerjemahan,
  terapkanOverride,
};
