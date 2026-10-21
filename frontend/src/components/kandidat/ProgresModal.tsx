import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea, Label } from "@/components/ui/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  Save,
  Activity,
  Briefcase,
  CalendarDays,
  ClipboardList,
  DollarSign,
  FileText,
} from "lucide-react";

interface FormProgres {
  status_progres: string;
  nama_perusahaan: string;
  institusi: string;
  bidang_ssw: string;
  detail_pekerjaan: string;
  jadwal_interview: string;
  catatan_interview: string;
  tgl_setsumeikai: string;
  tgl_mensetsu_1: string;
  tgl_mensetsu_2: string;
  catatan_mensetsu: string;
  biaya_pemberkasan: string;
  adm_tahap_1: string;
  adm_tahap_2: string;
  dokumen_dikirim: string;
  terbit_kontrak: string;
  kontrak_dikirim_tsk: string;
  terbit_paspor: string;
  masuk_imigrasi: string;
  coe_terbit: string;
  ektkln_pembuatan: string;
  dokumen_dikirim_2: string;
  visa: string;
  jadwal_penerbangan: string;
}

interface ProgresModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formProgres: FormProgres;
  updateFormProgres: (key: string, value: string) => void;
  onSave: () => void;
  loading: boolean;
  sertifikatSsw?: string;
  perusahaanList?: { id: number; nama_perusahaan: string }[];
}

const statusOptions = [
  {
    value: "Job Matching",
    label: "Job Matching",
    desc: "Kandidat sedang dicarikan / dipasangkan dengan job yang cocok.",
  },
  {
    value: "Pending",
    label: "Pending",
    desc: "Proses dijeda atau menunggu tahap berikutnya.",
  },
  {
    value: "lamar ke perusahaan",
    label: "Lamar ke Perusahaan",
    desc: "Berkas kandidat sudah dilamar ke perusahaan tujuan.",
  },
  {
    value: "Interview",
    label: "Interview",
    desc: "Kandidat sedang menjalani proses interview.",
  },
  {
    value: "Jadwalkan Interview Ulang",
    label: "Jadwalkan Interview Ulang",
    desc: "Interview perlu dijadwalkan ulang.",
  },
  {
    value: "Lulus interview",
    label: "Lulus Interview",
    desc: "Kandidat dinyatakan lulus interview.",
  },
  {
    value: "Gagal Interview",
    label: "Gagal Interview",
    desc: "Kandidat tidak lolos interview.",
  },
  {
    value: "Pemberkasan",
    label: "Pemberkasan",
    desc: "Proses pengurusan dokumen & berkas berangkat.",
  },
  {
    value: "Berangkat",
    label: "Berangkat",
    desc: "Kandidat sudah / siap diberangkatkan ke Jepang.",
  },
  {
    value: "Ditolak",
    label: "Ditolak",
    desc: "Kandidat ditolak / proses tidak dilanjutkan.",
  },
];

const formatDateID = (v: string) => {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

function Section({
  icon: Icon,
  title,
  hint,
  iconClass,
  children,
}: {
  icon: React.ElementType;
  title: string;
  hint?: string;
  iconClass: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b bg-muted/30 rounded-t-xl">
        <span
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}
        >
          <Icon size={14} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight">{title}</p>
          {hint && (
            <p className="text-[11px] text-muted-foreground leading-tight">
              {hint}
            </p>
          )}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  filled,
  children,
}: {
  label: string;
  hint?: string;
  filled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-semibold">{label}</Label>
        {filled && (
          <span className="text-[10px] text-emerald-600 font-bold shrink-0">
            ✓ Terisi
          </span>
        )}
      </div>
      {children}
      {hint && (
        <p className="text-[11px] text-muted-foreground leading-tight">
          {hint}
        </p>
      )}
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
  showEmptyHint = false,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  showEmptyHint?: boolean;
}) {
  const display = formatDateID(value);
  return (
    <div className="min-w-0 space-y-1">
      {label && <Label className="text-xs font-semibold">{label}</Label>}
      <Input
        type="date"
        className="h-10 w-full min-w-0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {display ? (
        <p className="text-[11px] text-emerald-600 font-medium leading-tight">
          {display}
        </p>
      ) : showEmptyHint ? (
        <p className="text-[11px] text-muted-foreground/70 leading-tight">
          Belum diisi
        </p>
      ) : null}
    </div>
  );
}

function DateCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-2.5 space-y-1.5 min-w-0">
      <Label className="text-[11px] font-semibold text-muted-foreground leading-tight block">
        {label}
      </Label>
      {children}
    </div>
  );
}

function RupiahInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
        Rp
      </span>
      <Input
        inputMode="numeric"
        className="pl-9 h-10"
        value={value ? Number(value).toLocaleString("id-ID") : ""}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder="0"
      />
    </div>
  );
}

export default function ProgresModal({
  open,
  onOpenChange,
  formProgres,
  updateFormProgres,
  onSave,
  loading,
  sertifikatSsw,
  perusahaanList = [],
}: ProgresModalProps) {
  const currentStatus = statusOptions.find(
    (s) => s.value === formProgres.status_progres,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Perbarui Progres Kandidat</DialogTitle>
          <DialogDescription>
            Atur status tahap dan lengkapi data proses kandidat. Kolom yang
            tidak diisi akan dikosongkan.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto -mx-1 px-1 space-y-4">
          {/* ── STATUS ── */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0">
                <Activity size={14} />
              </span>
              <div>
                <p className="text-sm font-bold leading-tight">
                  Status Kandidat
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Tahap proses kandidat saat ini
                </p>
              </div>
            </div>
            <Select
              value={formProgres.status_progres}
              onValueChange={(v) => updateFormProgres("status_progres", v)}
            >
              <SelectTrigger className="h-10 bg-white">
                <SelectValue placeholder="Pilih status tahap..." />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentStatus && (
              <p className="text-xs text-sky-900 bg-white border border-sky-200 rounded-lg px-3 py-2 mt-2.5 leading-relaxed">
                {currentStatus.desc}
              </p>
            )}
          </div>

          {/* ── JOB / PERUSAHAAN ── */}
          <Section
            icon={Briefcase}
            title="Job & Perusahaan"
            hint="Perusahaan tujuan dan detail penempatan kandidat"
            iconClass="bg-amber-500 text-white"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field
                label="Perusahaan Penempatan"
                hint="Perusahaan di Jepang yang menampung kandidat"
                filled={!!formProgres.nama_perusahaan}
              >
                {perusahaanList.length > 0 ? (
                  <Select
                    value={formProgres.nama_perusahaan}
                    onValueChange={(v) =>
                      updateFormProgres("nama_perusahaan", v)
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Pilih perusahaan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {perusahaanList.map(
                        (p: { id: number; nama_perusahaan: string }) => (
                          <SelectItem
                            key={p.id}
                            value={p.nama_perusahaan}
                          >
                            {p.nama_perusahaan}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    className="h-10"
                    value={formProgres.nama_perusahaan}
                    onChange={(e) =>
                      updateFormProgres("nama_perusahaan", e.target.value)
                    }
                    placeholder="Nama perusahaan..."
                  />
                )}
              </Field>

              <Field
                label="Institusi / LPK"
                hint="LPK atau institusi yang membina kandidat"
                filled={!!formProgres.institusi}
              >
                <Input
                  className="h-10"
                  value={formProgres.institusi}
                  onChange={(e) =>
                    updateFormProgres("institusi", e.target.value)
                  }
                  placeholder="Ketik nama institusi..."
                />
              </Field>

              <Field
                label="Bidang SSW"
                hint={
                  sertifikatSsw
                    ? "Pilih dari sertifikat SSW kandidat"
                    : "Bidang kerja SSW"
                }
                filled={!!formProgres.bidang_ssw}
              >
                {sertifikatSsw ? (
                  <Select
                    value={formProgres.bidang_ssw}
                    onValueChange={(v) => updateFormProgres("bidang_ssw", v)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Pilih bidang SSW..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sertifikatSsw
                        .split(",")
                        .map((s: string, i: number) => (
                          <SelectItem key={i} value={s.trim()}>
                            {s.trim()}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    className="h-10"
                    value={formProgres.bidang_ssw}
                    onChange={(e) =>
                      updateFormProgres("bidang_ssw", e.target.value)
                    }
                    placeholder="Bidang SSW..."
                  />
                )}
              </Field>
            </div>

            <div className="mt-4">
              <Field
                label="Detail Pekerjaan"
                hint="Jelaskan posisi / job description kandidat"
                filled={!!formProgres.detail_pekerjaan}
              >
                <Textarea
                  value={formProgres.detail_pekerjaan}
                  onChange={(e) =>
                    updateFormProgres("detail_pekerjaan", e.target.value)
                  }
                  placeholder="Contoh: Line produksi pengolahan makanan, shift pagi, dsb..."
                  rows={2}
                />
              </Field>
            </div>
          </Section>

          {/* ── JADWAL INTERVIEW ── */}
          <Section
            icon={CalendarDays}
            title="Jadwal Interview"
            hint="Kapan interview dijadwalkan dan catatannya"
            iconClass="bg-violet-500 text-white"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DateField
                label="Tanggal Interview"
                value={formProgres.jadwal_interview}
                onChange={(v) => updateFormProgres("jadwal_interview", v)}
                showEmptyHint
              />
              <div className="md:col-span-2">
                <Field
                  label="Catatan Interview"
                  hint="Hasil, kesan, atau catatan dari interview"
                  filled={!!formProgres.catatan_interview}
                >
                  <Textarea
                    value={formProgres.catatan_interview}
                    onChange={(e) =>
                      updateFormProgres("catatan_interview", e.target.value)
                    }
                    placeholder="Catatan hasil interview..."
                    rows={2}
                  />
                </Field>
              </div>
            </div>
          </Section>

          {/* ── DATA INTERVIEW & MENSETSU ── */}
          <Section
            icon={ClipboardList}
            title="Data Interview & Mensetsu"
            hint="Jadwal setsumeikai dan mensetsu + catatannya"
            iconClass="bg-sky-500 text-white"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DateField
                label="TGL Setsumeikai"
                value={formProgres.tgl_setsumeikai}
                onChange={(v) => updateFormProgres("tgl_setsumeikai", v)}
              />
              <DateField
                label="TGL Mensetsu 1"
                value={formProgres.tgl_mensetsu_1}
                onChange={(v) => updateFormProgres("tgl_mensetsu_1", v)}
              />
              <DateField
                label="TGL Mensetsu 2"
                value={formProgres.tgl_mensetsu_2}
                onChange={(v) => updateFormProgres("tgl_mensetsu_2", v)}
              />
            </div>
            <div className="mt-4">
              <Field
                label="Catatan Mensetsu"
                filled={!!formProgres.catatan_mensetsu}
              >
                <Textarea
                  value={formProgres.catatan_mensetsu}
                  onChange={(e) =>
                    updateFormProgres("catatan_mensetsu", e.target.value)
                  }
                  placeholder="Catatan hasil mensetsu..."
                  rows={2}
                />
              </Field>
            </div>
          </Section>

          {/* ── BIAYA & ADMINISTRASI ── */}
          <Section
            icon={DollarSign}
            title="Biaya & Administrasi"
            hint="Nominal otomatis difmt (Rp 1.500.000)"
            iconClass="bg-emerald-500 text-white"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field
                label="Biaya Pemberkasan"
                filled={!!formProgres.biaya_pemberkasan}
              >
                <RupiahInput
                  value={formProgres.biaya_pemberkasan}
                  onChange={(v) => updateFormProgres("biaya_pemberkasan", v)}
                />
              </Field>
              <Field
                label="ADM Tahap 1"
                filled={!!formProgres.adm_tahap_1}
              >
                <RupiahInput
                  value={formProgres.adm_tahap_1}
                  onChange={(v) => updateFormProgres("adm_tahap_1", v)}
                />
              </Field>
              <Field
                label="ADM Tahap 2"
                filled={!!formProgres.adm_tahap_2}
              >
                <RupiahInput
                  value={formProgres.adm_tahap_2}
                  onChange={(v) => updateFormProgres("adm_tahap_2", v)}
                />
              </Field>
            </div>
          </Section>

          {/* ── TRACKING DOKUMEN & PROSES ── */}
          <Section
            icon={FileText}
            title="Tracking Dokumen & Proses"
            hint="Isi tanggalnya hanya jika tahapnya sudah terjadi"
            iconClass="bg-purple-500 text-white"
          >
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <DateCell label="Dok. Dikirim">
                <DateField
                  value={formProgres.dokumen_dikirim}
                  onChange={(v) => updateFormProgres("dokumen_dikirim", v)}
                />
              </DateCell>
              <DateCell label="Terbit Kontrak">
                <DateField
                  value={formProgres.terbit_kontrak}
                  onChange={(v) => updateFormProgres("terbit_kontrak", v)}
                />
              </DateCell>
              <DateCell label="Kontrak ke TSK">
                <DateField
                  value={formProgres.kontrak_dikirim_tsk}
                  onChange={(v) =>
                    updateFormProgres("kontrak_dikirim_tsk", v)
                  }
                />
              </DateCell>
              <DateCell label="Terbit Paspor">
                <DateField
                  value={formProgres.terbit_paspor}
                  onChange={(v) => updateFormProgres("terbit_paspor", v)}
                />
              </DateCell>
              <DateCell label="Masuk Imigrasi">
                <DateField
                  value={formProgres.masuk_imigrasi}
                  onChange={(v) => updateFormProgres("masuk_imigrasi", v)}
                />
              </DateCell>
              <DateCell label="COE Terbit">
                <DateField
                  value={formProgres.coe_terbit}
                  onChange={(v) => updateFormProgres("coe_terbit", v)}
                />
              </DateCell>
              <DateCell label="E-KTKLN">
                <DateField
                  value={formProgres.ektkln_pembuatan}
                  onChange={(v) => updateFormProgres("ektkln_pembuatan", v)}
                />
              </DateCell>
              <DateCell label="Dok. Dikirim 2">
                <DateField
                  value={formProgres.dokumen_dikirim_2}
                  onChange={(v) => updateFormProgres("dokumen_dikirim_2", v)}
                />
              </DateCell>
              <DateCell label="Visa">
                <DateField
                  value={formProgres.visa}
                  onChange={(v) => updateFormProgres("visa", v)}
                />
              </DateCell>
              <DateCell label="Jadwal Penerbangan">
                <DateField
                  value={formProgres.jadwal_penerbangan}
                  onChange={(v) =>
                    updateFormProgres("jadwal_penerbangan", v)
                  }
                />
              </DateCell>
            </div>
          </Section>
        </div>

        <DialogFooter className="border-t pt-4 mt-1">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button onClick={onSave} disabled={loading}>
            {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
            <Save size={14} className="mr-2" />
            Simpan Progres
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
