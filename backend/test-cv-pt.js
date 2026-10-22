const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
require('dotenv').config();
const { detectPlaceholders } = require('./src/services/cvPlaceholderParser');
const { getKandidatFull } = require('./src/services/cvDataFetcher');
const { renderTemplate } = require('./src/services/cvTemplateRenderer');

const TEMPLATE = path.join(__dirname, 'uploads', 'cv-templates', 'tpl-1792651876869-a2monmjghu8.xlsx');
const OUT = path.join(__dirname, 'tmp-pt.xlsx');

(async () => {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  const [rows] = await c.query(
    "SELECT id FROM kandidat_pendidikan WHERE kandidat_id = 473 AND jenjang = 'Perguruan Tinggi' LIMIT 1"
  );
  if (!rows.length) {
    console.log('tidak ada baris PT untuk kandidat 473');
    process.exit(0);
  }
  const id = rows[0].id;
  await c.query('UPDATE kandidat_pendidikan SET jenjang_detail = ? WHERE id = ?', ['S1', id]);

  const det = await detectPlaceholders(TEMPLATE);
  const k = await getKandidatFull(473);
  await renderTemplate(TEMPLATE, k, OUT);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(OUT);
  const ws = wb.worksheets[0];
  console.log('isi baris pendidikan:');
  for (let r = 31; r <= 34; r++) {
    console.log('  ', ['A', 'B', 'E', 'F', 'H', 'J'].map((col) => `${col}${r}=${JSON.stringify(ws.getCell(col + r).value)}`).join(' '));
  }
  fs.unlinkSync(OUT);
  await c.query('UPDATE kandidat_pendidikan SET jenjang_detail = NULL WHERE id = ?', [id]);
  await c.end();
  process.exit(0);
})().catch((e) => {
  console.error('GAGAL:', e);
  process.exit(1);
});
