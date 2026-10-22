const ExcelJS = require('exceljs');
require('./exceljsPatch');
const fs = require('fs');
const path = require('path');
const { CATALOG, resolveGroupKey } = require('../config/cvFields');
const fmt = require('./cvFormatter');
const { translateValue } = require('./cvTranslator');
const { cellText, dropdownOptionsFromCell, PLACEHOLDER_RE, ANY_PLACEHOLDER_RE } = require('./cvPlaceholderParser');

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');
const EMU_PER_PIXEL = 9525;
const PHOTO_RATIO = 3 / 4; // lebar:tinggi

/* ------------------------------------------------------------------ *
 * Helper
 * ------------------------------------------------------------------ */

const isEmpty = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

/** Ambil nilai mentah dari map data profil (mendukung alias grup). */
function resolveRaw(prof, key) {
  const g = resolveGroupKey(key);
  if (g) {
    const v = prof[g.canonicalKey];
    return v === undefined ? null : v;
  }
  const v = prof[key];
  return v === undefined ? null : v;
}

/**
 * Nilai akhir sebuah placeholder, lalu diterjemahkan ke bahasa CV yang dipilih.
 * @param {string} lang "auto" | "ja" | "id"
 */
function resolveValue(prof, key, lang, fixedKeys) {
  const result = resolveValueRaw(prof, key);
  if (result.value === null || result.value === undefined) return result;
  // Nilai yang sudah dioverride admin dipakai apa adanya (tidak diterjemahkan lagi).
  if (fixedKeys && fixedKeys.has(key)) return { value: result.value, warning: result.warning };
  return { value: translateValue(key, result.value, lang), warning: result.warning };
}
/**
 * Hitung nilai akhir sebuah placeholder.
 * Mengembalikan { value, warning }.
 */
function resolveValueRaw(prof, key) {
  const meta = CATALOG[key] || null;
  const group = resolveGroupKey(key);
  const format = (group && group.format) || (meta && meta.format) || null;
  const type = (group && group.type) || (meta && meta.type) || 'text';

  const raw = resolveRaw(prof, key);

  // --- Nilai turunan (dihitung dari kolom lain, tidak butuh nilai mentah) ---
  if (key === 'tanggal_lahir_jp') {
    const d = prof.tanggal_lahir_parsed || fmt.parseDate(raw);
    if (!d) return { value: null, warning: null };
    return { value: fmt.formatJpDate(d), warning: null };
  }
  if (key === 'tanggal_lahir') {
    const d = prof.tanggal_lahir_parsed || fmt.parseDate(raw);
    if (!d) return { value: null, warning: null };
    return { value: fmt.formatDateShort(d), warning: null };
  }
  if (key === 'usia') {
    const d = prof.tanggal_lahir_parsed;
    const computed = d ? fmt.age(d) : null;
    if (computed !== null) return { value: computed, warning: null };
    if (isEmpty(raw)) return { value: null, warning: null };
    const digits = String(raw).replace(/\D+/g, '');
    return { value: digits ? parseInt(digits, 10) : null, warning: null };
  }

  if (isEmpty(raw)) return { value: null, warning: null };

  // --- Periode grup (pendidikan_N_mulai / kerja_N_periode) ---
  if (group) {
    if (group.sub === 'mulai' || group.sub === 'selesai') {
      if (typeof raw === 'object' && raw !== null) {
        if (group.sub === 'selesai' && raw.masih_bekerja) return { value: '現在まで', warning: null };
        const p = fmt.periodFromRow(raw.bulan, raw.tahun);
        return { value: p.jp || p.text, warning: null };
      }
    }
    if (group.sub === 'periode') {
      if (typeof raw === 'object' && raw !== null) {
        const a = fmt.periodFromRow(raw.mulai && raw.mulai.bulan, raw.mulai && raw.mulai.tahun);
        const b = raw.selesai && raw.selesai.masih_bekerja
          ? { jp: '現在まで', text: 'Sekarang' }
          : fmt.periodFromRow(raw.selesai && raw.selesai.bulan, raw.selesai && raw.selesai.tahun);
        const jp = [a.jp, b.jp].filter(Boolean).join(' - ');
        const text = [a.text, b.text].filter(Boolean).join(' - ');
        return { value: jp || text || null, warning: null };
      }
    }
    if (group.sub === 'penghasilan') {
      return { value: fmt.moneyFamily(raw) || fmt.money(raw), warning: null };
    }
    if (group.sub === 'usia') {
      // Satuan (才/tahun) sudah ada di template, jadi cukup angkanya.
      const n = parseInt(String(raw).replace(/\D+/g, ''), 10);
      return { value: Number.isFinite(n) ? String(n) : null, warning: null };
    }
    if (type === 'number') {
      const n = Number(raw);
      return { value: Number.isFinite(n) ? n : String(raw), warning: null };
    }
    return { value: String(raw), warning: null };
  }

  // --- Format profil ---
  if (format === 'upper') return { value: String(raw).toUpperCase(), warning: null };
  if (format === 'date_jp') {
    const d = fmt.parseDate(raw);
    return { value: d ? fmt.formatJpDate(d) : String(raw), warning: null };
  }
  if (format === 'date') {
    const d = fmt.parseDate(raw);
    return { value: d ? fmt.formatDateShort(d) : String(raw), warning: null };
  }
  if (format === 'age') {
    const d = prof.tanggal_lahir_parsed;
    const a = d ? fmt.age(d) : null;
    if (a !== null) return { value: a, warning: null };
  }
  if (format === 'bool') return { value: fmt.boolText(raw), warning: null };
  if (format === 'phone') {
    const r = fmt.normalizePhone(raw);
    return { value: r.value, warning: r.warning };
  }
  if (format === 'money') return { value: fmt.money(raw), warning: null };
  if (format === 'money_family') return { value: fmt.moneyFamily(raw), warning: null };

  if (typeof raw === 'boolean') return { value: fmt.boolText(raw), warning: null };
  if (raw instanceof Date) {
    const d = fmt.parseDate(raw);
    return { value: d ? fmt.formatDateShort(d) : raw.toISOString().slice(0, 10), warning: null };
  }
  if (type === 'number') {
    const n = Number(raw);
    if (Number.isFinite(n)) return { value: n, warning: null };
  }
  return { value: String(raw), warning: null };
}

/** Cocokkan nilai dengan daftar pilihan (data validation) milik sel template. */
function applyDropdown(key, value, options) {
  if (!options || !options.length || value === null || value === undefined) {
    return { value, warning: null };
  }
  const r = fmt.matchDropdown(options, value);
  if (r.value === null) {
    return {
      value: null,
      warning: `{${key}}: nilai "${value}" tidak ada di daftar pilihan template${r.suggestion ? ` (pilihan terdekat: ${r.suggestion})` : ''}.`,
    };
  }
  return { value: r.value, warning: null };
}

/* ------------------------------------------------------------------ *
 * Foto
 * ------------------------------------------------------------------ */

function colPx(worksheet, colNumber) {
  const col = worksheet.getColumn(colNumber);
  const width = col && col.width ? col.width : 8.43;
  return Math.max(1, Math.round(width * 7 + 5));
}

function rowPx(worksheet, rowNumber) {
  const row = worksheet.getRow(rowNumber);
  const height = row && row.height ? row.height : 15;
  return Math.max(1, Math.round(height * (96 / 72)));
}

/** Cari range merge yang memuat sel anchor. */
function findMerge(worksheet, address) {
  const merges = worksheet.model.merges || [];
  const cell = worksheet.getCell(address);
  for (const range of merges) {
    const m = /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(range);
    if (!m) continue;
    const c1 = colToNum(m[1]);
    const r1 = parseInt(m[2], 10);
    const c2 = colToNum(m[3]);
    const r2 = parseInt(m[4], 10);
    if (cell.col >= c1 && cell.col <= c2 && cell.row >= r1 && cell.row <= r2) {
      return { range, c1, r1, c2, r2 };
    }
  }
  return null;
}

function colToNum(letters) {
  let n = 0;
  for (let i = 0; i < letters.length; i++) n = n * 26 + (letters.charCodeAt(i) - 64);
  return n;
}

function numToCol(num) {
  let n = num;
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s || 'A';
}

/** Cari file foto di disk berdasarkan path_file dari database. */
function findPhotoFile(foto) {
  if (!foto || !foto.path_file) return null;
  const rel = String(foto.path_file).replace(/^uploads[\\/]+/, '').replace(/\\/g, '/');
  const direct = path.resolve(UPLOAD_ROOT, rel);
  if (fs.existsSync(direct)) return direct;

  const base = path.basename(rel);
  const candidates = [
    path.resolve(UPLOAD_ROOT, base),
    path.resolve(__dirname, '..', '..', rel),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

/**
 * Tempel foto (rasio 3:4) di dalam area sel, mengikuti area merge bila ada.
 */
async function placePhoto(wb, worksheet, cell, photoPath, warnings) {
  try {
    const ext = photoPath.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
    const imageId = wb.addImage({ filename: photoPath, extension: ext });

    const merge = findMerge(worksheet, cell.address);
    const c1 = merge ? merge.c1 : cell.col;
    const c2 = merge ? merge.c2 : cell.col;
    const r1 = merge ? merge.r1 : cell.row;
    const r2 = merge ? merge.r2 : cell.row;

    let areaW = 0;
    for (let c = c1; c <= c2; c++) areaW += colPx(worksheet, c);
    let areaH = 0;
    for (let r = r1; r <= r2; r++) areaH += rowPx(worksheet, r);

    const pad = 3;
    const availW = Math.max(10, areaW - pad * 2);
    const availH = Math.max(10, areaH - pad * 2);
    let w = Math.floor(Math.min(availW, availH * PHOTO_RATIO));
    let h = Math.floor(w / PHOTO_RATIO);
    if (h > availH) {
      h = availH;
      w = Math.floor(h * PHOTO_RATIO);
    }
    w = Math.max(10, w);
    h = Math.max(10, h);

    // Posisi tengah di dalam area (EMU), dihitung dari offset kolom/baris.
    const dxPx = pad + Math.floor((availW - w) / 2);
    const dyPx = pad + Math.floor((availH - h) / 2);

    let col = c1;
    let offXPx = dxPx;
    for (let c = c1; c <= c2; c++) {
      const wpx = colPx(worksheet, c);
      if (offXPx < wpx || c === c2) break;
      offXPx -= wpx;
      col++;
    }
    let row = r1;
    let offYPx = dyPx;
    for (let r = r1; r <= r2; r++) {
      const hpx = rowPx(worksheet, r);
      if (offYPx < hpx || r === r2) break;
      offYPx -= hpx;
      row++;
    }

    worksheet.addImage(imageId, {
      tl: {
        nativeCol: col - 1,
        nativeColOff: Math.round(offXPx * EMU_PER_PIXEL),
        nativeRow: row - 1,
        nativeRowOff: Math.round(offYPx * EMU_PER_PIXEL),
      },
      ext: { width: w, height: h },
      editAs: 'oneCell',
    });
    return true;
  } catch (e) {
    warnings.push(`Gagal menempel foto: ${e.message}`);
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * Render
 * ------------------------------------------------------------------ */

/**
 * Perbaiki relationship komentar/VML yang target-nya tidak ada di map.
 * ExcelJS gagal saat menulis file bila rel Target tidak cocok dengan
 * nama file komentar yang terbaca (mis. "comments2.xml" tapi isinya "comments1.xml").
 */
function repairCommentRelations(wb) {
  const model = wb && wb.model;
  if (!model) return;
  const comments = model.comments || {};
  const vmls = model.vmlDrawings || {};
  const commentKeys = Object.keys(comments);
  const vmlKeys = Object.keys(vmls);
  const relsMap = model.worksheetRels || {};

  Object.keys(relsMap).forEach((sheetNo) => {
    const rels = relsMap[sheetNo] || [];
    let ci = 0;
    let vi = 0;
    rels.forEach((rel) => {
      const type = String(rel.Type || '');
      if (/comments/i.test(type)) {
        if (comments[rel.Target]) return;
        const key = commentKeys[ci++];
        if (key) rel.Target = key;
        return;
      }
      if (/vmlDrawing/i.test(type)) {
        if (vmls[rel.Target]) return;
        const key = vmlKeys[vi++];
        if (key) rel.Target = key;
      }
    });
  });
}

/**
 * Isi template Excel dengan data kandidat.
 * Placeholder tanpa data dikosongkan (tidak pernah ditulis sebagai "{nama}").
 */
async function renderTemplate(templatePath, kandidatFull, outPath, options) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(templatePath);
  repairCommentRelations(wb);

  const prof = kandidatFull.profil || {};
  const lang = (options && options.bahasa) || 'auto';
  const fixedKeys = (options && options.fixedKeys) || null;
  const warnings = [];
  const missing = {};
  const filled = {};
  const photoCells = [];

  wb.eachSheet((worksheet) => {
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell({ includeEmpty: false }, (cell) => {
        const text = cellText(cell);
        if (!text || !text.includes('{')) return;

        // --- Foto ---
        if (text.trim() === '{foto}') {
          cell.value = '';
          photoCells.push({ sheet: worksheet.name, address: cell.address });
          return;
        }

        const options = dropdownOptionsFromCell(cell, worksheet);
        let out = text;
        const names = Array.from(new Set(Array.from(text.matchAll(ANY_PLACEHOLDER_RE)).map((m) => m[1])));

        names.forEach((name) => {
          const { value, warning } = resolveValue(prof, name, lang, fixedKeys);
          if (warning) warnings.push(`{${name}}: ${warning}`);

          let finalValue = value;
          if (finalValue !== null && finalValue !== undefined && options && options.length) {
            const dr = applyDropdown(name, finalValue, options);
            if (dr.warning) warnings.push(dr.warning);
            finalValue = dr.value;
          }

          if (finalValue === null || finalValue === undefined || finalValue === '') {
            missing[name] = true;
            out = out.split('{' + name + '}').join('');
            return;
          }
          filled[name] = finalValue;
          out = out.split('{' + name + '}').join(String(finalValue));
        });

        if (out.trim() === '') {
          cell.value = '';
          return;
        }

        // Pertahankan format rich text (bold/ukuran font) bila sel-asal rich text.
        const original = cell.value;
        if (original && typeof original === 'object' && Array.isArray(original.richText) && original.richText.length) {
          const runs = original.richText.map((r) => ({ ...r }));
          runs[0].text = out;
          runs.length = 1;
          cell.value = { richText: runs };
        } else {
          cell.value = out;
        }
      });
    });
  });

  // --- Tempel foto di sel {foto} ---
  if (photoCells.length) {
    const photoPath = findPhotoFile(kandidatFull.foto);
    if (!photoPath) {
      const info = kandidatFull.foto
        ? ` Dokumen ${kandidatFull.foto.jenis_dokumen || 'foto'} tercatat di database tetapi berkasnya tidak ada di server (${kandidatFull.foto.path_file || '?'}) — upload ulang fotonya.`
        : ' Dokumen pas_foto / foto_full_body tidak ditemukan.';
      warnings.push(`Foto belum tersedia untuk kandidat ini.${info}`);
    } else {
      for (const target of photoCells) {
        const sheet = wb.getWorksheet(target.sheet);
        if (!sheet) continue;
        let cell;
        try {
          cell = sheet.getCell(target.address);
        } catch (e) {
          continue;
        }
        if (!cell) continue;
        await placePhoto(wb, sheet, cell, photoPath, warnings);
      }
    }
  }

  // --- Nama sheet & metadata ---
  if (wb.worksheets.length) {
    const sheetName = fmt.sheetName(prof.nama_romaji || prof.user_nama || 'CV');
    try {
      wb.worksheets[0].name = sheetName;
    } catch (e) {
      /* nama sheet tidak valid, abaikan */
    }
  }
  wb.creator = '';
  wb.lastModifiedBy = '';
  wb.title = '';
  wb.subject = '';
  wb.description = '';
  wb.keywords = '';
  wb.category = '';
  wb.company = '';
  wb.manager = '';

  await wb.xlsx.writeFile(outPath);

  const missingNames = Object.keys(missing);
  if (missingNames.length) {
    const shown = missingNames.slice(0, 8).map((n) => `{${n}}`).join(', ');
    const more = missingNames.length > 8 ? ` dan ${missingNames.length - 8} lainnya` : '';
    warnings.push(
      `${missingNames.length} placeholder tanpa data (sel dikosongkan): ${shown}${more}.`
    );
  }

  return {
    warnings: Array.from(new Set(warnings)),
    missing: missingNames,
    filled: Object.keys(filled).length,
    photoPlaced: photoCells.length > 0,
  };
}

/**
 * Pratinjau nilai placeholder untuk kandidat (tanpa menulis berkas).
 * `optionsMap` berisi pilihan dropdown per key → nilai ditampilkan sesuai
 * apa yang akan tertulis di file (mis. "Ayah" → "父 (AYAH)").
 */
function previewValues(kandidatFull, keys, optionsMap, lang, fixedKeys) {
  const prof = kandidatFull.profil || {};
  const list = keys && keys.length ? keys : Object.keys(CATALOG);
  const opts = optionsMap || {};
  const out = [];
  list.forEach((key) => {
    const { value } = resolveValue(prof, key, lang, fixedKeys);
    const meta = CATALOG[key] || null;
    const options = opts[key];
    let shown = value === null || value === undefined ? '' : String(value);
    let mismatch = false;

    if (options && options.length && shown !== '') {
      const r = fmt.matchDropdown(options, shown);
      if (r.value === null) {
        mismatch = true;
      } else {
        shown = String(r.value);
      }
    }

    out.push({
      key,
      label: meta ? meta.label : key,
      type: meta ? meta.type : 'text',
      known: !!meta,
      value: shown,
      raw: value === null || value === undefined ? '' : String(value),
      hasValue: value !== null && value !== undefined && value !== '',
      dropdown: options && options.length ? options : null,
      mismatch,
    });
  });
  return out;
}

module.exports = {
  renderTemplate,
  previewValues,
  resolveValue,
  resolveRaw,
  findPhotoFile,
  PLACEHOLDER_RE,
  ANY_PLACEHOLDER_RE,
};
