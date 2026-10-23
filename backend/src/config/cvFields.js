/**
 * Satu sumber kebenaran katalog placeholder CV.
 *
 * Placeholder ditulis di sel template Excel dengan pola {nama_placeholder}.
 * Semuanya memakai huruf kecil, angka, dan underscore.
 *
 * type   : text | number | date | bool | textarea | photo | dropdown | period | money
 * source : profile (kolom kandidat_profil) | user (kolom users) | group (baris anak) | computed
 * format : upper | date | date_jp | age | bool | period | money | phone | money_family
 */

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const PROFILE_FIELDS = [
  // ---- Identitas ----
  ['nama_romaji', 'Nama (Romaji)', 'text', 'upper', ['nama_cv']],
  ['nama', 'Nama lengkap (akun)', 'text', null, []],
  ['nama_katakana', 'Nama (Katakana)', 'text', null, []],
  ['tempat_lahir', 'Tempat Lahir', 'text', null, []],
  ['tanggal_lahir', 'Tanggal Lahir', 'date', 'date', []],
  ['tanggal_lahir_jp', 'Tanggal Lahir (format Jepang)', 'text', 'date_jp', []],
  ['usia', 'Usia', 'number', 'age', []],
  ['jenis_kelamin', 'Jenis Kelamin', 'text', null, []],
  ['status_pernikahan', 'Status Pernikahan', 'text', null, ['status_nikah']],
  ['agama', 'Agama', 'text', null, []],
  ['jumlah_anak', 'Jumlah Anak', 'number', null, []],

  // ---- Fisik ----
  ['tinggi_badan', 'Tinggi Badan (cm)', 'number', null, ['tinggi']],
  ['berat_badan', 'Berat Badan (kg)', 'number', null, ['berat']],
  ['ukuran_baju', 'Ukuran Baju', 'text', null, []],
  ['lingkar_pinggang', 'Lingkar Pinggang (cm)', 'number', null, []],
  ['panjang_telapak_kaki', 'Panjang Telapak Kaki (cm)', 'number', null, []],
  ['golongan_darah', 'Golongan Darah', 'text', 'upper', []],
  ['tangan_dominan', 'Tangan Dominan', 'text', null, []],
  ['sim_dimiliki', 'SIM', 'text', null, ['sim_status']],
  ['ukuran_sepatu', 'Ukuran Sepatu (cm)', 'number', null, []],

  // ---- Kontak ----
  ['nomor_hp', 'No. HP', 'text', 'phone', ['no_hp']],
  ['email_kontak', 'Email', 'text', null, ['email']],
  ['alamat_lengkap', 'Alamat', 'textarea', null, ['alamat']],
  ['kontak_ortu_nama', 'Nama Kontak Orang Tua', 'text', null, []],
  ['kontak_ortu_hp', 'HP Kontak Orang Tua', 'text', 'phone', ['kontak_darurat_telp']],
  ['kontak_darurat_hubungan', 'Hubungan Kontak Darurat', 'text', null, []],
  ['paspor', 'Paspor', 'text', null, []],
  ['catatan_tambahan', 'Catatan Tambahan', 'textarea', null, []],
  ['promosi_diri', 'Promosi Diri', 'textarea', null, []],

  // ---- Riwayat kriminal / operasi / penyakit (dipakai template SSW) ----
  ['kriminal_ada', 'Riwayat Kriminal', 'text', null, []],
  ['kriminal_detail', 'Detail Riwayat Kriminal', 'textarea', null, []],
  ['operasi_ada', 'Riwayat Operasi', 'text', null, []],
  ['operasi_detail', 'Detail Riwayat Operasi', 'textarea', null, []],
  ['penyakit_ada', 'Riwayat Penyakit (Ada/Tidak)', 'text', null, []],

  // ---- Data paspor & peserta ----
  ['nomor_paspor', 'Nomor Paspor', 'text', null, []],
  ['paspor_kadaluarsa', 'Paspor Berakhir (tanggal)', 'text', null, []],
  ['nomor_peserta', 'Nomor Peserta', 'text', null, []],
  ['tanggal_buat_bulan', 'Tanggal Terbit Paspor - Bulan', 'text', null, []],
  ['tanggal_buat_tahun', 'Tanggal Terbit Paspor - Tahun', 'text', null, []],
  ['tanggal_buat_hari', 'Tanggal Terbit Paspor - Hari', 'text', null, []],

  // ---- LPK (lembaga pengBATU) ----
  ['lpk_nama', 'Nama LPK', 'text', null, []],
  ['lpk_mulai_bulan', 'LPK Mulai - Bulan', 'text', null, []],
  ['lpk_mulai_tahun', 'LPK Mulai - Tahun', 'text', null, []],
  ['lpk_selesai_bulan', 'LPK Selesai - Bulan', 'text', null, []],
  ['lpk_selesai_tahun', 'LPK Selesai - Tahun', 'text', null, []],
  ['cabang', 'Cabang', 'text', null, []],

  // ---- Kesehatan ----
  ['sudah_vaksin', 'Sudah Vaksin', 'bool', 'bool', []],
  ['berkacamata', 'Berkacamata', 'bool', 'bool', []],
  ['lensa_kontak', 'Lensa Kontak', 'bool', 'bool', []],
  ['buta_warna', 'Buta Warna', 'bool', 'bool', []],
  ['bertato', 'Bertato', 'bool', 'bool', []],
  ['merokok', 'Merokok', 'bool', 'bool', []],
  ['minum_alkohol', 'Minum Alkohol', 'bool', 'bool', ['alkohol']],
  ['intensitas_alkohol', 'Intensitas Alkohol', 'text', null, []],
  ['kondisi_kesehatan', 'Kondisi Kesehatan', 'text', null, []],
  ['riwayat_penyakit', 'Riwayat Penyakit', 'textarea', null, []],
  ['penglihatan_kanan', 'Penglihatan Kanan', 'text', null, []],
  ['penglihatan_kiri', 'Penglihatan Kiri', 'text', null, []],

  // ---- Pendidikan ----
  ['pendidikan_terakhir', 'Pendidikan Terakhir', 'text', null, []],

  // ---- Jepang ----
  ['pernah_ke_jepang', 'Pernah ke Jepang', 'bool', 'bool', []],
  ['keluarga_di_jepang', 'Ada Kerabat di Jepang', 'bool', 'bool', []],
  ['hubungan_keluarga_jepang', 'Hubungan Kerabat di Jepang', 'text', null, ['kerabat_hubungan']],
  ['status_kerabat_jepang', 'Status Kerabat di Jepang', 'text', null, ['kerabat_pekerjaan']],
  ['kontak_keluarga_jepang', 'Kontak Kerabat di Jepang', 'text', null, ['kerabat_nama']],
  ['kenalan_di_jepang', 'Ada Kenalan di Jepang', 'bool', 'bool', []],
  ['kenalan_jepang_detail', 'Detail Kenalan di Jepang', 'textarea', null, ['kerabat_alamat']],
  ['kerabat_usia', 'Usia Kerabat di Jepang', 'text', null, []],
  ['level_jlpt', 'Level JLPT', 'text', 'upper', ['jlpt_level']],
  ['jlpt_ada', 'Punya Sertifikat JLPT', 'text', null, []],
  ['level_jft', 'Level JFT', 'text', 'upper', []],
  ['sertifikat_ssw', 'Sertifikat SSW', 'text', null, []],
  ['bidang_ssw', 'Bidang SSW', 'text', null, ['ssw_bidang']],
  ['lama_belajar_jepang', 'Lama Belajar Bahasa Jepang', 'text', null, []],
  ['level_bahasa_jepang', 'Level Bahasa Jepang', 'text', null, []],

  // ---- Motivasi ----
  ['tujuan_ke_jepang', 'Tujuan ke Jepang', 'textarea', null, []],
  ['alasan_ke_jepang', 'Alasan ke Jepang', 'textarea', null, []],
  ['cita_cita_setelah_jepang', 'Cita-cita Setelah Pulang', 'textarea', null, ['tujuan_setelah_pulang']],
  ['rencana_pengiriman_uang', 'Rencana Pengiriman Uang', 'money', 'money', []],
  ['kelebihan_diri', 'Kelebihan Diri', 'textarea', null, ['kelebihan']],
  ['kekurangan_diri', 'Kekurangan Diri', 'textarea', null, ['kekurangan']],
  ['hobi', 'Hobi', 'textarea', null, []],
  ['keahlian', 'Keahlian', 'textarea', null, []],
  ['bersedia_shift', 'Bersedia Bekerja Shift', 'bool', 'bool', []],
  ['bersedia_lembur', 'Bersedia Lembur', 'bool', 'bool', []],
  ['bersedia_hari_libur', 'Bersedia Kerja Hari Libur', 'bool', 'bool', []],
  ['lama_tinggal_jepang', 'Rencana Tinggal di Jepang', 'text', null, []],
  ['lama_kerja_perusahaan', 'Rencana Lama Kerja di Perusahaan', 'text', null, []],
  ['rencana_pulang', 'Rencana Kembali ke Indonesia', 'text', null, []],
  ['sumber_biaya', 'Sumber Biaya', 'text', null, []],
  ['biaya_disiapkan', 'Biaya yang Disiapkan', 'text', null, []],

  // ---- Keluarga ----
  ['penghasilan_keluarga', 'Penghasilan Keluarga', 'money', 'money', []],
];

// Placeholder yang dihitung dari kolom lain.
const COMPUTED_FIELDS = [
  ['foto', 'Foto', 'photo', null, []],
];

/**
 * Placeholder dokumen hasil upload (tabel kandidat_dokumen).
 *
 * Ditulis {dokumen_<jenis_dokumen>}, mis. {dokumen_ktp}, {dokumen_ijazah_sd},
 * {dokumen_ssw_1}, {dokumen_keahlian_sertifikat_1}. Bila sel hanya berisi
 * placeholder ini dan berkasnya gambar, gambar ditempel ke sel (seperti {foto}).
 * Untuk PDF / file non-gambar, nama file ditulis sebagai teks.
 */
const DOCUMENT_TYPES = [
  ['pas_foto', 'Pas Foto'],
  ['foto_full_body', 'Foto Full Body'],
  ['ktp', 'KTP'],
  ['kk', 'Kartu Keluarga'],
  ['ijazah', 'Ijazah'],
  ['ijazah_sd', 'Ijazah SD'],
  ['ijazah_smp', 'Ijazah SMP'],
  ['ijazah_sma', 'Ijazah SMA/SMK'],
  ['ijazah_pt', 'Ijazah Perguruan Tinggi'],
  ['akte', 'Akte Kelahiran'],
  ['sertifikat_jft', 'Sertifikat JFT'],
  ['sertifikat_ssw', 'Sertifikat SSW'],
  ['lainnya', 'Dokumen Lainnya'],
];

const DOCUMENT_NUMBERED = [
  ['ssw', 'Sertifikat SSW', 10],
  ['keahlian_sertifikat', 'Sertifikat Keahlian', 10],
  ['paklaring', 'Paklaring', 10],
];

function documentLabel(jenis) {
  const found = DOCUMENT_TYPES.find(([key]) => key === jenis);
  if (found) return found[1];
  return String(jenis || '')
    .split('_')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

/** Semua placeholder dokumen yang ditampilkan di daftar referensi. */
function documentFields() {
  const out = [];
  DOCUMENT_TYPES.forEach(([jenis, label]) => {
    out.push([`dokumen_${jenis}`, `Dokumen: ${label}`, jenis]);
  });
  DOCUMENT_NUMBERED.forEach(([prefix, label, max]) => {
    for (let i = 1; i <= max; i++) {
      out.push([`dokumen_${prefix}_${i}`, `Dokumen: ${label} ${i}`, `${prefix}_${i}`]);
    }
  });
  return out;
}

const DOCUMENT_FIELDS = documentFields();

/**
 * Kenali placeholder dokumen dinamis (termasuk jenis yang tidak ada di daftar).
 * @returns {{key:string,jenis:string,label:string,type:string,source:string}|null}
 */
const RESERVED_DOCUMENT_KEYS = new Set(['dokumen_dikirim', 'dokumen_dikirim_2']);

function resolveDocumentKey(key) {
  if (RESERVED_DOCUMENT_KEYS.has(key)) return null;
  const m = /^dokumen_([a-z0-9]+(?:_[a-z0-9]+)*)$/.exec(String(key || ''));
  if (!m) return null;
  const jenis = m[1];
  return {
    key,
    jenis,
    label: `Dokumen: ${documentLabel(jenis)}`,
    type: 'document',
    source: 'document',
  };
}

/** Field grup berulang: prefix placeholder -> kolom pada tabel anak. */
const GROUP_FIELDS = {
  pendidikan: {
    label: 'Pendidikan',
    max: 5,
    table: 'kandidat_pendidikan',
    order: 'FIELD(jenjang, "SD","SMP","SMA/SMK","Perguruan Tinggi")',
    sub: {
      jenjang: { column: 'jenjang', label: 'Jenjang', type: 'text' },
      nama_sekolah: { column: 'nama_sekolah', label: 'Nama Sekolah', type: 'text', aliases: ['sekolah'] },
      jurusan: { column: 'jurusan', label: 'Jurusan', type: 'text' },
      mulai: { column: 'mulai', label: 'Periode Mulai', type: 'period' },
      selesai: { column: 'selesai', label: 'Periode Selesai', type: 'period' },
      periode: { column: 'periode', label: 'Periode', type: 'period_range', format: 'period_range' },
    },
  },
  kerja: {
    label: 'Pekerjaan',
    max: 5,
    table: 'kandidat_pengalaman_kerja',
    order: 'tahun_masuk DESC',
    sub: {
      perusahaan: { column: 'nama_perusahaan', label: 'Perusahaan', type: 'text', aliases: ['nama_perusahaan'] },
      posisi: { column: 'posisi', label: 'Posisi', type: 'text', aliases: ['jenis'] },
      deskripsi: { column: 'deskripsi_pekerjaan', label: 'Deskripsi', type: 'textarea', aliases: ['deskripsi_pekerjaan'] },
      gaji: { column: null, label: 'Gaji', type: 'text' },
      mulai: { column: 'mulai', label: 'Periode Mulai', type: 'period' },
      selesai: { column: 'selesai', label: 'Periode Selesai', type: 'period' },
      periode: { column: 'periode', label: 'Periode', type: 'period_range', format: 'period_range' },
    },
  },
  keluarga: {
    label: 'Keluarga',
    max: 8,
    table: 'kandidat_keluarga',
    order: 'FIELD(hubungan, "Ayah","Ibu","Suami","Istri","Kakak","Adik","Lainnya"), urutan',
    sub: {
      hubungan: { column: 'hubungan', label: 'Hubungan', type: 'text' },
      nama: { column: 'nama', label: 'Nama', type: 'text' },
      usia: { column: 'usia', label: 'Usia', type: 'number' },
      pekerjaan: { column: 'pekerjaan', label: 'Pekerjaan', type: 'text' },
      penghasilan: { column: 'penghasilan', label: 'Penghasilan', type: 'money', format: 'money', aliases: ['gaji'] },
    },
  },
};

const BULAN_TO_NUM = {};
MONTHS_ID.forEach((m, i) => {
  BULAN_TO_NUM[m.toLowerCase()] = i + 1;
  BULAN_TO_NUM[m.toLowerCase().slice(0, 3)] = i + 1;
});
[
  'jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des',
].forEach((m, i) => {
  BULAN_TO_NUM[m] = i + 1;
});

/**
 * Bangun katalog lengkap: key -> { key, label, type, format, source, column, group, groupField, aliases }
 */
function buildCatalog() {
  const catalog = {};

  const put = (key, meta) => {
    catalog[key] = { key, ...meta };
    (meta.aliases || []).forEach((alias) => {
      if (!catalog[alias]) {
        catalog[alias] = { ...meta, key: alias, aliasOf: key };
      }
    });
  };

  PROFILE_FIELDS.forEach(([key, label, type, format, aliases]) => {
    put(key, {
      label,
      type,
      format: format || null,
      source: 'profile',
      column: key,
      aliases: aliases || [],
    });
  });

  COMPUTED_FIELDS.forEach(([key, label, type, format, aliases]) => {
    put(key, {
      label,
      type,
      format: format || null,
      source: 'computed',
      column: null,
      aliases: aliases || [],
    });
  });

  DOCUMENT_FIELDS.forEach(([key, label, jenis]) => {
    put(key, {
      label,
      type: 'document',
      format: null,
      source: 'document',
      column: null,
      jenis_dokumen: jenis,
      aliases: [],
    });
  });

  Object.entries(GROUP_FIELDS).forEach(([group, def]) => {
    Object.entries(def.sub).forEach(([sub, meta]) => {
      const key = `${group}_1_${sub}`;
      const aliases = (meta.aliases || []).map((a) => `${group}_1_${a}`);
      put(key, {
        label: `${def.label}: ${meta.label}`,
        type: meta.type,
        format: meta.format || null,
        source: 'group',
        group,
        groupField: sub,
        column: meta.column,
        aliases,
      });
    });
  });

  return catalog;
}

const CATALOG = buildCatalog();

/**
 * Placeholder grup selalu ditulis <group>_<nomor>_<sub>.
 * Kembalikan definisi untuk sebuah kunci group, atau null.
 * Mendukung alias sub (mis. pendidikan_1_sekolah -> pendidikan_1_nama_sekolah).
 */
function resolveGroupKey(key) {
  const m = /^([a-z]+)_(\d+)_([a-z0-9_]+)$/.exec(key);
  if (!m) return null;
  const [, group, index, requestedSub] = m;
  const def = GROUP_FIELDS[group];
  if (!def) return null;

  let sub = requestedSub;
  let meta = def.sub[sub];
  if (!meta) {
    // Cari sub canonical yang memiliki alias ini.
    for (const [name, m2] of Object.entries(def.sub)) {
      if ((m2.aliases || []).includes(requestedSub)) {
        meta = m2;
        sub = name;
        break;
      }
    }
  }
  if (!meta) return null;

  const n = parseInt(index, 10);
  if (n < 1 || n > def.max) return null;
  return {
    key,
    group,
    index: n,
    sub,
    requestedSub,
    canonicalKey: `${group}_${n}_${sub}`,
    label: `${def.label} ${n}: ${meta.label}`,
    type: meta.type,
    format: meta.format || null,
    source: 'group',
    column: meta.column,
  };
}

/** Daftar seluruh kunci grup yang valid (untuk setiap group dan sub). */
function groupKeys() {
  const out = [];
  Object.entries(GROUP_FIELDS).forEach(([group, def]) => {
    Object.keys(def.sub).forEach((sub) => {
      for (let i = 1; i <= def.max; i++) out.push(`${group}_${i}_${sub}`);
    });
  });
  return out;
}

/**
 * Daftar lengkap placeholder yang bisa dipakai di template.
 * Dipakai untuk halaman referensi placeholder & unduh template contoh.
 */
function catalogList() {
  const out = [];

  Object.entries(GROUP_FIELDS).forEach(([group, def]) => {
    Object.entries(def.sub).forEach(([sub, meta]) => {
      const keys = [`${group}_1_${sub}`];
      (meta.aliases || []).forEach((a) => keys.push(`${group}_1_${a}`));
      keys.forEach((key) => {
        out.push({
          key,
          label: `${def.label}: ${meta.label}`,
          type: meta.type,
          format: meta.format || null,
          source: 'group',
          group,
          groupField: sub,
          repeatable: true,
          max: def.max,
        });
      });
    });
  });

  Object.entries(CATALOG).forEach(([key, meta]) => {
    if (meta.source === 'group') return;
    out.push({
      key,
      label: meta.label,
      type: meta.type,
      format: meta.format || null,
      source: meta.source,
      aliasOf: meta.aliasOf || null,
      repeatable: false,
    });
  });

  return out;
}

module.exports = {
  CATALOG,
  GROUP_FIELDS,
  DOCUMENT_FIELDS,
  DOCUMENT_TYPES,
  MONTHS_ID,
  BULAN_TO_NUM,
  resolveGroupKey,
  resolveDocumentKey,
  groupKeys,
  catalogList,
};
