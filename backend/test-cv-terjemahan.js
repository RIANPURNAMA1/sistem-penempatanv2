/**
 * Uji fitur penerjemahan isian CV:
 *  - simpan terjemahan manual
 *  - pratinjau & generate memakai terjemahan
 *  - detail: daftar field + nilai terstruktur
 */
const path = require('path');
const axios = require('axios');
const ExcelJS = require('exceljs');
const { getKandidatFull } = require(path.join(__dirname, 'src/services/cvDataFetcher'));
const { renderTemplate } = require(path.join(__dirname, 'src/services/cvTemplateRenderer'));

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

  // 1) simpan terjemahan manual
  const simpan = await api.put(`/api/cv-template/terjemahan/${KANDIDAT_ID}`, {
    bahasa: 'ja',
    translations: {
      tujuan_ke_jepang: '家族の家計，改善し，日本で Arbeitner iencesたいと思っています。',
      kelebihan_diri: '責任感が強く，新しい環境にすぐ慣れる性格です。',
    },
  });
  console.log('✔ simpan terjemahan:', simpan.data.message);

  // 2) daftar terjemahan
  const list = await api.get(`/api/cv-template/terjemahan/${KANDIDAT_ID}`, {
    params: { bahasa: 'ja' },
  });
  console.log('✔ daftar field:', list.data.data.fields.length);
  list.data.data.fields.slice(0, 3).forEach((f) =>
    console.log('   -', f.label, '=>', (f.terjemahan || '(belum)').slice(0, 40))
  );
  console.log('   nilai terstruktur (contoh):', JSON.stringify(list.data.data.nilai).slice(0, 200));

  // 3) pratinjau dengan bahasa ja
  const tpls = (await api.get('/api/cv-template')).data.data;
  const tplId = tpls.find((t) => t.is_active)?.id || tpls[0].id;
  const prev = await api.post(`/api/cv-template/generate/preview/${KANDIDAT_ID}`, {
    cv_template_id: tplId,
    bahasa: 'ja',
  });
  const values = prev.data.data.values;
  const cari = (k) => values.find((v) => v.key === k)?.value;
  console.log('✔ pratinjau (ja):');
  console.log('   tujuan_ke_jepang =', JSON.stringify(cari('tujuan_ke_jepang')));
  console.log('   kelebihan_diri   =', JSON.stringify(cari('kelebihan_diri')));
  console.log('   agama            =', JSON.stringify(cari('agama')));
  console.log('   jenis_kelamin    =', JSON.stringify(cari('jenis_kelamin')));

  // 4) generate + cek sel file
  const gen = await api.post(`/api/cv-template/generate/${KANDIDAT_ID}`, {
    cv_template_id: tplId,
    bahasa: 'ja',
  });
  console.log('✔ generate:', gen.data.data.file_name, '| bahasa:', gen.data.data.bahasa);
  console.log('   warnings:', gen.data.data.warnings.slice(0, 2));

  // 5) bersihkan terjemahan uji
  await api.put(`/api/cv-template/terjemahan/${KANDIDAT_ID}`, {
    bahasa: 'ja',
    translations: { tujuan_ke_jepang: '', kelebihan_diri: '' },
  });
  const mysql = require('mysql2/promise');
  require('dotenv').config();
  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  await c.query('DELETE FROM kandidat_terjemahan WHERE kandidat_id = ?', [KANDIDAT_ID]);
  await c.query('DELETE FROM cv_generated');
  const fs = require('fs');
  fs.readdirSync('uploads/cv-generated').forEach((f) => {
    if (f.endsWith('.xlsx') && f !== 'contoh-template-cv.xlsx') fs.unlinkSync('uploads/cv-generated/' + f);
  });
  await c.end();
  console.log('✔ data uji dibersihkan');
})().catch((e) => {
  console.error('GAGAL:', e.response?.status, JSON.stringify(e.response?.data).slice(0, 300));
  process.exit(1);
});
