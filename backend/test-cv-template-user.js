/**
 * Uji render memakai template milik user (template_cv_mendunia_v2):
 * checking nilai dropdown (agama,okok, alkohol, jenis kelamin, dst).
 */
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { detectPlaceholders } = require(path.join(__dirname, 'src/services/cvPlaceholderParser'));
const { getKandidatFull } = require(path.join(__dirname, 'src/services/cvDataFetcher'));
const { renderTemplate } = require(path.join(__dirname, 'src/services/cvTemplateRenderer'));

const TEMPLATE =
  process.env.TEMPLATE ||
  path.join(__dirname, 'uploads', 'cv-templates', 'tpl-1792650729566-nts25xst9wm.xlsx');
const KANDIDAT_ID = process.argv[2] || '473';
const OUT = path.join(__dirname, 'tmp-cv-user.xlsx');

(async () => {
  const d = await detectPlaceholders(TEMPLATE);
  const unknown = d.placeholders.filter((x) => !x.known);
  console.log('total placeholder:', d.placeholders.length);
  console.log('tidak dikenal:', unknown.map((x) => x.name).join(', ') || '(tidak ada)');

  const k = await getKandidatFull(KANDIDAT_ID);
  if (!k) throw new Error('kandidat tidak ditemukan');
  const r = await renderTemplate(TEMPLATE, k, OUT);
  console.log('filled:', r.filled);
  console.log('warnings:');
  r.warnings.forEach((w) => console.log('  -', w));

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(OUT);
  const ws = wb.worksheets[0];

  console.log('\n--- nilai dropdown ---');
  d.placeholders
    .filter((p) => p.options.length)
    .forEach((p) => {
      const addr = (p.cells[0] || '').split(' ')[0];
      const v = ws.getCell(addr).value;
      const ok = v && String(v).trim() !== '' ? 'OK ' : 'KOSONG';
      console.log(`  ${ok} ${p.name.padEnd(22)} ${addr.padEnd(6)} = ${JSON.stringify(v)}   (opsi: ${p.options.join(' / ')})`);
    });

  console.log('\n--- placeholder tanpa data ---');
  console.log('  ', r.missing.join(', ') || '(tidak ada)');
  fs.unlinkSync(OUT);
  process.exit(0);
})().catch((e) => {
  console.error('GAGAL:', e);
  process.exit(1);
});
