/**
 * Uji override nilai dari pratinjau (koreksi admin):
 *  preview -> edit nilai -> generate memakai override -> simpan ke kandidat
 */
const axios = require('axios');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:5010';
const KANDIDAT_ID = process.argv[2] || '473';

(async () => {
  const login = await axios.post(`${BASE}/api/auth/login`, {
    email: 'adminpenempatan@gmail.com',
    password: 'admin123',
  });
  const api = axios.create({
    baseURL: BASE,
    headers: { Authorization: `Bearer ${login.data.token}` },
  });

  const tpls = (await api.get('/api/cv-template')).data.data;
  const tplId = tpls.find((t) => t.is_active)?.id || tpls[0].id;

  // 1) pratinjau
  const prev = await api.post(`/api/cv-template/generate/preview/${KANDIDAT_ID}`, {
    cv_template_id: tplId,
    bahasa: 'ja',
  });
  const values = prev.data.data.values;
  const cari = (k) => values.find((v) => v.key === k)?.value;
  console.log('✔ pratinjau (tanpa override):');
  console.log('   tujuan_ke_jepang =', JSON.stringify((cari('tujuan_ke_jepang') || '').slice(0, 40)));
  console.log('   agama            =', JSON.stringify(cari('agama')));

  // 2) admin mengoreksi 2 field
  const overrides = {
    tujuan_ke_jepang: '日本で働き、家族の生活を支えたいと考えています。',
    agama: 'キリスト教',
  };

  // 3) pratinjau dengan override -> harus ikut berubah
  const prev2 = await api.post(`/api/cv-template/generate/preview/${KANDIDAT_ID}`, {
    cv_template_id: tplId,
    bahasa: 'ja',
    overrides,
  });
  const v2 = prev2.data.data.values;
  const cari2 = (k) => v2.find((v) => v.key === k)?.value;
  console.log('✔ pratinjau (dengan override):');
  console.log('   tujuan_ke_jepang =', JSON.stringify(cari2('tujuan_ke_jepang')));
  console.log('   agama            =', JSON.stringify(cari2('agama')), '(tidak diterjemahkan lagi ✓)');

  // 4) generate dengan override
  const gen = await api.post(`/api/cv-template/generate/${KANDIDAT_ID}`, {
    cv_template_id: tplId,
    bahasa: 'ja',
    overrides,
  });
  console.log('✔ generate dengan override:', gen.data.data.file_name);

  // 5) cek isi file
  const dl = await api.get(`/api/cv-template/generated/download/${gen.data.data.id}`, {
    responseType: 'arraybuffer',
  });
  const out = path.join(__dirname, 'tmp-override.xlsx');
  fs.writeFileSync(out, Buffer.from(dl.data));
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(out);
  const ws = wb.worksheets[0];
  const det = (await api.get(`/api/cv-template/${tplId}/placeholders`)).data.data;
  const findAddr = (name) => {
    const p = det.placeholders.find((x) => x.name === name);
    return p ? p.cells[0].split(' ')[0] : null;
  };
  const addrTujuan = findAddr('tujuan_ke_jepang');
  const addrAgama = findAddr('agama');
  if (addrTujuan) console.log('   sel tujuan  =', JSON.stringify(ws.getCell(addrTujuan).value));
  if (addrAgama) console.log('   sel agama   =', JSON.stringify(ws.getCell(addrAgama).value));
  fs.unlinkSync(out);

  // 6) bersihkan: hapus override tersimpan (kandidat 473)
  const mysql = require('mysql2/promise');
  require('dotenv').config();
  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  await c.query("DELETE FROM kandidat_terjemahan WHERE kandidat_id = ? AND field_key IN ('tujuan_ke_jepang','agama')", [KANDIDAT_ID]);
  await c.query('DELETE FROM cv_generated');
  fs.readdirSync('uploads/cv-generated').forEach((f) => {
    if (f.endsWith('.xlsx') && f !== 'contoh-template-cv.xlsx') fs.unlinkSync('uploads/cv-generated/' + f);
  });
  await c.end();
  console.log('✔ data uji dibersihkan');
})().catch((e) => {
  console.error('GAGAL:', e.response?.status, JSON.stringify(e.response?.data).slice(0, 300));
  process.exit(1);
});
