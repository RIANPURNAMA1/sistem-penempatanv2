import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap } from "lucide-react";
import { YearMonthPicker } from "../YearMonthPicker";
import { IjazahUpload } from "../IjazahUpload";
import {
  getIjazahJenis,
  labelIjazah,
  jenjangWajib,
  JENJANG_PENDIDIKAN,
} from "../constants";

interface FormStep3Props {
  form: any;
  setPendidikan: (i: number, key: string, v: string) => void;
  errors: Record<string, string>;
  uploadingKey?: string | null;
  isSubmitted?: boolean;
  handleUpload?: (jenis: string, file: File, sswIndex?: number) => void;
}

export function FormStep3_Pendidikan({
  form,
  setPendidikan,
  errors,
  uploadingKey = null,
  isSubmitted = false,
  handleUpload,
}: FormStep3Props) {
return ( <div className="space-y-6">

  {/* TITLE */}
  <p className="form-section-title flex items-center gap-2 text-sm sm:text-base">
    <GraduationCap className="h-4 w-4" />
    PENDIDIKAN（学歴）
  </p>

  {/* PENDIDIKAN TERAKHIR */}
  <div className="max-w-sm space-y-1.5">
    <Label className="required">Pendidikan Terakhir</Label>
    <Select
      value={form.pendidikan_terakhir || ""}
      onValueChange={(v) => form.setPendidikanTerakhir?.(v)}
    >
      <SelectTrigger className="w-full" error={!!errors.pendidikan_terakhir}>
        <SelectValue placeholder="Pilih pendidikan terakhir..." />
      </SelectTrigger>
      <SelectContent>
        {JENJANG_PENDIDIKAN.map((j) => (
          <SelectItem key={j} value={j}>
            {j}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {errors.pendidikan_terakhir && (
      <p className="text-xs text-red-500">{errors.pendidikan_terakhir}</p>
    )}
  </div>

  {/* LIST PENDIDIKAN */}
  {form.pendidikan.map((p: any, i: number) => {
    const wajib = jenjangWajib.includes(p.jenjang);

    return (
      <div key={i} className="border border-border rounded-lg p-4 space-y-4">

        <p className="font-semibold text-sm text-muted-foreground">
          {p.jenjang}
        </p>

        {/* GRID RESPONSIVE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* NAMA SEKOLAH */}
          <div className="col-span-1 md:col-span-2 space-y-1.5 w-full">
            <Label className={wajib ? "required" : ""}>
              Nama Sekolah / Universitas
            </Label>
            <Input
              className="w-full"
              value={p.nama_sekolah || ""}
              onChange={(e) => setPendidikan(i, "nama_sekolah", e.target.value)}
              placeholder={p.jenjang}
            />
            {errors[`pendidikan_${i}_nama_sekolah`] && (
              <p className="text-xs text-red-500">
                {errors[`pendidikan_${i}_nama_sekolah`]}
              </p>
            )}
          </div>

          {/* JURUSAN */}
          {(p.jenjang === "SMA/SMK" || p.jenjang === "Perguruan Tinggi") && (
            <div className="col-span-1 md:col-span-2 space-y-1.5 w-full">
              <Label>Jurusan</Label>
              <Input
                className="w-full"
                value={p.jurusan || ""}
                onChange={(e) => setPendidikan(i, "jurusan", e.target.value)}
                placeholder="Jurusan / Prodi"
              />
            </div>
          )}

          {/* MASUK */}
          <div className="space-y-1.5 w-full">
            <Label className={wajib ? "required" : ""}>
              Bulan & Tahun Masuk
            </Label>
            <div className="w-full">
              <YearMonthPicker
                monthVal={p.bulan_masuk}
                yearVal={p.tahun_masuk}
                onMonthChange={(v: string) => setPendidikan(i, "bulan_masuk", v)}
                onYearChange={(v: string) => setPendidikan(i, "tahun_masuk", v)}
              />
            </div>
            {errors[`pendidikan_${i}_bulan_masuk`] && (
              <p className="text-xs text-red-500">
                {errors[`pendidikan_${i}_bulan_masuk`]}
              </p>
            )}
            {errors[`pendidikan_${i}_tahun_masuk`] && (
              <p className="text-xs text-red-500">
                {errors[`pendidikan_${i}_tahun_masuk`]}
              </p>
            )}
          </div>

          {/* LULUS */}
          <div className="space-y-1.5 w-full">
            <Label className={wajib ? "required" : ""}>
              Bulan & Tahun Lulus
            </Label>
            <div className="w-full">
              <YearMonthPicker
                monthVal={p.bulan_lulus}
                yearVal={p.tahun_lulus}
                onMonthChange={(v: string) => setPendidikan(i, "bulan_lulus", v)}
                onYearChange={(v: string) => setPendidikan(i, "tahun_lulus", v)}
                placeholder="Bulan Lulus"
              />
            </div>
            {errors[`pendidikan_${i}_bulan_lulus`] && (
              <p className="text-xs text-red-500">
                {errors[`pendidikan_${i}_bulan_lulus`]}
              </p>
            )}
            {errors[`pendidikan_${i}_tahun_lulus`] && (
              <p className="text-xs text-red-500">
                {errors[`pendidikan_${i}_tahun_lulus`]}
              </p>
            )}
          </div>

          {/* IJAZAH */}
          {(() => {
            const jenis = getIjazahJenis(p.jenjang);
            if (!jenis) return null;

            const uploaded = form.dokumen?.find(
              (d: any) => d.jenis_dokumen === jenis,
            );

            return (
              <IjazahUpload
                label={labelIjazah(p.jenjang)}
                required={wajib}
                fileName={uploaded?.nama_file}
                uploading={uploadingKey === jenis}
                disabled={isSubmitted || !handleUpload}
                error={errors[`pendidikan_${i}_ijazah`]}
                onUpload={(file) => handleUpload?.(jenis, file)}
              />
            );
          })()}

        </div>
      </div>
    );
  })}
</div>


);
}
