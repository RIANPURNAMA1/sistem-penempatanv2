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
import { jenjangWajib } from "../constants";

interface FormStep3Props {
form: any;
setPendidikan: (i: number, key: string, v: string) => void;
errors: Record<string, string>;
}

export function FormStep3_Pendidikan({ form, setPendidikan, errors }: FormStep3Props) {
return ( <div className="space-y-6">

```
  {/* TITLE */}
  <p className="form-section-title flex items-center gap-2 text-sm sm:text-base">
    <GraduationCap className="h-4 w-4" />
    PENDIDIKAN（学歴）
  </p>

  {/* PENDIDIKAN TERAKHIR */}
  <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
    <p className="font-semibold text-sm text-muted-foreground">
      Pendidikan Terakhir
    </p>
    <Select
      value={form.pendidikan_terakhir || ""}
      onValueChange={(v) => form.setPendidikanTerakhir?.(v)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Pilih pendidikan terakhir..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="SD">SD</SelectItem>
        <SelectItem value="SMP">SMP</SelectItem>
        <SelectItem value="SMA/SMK">SMA/SMK</SelectItem>
        <SelectItem value="Perguruan Tinggi">Perguruan Tinggi</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* LIST PENDIDIKAN */}
  {form.pendidikan.map((p: any, i: number) => {
    const wajib = jenjangWajib.includes(p.jenjang);

    return (
      <div key={i} className="border border-border rounded-lg p-4 space-y-4">

        <p className="font-semibold text-sm text-muted-foreground">
          {p.jenjang} {wajib && <span className="text-red-500">*</span>}
        </p>

        {/* GRID RESPONSIVE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* NAMA SEKOLAH */}
          <div className="col-span-1 md:col-span-2 space-y-1.5 w-full">
            <Label className={wajib ? "required" : ""}>
              Nama Sekolah / Universitas {wajib && "*"}
            </Label>
            <Input
              className="w-full"
              value={p.nama_sekolah || ""}
              onChange={(e) => setPendidikan(i, "nama_sekolah", e.target.value)}
              placeholder={`Nama ${p.jenjang}`}
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
              Bulan & Tahun Masuk {wajib && "*"}
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
              Bulan & Tahun Lulus {wajib && "*"}
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

        </div>
      </div>
    );
  })}
</div>


);
}
