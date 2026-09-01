import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Card, CardContent, Separator } from "@/components/ui/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/useToast";
import api from "@/lib/api";
import {
  KeyRound,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";

import { STEPS, defaultPendidikan, defaultKeluarga, REQUIRED_DOCS } from "@/components/form-kandidat/constants";

import {
  FormStep1_DataDiri,
  FormStep2_Kesehatan,
  FormStep3_Pendidikan,
  FormStep4_Pengalaman,
  FormStep5_Kemampuan,
  FormStep6_Keluarga,
  FormStep7_Jepang,
  FormStep8_Motivasi,
  FormStep9_Dokumen,
} from "@/components/form-kandidat";

// Step 0 = Akses Akun; Steps 1-9 = form kandidat data (incl. Dokumen upload).
// File dokumen didefer: dikumpulkan dulu di state, lalu diupload setelah kandidat dibuat.
const TABS = [
  { id: 0, label: "Akses Akun", icon: KeyRound },
  ...STEPS.map((s) => ({ ...s })),
];

interface TambahKandidatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function TambahKandidatModal({
  open,
  onOpenChange,
  onSuccess,
}: TambahKandidatModalProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cabangList, setCabangList] = useState<{ id: number; nama_cabang: string }[]>([]);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [pendingDokumen, setPendingDokumen] = useState<Record<string, File>>({});
  const [savedId, setSavedId] = useState<number | null>(null);

  const [form, setForm] = useState<any>({
    nama_romaji: "",
    nama_katakana: "",
    email: "",
    password_akun: "",
    pendaftaran: "manual",
    cabang_id: "",
    pendidikan_terakhir: "",
    pendidikan: defaultPendidikan,
    pengalaman: [],
    keluarga: defaultKeluarga,
    sertifikat_ssw: [],
    pernah_ke_jepang: null,
    keluarga_di_jepang: null,
    kenalan_di_jepang: null,
    sudah_vaksin: null,
    berkacamata: null,
    lensa_kontak: null,
    buta_warna: null,
    bertato: null,
    merokok: null,
    minum_alkohol: null,
    bersedia_shift: null,
    bersedia_lembur: null,
    bersedia_hari_libur: null,
  });

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setErrors({});
    setCreated(null);
    setSavedId(null);
    setForm((p: any) => ({
      ...p,
      email: "",
      password_akun: "",
      cabang_id: "",
      nama_romaji: "",
      nama_katakana: "",
      tempat_lahir: "",
      tanggal_lahir: "",
      umur: "",
      jenis_kelamin: "",
      status_pernikahan: "",
      jumlah_anak: 0,
      agama: "",
      tinggi_badan: "",
      berat_badan: "",
      golongan_darah: "",
      tangan_dominan: "",
      ukuran_baju: "",
      lingkar_pinggang: "",
      panjang_telapak_kaki: "",
      sim_dimiliki: "",
      nomor_hp: "",
      email_kontak: "",
      alamat_lengkap: "",
      kontak_ortu_nama: "",
      kontak_ortu_hp: "",
      pendidikan: defaultPendidikan,
      pengalaman: [],
      keluarga: defaultKeluarga,
      sertifikat_ssw: [],
      sertifikatSsw: [],
      dokumen: [],
    }));
    setPendingDokumen({});
  }, [open]);

  useEffect(() => {
    api.get("/cabang").then((r) => setCabangList(r.data.data || [])).catch(() => setCabangList([]));
  }, []);

  const set =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((p: any) => ({ ...p, [key]: e.target.value }));
      if (errors[key])
        setErrors((er: any) => {
          const n = { ...er };
          delete n[key];
          return n;
        });
    };
  const setBool = (key: string) => (v: boolean) => {
    setForm((p: any) => ({ ...p, [key]: v }));
  };
  const setSel = (key: string) => (v: string) => {
    setForm((p: any) => ({ ...p, [key]: v }));
    if (errors[key])
      setErrors((er: any) => {
        const n = { ...er };
        delete n[key];
        return n;
      });
  };

  const setPendidikan = (i: number, key: string, v: string) =>
    setForm((p: any) => {
      const arr = [...p.pendidikan];
      arr[i] = { ...arr[i], [key]: v };
      return { ...p, pendidikan: arr };
    });
  const setPengalaman = (i: number, key: string, v: any) =>
    setForm((p: any) => {
      const arr = [...p.pengalaman];
      arr[i] = { ...arr[i], [key]: v };
      return { ...p, pengalaman: arr };
    });
  const setKeluarga = (i: number, key: string, v: string) =>
    setForm((p: any) => {
      const arr = [...p.keluarga];
      arr[i] = { ...arr[i], [key]: v };
      return { ...p, keluarga: arr };
    });

  const addPengalaman = () =>
    setForm((p: any) => ({
      ...p,
      pengalaman: [
        ...p.pengalaman,
        {
          nama_perusahaan: "",
          alamat_perusahaan: "",
          posisi: "",
          bulan_masuk: "",
          tahun_masuk: "",
          bulan_keluar: "",
          tahun_keluar: "",
          masih_bekerja: false,
          deskripsi_pekerjaan: "",
        },
      ],
    }));
  const removePengalaman = (i: number) =>
    setForm((p: any) => ({ ...p, pengalaman: p.pengalaman.filter((_: any, idx: number) => idx !== i) }));

  const addKeluarga = (hubungan: string) => {
    const existing = form.keluarga.filter((k: any) => k.hubungan === hubungan).length;
    setForm((p: any) => ({
      ...p,
      keluarga: [
        ...p.keluarga,
        { hubungan, nama: "", usia: "", pekerjaan: "", penghasilan: "", urutan: existing + 1 },
      ],
    }));
  };
  const removeKeluarga = (i: number) =>
    setForm((p: any) => ({ ...p, keluarga: p.keluarga.filter((_: any, idx: number) => idx !== i) }));

  const toggleSSW = (val: string) =>
    setForm((p: any) => ({
      ...p,
      sertifikat_ssw: p.sertifikat_ssw?.includes(val)
        ? p.sertifikat_ssw.filter((s: string) => s !== val)
        : [...p.sertifikat_ssw, val],
    }));

  const setDokumenEntry = (jenis: string, nama_file: string) =>
    setForm((p: any) => ({
      ...p,
      dokumen: [...(p.dokumen || []).filter((d: any) => d.jenis_dokumen !== jenis), { jenis_dokumen: jenis, nama_file }],
    }));

  const handleUpload = (jenis: string, file: File, sswIndex?: number) => {
    setPendingDokumen((p) => ({ ...p, [jenis]: file }));
    setDokumenEntry(jenis, file.name);
  };

  const addSertifikatSsw = () =>
    setForm((p: any) => ({ ...p, sertifikatSsw: [...(p.sertifikatSsw || []), {}] }));

  const removeSertifikatSsw = (i: number) => {
    setForm((p: any) => ({
      ...p,
      sertifikatSsw: (p.sertifikatSsw || []).filter((_: any, idx: number) => idx !== i),
      dokumen: (p.dokumen || []).filter((d: any) => d.jenis_dokumen !== `ssw_${i + 1}`),
    }));
    setPendingDokumen((p) => {
      const n = { ...p };
      delete n[`ssw_${i + 1}`];
      return n;
    });
  };

  const isEmpty = (val: any) => val === undefined || val === null || val === "";

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNum === 0) {
      if (isEmpty(form.cabang_id)) newErrors.cabang_id = "Cabang (Mendunia) wajib dipilih";
      if (isEmpty(form.email)) newErrors.email = "Email login wajib diisi";
    }

    if (stepNum === 1) {
      if (isEmpty(form.nama_katakana)) newErrors.nama_katakana = "Nama Katakana wajib diisi";
      if (isEmpty(form.nama_romaji)) newErrors.nama_romaji = "Nama Romaji wajib diisi";
      if (isEmpty(form.tempat_lahir)) newErrors.tempat_lahir = "Tempat lahir wajib diisi";
      if (isEmpty(form.tanggal_lahir)) newErrors.tanggal_lahir = "Tanggal lahir wajib diisi";
      if (isEmpty(form.umur)) newErrors.umur = "Umur wajib diisi";
      if (isEmpty(form.jenis_kelamin)) newErrors.jenis_kelamin = "Jenis kelamin wajib dipilih";
      if (isEmpty(form.status_pernikahan)) newErrors.status_pernikahan = "Status pernikahan wajib dipilih";
      if (isEmpty(form.agama)) newErrors.agama = "Agama wajib dipilih";
      if (isEmpty(form.tinggi_badan)) newErrors.tinggi_badan = "Tinggi badan wajib diisi";
      if (isEmpty(form.berat_badan)) newErrors.berat_badan = "Berat badan wajib diisi";
      if (isEmpty(form.golongan_darah)) newErrors.golongan_darah = "Golongan darah wajib dipilih";
      if (isEmpty(form.tangan_dominan)) newErrors.tangan_dominan = "Tangan dominan wajib dipilih";
      if (isEmpty(form.ukuran_baju)) newErrors.ukuran_baju = "Ukuran baju wajib dipilih";
      if (isEmpty(form.nomor_hp)) newErrors.nomor_hp = "Nomor HP wajib diisi";
      if (isEmpty(form.email_kontak)) newErrors.email_kontak = "Email wajib diisi";
      if (isEmpty(form.alamat_lengkap)) newErrors.alamat_lengkap = "Alamat lengkap wajib diisi";
      if (isEmpty(form.kontak_ortu_nama)) newErrors.kontak_ortu_nama = "Nama orang tua/wali wajib diisi";
      if (isEmpty(form.kontak_ortu_hp)) newErrors.kontak_ortu_hp = "No. HP orang tua wajib diisi";
    }

    if (stepNum === 2) {
      if (form.sudah_vaksin === undefined || form.sudah_vaksin === null)
        newErrors.sudah_vaksin = "Pilih sudah/tidak vaksin";
      if (isEmpty(form.kondisi_kesehatan)) newErrors.kondisi_kesehatan = "Kondisi kesehatan wajib dipilih";
      if (form.berkacamata === undefined || form.berkacamata === null) newErrors.berkacamata = "Pilih ya/tidak";
      if (form.lensa_kontak === undefined || form.lensa_kontak === null) newErrors.lensa_kontak = "Pilih ya/tidak";
      if (form.buta_warna === undefined || form.buta_warna === null) newErrors.buta_warna = "Pilih ya/tidak";
      if (form.bertato === undefined || form.bertato === null) newErrors.bertato = "Pilih ya/tidak";
      if (form.merokok === undefined || form.merokok === null) newErrors.merokok = "Pilih ya/tidak";
      if (form.minum_alkohol === undefined || form.minum_alkohol === null) newErrors.minum_alkohol = "Pilih ya/tidak";
      if (isEmpty(form.riwayat_penyakit))
        newErrors.riwayat_penyakit = 'Riwayat penyakit wajib diisi (isi "Tidak ada" jika tidak ada)';
    }

    if (stepNum === 3) {
      const jenjangWajib = ["SD", "SMP"];
      form.pendidikan.forEach((p: any, i: number) => {
        if (jenjangWajib.includes(p.jenjang)) {
          if (isEmpty(p.nama_sekolah)) newErrors[`pendidikan_${i}_nama_sekolah`] = `Nama ${p.jenjang} wajib diisi`;
          if (isEmpty(p.bulan_masuk)) newErrors[`pendidikan_${i}_bulan_masuk`] = "Bulan masuk wajib dipilih";
          if (isEmpty(p.tahun_masuk)) newErrors[`pendidikan_${i}_tahun_masuk`] = "Tahun masuk wajib dipilih";
          if (isEmpty(p.bulan_lulus)) newErrors[`pendidikan_${i}_bulan_lulus`] = "Bulan lulus wajib dipilih";
          if (isEmpty(p.tahun_lulus)) newErrors[`pendidikan_${i}_tahun_lulus`] = "Tahun lulus wajib dipilih";
        }
      });
    }

    if (stepNum === 5) {
      if (isEmpty(form.level_jlpt)) newErrors.level_jlpt = "Level JLPT wajib dipilih";
      if (isEmpty(form.lama_belajar_jepang)) newErrors.lama_belajar_jepang = "Lama belajar Jepang wajib diisi";
      if (isEmpty(form.level_bahasa_jepang)) newErrors.level_bahasa_jepang = "Level bahasa Jepang wajib dipilih";
    }

    if (stepNum === 6) {
      if (isEmpty(form.penghasilan_keluarga)) newErrors.penghasilan_keluarga = "Penghasilan keluarga wajib diisi";
      const ayah = form.keluarga.find((k: any) => k.hubungan === "Ayah");
      const ibu = form.keluarga.find((k: any) => k.hubungan === "Ibu");
      if (!ayah || isEmpty(ayah.nama)) newErrors.keluarga_ayah_nama = "Nama Ayah wajib diisi";
      if (ayah && isEmpty(ayah.usia)) newErrors.keluarga_ayah_usia = "Usia Ayah wajib diisi";
      if (!ibu || isEmpty(ibu.nama)) newErrors.keluarga_ibu_nama = "Nama Ibu wajib diisi";
      if (ibu && isEmpty(ibu.usia)) newErrors.keluarga_ibu_usia = "Usia Ibu wajib diisi";
    }

    if (stepNum === 8) {
      if (isEmpty(form.tujuan_ke_jepang)) newErrors.tujuan_ke_jepang = "Tujuan ke Jepang wajib diisi";
      if (isEmpty(form.alasan_ke_jepang)) newErrors.alasan_ke_jepang = "Alasan ingin ke Jepang wajib diisi";
      if (isEmpty(form.cita_cita_setelah_jepang))
        newErrors.cita_cita_setelah_jepang = "Cita-rata setelah pulang wajib diisi";
      if (isEmpty(form.rencana_pengiriman_uang))
        newErrors.rencana_pengiriman_uang = "Rencana pengiriman uang wajib diisi";
      if (isEmpty(form.kelebihan_diri)) newErrors.kelebihan_diri = "Kelebihan diri wajib diisi";
      if (isEmpty(form.kekurangan_diri)) newErrors.kekurangan_diri = "Kekurangan diri wajib diisi";
      if (isEmpty(form.hobi)) newErrors.hobi = "Hobi wajib diisi";
      if (isEmpty(form.keahlian)) newErrors.keahlian = "Keahlian wajib diisi";
    }

    if (stepNum === 9) {
      const labelMap: Record<string, string> = {
        pas_foto: "Pas Foto",
        foto_full_body: "Foto Full Body",
        kk: "Kartu Keluarga (KK)",
        ktp: "KTP",
        ijazah: "Ijazah",
        akte: "Akte Kelahiran",
      };
      const missing = REQUIRED_DOCS.filter((k) => !form.dokumen?.some((d: any) => d.jenis_dokumen === k));
      if (missing.length > 0)
        newErrors.dokumen = `Semua dokumen wajib diupload: ${missing.map((k) => labelMap[k] || k).join(", ")}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => ({
    ...form,
    sertifikat_ssw: Array.isArray(form.sertifikat_ssw)
      ? form.sertifikat_ssw.join(", ")
      : form.sertifikat_ssw || "",
    nama: form.nama_romaji || form.nama_katakana,
  });

  const ensureAccount = (): boolean => {
    if (!form.cabang_id) {
      toast({ title: "Lengkapi dulu Cabang (Mendunia) agar dapat menyimpan", variant: "destructive" as any });
      return false;
    }
    if (!form.nama_romaji && !form.nama_katakana && !form.nama) {
      toast({ title: "Lengkapi dulu Nama (Data Diri) agar dapat menyimpan", variant: "destructive" as any });
      return false;
    }
    return true;
  };

  const handleSaveDraft = async () => {
    if (!ensureAccount()) return;
    setSaving(true);
    try {
      const payload = buildPayload();
      if (savedId) {
        await api.put(`/kandidat/${savedId}/update-profile`, payload);
        toast({ title: "Data tersimpan (draft). Lanjutkan mengisi atau simpan lagi.", variant: "success" as any });
      } else {
        const res = await api.post("/kandidat", payload);
        if (res.data.success) {
          setSavedId(res.data.data?.id || null);
          toast({ title: "Draft disimpan. Lanjutkan mengisi data.", variant: "success" as any });
        } else {
          toast({ title: res.data.message || "Gagal menyimpan draft", variant: "destructive" as any });
        }
      }
    } catch (err: any) {
      toast({
        title: err.response?.data?.message || "Gagal menyimpan draft",
        variant: "destructive" as any,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!ensureAccount()) return;
    setSaving(true);
    try {
      const payload = buildPayload();
      let newId = savedId;
      let res: any = null;
      if (savedId) {
        await api.put(`/kandidat/${savedId}/update-profile`, payload);
        res = {
          data: {
            success: true,
            message: "Data kandidat berhasil diperbarui",
            data: {
              id: savedId,
              email: form.email,
              password: form.password_akun || "12345678",
            },
          },
        };
      } else {
        res = await api.post("/kandidat", payload);
        newId = res.data.data?.id || null;
      }
      if (res.data.success) {
        if (newId) {
          const entries = Object.entries(pendingDokumen || {});
          for (const [jenis, file] of entries) {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("jenis_dokumen", jenis);
            try {
              await api.post(`/kandidat/${newId}/upload-dokumen?jenis_dokumen=${jenis}`, fd, {
                headers: { "Content-Type": "multipart/form-data" },
              });
            } catch (uploadErr: any) {
              toast({
                title: `Gagal upload ${jenis}: ${uploadErr.response?.data?.message || "error"}`,
                variant: "destructive" as any,
              });
            }
          }
        }
        setCreated({
          email: res.data.data?.email || form.email || "Email dibuat otomatis",
          password: res.data.data?.password || form.password_akun || "12345678",
        });
        toast({ title: res.data.message || "Kandidat berhasil ditambahkan", variant: "success" as any });
        onSuccess();
      }
    } catch (err: any) {
      toast({
        title: err.response?.data?.message || "Gagal menambah kandidat",
        variant: "destructive" as any,
      });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-3 sm:p-6">
      <div className="bg-white w-full max-w-4xl max-h-[94vh] flex flex-col rounded-xl shadow-xl overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Tambah Data Kandidat</h2>
            <p className="text-xs text-muted-foreground">
              Input mengikuti formulir pendaftaran, sekaligus otomatis membuat akun akses kandidat
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1.5 hover:bg-muted text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1.5 flex-wrap px-5 pt-4">
          {TABS.map((t) => {
            const Icon = t.icon;
            const done =
              created || (t.id < step);
            return (
              <button
                key={t.id}
                onClick={() => setStep(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  step === t.id
                    ? "bg-[#1e3a5f] text-white"
                    : done
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {done && !created ? <CheckCircle size={13} /> : <Icon size={13} />}
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {created ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">
                <CheckCircle size={20} />
                <p className="text-sm font-medium">Kandidat berhasil ditambahkan. Akun akses dibuat otomatis:</p>
              </div>

              <Card>
                <CardContent className="pt-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <code className="block text-sm px-2.5 py-2 bg-muted rounded-md">{created.email}</code>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Password (Default)</Label>
                      <code className="block text-sm px-2.5 py-2 bg-muted rounded-md">{created.password}</code>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Jika password tidak berfungsi / salah, berarti sudah diganti oleh pemilik akun (kandidat).
                  </p>
                </CardContent>
              </Card>

              {/* finish actions */}
              <div className="flex flex-wrap gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Selesai
                </Button>
                <Button
                  onClick={() => {
                    setCreated(null);
                    setStep(0);
                    setErrors({});
                    setForm((p: any) => ({
                      ...p,
                      email: "",
                      password_akun: "",
                      cabang_id: "",
                      nama_romaji: "",
                      nama_katakana: "",
                      tempat_lahir: "",
                      tanggal_lahir: "",
                      umur: "",
                      jenis_kelamin: "",
                      status_pernikahan: "",
                      jumlah_anak: 0,
                      agama: "",
                      tinggi_badan: "",
                      berat_badan: "",
                      golongan_darah: "",
                      tangan_dominan: "",
                      ukuran_baju: "",
                      lingkar_pinggang: "",
                      panjang_telapak_kaki: "",
                      sim_dimiliki: "",
                      nomor_hp: "",
                      email_kontak: "",
                      alamat_lengkap: "",
                      kontak_ortu_nama: "",
                      kontak_ortu_hp: "",
                      pendidikan: defaultPendidikan,
                      pengalaman: [],
                      keluarga: defaultKeluarga,
    sertifikat_ssw: [],
    sertifikatSsw: [],
    dokumen: [],
                    }));
                  }}
                >
                  Tambah Lagi
                </Button>
              </div>
            </div>
          ) : (
            <>
              {step === 0 && (
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <KeyRound size={15} /> AKSES AKUN（アカウント）
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="required">Cabang Mendunia *</Label>
                      <Select value={form.cabang_id || ""} onValueChange={setSel("cabang_id")}>
                        <SelectTrigger error={!!errors.cabang_id}>
                          <SelectValue placeholder="Pilih cabang..." />
                        </SelectTrigger>
                        <SelectContent>
                          {cabangList.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.nama_cabang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.cabang_id && <p className="text-xs text-red-500">{errors.cabang_id}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="required">Email Login *</Label>
                      <Input
                        type="email"
                        value={form.email || ""}
                        onChange={set("email")}
                        placeholder="email@kandidat.com"
                        error={!!errors.email}
                      />
                      {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Password (Default)</Label>
                      <Input
                        value={form.password_akun || ""}
                        onChange={set("password_akun")}
                        placeholder="12345678"
                      />
                      <p className="text-xs text-muted-foreground">
                        Kosongkan untuk memakai default <b>12345678</b>. Login kandidat memakai Email atau Nama.
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <p className="text-xs text-muted-foreground">
                    Isi data diri kandidat pada langkah berikutnya. Akun akses (email + password) akan langsung
                    dibuat otomatis bersamaan dengan profil.
                  </p>
                </div>
              )}

              {step === 1 && (
                <FormStep1_DataDiri form={form} set={set} setSel={setSel} errors={errors} cabangList={cabangList} />
              )}
              {step === 2 && (
                <FormStep2_Kesehatan form={form} setBool={setBool} set={set} setSel={setSel} errors={errors} />
              )}
              {step === 3 && (
                <FormStep3_Pendidikan
                  form={{
                    ...form,
                    setPendidikanTerakhir: (v: string) => setForm((p: any) => ({ ...p, pendidikan_terakhir: v })),
                  }}
                  setPendidikan={setPendidikan}
                  errors={errors}
                />
              )}
              {step === 4 && (
                <FormStep4_Pengalaman
                  form={form}
                  setPengalaman={setPengalaman}
                  addPengalaman={addPengalaman}
                  removePengalaman={removePengalaman}
                />
              )}
              {step === 5 && (
                <FormStep5_Kemampuan form={form} set={set} setSel={setSel} errors={errors} toggleSSW={toggleSSW} />
              )}
              {step === 6 && (
                <FormStep6_Keluarga
                  form={form}
                  set={set}
                  setKeluarga={setKeluarga}
                  addKeluarga={addKeluarga}
                  removeKeluarga={removeKeluarga}
                  errors={errors}
                />
              )}
              {step === 7 && (
                <FormStep7_Jepang form={form} setBool={setBool} set={set} setSel={setSel} errors={errors} />
              )}
              {step === 8 && (
                <FormStep8_Motivasi form={form} setBool={setBool} set={set} setSel={setSel} errors={errors} />
              )}
              {step === 9 && (
                <FormStep9_Dokumen
                  form={form}
                  uploadingKey={null}
                  isSubmitted={false}
                  handleUpload={handleUpload}
                  addSertifikatSsw={addSertifikatSsw}
                  removeSertifikatSsw={removeSertifikatSsw}
                  errors={errors}
                />
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        {!created && (
          <div className="flex items-center justify-between px-5 py-3 border-t gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ChevronLeft size={14} className="mr-1" /> Sebelumnya
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={saving}>
                {saving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <CheckCircle size={14} className="mr-1" />}
                {savedId ? "Simpan Lagi" : "Simpan Dulu"}
              </Button>
              {step < TABS.length - 1 ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setStep((s) => s + 1);
                    setErrors({});
                  }}
                >
                  Lanjut <ChevronRight size={14} className="ml-1" />
                </Button>
              ) : (
                <Button size="sm" onClick={handleSubmit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                  {saving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <CheckCircle size={14} className="mr-1" />}
                  Simpan & Selesai
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
