/**
 * Uji render dengan template CV asli (実習生経歴書) dari project generate-cv-exels.
 * Memeriksa placeholder yang tak dikenal, dropdown, dan hasil sel.
 */
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { detectPlaceholders } = require(path.join(__dirname, 'src/services/cvPlaceholderParser'));
const { getKandidatFull } = require(path.join(__dirname, 'src/services/cvDataFetcher'));
const { renderTemplate } = require(path.join(__dirname, 'src/services/cvTemplateRenderer'));

const TEMPLATE =
  process.env.TEMPLATE ||
  path.join(
    __dirname,
    '..',
    '..',
    'generate-cv-exels',
    'backend',
    'storage',
    'app',
    'samples',
    'template_cv_placeholder.xlsx'
  );
const KANDIDAT_ID = process.argv[2] || '473';
const OUT = path.join(__dirname, 'tmp-cv-real.xlsx');

(async () => {
  const d = await detectPlaceholders(TEMPLATE);
  const unknown = d.placeholders.filter((x) => !x.known);
  console.log('total placeholder:', d.placeholders.length);
  console.log('grup:', d.groups.map((g) => `${g.group}(${g.rows.join(',')})`).join(', '));
  console.log('tidak dikenal:', unknown.map((x) => x.name).join(', ') || '(tidak ada)');
  console.log('semua:', d.placeholders.map((x) => x.name).join(', '));

  const k = await getKandidatFull(KANDIDAT_ID);
  if (!k) throw new Error('kandidat tidak ditemukan');
  const r = await renderTemplate(TEMPLATE, k, OUT);
  console.log('filled:', r.filled);
  console.log('warnings:');
  r.warnings.forEach((w) => console.log('  -', w));

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(OUT);
  const ws = wb.worksheets[0];
  console.log('\n--- sel hasil ---');
  ['L5', 'L6', 'L7', 'L12', 'L13', 'L14', 'L15', 'L17', 'L18', 'D52', 'L52', 'A56', 'E56', 'G56', 'I56', 'K56', 'A58'].forEach(
    (a) => console.log('  ', a, '=', JSON.stringify(ws.getCell(a).value))
  );
  console.log('  images:', (wb.media || []).length);
  fs.unlinkSync(OUT);
  process.exit(0);
})().catch((e) => {
  console.error('GAGAL:', e);
  process.exit(1);
});
