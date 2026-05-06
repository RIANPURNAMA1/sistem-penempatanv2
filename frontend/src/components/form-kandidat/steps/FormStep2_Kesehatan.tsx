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

export function FormStep2_Kesehatan({
form,
setBool,
set,
setSel,
errors,
}: FormStep2Props) {
return ( <div className="space-y-5">
{/* TITLE */} <p className="form-section-title flex items-center gap-2 text-sm sm:text-base"> <Heart size={18} /> KONDISI FISIK & KESEHATAN </p>
  {/* GRID RESPONSIVE */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    {/* SUDAH VAKSIN */}
    <div className="space-y-1.5 w-full">
      <Label className="required">Sudah Vaksin? *</Label>
      <div className="w-full">
        <BoolSelect
          value={form.sudah_vaksin}
          onChange={setBool("sudah_vaksin")}
          error={!!errors.sudah_vaksin}
        />
      </div>
      {errors.sudah_vaksin && (
        <p className="text-xs text-red-500">{errors.sudah_vaksin}</p>
      )}
    </div>

    {/* KONDISI KESEHATAN */}
    <div className="space-y-1.5 w-full">
      <Label className="required">Kondisi Kesehatan Saat Ini *</Label>
      <Select
        value={form.kondisi_kesehatan || ""}
        onValueChange={setSel("kondisi_kesehatan")}
      >
        <SelectTrigger className="w-full" error={!!errors.kondisi_kesehatan}>
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

    {/* PENGLIHATAN */}
    <div className="space-y-1.5 w-full">
      <Label>Penglihatan Kanan</Label>
      <Input
        className="w-full"
        value={form.penglihatan_kanan || ""}
        onChange={set("penglihatan_kanan")}
        placeholder="Normal / Minus -2.5"
      />
    </div>

    <div className="space-y-1.5 w-full">
      <Label>Penglihatan Kiri</Label>
      <Input
        className="w-full"
        value={form.penglihatan_kiri || ""}
        onChange={set("penglihatan_kiri")}
        placeholder="Normal / Minus -1.5"
      />
    </div>

    {/* BOOL FIELDS */}
    {[
      { key: "berkacamata", label: "Berkacamata?" },
      { key: "lensa_kontak", label: "Menggunakan Lensa Kontak?" },
      { key: "buta_warna", label: "Buta Warna?" },
      { key: "bertato", label: "Bertato?" },
      { key: "merokok", label: "Merokok?" },
      { key: "minum_alkohol", label: "Minum Alkohol?" },
    ].map((item) => (
      <div key={item.key} className="space-y-1.5 w-full">
        <Label className="required">{item.label} *</Label>
        <div className="w-full">
          <BoolSelect
            value={form[item.key]}
            onChange={setBool(item.key)}
            error={!!errors[item.key]}
          />
        </div>
        {errors[item.key] && (
          <p className="text-xs text-red-500">{errors[item.key]}</p>
        )}
      </div>
    ))}

    {/* CONDITIONAL FIELD */}
    {form.minum_alkohol && (
      <div className="col-span-1 md:col-span-2 space-y-1.5 w-full">
        <Label>Intensitas Minum Alkohol</Label>
        <Input
          className="w-full"
          value={form.intensitas_alkohol || ""}
          onChange={set("intensitas_alkohol")}
          placeholder="Misal: 1-2x seminggu"
        />
      </div>
    )}

    {/* TEXTAREA */}
    <div className="col-span-1 md:col-span-2 space-y-1.5 w-full">
      <Label className="required">Riwayat Penyakit / Cedera *</Label>
      <Textarea
        className={`w-full ${errors.riwayat_penyakit ? "border-red-500" : ""}`}
        value={form.riwayat_penyakit || ""}
        onChange={set("riwayat_penyakit")}
        placeholder="Cedera, patah tulang, penyakit kronis, dll. Isi 'Tidak ada' jika tidak ada."
        rows={3}
      />
      {errors.riwayat_penyakit && (
        <p className="text-xs text-red-500">{errors.riwayat_penyakit}</p>
      )}
    </div>

  </div>
</div>


);
}
