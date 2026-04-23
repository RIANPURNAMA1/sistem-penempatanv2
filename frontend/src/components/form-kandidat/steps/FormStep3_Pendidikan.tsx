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
  return (
    <div className="space-y-6">
      <p className="form-section-title">
        <GraduationCap className="inline mr-2 h-4 w-4" />
        PENDIDIKAN（学歴）
      </p>
      <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
        <p className="font-semibold text-sm text-muted-foreground">
          Pendidikan Terakhir
        </p>
        <Select
          value={form.pendidikan_terakhir || ""}
          onValueChange={(v) => form.setPendidikanTerakhir?.(v)}
        >
          <SelectTrigger>
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
      {form.pendidikan.map((p: any, i: number) => {
        const wajib = jenjangWajib.includes(p.jenjang);
        return (
          <div key={i} className="border border-border rounded-lg p-4 space-y-3">
            <p className="font-semibold text-sm text-muted-foreground">
              {p.jenjang} {wajib && <span className="text-red-500">*</span>}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className={wajib ? "required" : ""}>
                  Nama Sekolah / Universitas {wajib && "*"}
                </Label>
                <Input
                  value={p.nama_sekolah || ""}
                  onChange={(e) => setPendidikan(i, "nama_sekolah", e.target.value)}
                  placeholder={`Nama ${p.jenjang}`}
                  error={!!errors[`pendidikan_${i}_nama_sekolah`]}
                />
                {errors[`pendidikan_${i}_nama_sekolah`] && (
                  <p className="text-xs text-red-500">
                    {errors[`pendidikan_${i}_nama_sekolah`]}
                  </p>
                )}
              </div>
              {(p.jenjang === "SMA/SMK" || p.jenjang === "Perguruan Tinggi") && (
                <div className="col-span-2 space-y-1.5">
                  <Label>Jurusan</Label>
                  <Input
                    value={p.jurusan || ""}
                    onChange={(e) => setPendidikan(i, "jurusan", e.target.value)}
                    placeholder="Jurusan / Prodi"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label className={wajib ? "required" : ""}>
                  Bulan & Tahun Masuk {wajib && "*"}
                </Label>
                <YearMonthPicker
                  monthVal={p.bulan_masuk}
                  yearVal={p.tahun_masuk}
                  onMonthChange={(v: string) => setPendidikan(i, "bulan_masuk", v)}
                  onYearChange={(v: string) => setPendidikan(i, "tahun_masuk", v)}
                />
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
              <div className="space-y-1.5">
                <Label className={wajib ? "required" : ""}>
                  Bulan & Tahun Lulus {wajib && "*"}
                </Label>
                <YearMonthPicker
                  monthVal={p.bulan_lulus}
                  yearVal={p.tahun_lulus}
                  onMonthChange={(v: string) => setPendidikan(i, "bulan_lulus", v)}
                  onYearChange={(v: string) => setPendidikan(i, "tahun_lulus", v)}
                  placeholder="Bulan Lulus"
                />
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