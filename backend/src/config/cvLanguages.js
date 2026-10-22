/**
 * Bahasa isian CV.
 *
 * Nilai profil disimpan dalam bahasa Indonesia, sedangkan template CV SSW memakai
 * pilihan dropdown berbahasa Jepang (例: 未婚 / 女 / 無 / 不可). Modul ini
 * menyediakan:
 *   - daftar bahasa yang bisa dipilih (auto / ja / id)
 *   - kamus terjemahan nilai profil <-> nilai bahasa Jepang
 *
 * "auto" = biarkan nilai apa adanya; pencocokan dropdown (cvFormatter) yang
 * mencari pilihan terdekat di template.
 */

const BAHASA = [
  { code: 'auto', label: 'Otomatis (sesuai pilihan template)' },
  { code: 'ja', label: 'Bahasa Jepang (日本語)' },
  { code: 'id', label: 'Bahasa Indonesia' },
];

/** Nilai Indonesia -> nilai Jepang, per field. */
const PETA_JA = {
  // ---- agama ----
  agama: {
    Islam: 'イスラーム教',
    Kristen: 'キリスト教',
    Katolik: 'カトリック',
    Hindu: 'ヒンドゥー教',
    Buddha: '仏教',
    Konghucu: '儒教',
    Lainnya: 'その他',
  },
  // ---- jenis kelamin ----
  jenis_kelamin: {
    'Laki-laki': '男',
    Perempuan: '女',
  },
  // ---- status pernikahan ----
  status_pernikahan: {
    'Belum Menikah': '未婚',
    Menikah: '既婚',
    Cerai: '離婚',
    Duda: '喪夫',
    Janda: '寡婦',
    Lainnya: 'その他',
  },
  // ---- golongan darah ----
  golongan_darah: {
    A: 'A',
    B: 'B',
    AB: 'AB',
    O: 'O',
    'Tidak Tahu': '不明',
  },
  // ---- tangan dominan ----
  tangan_dominan: {
    Kanan: '右',
    Kiri: '左',
  },
  // ---- bahasa Jepang ----
  level_bahasa_jepang: {
    Dasar: '初級',
    Menengah: '中級',
    Lancar: '上級',
  },
  // ---- bidang SSW ----
  bidang_ssw: {
    Pertanian: '農業',
    'Pengolahan Makanan': '飲食料品製造業',
    'Kaigo (perawat)': '介護',
    Restoran: '外食業',
    Konstruksi: '建設',
    Perhotelan: '外食業',
    Perternakan: '畜産',
    'Building Cleaning': '建物清掃',
    'Perbaikan dan Perawatan Mobil': '自動車整備',
    Driver: '旅客・貨物輸送業',
    Gaishoku: '外食業',
  },
  // ---- jenjang pendidikan ----
  jenjang: {
    SD: '小学校',
    SMP: '中学',
    SMA: '普通高校',
    SMK: '職業高校',
    'SMA/SMK': '職業高校',
    D3: 'ディプロマ３',
    D4: '大学',
    S1: '大学',
    S2: '大学',
    S3: '大学',
    'Perguruan Tinggi': '大学',
  },
  // ---- hubungan keluarga ----
  hubungan: {
    Ayah: '父',
    Ibu: '母',
    Suami: '夫',
    Istri: '妻',
    Kakak: '兄',
    Adik: '弟',
    Anak: '息子',
    Kakek: 'お爺さん',
    Nenek: 'お祖母さん',
    Lainnya: 'その他',
  },
};

/** Nilai boolean & serapan lain (dipakai lintas field). */
const PETA_BOOLEAN = {
  Ya: '有',
  Tidak: '無',
  Ada: '有',
  'Tidak ada': '無',
  Pernah: '有',
  'Belum pernah': '無',
  'Sudah punya': '有',
  'Belum punya': '無',
};

/** Field yang nilainya boolean (sudah termasuk nilai 0/1 → Ya/Tidak). */
const FIELD_BOOLEAN = [
  'sudah_vaksin',
  'berkacamata',
  'lensa_kontak',
  'buta_warna',
  'bertato',
  'merokok',
  'minum_alkohol',
  'pernah_ke_jepang',
  'keluarga_di_jepang',
  'kenalan_di_jepang',
  'bersedia_shift',
  'bersedia_lembur',
  'bersedia_hari_libur',
  'kriminal_ada',
  'operasi_ada',
  'penyakit_ada',
  'paspor',
  'riwayat_penyakit',
  'kacamata',
];

/** Bangun peta kebalikan (Jepang -> Indonesia) otomatis. */
function balik(peta) {
  const out = {};
  Object.keys(peta).forEach((key) => {
    const inner = {};
    Object.keys(peta[key]).forEach((src) => {
      const dst = peta[key][src];
      if (!inner[dst]) inner[dst] = src;
    });
    out[key] = inner;
  });
  return out;
}

const PETA_ID = balik(PETA_JA);
const BOOLEAN_ID = balik({ boolean: PETA_BOOLEAN }).boolean;

module.exports = {
  BAHASA,
  PETA_JA,
  PETA_ID,
  PETA_BOOLEAN,
  BOOLEAN_ID,
  FIELD_BOOLEAN,
  balik,
};
