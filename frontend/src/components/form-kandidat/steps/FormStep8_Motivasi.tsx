import { Input } from "@/components/ui/input";
import { Label, Textarea } from "@/components/ui/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, Info } from "lucide-react";
import { CONTOH_MOTIVASI } from "../constants";
import { BoolSelect } from "../BoolSelect";

interface FormStep8Props {
  form: any;
  setBool: (key: string) => (v: boolean) => void;
  set: (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setSel: (key: string) => (v: string) => void;
  errors: Record<string, string>;
}

export function FormStep8_Motivasi({ form, setBool, set, setSel, errors }: FormStep8Props) {
  return (
    <div className="space-y-4">
      <p className="form-section-title">
        <Target className="inline mr-2 h-4 w-4" />
        MOTIVASI, TUJUAN & POIN PENDUKUNG
      </p>
      <div className="rounded-lg border border-[#1e3a5f]/20 bg-[#1e3a5f]/5 px-3 py-2.5 flex items-start gap-2">
        <Info size={14} className="text-[#1e3a5f] shrink-0 mt-0.5" />
        <p className="text-[11px] text-gray-600 leading-relaxed">
          <strong>Semua isian pada langkah ini wajib ditulis dalam bahasa Jepang
          (日本語で記入)</strong> karena akan dicantumkan pada CV yang dikirim ke perusahaan di
          Jepang. Gunakan contoh-contoh di bawah sebagai panduan. Tulis dalam bentuk
          <em> ます/たい </em> (polite) dan Hindari gunakan placeholder.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label className="required">Tujuan ke Jepang *</Label>
          <Textarea
            value={form.tujuan_ke_jepang || ""}
            onChange={set("tujuan_ke_jepang")}
            rows={3}
            placeholder={`例：${CONTOH_MOTIVASI.tujuan_ke_jepang}`}
            className={errors.tujuan_ke_jepang ? "border-red-500" : ""}
          />
          <p className="text-[11px] text-muted-foreground">
            Contoh: 「{CONTOH_MOTIVASI.tujuan_ke_jepang}」
          </p>
          {errors.tujuan_ke_jepang && (
            <p className="text-xs text-red-500">{errors.tujuan_ke_jepang}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Alasan Ingin ke Jepang *</Label>
          <Textarea
            value={form.alasan_ke_jepang || ""}
            onChange={set("alasan_ke_jepang")}
            rows={3}
            placeholder={`例：${CONTOH_MOTIVASI.alasan_ke_jepang}`}
            className={errors.alasan_ke_jepang ? "border-red-500" : ""}
          />
          <p className="text-[11px] text-muted-foreground">
            Contoh: 「{CONTOH_MOTIVASI.alasan_ke_jepang}」
          </p>
          {errors.alasan_ke_jepang && (
            <p className="text-xs text-red-500">{errors.alasan_ke_jepang}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Citacita Setelah Pulang dari Jepang *</Label>
          <Textarea
            value={form.cita_cita_setelah_jepang || ""}
            onChange={set("cita_cita_setelah_jepang")}
            rows={3}
            placeholder={`例：${CONTOH_MOTIVASI.cita_cita_setelah_jepang}`}
            className={errors.cita_cita_setelah_jepang ? "border-red-500" : ""}
          />
          <p className="text-[11px] text-muted-foreground">
            Contoh: 「{CONTOH_MOTIVASI.cita_cita_setelah_jepang}」
          </p>
          {errors.cita_cita_setelah_jepang && (
            <p className="text-xs text-red-500">
              {errors.cita_cita_setelah_jepang}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Rencana Pengiriman Uang/Bulan ke Indonesia (Rp) *</Label>
          <Input
            type="number"
            value={form.rencana_pengiriman_uang || ""}
            onChange={set("rencana_pengiriman_uang")}
            placeholder="3000000"
            error={!!errors.rencana_pengiriman_uang}
          />
          {errors.rencana_pengiriman_uang && (
            <p className="text-xs text-red-500">{errors.rencana_pengiriman_uang}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Kelebihan Diri *</Label>
          <Textarea
            value={form.kelebihan_diri || ""}
            onChange={set("kelebihan_diri")}
            rows={3}
            placeholder={`例：${CONTOH_MOTIVASI.kelebihan_diri}`}
            className={errors.kelebihan_diri ? "border-red-500" : ""}
          />
          <p className="text-[11px] text-muted-foreground">
            Contoh: 「{CONTOH_MOTIVASI.kelebihan_diri}」
          </p>
          {errors.kelebihan_diri && (
            <p className="text-xs text-red-500">{errors.kelebihan_diri}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Kekurangan Diri *</Label>
          <Textarea
            value={form.kekurangan_diri || ""}
            onChange={set("kekurangan_diri")}
            rows={3}
            placeholder={`例：${CONTOH_MOTIVASI.kekurangan_diri}`}
            className={errors.kekurangan_diri ? "border-red-500" : ""}
          />
          <p className="text-[11px] text-muted-foreground">
            Contoh: 「{CONTOH_MOTIVASI.kekurangan_diri}」
          </p>
          {errors.kekurangan_diri && (
            <p className="text-xs text-red-500">{errors.kekurangan_diri}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Keahlian *</Label>
          <Textarea
            value={form.keahlian || ""}
            onChange={set("keahlian")}
            rows={2}
            placeholder={`例：${CONTOH_MOTIVASI.keahlian}`}
            className={errors.keahlian ? "border-red-500" : ""}
          />
          <p className="text-[11px] text-muted-foreground">
            Contoh: 「{CONTOH_MOTIVASI.keahlian}」
          </p>
          {errors.keahlian && (
            <p className="text-xs text-red-500">{errors.keahlian}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Promosi Diri (自己PR)</Label>
          <Textarea
            value={form.promosi_diri || ""}
            onChange={set("promosi_diri")}
            rows={3}
            placeholder={`例：${CONTOH_MOTIVASI.promosi_diri}`}
            className={errors.promosi_diri ? "border-red-500" : ""}
          />
          <p className="text-[11px] text-muted-foreground">
            Contoh: 「{CONTOH_MOTIVASI.promosi_diri}」
          </p>
          {errors.promosi_diri && (
            <p className="text-xs text-red-500">{errors.promosi_diri}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Catatan Tambahan (備考)</Label>
          <Textarea
            value={form.catatan_tambahan || ""}
            onChange={set("catatan_tambahan")}
            rows={2}
            placeholder={`例：${CONTOH_MOTIVASI.catatan_tambahan}`}
            className={errors.catatan_tambahan ? "border-red-500" : ""}
          />
          <p className="text-[11px] text-muted-foreground">
            Contoh: 「{CONTOH_MOTIVASI.catatan_tambahan}」
          </p>
          {errors.catatan_tambahan && (
            <p className="text-xs text-red-500">{errors.catatan_tambahan}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1.5">
          <Label className="required">Bersedia Kerja Shift? *</Label>
          <BoolSelect
            value={form.bersedia_shift}
            onChange={setBool("bersedia_shift")}
            error={!!errors.bersedia_shift}
          />
          {errors.bersedia_shift && (
            <p className="text-xs text-red-500">{errors.bersedia_shift}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Bersedia Lembur? *</Label>
          <BoolSelect
            value={form.bersedia_lembur}
            onChange={setBool("bersedia_lembur")}
            error={!!errors.bersedia_lembur}
          />
          {errors.bersedia_lembur && (
            <p className="text-xs text-red-500">{errors.bersedia_lembur}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Bersedia Kerja Hari Libur? *</Label>
          <BoolSelect
            value={form.bersedia_hari_libur}
            onChange={setBool("bersedia_hari_libur")}
            error={!!errors.bersedia_hari_libur}
          />
          {errors.bersedia_hari_libur && (
            <p className="text-xs text-red-500">{errors.bersedia_hari_libur}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Lama Ingin Tinggal di Jepang *</Label>
          <Select
            value={form.lama_tinggal_jepang || ""}
            onValueChange={setSel("lama_tinggal_jepang")}
          >
            <SelectTrigger error={!!errors.lama_tinggal_jepang}>
              <SelectValue placeholder="Pilih..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2-3 tahun">2-3 tahun</SelectItem>
              <SelectItem value="3-5 tahun">3-5 tahun</SelectItem>
            </SelectContent>
          </Select>
          {errors.lama_tinggal_jepang && (
            <p className="text-xs text-red-500">{errors.lama_tinggal_jepang}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Lama Ingin Bekerja di Perusahaan *</Label>
          <Select
            value={form.lama_kerja_perusahaan || ""}
            onValueChange={setSel("lama_kerja_perusahaan")}
          >
            <SelectTrigger error={!!errors.lama_kerja_perusahaan}>
              <SelectValue placeholder="Pilih..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-2 tahun">1-2 tahun</SelectItem>
              <SelectItem value="2-3 tahun">2-3 tahun</SelectItem>
              <SelectItem value="3-5 tahun">3-5 tahun</SelectItem>
            </SelectContent>
          </Select>
          {errors.lama_kerja_perusahaan && (
            <p className="text-xs text-red-500">{errors.lama_kerja_perusahaan}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Rencana Pulang ke Indonesia (5 tahun) *</Label>
          <Select
            value={form.rencana_pulang || ""}
            onValueChange={setSel("rencana_pulang")}
          >
            <SelectTrigger error={!!errors.rencana_pulang}>
              <SelectValue placeholder="Pilih..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-2 kali">1-2 kali</SelectItem>
              <SelectItem value="3-4 kali">3-4 kali</SelectItem>
              <SelectItem value="Lainnya">Lainnya</SelectItem>
            </SelectContent>
          </Select>
          {errors.rencana_pulang && (
            <p className="text-xs text-red-500">{errors.rencana_pulang}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Sumber Biaya Keberangkatan *</Label>
          <Select
            value={form.sumber_biaya || ""}
            onValueChange={setSel("sumber_biaya")}
          >
            <SelectTrigger error={!!errors.sumber_biaya}>
              <SelectValue placeholder="Pilih..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dana Pribadi">Dana Pribadi</SelectItem>
              <SelectItem value="Dana Talang LPK">Dana Talang LPK</SelectItem>
            </SelectContent>
          </Select>
          {errors.sumber_biaya && (
            <p className="text-xs text-red-500">{errors.sumber_biaya}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Biaya yang Disiapkan *</Label>
          <Select
            value={form.biaya_disiapkan || ""}
            onValueChange={setSel("biaya_disiapkan")}
          >
            <SelectTrigger error={!!errors.biaya_disiapkan}>
              <SelectValue placeholder="Pilih..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10-20 Juta">10-20 Juta</SelectItem>
              <SelectItem value="20-30 Juta">20-30 Juta</SelectItem>
              <SelectItem value="40-50 Juta">40-50 Juta</SelectItem>
              <SelectItem value="Lainnya">Lainnya</SelectItem>
            </SelectContent>
          </Select>
          {errors.biaya_disiapkan && (
            <p className="text-xs text-red-500">{errors.biaya_disiapkan}</p>
          )}
        </div>
      </div>
    </div>
  );
}