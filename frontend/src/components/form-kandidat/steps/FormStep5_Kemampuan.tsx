import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";
import { ssw_options } from "../constants";

interface FormStep5Props {
  form: any;
  set: (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setSel: (key: string) => (v: string) => void;
  errors: Record<string, string>;
  toggleSSW: (val: string) => void;
}

export function FormStep5_Kemampuan({ form, set, setSel, errors, toggleSSW }: FormStep5Props) {
  return (
    <div className="space-y-4">
      <p className="form-section-title">
        <Star size={18} /> KEMAMPUAN & SERTIFIKAT
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="required">Level JLPT *</Label>
          <Select value={form.level_jlpt || ""} onValueChange={setSel("level_jlpt")}>
            <SelectTrigger error={!!errors.level_jlpt}>
              <SelectValue placeholder="Pilih level..." />
            </SelectTrigger>
            <SelectContent>
              {["N1", "N2", "N3", "N4", "N5", "Belum ada"].map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.level_jlpt && (
            <p className="text-xs text-red-500">{errors.level_jlpt}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Level JFT (opsional)</Label>
          <Select value={form.level_jft || ""} onValueChange={setSel("level_jft")}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih level..." />
            </SelectTrigger>
            <SelectContent>
              {["A1", "A2", "B1", "B2", "Belum ada"].map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="required">Lama Belajar Bahasa Jepang *</Label>
          <Input
            value={form.lama_belajar_jepang || ""}
            onChange={set("lama_belajar_jepang")}
            placeholder="6 bulan, 1 tahun, dll."
            error={!!errors.lama_belajar_jepang}
          />
          {errors.lama_belajar_jepang && (
            <p className="text-xs text-red-500">{errors.lama_belajar_jepang}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Level Bahasa Jepang *</Label>
          <Select
            value={form.level_bahasa_jepang || ""}
            onValueChange={setSel("level_bahasa_jepang")}
          >
            <SelectTrigger error={!!errors.level_bahasa_jepang}>
              <SelectValue placeholder="Pilih..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dasar">Dasar</SelectItem>
              <SelectItem value="Menengah">Menengah</SelectItem>
              <SelectItem value="Lancar">Lancar</SelectItem>
            </SelectContent>
          </Select>
          {errors.level_bahasa_jepang && (
            <p className="text-xs text-red-500">{errors.level_bahasa_jepang}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>ID Prometric (opsional)</Label>
          <Input
            value={form.id_prometric || ""}
            onChange={set("id_prometric")}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Password Prometric (opsional)</Label>
          <Input
            value={form.password_prometric || ""}
            onChange={set("password_prometric")}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Sertifikat SSW yang Dimiliki (opsional)</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {ssw_options.map((s) => (
            <label
              key={s}
              className="flex items-center gap-2 p-2.5 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <input
                type="checkbox"
                className="rounded"
                checked={form.sertifikat_ssw?.includes(s) || false}
                onChange={() => toggleSSW(s)}
              />
              <span className="text-sm">{s}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}