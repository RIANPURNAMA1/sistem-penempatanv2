import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
} from "@/components/ui/components";
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
  Save,
  Send,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  FileText,
  User,
} from "lucide-react";

import {
  STEPS,
  REQUIRED_DOCS,
  defaultPendidikan,
  defaultKeluarga,
  statusBadge,
} from "@/components/form-kandidat/constants";

import {
  BoolSelect,
  YearMonthPicker,
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

export default function FormulirPage() {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [profil, setProfil] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [sertifikatSsw, setSertifikatSsw] = useState<any[]>([
    { id: null, nama_file: "", file: null },
  ]);
  const [cabangList, setCabangList] = useState<{ id: number; nama_cabang: string }[]>([]);
  const [form, setForm] = useState<any>({
    pendidikan_terakhir: "",
    pendidikan: defaultPendidikan,
    pengalaman: [],
    keluarga: defaultKeluarga,
    sertifikat_ssw: [],
  });

  useEffect(() => {
    api.get("/kandidat/my-profile").then((r) => {
      const d = r.data.data;
      setProfil(d);
      const convertBool = (v: any) =>
        v === true || v === 1 || v === "1"
          ? true
          : v === false || v === 0 || v === "0"
            ? false
            : null;
      setForm((p: any) => ({
        ...p,
        ...d,
        pernah_ke_jepang: convertBool(d.pernah_ke_jepang),
        keluarga_di_jepang: convertBool(d.keluarga_di_jepang),
        kenalan_di_jepang: convertBool(d.kenalan_di_jepang),
        sudah_vaksin: convertBool(d.sudah_vaksin),
        berkacamata: convertBool(d.berkacamata),
        lensa_kontak: convertBool(d.lensa_kontak),
        buta_warna: convertBool(d.buta_warna),
        bertato: convertBool(d.bertato),
        merokok: convertBool(d.merokok),
        minum_alkohol: convertBool(d.minum_alkohol),
        bersedia_shift: convertBool(d.bersedia_shift),
        bersedia_lembur: convertBool(d.bersedia_lembur),
        bersedia_hari_libur: convertBool(d.bersedia_hari_libur),
        pendidikan: d.pendidikan?.length ? d.pendidikan : p.pendidikan,
        pengalaman: d.pengalaman?.length ? d.pengalaman : p.pengalaman,
        keluarga: d.keluarga?.length ? d.keluarga : p.keluarga,
        sertifikat_ssw: d.sertifikat_ssw
          ? typeof d.sertifikat_ssw === "string"
            ? d.sertifikat_ssw
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
            : d.sertifikat_ssw
          : [],
        dokumen: d.dokumen || [],
      }));
    });
  }, []);

  useEffect(() => {
    api.get("/cabang").then((r) => setCabangList(r.data.data));
  }, []);

  const set =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((p: any) => ({ ...p, [key]: e.target.value }));
      setTouched((t: any) => ({ ...t, [key]: true }));
      if (errors[key])
        setErrors((er: any) => {
          const n = { ...er };
          delete n[key];
          return n;
        });
    };
  const setBool = (key: string) => (v: boolean) => {
    setForm((p: any) => ({ ...p, [key]: v }));
    setTouched((t: any) => ({ ...t, [key]: true }));
    if (errors[key])
      setErrors((er: any) => {
        const n = { ...er };
        delete n[key];
        return n;
      });
  };
  const setSel = (key: string) => (v: string) => {
    setForm((p: any) => ({ ...p, [key]: v }));
    setTouched((t: any) => ({ ...t, [key]: true }));
    if (errors[key])
      setErrors((er: any) => {
        const n = { ...er };
        delete n[key];
        return n;
      });
  };

  const setPendidikan = (i: number, key: string, v: string) => {
    setForm((p: any) => {
      const arr = [...p.pendidikan];
      arr[i] = { ...arr[i], [key]: v };
      return { ...p, pendidikan: arr };
    });
    setTouched((t: any) => ({ ...t, [`pendidikan_${i}_${key}`]: true }));
    if (errors[`pendidikan_${i}_${key}`])
      setErrors((er: any) => {
        const n = { ...er };
        delete n[`pendidikan_${i}_${key}`];
        return n;
      });
  };
  const setPengalaman = (i: number, key: string, v: any) => {
    setForm((p: any) => {
      const arr = [...p.pengalaman];
      arr[i] = { ...arr[i], [key]: v };
      return { ...p, pengalaman: arr };
    });
  };
  const setKeluarga = (i: number, key: string, v: string) => {
    setForm((p: any) => {
      const arr = [...p.keluarga];
      arr[i] = { ...arr[i], [key]: v };
      return { ...p, keluarga: arr };
    });
  };

  const isEmpty = (val: any) => val === undefined || val === null || val === "";

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {};

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
      if (form.sudah_vaksin === undefined || form.sudah_vaksin === null || form.sudah_vaksin === "")
        newErrors.sudah_vaksin = "Pilih sudah/tidak vaksin";
      if (isEmpty(form.kondisi_kesehatan)) newErrors.kondisi_kesehatan = "Kondisi kesehatan wajib dipilih";
      if (form.berkacamata === undefined || form.berkacamata === null || form.berkacamata === "" || form.berkacamata === 0)
        newErrors.berkacamata = "Pilih ya/tidak";
      if (form.lensa_kontak === undefined || form.lensa_kontak === null || form.lensa_kontak === "" || form.lensa_kontak === 0)
        newErrors.lensa_kontak = "Pilih ya/tidak";
      if (form.buta_warna === undefined || form.buta_warna === null || form.buta_warna === "" || form.buta_warna === 0)
        newErrors.buta_warna = "Pilih ya/tidak";
      if (form.bertato === undefined || form.bertato === null || form.bertato === "" || form.bertato === 0)
        newErrors.bertato = "Pilih ya/tidak";
      if (form.merokok === undefined || form.merokok === null || form.merokok === "" || form.merokok === 0)
        newErrors.merokok = "Pilih ya/tidak";
      if (form.minum_alkohol === undefined || form.minum_alkohol === null || form.minum_alkohol === "" || form.minum_alkohol === 0)
        newErrors.minum_alkohol = "Pilih ya/tidak";
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
      if (ayah && isEmpty(ayah.pekerjaan)) newErrors.keluarga_ayah_pekerjaan = "Pekerjaan Ayah wajib diisi";
      if (!ibu || isEmpty(ibu.nama)) newErrors.keluarga_ibu_nama = "Nama Ibu wajib diisi";
      if (ibu && isEmpty(ibu.usia)) newErrors.keluarga_ibu_usia = "Usia Ibu wajib diisi";
      if (ibu && isEmpty(ibu.pekerjaan)) newErrors.keluarga_ibu_pekerjaan = "Pekerjaan Ibu wajib diisi";
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
      const missing = REQUIRED_DOCS.filter(
        (d) => !form.dokumen?.find((doc: any) => doc.jenis_dokumen === d),
      );
      if (missing.length > 0) newErrors.dokumen = `${missing.length} dokumen belum diupload`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    setForm((p: any) => ({
      ...p,
      pengalaman: p.pengalaman.filter((_: any, idx: number) => idx !== i),
    }));

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
    setForm((p: any) => ({
      ...p,
      keluarga: p.keluarga.filter((_: any, idx: number) => idx !== i),
    }));

  const toggleSSW = (val: string) =>
    setForm((p: any) => ({
      ...p,
      sertifikat_ssw: p.sertifikat_ssw?.includes(val)
        ? p.sertifikat_ssw.filter((s: string) => s !== val)
        : [...p.sertifikat_ssw, val],
    }));

  const addSertifikatSsw = () => setSertifikatSsw((p) => [...p, { id: null, nama_file: "", file: null }]);
  const removeSertifikatSsw = (i: number) =>
    setSertifikatSsw((p) => p.filter((_: any, idx: number) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        sertifikat_ssw: form.sertifikat_ssw?.join(", ") || "",
      };
      await api.put("/kandidat/my-profile", payload);
      toast({ title: "Data berhasil disimpan", variant: "success" as any });
    } catch {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.put("/kandidat/my-profile", {
        ...form,
        sertifikat_ssw: form.sertifikat_ssw?.join(", ") || "",
      });
      const res = await api.post("/kandidat/submit");
      const newStatus = res.data?.status || 'submitted';
      toast({
        title: newStatus === 'approved' ? "Formulir langsung disetujui!" : "Formulir berhasil dikirim!",
        description: res.data?.message || (newStatus === 'approved' 
          ? "Sertifikat JFT & SSW sudah lengkap, formulir langsung disetujui." 
          : "Admin akan segera memproses data Anda"),
        variant: "success" as any,
      });
      setProfil((p: any) => ({ ...p, status_formulir: newStatus }));
      setForm((p: any) => ({ ...p, status_formulir: newStatus }));
    } catch {
      toast({ title: "Gagal mengirim formulir", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async (jenis: string, file: File, sswIndex?: number) => {
    setUploadingKey(jenis);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("jenis_dokumen", jenis);
    try {
      await api.post("/kandidat/upload-dokumen", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
      toast({ title: "Dokumen berhasil diupload", variant: "success" as any });

      const newDokumen = { jenis_dokumen: jenis, nama_file: file.name };

      if (sswIndex !== undefined) {
        setSertifikatSsw((p: any) => {
          const arr = [...p];
          arr[sswIndex] = { ...arr[sswIndex], nama_file: file.name, file };
          return arr;
        });
        setForm((p: any) => ({
          ...p,
          dokumen: [...(p.dokumen || []).filter((d: any) => d.jenis_dokumen !== jenis), newDokumen],
        }));
      } else {
        setForm((p: any) => ({
          ...p,
          dokumen: [...(p.dokumen || []).filter((d: any) => d.jenis_dokumen !== jenis), newDokumen],
        }));
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toast({
        title: `Upload gagal: ${err.response?.data?.message || err.message}`,
        variant: "destructive",
      });
    } finally {
      setUploadingKey(null);
    }
  };

  const isSubmitted =
    form.status_formulir === "submitted" ||
    form.status_formulir === "reviewed" ||
    form.status_formulir === "approved";

  const curStatus = statusBadge[form.status_formulir] || statusBadge.draft;

  return (
    <div className="page-container max-w-4xl">
      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Formulir Pendaftaran</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Isi data lengkap untuk matching pekerjaan terbaik di Jepang
            </p>
          </div>
          <Badge variant={curStatus.variant as any} className="text-sm px-3 py-1">
            {curStatus.label}
          </Badge>
        </div>
        {form.catatan_admin && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <p className="font-medium mb-1">Catatan Admin:</p>
            <p>{form.catatan_admin}</p>
          </div>
        )}
      </div>

      {/* ── Step Navigation ──
          Desktop  : flex scroll row dengan label teks penuh
          Mobile (≤400px) : grid 5 kolom, icon + label pendek, semua step terlihat
      */}
      <div className="mb-6">
        {/* Mobile grid — tampil di bawah sm, tersembunyi di sm ke atas */}
        <div className="grid grid-cols-5 gap-1 sm:hidden">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`flex flex-col items-center justify-center gap-0.5 px-1 py-2 rounded-lg transition-all min-w-0 ${
                  step === s.id
                    ? "bg-[#1e3a5f] text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon size={14} />
                <span className="text-[9px] font-medium truncate w-full text-center leading-tight">
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop scroll row — tersembunyi di bawah sm, tampil di sm ke atas */}
        <div className="hidden sm:block -mx-4 px-4 overflow-x-auto pb-2 sm:mx-0 sm:px-0">
          <div className="flex gap-1 min-w-max pr-4">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    step === s.id
                      ? "bg-[#1e3a5f] text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon size={14} />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div className="h-1 bg-muted rounded-full mb-6 mx-4 sm:mx-0">
        <div
          className="h-full bg-foreground rounded-full transition-all"
          style={{ width: `${(step / STEPS.length) * 100}%` }}
        />
      </div>

      {/* ── Form Card ── */}
      <Card>
        <CardContent className="pt-6 pb-8">
          {step === 1 && (
            <FormStep1_DataDiri form={form} set={set} setSel={setSel} errors={errors} cabangList={cabangList} />
          )}

          {step === 2 && (
            <FormStep2_Kesehatan
              form={form}
              setBool={setBool}
              set={set}
              setSel={setSel}
              errors={errors}
            />
          )}

          {step === 3 && (
            <FormStep3_Pendidikan
              form={{
                ...form,
                setPendidikanTerakhir: (v: string) =>
                  setForm((p: any) => ({ ...p, pendidikan_terakhir: v })),
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
            <FormStep5_Kemampuan
              form={form}
              set={set}
              setSel={setSel}
              errors={errors}
              toggleSSW={toggleSSW}
            />
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
            <FormStep7_Jepang
              form={form}
              setBool={setBool}
              set={set}
              setSel={setSel}
              errors={errors}
            />
          )}

          {step === 8 && (
            <FormStep8_Motivasi
              form={form}
              setBool={setBool}
              set={set}
              setSel={setSel}
              errors={errors}
            />
          )}

          {step === 9 && (
            <FormStep9_Dokumen
              form={{ ...form, sertifikatSsw }}
              uploadingKey={uploadingKey}
              isSubmitted={isSubmitted}
              handleUpload={handleUpload}
              addSertifikatSsw={addSertifikatSsw}
              removeSertifikatSsw={removeSertifikatSsw}
              errors={errors}
            />
          )}
        </CardContent>
      </Card>

      {/* ── Action Buttons ──
          Mobile (≤400px): tombol Simpan hanya tampilkan icon, label dipersingkat
          Desktop: tampil normal dengan teks lengkap
      */}
      <div className="flex items-center justify-between mt-6 gap-2">
        {/* Tombol Sebelumnya */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-4"
        >
          <ChevronLeft size={14} className="mr-0.5 sm:mr-1" />
          {/* Label panjang di sm ke atas, pendek di mobile */}
          <span className="hidden sm:inline">Sebelumnya</span>
          <span className="sm:hidden">Kembali</span>
        </Button>

        {/* Grup tombol kanan */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Tombol Simpan */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saving || isSubmitted}
            className="text-xs sm:text-sm px-2 sm:px-4"
          >
            {saving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} className="sm:mr-1.5" />
            )}
            {/* Sembunyikan teks di mobile, tampilkan di sm ke atas */}
            <span className="hidden sm:inline">Simpan</span>
          </Button>

          {/* Tombol Lanjut / Kirim */}
          {step < STEPS.length ? (
            <Button
              size="sm"
              className="text-xs sm:text-sm px-2 sm:px-4"
              onClick={() => {
                if (validateStep(step)) {
                  setStep((s) => Math.min(STEPS.length, s + 1));
                  setErrors({});
                } else {
                  toast({
                    title: "Lengkapi semua field yang wajib diisi",
                    description: "Field dengan tanda * wajib diisi",
                    variant: "destructive" as any,
                  });
                }
              }}
            >
              {/* Label pendek di mobile, panjang di sm ke atas */}
              <span className="hidden sm:inline">Lanjut</span>
              <span className="sm:hidden">Lanjut</span>
              <ChevronRight size={14} className="ml-0.5 sm:ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={async () => {
                const allStepsValid = [1, 2, 3, 5, 6, 7, 8, 9].every((s) => validateStep(s));
                if (!allStepsValid) {
                  toast({
                    title: "Lengkapi semua field yang wajib diisi",
                    description: "Semua field wajib diisi sebelum mengirim",
                    variant: "destructive" as any,
                  });
                  return;
                }
                handleSubmit();
              }}
              disabled={submitting || isSubmitted}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm px-2 sm:px-4"
            >
              {submitting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Send size={13} className="sm:mr-1.5" />
              )}
              {/* Label dipendekkan di mobile */}
              <span className="hidden sm:inline">
                {isSubmitted ? "Sudah Terkirim" : "Kirim Formulir"}
              </span>
              <span className="sm:hidden">
                {isSubmitted ? "Terkirim" : "Kirim"}
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}