/**
 * Cek isi sel hasil render untuk template milik user.
 */
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { getKandidatFull } = require(path.join(__dirname, 'src/services/cvDataFetcher'));
const { renderTemplate } = require(path.join(__dirname, 'src/services/cvTemplateRenderer'));

const TEMPLATE =
  process.env.TEMPLATE ||
  path.join(__dirname, 'uploads', 'cv-templates', 'tpl-1792651475619-ohdjvgxuqzq.xlsx');
const KANDIDAT_ID = process.argv[2] || '473';
const OUT = path.join(__dirname, 'tmp-v.xlsx');

(async () => {
  const k = await getKandidatFull(KANDIDAT_ID);
  await renderTemplate(TEMPLATE, k, OUT);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(OUT);
  const ws = wb.worksheets[0];

  console.log('--- keluarga (A=hubungan, B=nama, N=usia, O=pekerjaan) ---');
  for (let r = 46; r <= 50; r++) {
    const row = ['A', 'B', 'N', 'O', 'Q'].map((c) => `${c}${r}=${JSON.stringify(ws.getCell(c + r).value)}`);
    console.log('  ', row.join(' '));
  }

  console.log('--- pendidikan (B=sekolah, E=jenjang, F=mulai, H=selesai, J=jurusan) ---');
  for (let r = 31; r <= 34; r++) {
    const row = ['B', 'E', 'F', 'H', 'J'].map((c) => `${c}${r}=${JSON.stringify(ws.getCell(c + r).value)}`);
    console.log('  ', row.join(' '));
  }

  console.log('--- header identitas (Q5..Q14) ---');
  for (let r = 5; r <= 14; r++) {
    const v = ws.getCell('Q' + r).value;
    if (v !== null && v !== undefined && String(v).trim() !== '') console.log('   Q' + r, '=', JSON.stringify(v));
  }

  fs.unlinkSync(OUT);
  process.exit(0);
})().catch((e) => {
  console.error('GAGAL:', e);
  process.exit(1);
});
