/**
 * Pemformat deterministik (tanpa AI) untuk nilai placeholder CV.
 * Semua fungsi murni dan tidak menyentuh database.
 */

const { MONTHS_ID, BULAN_TO_NUM } = require('../config/cvFields');

const TZ = 'Asia/Jakarta';

function todayJakarta() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const [y, m, d] = parts.split('-').map(Number);
  return { year: y, month: m, day: d };
}

function makeDate(y, m, d) {
  if (!y || !m || !d) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return { year: y, month: m, day: d };
}

/**
 * Terima Date, "YYYY-MM-DD", "DD/MM/YYYY", "DD-MM-YYYY", "20 April 1993".
 * Kembalikan { year, month, day } atau null.
 */
function parseDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    // mysql2 membentuk kolom DATE MySQL sebagai Date pada zona waktu lokal
    // (contoh: 2007-03-29 lokal -> "2007-03-28T17:00:00.000Z" saat diserialisasi).
    // Karena itu gunakan getter lokal, bukan UTC, agar tanggal tidak mundur satu hari.
    return makeDate(
      value.getFullYear(),
      value.getMonth() + 1,
      value.getDate(),
    );
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return excelSerialToDate(value);
  }
  const s = String(value ?? '').trim();
  if (s === '') return null;

  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (m) return makeDate(+m[1], +m[2], +m[3]);

  m = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/.exec(s);
  if (m) return makeDate(+m[3], +m[2], +m[1]);

  m = /^(\d{1,2})\s+([A-Za-z]+)\.?\s+(\d{4})$/.exec(s);
  if (m) {
    const mon = BULAN_TO_NUM[m[2].toLowerCase()];
    if (mon) return makeDate(+m[3], mon, +m[1]);
  }
  return null;
}

function excelSerialToDate(serial) {
  if (serial <= 20000 || serial >= 80000) return null;
  const ms = Math.round((serial - 25569) * 86400 * 1000);
  const dt = new Date(ms);
  return makeDate(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

/** "29 Maret 2007" */
function formatDateID(d) {
  if (!d) return null;
  return `${d.day} ${MONTHS_ID[d.month - 1]} ${d.year}`;
}

/** "29/03/2007" */
function formatDateShort(d) {
  if (!d) return null;
  const mm = String(d.month).padStart(2, '0');
  const dd = String(d.day).padStart(2, '0');
  return `${dd}/${mm}/${d.year}`;
}

/** "年2007 月03 日29" (format Jepang pada template 実習生経歴書) */
function formatJpDate(d) {
  if (!d) return null;
  return `年${d.year} 月${String(d.month).padStart(2, '0')} 日${String(d.day).padStart(2, '0')}`;
}

/** Usia pada tanggal tertentu (default hari ini, Asia/Jakarta). */
function age(d, ref) {
  if (!d) return null;
  const t = ref || todayJakarta();
  let a = t.year - d.year;
  if (t.month < d.month || (t.month === d.month && t.day < d.day)) a -= 1;
  return a < 0 ? null : a;
}

/**
 * Periode pendidikan/kerja dari baris DB (bulan_masuk varchar + tahun_masuk year).
 * Kembalikan { text, year, month, jp }.
 */
function periodFromRow(bulan, tahun) {
  const b = String(bulan ?? '').trim();
  const y = parseInt(tahun, 10);
  const mon = BULAN_TO_NUM[b.toLowerCase()] ?? null;

  if (!Number.isFinite(y) && !b) return { text: null, year: null, month: null, jp: null };

  if (Number.isFinite(y)) {
    const label = mon ? `${MONTHS_ID[mon - 1]} ${y}` : `${y}`;
    const jp = mon ? `${y}年${String(mon).padStart(2, '0')}月` : `${y}年`;
    return { text: label, year: y, month: mon, jp };
  }
  return { text: b || null, year: null, month: null, jp: b || null };
}

/** Periode gabungan "Juli 2013 - Juni 2019" */
function periodRange(mulai, selesai) {
  const a = periodFromRow(mulai.bulan, mulai.tahun);
  const b = periodFromRow(selesai.bulan, selesai.tahun);
  if (a.text && b.text) return `${a.text} - ${b.text}`;
  return a.text || b.text || null;
}

/**
 * Normalisasi nomor HP ke "(+62)8xxxxxxxxxx".
 * Kembalikan { value, warning }.
 */
function normalizePhone(raw) {
  const s = String(raw ?? '').trim();
  if (s === '') return { value: null, warning: null };
  if (/[A-Za-z]/.test(s)) return { value: null, warning: 'No. HP mengandung huruf dan dikosongkan.' };

  let digits = s.replace(/\D+/g, '');
  while (digits.startsWith('62') && digits.length > 11) digits = digits.slice(2);
  if (digits.startsWith('62')) digits = digits.slice(2);
  digits = digits.replace(/^0+/, '');

  if (digits.length < 8 || digits.length > 13) {
    return { value: null, warning: 'Panjang No. HP tidak wajar dan dikosongkan.' };
  }
  return { value: `(+62)${digits}`, warning: null };
}

/** Uang: " ¥2.500.000". Null bila tidak ada data. */
function money(raw) {
  const digits = String(raw ?? '').replace(/\D+/g, '');
  if (!digits) return null;
  return ` ¥${parseInt(digits, 10).toLocaleString('id-ID')}`;
}

/** Penghasilan keluarga: "なし" bila tidak berpenghasilan. */
function moneyFamily(raw) {
  const s = String(raw ?? '').trim().toLowerCase();
  if (s === '') return null;
  if (['0', '-', 'tidak ada', 'tidak', 'nihil', 'tidak ada penghasilan', 'tdk ada', 'なし'].includes(s)) {
    return 'なし';
  }
  return money(raw);
}

/** Boolean tinyint(1) → "Ya" / "Tidak" */
function boolText(value) {
  if (value === null || value === undefined || value === '') return null;
  if (value === true || value === 1 || value === '1') return 'Ya';
  if (value === false || value === 0 || value === '0') return 'Tidak';
  return String(value);
}

/** Buang bagian （…） atau (…) lalu lowercase, untuk pencocokan dropdown. */
function dropdownBase(option) {
  return String(option ?? '')
    .replace(/[（(].*?[）)]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Normalisasi teks: kurung full-width → half-width, spasi dirapatkan, lowercase. */
function normalizeText(value) {
  return String(value ?? '')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Buang tanda panjang (ー) supaya "イスラーム教" dan "islam lam" dianggap sama.
 */
function stripLongVowel(value) {
  return String(value ?? '').replace(/[ー－‐]/g, '');
}

/**
 * Kandidat teks dari satu pilihan dropdown.
 * Template bisa memakai beberapa gaya, semua harus dicoba:
 *   "男 Laki-laki"         → ["男 laki-laki", "男", "laki-laki"]
 *   "有（飲む）"            → ["有(飲む)", "有", "飲む"]
 *   "無 Single"            → ["無 single", "無", "single"]
 *   "Belum Menikah（未婚）" → ["belum menikah(未婚)", "belum menikah", "未婚"]
 */
function optionTokens(option) {
  const full = normalizeText(option);
  const out = new Set();
  const add = (v) => {
    const s = String(v ?? '').trim();
    if (!s) return;
    out.add(s);
    const loose = stripLongVowel(s);
    if (loose) out.add(loose);
  };
  add(full);
  const m = /^(.*)\(([^()]*)\)$/.exec(full);
  if (m) {
    add(m[1]);
    add(m[2]);
  }
  full.split(' ').forEach(add);
  return Array.from(out);
}

/**
 * Sinonim nilai → pilihan dropdown.
 * Berisi padanan bahasa Jepang karena template CV SSW memakai gaya
 * "utama = Jepang, keterangan = Indonesia" (mis. 有/無 atau イスラーム教).
 */
const VALUE_SYNONYMS = {
  // boolean
  ya: ['ya', 'ada', 'pernah', 'punya', 'sudah punya', 'memiliki', '有'],
  tidak: ['tidak', 'tidak ada', 'belum', 'belum pernah', 'belum punya', 'tidak dimiliki', '無'],
  ada: ['ada', 'memiliki', '有'],
  'tidak ada': ['tidak ada', 'tidak', '無'],
  pernah: ['pernah', '有'],
  'belum pernah': ['belum pernah', 'belum', '無'],
  'sudah punya': ['sudah punya', 'punya', '有'],
  'belum punya': ['belum punya', 'belum', '無'],
  // agama
  islam: ['islam', 'イスラーム教'],
  kristen: ['kristen', 'キリスト教'],
  katolik: ['katolik', 'カトリック'],
  hindu: ['hindu', 'ヒンドゥー'],
  buddha: ['buddha', '仏教'],
  konghucu: ['konghucu', '儒教'],
  // jenis kelamin
  'laki-laki': ['laki-laki', '男'],
  perempuan: ['perempuan', '女'],
  // status pernikahan
  'belum menikah': ['single', 'belum menikah', 'belum'],
  menikah: ['menikah', 'married', '既婚'],
  // golongan darah
  'tidak tahu': ['tidak tahu', 'tidak diketahui', '不明'],
  // agama & lain-lain
  lainnya: ['lainnya', 'その他'],
  // jenjang perguruan tinggi
  s1: ['s1', 'sarjana', '大学', 'univ'],
  s2: ['s2', 'magister', '大学', 'univ'],
  s3: ['s3', 'doktor', '大学', 'univ'],
  d3: ['d3', 'diploma 3', 'ディプロマ３'] ,
  d4: ['d4', 'sarjana terapan', '大学', 'univ'],
  'perguruan tinggi': ['perguruan tinggi', '大学', 'univ', 'perguruan'],

  // ---- nilai bahasa Jepang (hasil terjemahan) agar tetap cocok dengan
  //      template yang memakai gaya Indonesia ----
  '\u672a\u5a5a': ['\u672a\u5a5a', '\u7121', 'single', 'belum menikah'],
  '\u65e2\u5a5a': ['\u65e2\u5a5a', '\u6709', 'married', 'menikah'],
  '\u96e2\u5a5a': ['\u96e2\u5a5a', '\u7121', 'cerai'],
  '\u6709': ['\u6709', 'ya', 'ada', 'pernah', 'sudah punya'],
  '\u7121': ['\u7121', 'tidak', 'tidak ada', 'belum', 'belum pernah', 'belum punya'],
  '\u7537': ['\u7537', 'laki-laki'],
  '\u5973': ['\u5973', 'perempuan'],
  '\u4e0d\u660e': ['\u4e0d\u660e', 'tidak tahu'],
  '\u53f3': ['\u53f3', 'kanan'],
  '\u5de6': ['\u5de6', 'kiri'],
  '\u5c0f\u5b66\u6821': ['\u5c0f\u5b66\u6821', 'sd'],
  '\u4e2d\u5b66': ['\u4e2d\u5b66', 'smp'],
  '\u901a\u5e38\u9ad8\u6821': ['\u901a\u5e38\u9ad8\u6821', 'sma'],
  '\u8077\u696d\u9ad8\u6821': ['\u8077\u696d\u9ad8\u6821', 'smk'],
  '\u5927\u5b66': ['\u5927\u5b66', 'perguruan tinggi', 's1', 'univ'],
  '\u30c7\u30a3\u30d7\u30ed\u30de\uff13': ['\u30c7\u30a3\u30d7\u30ed\u30de\uff13', 'd3'],
  '\u7236': ['\u7236', 'ayah'],
  '\u6bcd': ['\u6bcd', 'ibu'],
  '\u592b': ['\u592b', 'suami'],
  '\u59bb': ['\u59bb', 'istri'],
  '\u5144': ['\u5144', 'kakak'],
  '\u5f1f': ['\u5f1f', 'adik'],
  '\u601d\u5b50': ['\u601d\u5b50', 'anak'],
  '\u304a\u723a\u3055\u3093': ['\u304a\u723a\u3055\u3093', 'kakek'],
  '\u304a\u59d0\u59b0\u3055\u3093': ['\u304a\u59d0\u59b0\u3055\u3093', 'nenek'],
  '\u30a4\u30b9\u30e9\u30fc\u30e0\u6559': ['\u30a4\u30b9\u30e9\u30fc\u30e0\u6559', 'islam'],
  '\u30ad\u30ea\u30b9\u30c8\u6559': ['\u30ad\u30ea\u30b9\u30c8\u6559', 'kristen'],
  '\u30ab\u30c8\u30ea\u30c3\u30af': ['\u30ab\u30c8\u30ea\u30c3\u30af', 'katolik'],
  '\u30d2\u30f3\u30c9\u30a5\u30fc\u6559': ['\u30d2\u30f3\u30c9\u30a5\u30fc\u6559', 'hindu'],
  '\u4f5b\u6559': ['\u4f5b\u6559', 'buddha'],
  '\u5112\u6559': ['\u5112\u6559', 'konghucu'],
  '\u305d\u306e\u4ed6': ['\u305d\u306e\u4ed6', 'lainnya'],
  '\u521d\u7d1a': ['\u521d\u7d1a', 'dasar'],
  '\u4e2d\u7d1a': ['\u4e2d\u7d1a', 'menengah'],
  '\u4e0a\u7d1a': ['\u4e0a\u7d1a', 'lancar'],
  '\u8fb2\u696d': ['\u8fb2\u696d', 'pertanian'],
  '\u98f2\u98df\u6599\u54c1\u88fd\u9020\u696d': ['\u98f2\u98df\u6599\u54c1\u88fd\u9020\u696d', 'pengolahan makanan'],
  '\u4ecb\u8b77': ['\u4ecb\u8b77', 'kaigo (perawat)'],
  '\u5916\u98df\u696d': ['\u5916\u98df\u696d', 'restoran'],
  '\u5efa\u8a2d': ['\u5efa\u8a2d', 'konstruksi'],
  '\u7267\u7523': ['\u7267\u7523', 'perternakan'],
  '\u5efa\u7269\u6e05\u6383': ['\u5efa\u7269\u6e05\u6383', 'building cleaning'],
  '\u81ea\u52d5\u8eca\u6574\u5099': ['\u81ea\u52d5\u8eca\u6574\u5099', 'perbaikan dan perawatan mobil'],
  '\u65c5\u5ba2\u30fb\u8ca8\u7269\u8f38\u9001\u696d': ['\u65c5\u5ba2\u30fb\u8ca8\u7269\u8f38\u9001\u696d', 'driver'],
  // tangan dominan
  kanan: ['kanan', '右'],
  kiri: ['kiri', '左'],
  // jenjang pendidikan
  sd: ['sd', '小学校', 'es'],
  smp: ['smp', '中学', 'jhs'],
  sma: ['sma', '普通高校'],
  smk: ['smk', '職業高校'],
  'sma/smk': ['smk', '職業高校'],
  // hubungan keluarga
  ayah: ['ayah', '父', 'bapak'],
  ibu: ['ibu', '母', 'ibu'],
  suami: ['suami', '夫'],
  istri: ['istri', '妻'],
  kakak: ['kakak', '兄', '姉'],
  adik: ['adik', '弟', '妹'],
  anak: ['anak', '息子', '娘'],
  kakek: ['kakek', 'お爺さん'],
  nenek: ['nenek', 'お祖母さん'],
};

function synonymList(base) {
  const out = new Set();
  const add = (v) => {
    const s = String(v ?? '').trim();
    if (!s) return;
    out.add(s);
    const loose = stripLongVowel(s);
    if (loose) out.add(loose);
  };

  const direct = VALUE_SYNONYMS[base];
  if (direct) direct.forEach(add);

  if (/^ya\b/.test(base) || /^ada\b/.test(base)) {
    ['ada', 'pernah', 'punya', 'memiliki', '有'].forEach((s) => out.add(s));
  }
  if (/^tidak\b/.test(base) || /^belum\b/.test(base) || /^nihil\b/.test(base)) {
    ['tidak', 'tidak ada', 'belum', 'tidak dimiliki', '無'].forEach((s) => out.add(s));
  }
  return Array.from(out);
}

/**
 * Cocokkan nilai mentah ke daftar pilihan dropdown template.
 * Mengembalikan { value, suggestion }.
 */
function matchDropdown(options, raw) {
  const list = Array.isArray(options) ? options.filter((o) => String(o ?? '').trim() !== '') : [];
  const s = String(raw ?? '').trim();
  if (s === '') return { value: null, suggestion: null };
  if (!list.length) return { value: s, suggestion: null };

  const base = normalizeText(s);
  const baseLoose = stripLongVowel(base);
  const tokens = list.map((o) => ({ option: o, tokens: optionTokens(o) }));

  // 1. Cocok persis dengan salah satu kandidat teks pilihan.
  //    (baseLoose: "イスラーム教" vs "islam lam" dianggap sama)
  const exact = tokens.find((t) => t.tokens.includes(base) || t.tokens.includes(baseLoose));
  if (exact) return { value: exact.option, suggestion: null };

  // 2. Cocok lewat sinonim (mis. "Islam" → イスラーム教, "Tidak" → 無).
  const syns = synonymList(base);
  if (syns.length) {
    const bySyn = tokens.find((t) => t.tokens.some((tok) => syns.includes(tok)));
    if (bySyn) return { value: bySyn.option, suggestion: null };
  }

  // 3. Pencocokan longgar (substring).
  const loose = list.find((o) => {
    const ob = normalizeText(o);
    return ob && base && (ob.includes(base) || base.includes(ob));
  });
  if (loose !== undefined) return { value: loose, suggestion: loose };

  return { value: null, suggestion: list[0] };
}

/** Nama sheet Excel: maksimal 31 karakter, tanpa karakter terlarang. */
function sheetName(name) {
  const s = String(name ?? '').replace(/[\\/?*[\]:]/g, '').trim().replace(/^'+|'+$/g, '');
  return s ? s.slice(0, 31) : 'CV';
}

/** Slug nama berkas aman. */
function slug(name) {
  const s = String(name ?? '')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '_');
  return s || 'peserta';
}

module.exports = {
  TZ,
  todayJakarta,
  parseDate,
  formatDateID,
  formatDateShort,
  formatJpDate,
  age,
  periodFromRow,
  periodRange,
  normalizePhone,
  money,
  moneyFamily,
  boolText,
  dropdownBase,
  matchDropdown,
  sheetName,
  slug,
};
