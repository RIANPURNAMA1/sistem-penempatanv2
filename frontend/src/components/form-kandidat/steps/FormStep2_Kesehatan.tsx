import { Input } from "@/components/ui/input";
import { Label, Textarea } from "@/components/ui/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart } from "lucide-react";
import { BoolSelect } from "../BoolSelect";

interface FormStep2Props {
  form: any;
  setBool: (key: string) => (v: boolean) => void;
  set: (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setSel: (key: string) => (v: string) => void;
  errors: Record<string, string>;
}

export function FormStep2_Kesehatan({ form, setBool, set, setSel, errors }: FormStep2Props) {
  return (
    <div className="space-y-4">
      <p className="form-section-title flex items-center gap-2">
        <Heart size={18} /> KONDISI FISIK & KESEHATAN
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="required">Sudah Vaksin? *</Label>
          <BoolSelect
            value={form.sudah_vaksin}
            onChange={setBool("sudah_vaksin")}
            error={!!errors.sudah_vaksin}
          />
          {errors.sudah_vaksin && (
            <p className="text-xs text-red-500">{errors.sudah_vaksin}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Kondisi Kesehatan Saat Ini *</Label>
          <Select
            value={form.kondisi_kesehatan || ""}
            onValueChange={setSel("kondisi_kesehatan")}
          >
            <SelectTrigger error={!!errors.kondisi_kesehatan}>
              <SelectValue placeholder="Pilih..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sehat">Sehat</SelectItem>
              <SelectItem value="Tidak Sehat">Tidak Sehat</SelectItem>
            </SelectContent>
          </Select>
          {errors.kondisi_kesehatan && (
            <p className="text-xs text-red-500">{errors.kondisi_kesehatan}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Penglihatan Kanan</Label>
          <Input
            value={form.penglihatan_kanan || ""}
            onChange={set("penglihatan_kanan")}
            placeholder="Normal / Minus -2.5"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Penglihatan Kiri</Label>
          <Input
            value={form.penglihatan_kiri || ""}
            onChange={set("penglihatan_kiri")}
            placeholder="Normal / Minus -1.5"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="required">Berkacamata? *</Label>
          <BoolSelect
            value={form.berkacamata}
            onChange={setBool("berkacamata")}
            error={!!errors.berkacamata}
          />
          {errors.berkacamata && (
            <p className="text-xs text-red-500">{errors.berkacamata}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Menggunakan Lensa Kontak? *</Label>
          <BoolSelect
            value={form.lensa_kontak}
            onChange={setBool("lensa_kontak")}
            error={!!errors.lensa_kontak}
          />
          {errors.lensa_kontak && (
            <p className="text-xs text-red-500">{errors.lensa_kontak}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Buta Warna? *</Label>
          <BoolSelect
            value={form.buta_warna}
            onChange={setBool("buta_warna")}
            error={!!errors.buta_warna}
          />
          {errors.buta_warna && (
            <p className="text-xs text-red-500">{errors.buta_warna}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Bertato? *</Label>
          <BoolSelect
            value={form.bertato}
            onChange={setBool("bertato")}
            error={!!errors.bertato}
          />
          {errors.bertato && (
            <p className="text-xs text-red-500">{errors.bertato}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Merokok? *</Label>
          <BoolSelect
            value={form.merokok}
            onChange={setBool("merokok")}
            error={!!errors.merokok}
          />
          {errors.merokok && (
            <p className="text-xs text-red-500">{errors.merokok}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Minum Alkohol? *</Label>
          <BoolSelect
            value={form.minum_alkohol}
            onChange={setBool("minum_alkohol")}
            error={!!errors.minum_alkohol}
          />
          {errors.minum_alkohol && (
            <p className="text-xs text-red-500">{errors.minum_alkohol}</p>
          )}
        </div>
        {form.minum_alkohol && (
          <div className="col-span-2 space-y-1.5">
            <Label>Intensitas Minum Alkohol</Label>
            <Input
              value={form.intensitas_alkohol || ""}
              onChange={set("intensitas_alkohol")}
              placeholder="Misal: 1-2x seminggu"
            />
          </div>
        )}
        <div className="col-span-2 space-y-1.5">
          <Label className="required">Riwayat Penyakit / Cedera *</Label>
          <Textarea
            value={form.riwayat_penyakit || ""}
            onChange={set("riwayat_penyakit")}
            placeholder="Cedera, patah tulang, penyakit kronis, dll. Isi 'Tidak ada' jika tidak ada."
            rows={3}
            className={errors.riwayat_penyakit ? "border-red-500" : ""}
          />
          {errors.riwayat_penyakit && (
            <p className="text-xs text-red-500">{errors.riwayat_penyakit}</p>
          )}
        </div>
      </div>
    </div>
  );
}