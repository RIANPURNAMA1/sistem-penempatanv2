/**
 * Uji end-to-end fitur Generate CV:
 *  1. buat template contoh berisi placeholder
 *  2. deteksi placeholder
 *  3. ambil data kandidat
 *  4. render CV
 *  5. verifikasi isi sel hasil
 */
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

const ROOT = __dirname;
const { detectPlaceholders } = require(path.join(ROOT, 'src/services/cvPlaceholderParser'));
const { getKandidatFull } = require(path.join(ROOT, 'src/services/cvDataFetcher'));
const { renderTemplate, previewValues } = require(path.join(ROOT, 'src/services/cvTemplateRenderer'));

const TMP = path.join(require('os').tmpdir(), 'cvtest');
if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });

const KANDIDAT_ID = process.argv[2] || '473';

async function buildTemplate(outPath) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Lamaran');
  ws.getColumn(1).width = 30;
  ws.getColumn(2).width = 40;
  ws.getColumn(3).width = 20;
  ws.getColumn(4).width = 20;

  const set = (addr, val) => {
    ws.getCell(addr).value = val;
  };

  set('A1', 'Foto');
  ws.mergeCells('A1:B4');
  set('A1', '{foto}');

  set('C1', 'Nama (Romaji)');
  set('D1', '{nama_romaji}');
  set('C2', 'Nama (Katakana)');
  set('D2', '{nama_katakana}');
  set('C3', 'Tempat, Tanggal Lahir');
  set('D3', '{tempat_lahir}, {tanggal_lahir}');
  set('C4', 'Tanggal Lahir (JP)');
  set('D4', '{tanggal_lahir_jp}');
  set('C5', 'Usia');
  set('D5', '{usia}');
  set('C6', 'Jenis Kelamin');
  set('D6', '{jenis_kelamin}');
  set('C7', 'Agama');
  set('D7', '{agama}');
  set('C8', 'Status Pernikahan');
  set('D8', '{status_nikah}');
  set('C9', 'Pendidikan Terakhir');
  set('D9', '{pendidikan_terakhir}');
  set('C10', 'No. HP');
  set('D10', '{no_hp}');
  set('C11', 'Email');
  set('D11', '{email}');
  set('C12', 'Alamat');
  set('D12', '{alamat}');
  set('C13', 'Kontak Orang Tua');
  set('D13', '{kontak_ortu_nama} / {kontak_darurat_telp}');
  set('C14', 'Tinggi / Berat');
  set('D14', '{tinggi} cm / {berat} kg');
  set('C15', 'Lingkar Pinggang');
  set('D15', '{lingkar_pinggang}');
  set('C16', 'Panjang Telapak Kaki');
  set('D16', '{panjang_telapak_kaki}');
  set('C17', 'Ukuran Baju');
  set('D17', '{ukuran_baju}');
  set('C18', 'SIM');
  set('D18', '{sim_status}');
  set('C19', 'Golongan Darah');
  set('D19', '{golongan_darah}');
  set('C20', 'Vaksin');
  set('D20', '{sudah_vaksin}');
  set('C21', 'Berkacamata');
  set('D21', '{berkacamata}');
  set('C22', 'Penglihatan');
  set('D22', '{penglihatan_kanan} / {penglihatan_kiri}');
  set('C23', 'Kondisi Kesehatan');
  set('D23', '{kondisi_kesehatan}');
  set('C24', 'Riwayat Penyakit');
  set('D24', '{riwayat_penyakit}');

  set('A6', 'RIWAYAT PENDIDIKAN');
  set('F7', 'Jenjang');
  set('G7', 'Sekolah');
  set('H7', 'Jurusan');
  set('I7', 'Periode');
  [1, 2, 3, 4, 5].forEach((i) => {
    const r = 7 + i;
    set('F' + r, `{pendidikan_${i}_jenjang}`);
    set('G' + r, `{pendidikan_${i}_nama_sekolah}`);
    set('H' + r, `{pendidikan_${i}_jurusan}`);
    set('I' + r, `{pendidikan_${i}_mulai} - {pendidikan_${i}_selesai}`);
  });

  set('A14', 'PEKERJAAN');
  [1, 2, 3].forEach((i) => {
    const r = 14 + i;
    set('F' + r, `{kerja_${i}_perusahaan}`);
    set('G' + r, `{kerja_${i}_posisi}`);
    set('H' + r, `{kerja_${i}_mulai} - {kerja_${i}_selesai}`);
  });

  set('A19', 'KELUARGA');
  [1, 2, 3].forEach((i) => {
    const r = 19 + i;
    set('F' + r, `{keluarga_${i}_hubungan}`);
    set('G' + r, `{keluarga_${i}_nama}`);
    set('H' + r, `{keluarga_${i}_usia}`);
    set('I' + r, `{keluarga_${i}_penghasilan}`);
  });

  set('A24', 'SERTIFIKAT');
  set('B24', '{sertifikat_ssw}');
  set('A25', 'JLPT');
  set('B25', '{level_jlpt}');
  set('A26', 'Tujuan');
  set('B26', '{tujuan_ke_jepang}');
  set('A27', 'Placeholder tidak dikenal');
  set('B27', '{field_yang_tidak_ada}');
  await wb.xlsx.writeFile(outPath);
}

(async () => {
  const tplPath = path.join(TMP, 'template-uji.xlsx');
  const outPath = path.join(TMP, 'cv-hasil.xlsx');

  await buildTemplate(tplPath);
  console.log('✔ template dibuat:', tplPath);

  const detected = await detectPlaceholders(tplPath);
  console.log(
    '✔ placeholder terdeteksi:',
    detected.placeholders.length,
    '| group:',
    detected.groups.map((g) => `${g.group}(${g.rows.join(',')})`).join(', ')
  );
  console.log(
    '  contoh:',
    detected.placeholders.slice(0, 8).map((p) => `${p.name}${p.known ? '' : ' (?)'}`).join(', ')
  );

  const kandidat = await getKandidatFull(KANDIDAT_ID);
  if (!kandidat) throw new Error('Kandidat tidak ditemukan');
  console.log('✔ data kandidat diambil. nama_romaji =', kandidat.profil.nama_romaji);
  console.log('  usia =', kandidat.profil.usia, '| tanggal_lahir =', kandidat.profil.tanggal_lahir_parsed);

  const res = await renderTemplate(tplPath, kandidat, outPath);
  console.log('✔ render selesai. filled =', res.filled);
  console.log('  warnings:', res.warnings.length ? res.warnings : '(tidak ada)');
  if (res.missing.length) console.log('  missing:', res.missing.join(', '));

  const out = new ExcelJS.Workbook();
  await out.xlsx.readFile(outPath);
  const ws = out.worksheets[0];
  console.log('\n--- ISI CV HASIL ---');
  ['A1', 'D1', 'D2', 'D3', 'D4', 'D5', 'D10', 'D11', 'D12', 'D13', 'D14', 'D17', 'D18', 'D20', 'D24'].forEach((a) => {
    console.log(`  ${a}: ${JSON.stringify(ws.getCell(a).value)}`);
  });
  console.log('  pendidikan:');
  [1, 2, 3, 4, 5].forEach((i) => {
    const r = 7 + i;
    console.log(
      `    ${i}: ${JSON.stringify(ws.getCell('F' + r).value)} | ${JSON.stringify(
        ws.getCell('G' + r).value
      )} | ${JSON.stringify(ws.getCell('H' + r).value)} | ${JSON.stringify(ws.getCell('I' + r).value)}`
    );
  });
  console.log(
    '  keluarga 1:',
    JSON.stringify(ws.getCell('F20').value),
    JSON.stringify(ws.getCell('G20').value),
    JSON.stringify(ws.getCell('H20').value),
    JSON.stringify(ws.getCell('I20').value)
  );
  console.log('  unknown:', JSON.stringify(ws.getCell('B27').value));
  console.log('  images:', (out.media || []).length);
  console.log('\nBerkas hasil:', outPath);
  process.exit(0);
})().catch((e) => {
  console.error('GAGAL:', e);
  process.exit(1);
});
