/**
 * Uji fitur bahasa isian CV:
 *  - pratinjau & render dengan bahasa ja / id / auto
 *  - cek nilai dropdown pada template berbahasa Jepang
 */
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { getKandidatFull } = require(path.join(__dirname, 'src/services/cvDataFetcher'));
const { renderTemplate } = require(path.join(__dirname, 'src/services/cvTemplateRenderer'));
const { detectPlaceholders } = require(path.join(__dirname, 'src/services/cvPlaceholderParser'));

const TEMPLATE =
  process.env.TEMPLATE ||
  path.join(__dirname, 'uploads', 'cv-templates', 'tpl-1792651876869-a2monmjghu8.xlsx');
const KANDIDAT_ID = process.argv[2] || '473';

(async () => {
  const det = await detectPlaceholders(TEMPLATE);
  const k = await getKandidatFull(KANDIDAT_ID);
  const targets = det.placeholders.filter((p) =>
    ['agama', 'jenis_kelamin', 'status_nikah', 'pernah_ke_jepang', 'merokok', 'alkohol', 'paspor', 'golongan_darah'].includes(
      p.name
    )
  );

  for (const lang of ['auto', 'ja', 'id']) {
    const out = path.join(__dirname, `tmp-lang-${lang}.xlsx`);
    const r = await renderTemplate(TEMPLATE, k, out, { bahasa: lang });
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(out);
    const ws = wb.worksheets[0];
    console.log(`\n=== bahasa: ${lang} ===`);
    targets.forEach((p) => {
      const addr = p.cells[0].split(' ')[0];
      console.log('  ', p.name.padEnd(20), '=', JSON.stringify(ws.getCell(addr).value));
    });
    console.log('   filled:', r.filled, '| warning dropdown:', r.warnings.filter((w) => w.includes('daftar pilihan')).length);
    fs.unlinkSync(out);
  }
  process.exit(0);
})().catch((e) => {
  console.error('GAGAL:', e);
  process.exit(1);
});
