import { Input } from "@/components/ui/input";
import { Label, Textarea } from "@/components/ui/components";
import { Globe } from "lucide-react";
import { BoolSelect } from "../BoolSelect";

interface FormStep7Props {
  form: any;
  setBool: (key: string) => (v: boolean) => void;
  set: (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setSel: (key: string) => (v: string) => void;
  errors: Record<string, string>;
}

export function FormStep7_Jepang({ form, setBool, set, setSel, errors }: FormStep7Props) {
  return (
    <div className="space-y-4">
      <p className="form-section-title">
        <Globe className="inline mr-2 h-4 w-4" />
        INFORMASI JEPANG
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="required">Pernah ke Jepang? *</Label>
          <BoolSelect
            value={form.pernah_ke_jepang}
            onChange={setBool("pernah_ke_jepang")}
            error={!!errors.pernah_ke_jepang}
          />
          {errors.pernah_ke_jepang && (
            <p className="text-xs text-red-500">{errors.pernah_ke_jepang}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Punya Keluarga di Jepang? *</Label>
          <BoolSelect
            value={form.keluarga_di_jepang}
            onChange={setBool("keluarga_di_jepang")}
            error={!!errors.keluarga_di_jepang}
          />
          {errors.keluarga_di_jepang && (
            <p className="text-xs text-red-500">{errors.keluarga_di_jepang}</p>
          )}
        </div>
        {form.keluarga_di_jepang && (
          <>
            <div className="space-y-1.5">
              <Label>Hubungan (opsional)</Label>
              <Input
                value={form.hubungan_keluarga_jepang || ""}
                onChange={set("hubungan_keluarga_jepang")}
                placeholder="Kakak, Ayah, dll."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status Kerabat di Jepang (opsional)</Label>
              <Input
                value={form.status_kerabat_jepang || ""}
                onChange={set("status_kerabat_jepang")}
                placeholder="TG, Magang, dll."
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Kontak Keluarga di Jepang (opsional)</Label>
              <Input
                value={form.kontak_keluarga_jepang || ""}
                onChange={set("kontak_keluarga_jepang")}
              />
            </div>
          </>
        )}
        <div className="space-y-1.5">
          <Label className="required">Punya Kenalan di Jepang? *</Label>
          <BoolSelect
            value={form.kenalan_di_jepang}
            onChange={setBool("kenalan_di_jepang")}
            error={!!errors.kenalan_di_jepang}
          />
          {errors.kenalan_di_jepang && (
            <p className="text-xs text-red-500">{errors.kenalan_di_jepang}</p>
          )}
        </div>
        {form.kenalan_di_jepang && (
          <div className="col-span-2 space-y-1.5">
            <Label>Detail Kenalan (Nama, Alamat, Kontak)</Label>
            <Textarea
              value={form.kenalan_jepang_detail || ""}
              onChange={set("kenalan_jepang_detail")}
              rows={3}
            />
          </div>
        )}
      </div>
    </div>
  );
}