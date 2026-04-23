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
  { key: "ijazah", label: "Ijazah" },
  { key: "akte", label: "Akte Kelahiran" },
  { key: "lainnya", label: "Dokumen Lainnya", optional: true },
];

export const ssw_options = [
  "Pengolahan Makanan",
  "Pertanian",
  "Gaishoku",
  "Kaigo (perawat)",
  "Building Cleaning",
  "Restoran",
  "Driver",
  "Perhotelah",
  "Perikanan",
  "Perbaikan dan Perawatan Mobil",
  "Konstruksi",
];

export const REQUIRED_DOCS = [
  "pas_foto",
  "foto_full_body",
  "kk",
  "ktp",
  "ijazah",
  "akte",
];

export const defaultPendidikan = [
  { jenjang: "SD", nama_sekolah: "", bulan_masuk: "", tahun_masuk: "", bulan_lulus: "", tahun_lulus: "" },
  { jenjang: "SMP", nama_sekolah: "", bulan_masuk: "", tahun_masuk: "", bulan_lurus: "", tahun_lulus: "" },
  {
    jenjang: "SMA/SMK",
    nama_sekolah: "",
    bulan_masuk: "",
    tahun_masuk: "",
    bulan_lulus: "",
    tahun_lulus: "",
    jurusan: "",
  },
  {
    jenjang: "Perguruan Tinggi",
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

export const statusBadge: Record<string, { label: string; variant: string }> = {
  draft: { label: "Belum dikirim", variant: "secondary" },
  submitted: { label: "Menunggu review", variant: "info" },
  reviewed: { label: "Sedang direview", variant: "warning" },
  approved: { label: "Disetujui", variant: "success" },
  rejected: { label: "Perlu perbaikan", variant: "destructive" },
};