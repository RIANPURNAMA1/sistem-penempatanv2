/**
 * Uji end-to-end endpoint /api/cv-template via HTTP:
 *  login -> upload template -> daftar -> preview -> generate -> unduh hasil
 */
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const os = require('os');

const BASE = process.env.BASE_URL || 'http://localhost:5005';
const EMAIL = process.env.EMAIL || 'adminpenempatan@gmail.com';
const PASSWORD = process.env.PASSWORD || 'admin123';
const KANDIDAT_ID = process.argv[2] || '473';

const TMP = path.join(os.tmpdir(), 'cvtest');
const TEMPLATE = path.join(TMP, 'template-uji.xlsx');
const OUT = path.join(TMP, 'cv-http-hasil.xlsx');

(async () => {
  const login = await axios.post(`${BASE}/api/auth/login`, { email: EMAIL, password: PASSWORD });
  const token = login.data.token;
  const api = axios.create({
    baseURL: BASE,
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('✔ login OK');

  // 1. Upload template
  const fd = new FormData();
  fd.append('template', fs.createReadStream(TEMPLATE));
  fd.append('nama_template', 'Template Uji HTTP');
  const up = await api.post('/api/cv-template/upload', fd, {
    headers: fd.getHeaders(),
  });
  const tplId = up.data.id;
  console.log('✔ upload OK. id =', tplId, '| placeholder terdeteksi =', up.data.detected.total);
  console.log('  grup:', up.data.detected.groups.map((g) => `${g.group}(${g.rows.join(',')})`).join(', '));

  // 2. Daftar template
  const list = await api.get('/api/cv-template');
  console.log('✔ daftar template:', list.data.data.length, 'item');

  // 3. Katalog placeholder
  const cat = await api.get('/api/cv-template/catalog');
  console.log('✔ katalog placeholder:', cat.data.data.length, 'item');

  // 4. Preview isian
  const prev = await api.post(`/api/cv-template/generate/preview/${KANDIDAT_ID}`, {
    cv_template_id: tplId,
  });
  const values = prev.data.data.values;
  const terisi = values.filter((v) => v.hasValue).length;
  console.log(`✔ pratinjau: ${terisi}/${values.length} terisi`);
  console.log('  contoh:', values.filter((v) => v.hasValue).slice(0, 5).map((v) => `${v.key}=${v.value}`).join(' | '));

  // 5. Generate
  const gen = await api.post(`/api/cv-template/generate/${KANDIDAT_ID}`, { cv_template_id: tplId });
  const d = gen.data.data;
  console.log('✔ generate OK:', d.file_name, '| filled =', d.filled, '| warnings =', d.warnings.length);

  // 6. Unduh hasil
  const dl = await api.get(`/api/cv-template/generated/download/${gen.data.data.id}`, { responseType: 'arraybuffer' });
  fs.writeFileSync(OUT, Buffer.from(dl.data));
  console.log('✔ unduh hasil ->', OUT, fs.statSync(OUT).size, 'bytes');

  // 7. Riwayat
  const hist = await api.get(`/api/cv-template/generate/history/${KANDIDAT_ID}`);
  console.log('✔ riwayat:', hist.data.data.length, 'file');

  // 8. Contoh template
  const sample = await api.get('/api/cv-template/sample-template', { responseType: 'arraybuffer' });
  console.log('✔ unduh template contoh:', Buffer.from(sample.data).length, 'bytes');

  // 9. Hapus template uji
  await api.delete(`/api/cv-template/${tplId}`);
  console.log('✔ template uji dihapus');
})().catch((e) => {
  console.error('GAGAL:', e.response?.status, JSON.stringify(e.response?.data).slice(0, 400) || e.message);
  process.exit(1);
});
