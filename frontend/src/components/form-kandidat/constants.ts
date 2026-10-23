import { User, Heart, GraduationCap, Briefcase, Star, Users, Globe, Target, Paperclip } from "lucide-react";

export const STEPS = [
  { id: 1, label: "Data Diri", icon: User },
  { id: 2, label: "Kesehatan", icon: Heart },
  { id: 3, label: "Pendidikan", icon: GraduationCap },
  { id: 4, label: "Pengalaman", icon: Briefcase },
  { id: 5, label: "Kemampuan", icon: Star },
  { id: 6, label: "Keluarga", icon: Users },
  { id: 7, label: "Jepang", icon: Globe },
  { id: 8, label: "Motivasi", icon: Target },
  { id: 9, label: "Dokumen", icon: Paperclip },
];

export const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const years = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i));

export const dokumenTypes = [
  { key: "sertifikat_jft", label: "Sertifikat JFT", optional: true },
  { key: "pas_foto", label: "Pas Foto" },
  { key: "foto_full_body", label: "Foto Full Body" },
  { key: "kk", label: "Kartu Keluarga (KK)" },
  { key: "ktp", label: "KTP" },
  { key: "akte", label: "Akte Kelahiran" },
  { key: "lainnya", label: "Dokumen Lainnya", optional: true },
];

export const ssw_options = [
  "Pengolahan Makanan",
  "Pertanian",
  "Peternakan",
  "Gaishoku",
  "Kaigo (perawat)",
  "Building Cleaning",
  "Restoran",
  "Driver",
  "Perhotelan",
  "Perikanan",
  "Perbaikan dan Perawatan Mobil",
  "Konstruksi",
];

export const REQUIRED_DOCS = [
  "pas_foto",
  "foto_full_body",
  "kk",
  "ktp",
  "akte",
];

export const defaultPendidikan = [
  { jenjang: "SD", jenjang_detail: "", nama_sekolah: "", bulan_masuk: "", tahun_masuk: "", bulan_lulus: "", tahun_lulus: "" },
  { jenjang: "SMP", jenjang_detail: "", nama_sekolah: "", bulan_masuk: "", tahun_masuk: "", bulan_lulus: "", tahun_lulus: "" },
  {
    jenjang: "SMA/SMK",
    jenjang_detail: "",
    nama_sekolah: "",
    bulan_masuk: "",
    tahun_masuk: "",
    bulan_lulus: "",
    tahun_lulus: "",
    jurusan: "",
  },
  {
    jenjang: "Perguruan Tinggi",
    jenjang_detail: "",
    nama_sekolah: "",
    bulan_masuk: "",
    tahun_masuk: "",
    bulan_lulus: "",
    tahun_lulus: "",
    jurusan: "",
  },
];

export const defaultKeluarga = [
  { hubungan: "Ayah", nama: "", usia: "", pekerjaan: "", penghasilan: "", urutan: 1 },
  { hubungan: "Ibu", nama: "", usia: "", pekerjaan: "", penghasilan: "", urutan: 1 },
  { hubungan: "Suami", nama: "", usia: "", pekerjaan: "", penghasilan: "", urutan: 1 },
  { hubungan: "Istri", nama: "",usia: "", pekerjaan: "", penghasilan: "", urutan: 1 },
];

export const jenjangWajib = ["SD", "SMP"];

/**
 * Jenis dokumen ijazah per jenjang pendidikan.
 * Dipakai untuk upload ijazah pada langkah Pendidikan (mengikuti SIM-MENDUNIA).
 */
export const IJAZAH_JENJANG: Record<string, string> = {
  SD: "ijazah_sd",
  SMP: "ijazah_smp",
  "SMA/SMK": "ijazah_sma",
  "Perguruan Tinggi": "ijazah_pt",
};

export const getIjazahJenis = (jenjang: string): string | undefined =>
  IJAZAH_JENJANG[jenjang];

/** Label upload ijazah per jenjang (mis. "Ijazah SD"). */
export const labelIjazah = (jenjang: string): string => {
  const label: Record<string, string> = {
    SD: "Ijazah SD",
    SMP: "Ijazah SMP",
    "SMA/SMK": "Ijazah SMA/SMK",
    "Perguruan Tinggi": "Ijazah Perguruan Tinggi",
  };
  return label[jenjang] || `Ijazah ${jenjang}`;
};

/**
 * Pilihan status pernikahan (dipakai di formulir kandidat & edit admin).
 * `value` = nilai yang disimpan di database, `label` = teks formal di form.
 * Label memuat istilah Jepang sesuai template CV SSW.
 */
export const STATUS_PERNIKAHAN = [
  { value: "Belum Menikah", label: "Belum Menikah (未婚)" },
  { value: "Menikah", label: "Menikah (既婚)" },
  { value: "Cerai", label: "Cerai / Tercerai (離婚)" },
  { value: "Duda", label: "Duda (喪夫)" },
  { value: "Janda", label: "Janda (寡婦)" },
  { value: "Lainnya", label: "Lainnya (その他)" },
];

/** Label status pernikahan untuk ditampilkan (mis. di detail kandidat). */
export const labelStatusPernikahan = (value?: string | null) =>
  STATUS_PERNIKAHAN.find((s) => s.value === value)?.label || value || "-";

/** Pilihan agama (sama dengan daftar pada template CV SSW). */
export const AGAMA_OPTIONS = [
  "Islam",
  "Kristen",
  "Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
  "Lainnya",
];

/**
 * Pilihan pendidikan terakhir — disamakan dengan formulir SIM-MENDUNIA.
 * Nilai ini yang disimpan pada kolom `pendidikan_terakhir`.
 */
export const JENJANG_PENDIDIKAN = [
  "SD / Sederajat",
  "SMP / Sederajat",
  "SMA / SMK / MA / Sederajat",
  "Paket A / B / C",
  "Diploma I / II / III / IV (D1–D4)",
  "Sarjana (S1)",
  "Magister (S2)",
  "Doktor (S3)",
];

/** Tingkat perguruan tinggi (isi baris "Perguruan Tinggi" pada riwayat pendidikan). */
export const TINGKAT_PT = ["D3", "D4", "S1", "S2", "S3"];

/**
 * Pemetaan jenjang riwayat pendidikan (nilai internal) ke label
 * "Pendidikan Terakhir" yang dipakai pada formulir.
 */
export const PENDIDIKAN_TERAKHIR_LABEL: Record<string, string> = {
  SD: "SD / Sederajat",
  SMP: "SMP / Sederajat",
  "SMA/SMK": "SMA / SMK / MA / Sederajat",
  D1: "Diploma I / II / III / IV (D1–D4)",
  D2: "Diploma I / II / III / IV (D1–D4)",
  D3: "Diploma I / II / III / IV (D1–D4)",
  D4: "Diploma I / II / III / IV (D1–D4)",
  S1: "Sarjana (S1)",
  S2: "Magister (S2)",
  S3: "Doktor (S3)",
  "Perguruan Tinggi": "Diploma I / II / III / IV (D1–D4)",
};

/** Label "Pendidikan Terakhir" dari jenjang (dan tingkat PT bila ada). */
export const labelPendidikanTerakhir = (
  jenjang: string,
  detail?: string | null,
): string => {
  if (jenjang === "Perguruan Tinggi") {
    return (
      PENDIDIKAN_TERAKHIR_LABEL[detail || ""] ||
      PENDIDIKAN_TERAKHIR_LABEL["Perguruan Tinggi"]
    );
  }
  return PENDIDIKAN_TERAKHIR_LABEL[jenjang] || "";
};

/**
 * Normalisasi nilai lama pendidikan terakhir (mis. "S1", "SMA/SMK")
 * agar cocok dengan pilihan pada formulir.
 */
export const normalizePendidikanTerakhir = (
  value?: string | null,
): string => {
  if (!value) return "";
  const v = String(value).trim();
  return PENDIDIKAN_TERAKHIR_LABEL[v] || v;
};

/**
 * Contoh isi bahasa Jepang untuk field motivasi (dipakai di form kandidat
 * dan sebagai petunjuk di halaman detail kandidat admin).
 * Semua isian pada langkah Motivasi wajib ditulis dalam bahasa Jepang.
 */
export const CONTOH_MOTIVASI: Record<string, string> = {
  tujuan_ke_jepang:
    "日本の製造業で働き、日本の経済発展に貢献したいと思っています。",
  alasan_ke_jepang:
    "日本の先端技術と高い品質に惹かれ、技術を磨きたいと考えています。",
  cita_cita_setelah_jepang:
    "帰国後は母国の発展に貢献し、教育分野で後輩の育成に尽力したいと考えています。",
  kelebihan_diri: "責任感が強く、チームワークを大切にする性格です。",
  kekurangan_diri: "自分の意見をうまく伝えられないことがあります。",
  keahlian: "野菜栽培と収穫、トラック運転、清掃作業",
  hobi: "読書、ジョギング、料理",
  promosi_diri:
    "農作業に熱意と責任をもって取り組み、個々の作物の生育を丁寧に確認します。",
  catatan_tambahan:
    "健康状態は良好で、定期的な健康診断の結果も良好です。",
};

export const statusBadge: Record<string, { label: string; variant: string }> = {
  draft: { label: "Belum dikirim", variant: "secondary" },
  submitted: { label: "Menunggu review", variant: "info" },
  reviewed: { label: "Sedang direview", variant: "warning" },
  approved: { label: "Disetujui", variant: "success" },
  rejected: { label: "Perlu perbaikan", variant: "destructive" },
};