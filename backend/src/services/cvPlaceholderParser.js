const ExcelJS = require('exceljs');
require('./exceljsPatch');
const { CATALOG, resolveGroupKey, resolveDocumentKey, GROUP_FIELDS } = require('../config/cvFields');

const PLACEHOLDER_RE = /\{([a-z0-9_]+)\}/g;
// Pola longgar: menangkap placeholder apa pun (mis. {Nama Romaji}) supaya upload
// tidak ditolak dan pengguna bisa melihat penamaan yang perlu diperbaiki.
const ANY_PLACEHOLDER_RE = /\{([^{}\n]{1,60})\}/g;

function cellText(cell) {
  if (!cell || cell.value === null || cell.value === undefined) return null;
  const v = cell.value;
  if (typeof v === 'object') {
    if (v.richText && Array.isArray(v.richText)) {
      return v.richText.map((r) => r.text || '').join('');
    }
    if (v.text !== undefined) return String(v.text);
    if (typeof v.toString === 'function') {
      const s = v.toString();
      if (s === '[object Object]') return null;
      return s;
    }
    return null;
  }
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return String(v);
}

function columnLetterToNumber(letter) {
  let n = 0;
  for (let i = 0; i < letter.length; i++) n = n * 26 + (letter.charCodeAt(i) - 64);
  return n;
}

function numberToColumnLetter(num) {
  let n = num;
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s || 'A';
}

function dropdownOptionsFromCell(cell, worksheet) {
  try {
    const dataValidation = cell && cell.dataValidation ? cell.dataValidation : null;
    if (!dataValidation) return null;
    if (dataValidation.type !== 'list' && dataValidation.type !== 'List') return null;
    let formulae = dataValidation.formulae || dataValidation.formula || [];
    if (typeof formulae === 'string') formulae = [formulae];
    if (!formulae.length) return null;
    let f = String(formulae[0] || '').trim();
    if (f === '') return null;

    if ((f.startsWith('"') && f.endsWith('"')) || (f.startsWith('{') && f.endsWith('}'))) {
      const inner = f.startsWith('{') ? f.slice(1, -1) : f.slice(1, -1);
      const items = inner.split(',').map((x) => x.replace(/^"|"$/g, '').trim()).filter(Boolean);
      return items.length ? items : null;
    }
    f = f.replace(/^=/, '');
    let ws = worksheet;
    if (f.includes('!')) {
      const parts = f.split('!');
      const name = parts[0].replace(/^'/, '').replace(/'$/, '');
      ws = worksheet.workbook.getWorksheet(name) || worksheet;
      f = parts[1];
    }
    f = f.replace(/\$/g, '');
    if (!/^[A-Z]+\d+(:[A-Z]+\d+)?$/.test(f)) return null;
    const range = f.includes(':') ? f.split(':') : [f, f];
    const r1c = range[0];
    const r2c = range[1];
    const r1 = parseInt(r1c.replace(/[A-Z]/g, ''), 10);
    const c1 = columnLetterToNumber(r1c.replace(/\d+/g, ''));
    const r2 = parseInt(r2c.replace(/[A-Z]/g, ''), 10);
    const c2 = columnLetterToNumber(r2c.replace(/\d+/g, ''));
    const out = [];
    for (let r = Math.min(r1,r2); r <= Math.max(r1,r2); r++) {
      for (let c = Math.min(c1,c2); c <= Math.max(c1,c2); c++) {
        const t = cellText(ws.getCell(r, c));
        if (t && t.trim()) out.push(t.trim());
      }
    }
    return out.length ? out : null;
  } catch (e) {
    return null;
  }
}

async function detectPlaceholders(filePath) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);

  const found = new Map();
  const groups = new Map();

  wb.eachSheet((worksheet) => {
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const text = cellText(cell);
        if (!text) return;
        const matches = Array.from(text.matchAll(ANY_PLACEHOLDER_RE));
        if (!matches.length) return;

        matches.forEach((m) => {
          const name = m[1];
          const docInfo = resolveDocumentKey(name);
          const meta =
            CATALOG[name] ||
            (docInfo
              ? { label: docInfo.label, type: 'document', source: 'document', format: null }
              : null);
          const groupInfo = resolveGroupKey(name);

          if (groupInfo) {
            if (!groups.has(groupInfo.group)) {
              groups.set(groupInfo.group, {
                group: groupInfo.group,
                def: GROUP_FIELDS[groupInfo.group],
                items: new Map(),
                opts: {},
                placeholders: new Map(),
              });
            }
            const g = groups.get(groupInfo.group);
            if (!g.items.has(groupInfo.index)) g.items.set(groupInfo.index, new Set());
            g.items.get(groupInfo.index).add(groupInfo.sub);

            // Pilihan dropdown milik sel grup (mis. hubungan keluarga).
            const options = dropdownOptionsFromCell(cell, worksheet);
            if (options && options.length) {
              if (!g.opts[groupInfo.index]) g.opts[groupInfo.index] = {};
              if (!g.opts[groupInfo.index][groupInfo.sub]) g.opts[groupInfo.index][groupInfo.sub] = options;
            }

            // Simpan nama placeholder persis seperti tertulis di template
            // (mis. {pendidikan_1_sekolah}) beserta selnya.
            if (!g.placeholders.has(name)) {
              g.placeholders.set(name, {
                name,
                row: groupInfo.index,
                sub: groupInfo.sub,
                canonical: groupInfo.canonicalKey,
                label: groupInfo.label,
                cells: [],
                options: options || [],
              });
            }
            const gp = g.placeholders.get(name);
            const gcoord = numberToColumnLetter(colNumber) + row.number;
            if (gp.cells.length < 10) gp.cells.push(gcoord + ' (' + worksheet.name + ')');
            if (!gp.options.length && options) gp.options = options;
            return;
          }

          const options = dropdownOptionsFromCell(cell, worksheet);
          const type = options && (!meta || meta.type === 'text') ? 'dropdown' : (meta && meta.type ? meta.type : 'text');
          const known = !!meta;

          if (!found.has(name)) {
            found.set(name, {
              name: name,
              type: type,
              known: known,
              source: meta ? meta.source : null,
              label: meta ? meta.label : name,
              format: meta ? meta.format : null,
              cells: [],
              sheets: new Set(),
              options: [],
            });
          }
          const entry = found.get(name);
          const coord = numberToColumnLetter(colNumber) + row.number;
          entry.cells.push(coord + ' (' + worksheet.name + ')');
          entry.sheets.add(worksheet.name);
          if (options && options.length && entry.options.length === 0) entry.options = options;
        });
      });
    });
  });

  const placeholders = [];
  found.forEach((p) => {
    placeholders.push({
      name: p.name,
      type: p.type,
      known: p.known,
      source: p.source,
      label: p.label,
      format: p.format,
      cells: p.cells.slice(0, 10),
      sheets: Array.from(p.sheets),
      options: Array.from(new Set(p.options)),
    });
  });

  const groupList = [];
  groups.forEach((g) => {
    const subsSet = new Set();
    g.items.forEach((setv) => { setv.forEach((x) => subsSet.add(x)); });
    groupList.push({
      group: g.group,
      label: g.def.label,
      max: g.def.max,
      rows: Array.from(g.items.keys()).sort((a,b) => a-b),
      subs: Array.from(subsSet),
      opts: g.opts || {},
      placeholders: Array.from(g.placeholders.values()).sort((a, b) =>
        a.row !== b.row ? a.row - b.row : a.name.localeCompare(b.name)
      ),
    });
  });

  placeholders.sort((a,b) => {
    if (a.known !== b.known) return a.known ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return { placeholders: placeholders, groups: groupList };
}

module.exports = {
  detectPlaceholders,
  cellText,
  dropdownOptionsFromCell,
  PLACEHOLDER_RE,
  ANY_PLACEHOLDER_RE,
};
