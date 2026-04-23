import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Separator } from "@/components/ui/components";
import { Users, Plus, Trash2 } from "lucide-react";

interface FormStep6Props {
  form: any;
  set: (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setKeluarga: (i: number, key: string, v: string) => void;
  addKeluarga: (hubungan: string) => void;
  removeKeluarga: (i: number) => void;
  errors: Record<string, string>;
}

export function FormStep6_Keluarga({
  form,
  set,
  setKeluarga,
  addKeluarga,
  removeKeluarga,
  errors,
}: FormStep6Props) {
  const hubunganList = ["Ayah", "Ibu", "Suami", "Istri", "Kakak", "Adik"];
  return (
    <div className="space-y-4">
      <p className="form-section-title">
        <Users className="inline mr-2 h-4 w-4" />
        DATA KELUARGA（家族構成）
      </p>
      <div className="space-y-1.5 sm:col-span-2">
        <Label className="required">
          Penghasilan Keluarga / Bulan (Rp) *
        </Label>
        <Input
          type="number"
          value={form.penghasilan_keluarga || ""}
          onChange={set("penghasilan_keluarga")}
          placeholder="5000000"
          error={!!errors.penghasilan_keluarga}
        />
        {errors.penghasilan_keluarga && (
          <p className="text-xs text-red-500">
            {errors.penghasilan_keluarga}
          </p>
        )}
      </div>
      <Separator />
      {hubunganList.map((hubungan) => {
        const members = form.keluarga.filter(
          (k: any) => k.hubungan === hubungan,
        );
        const canAdd = ["Kakak", "Adik", "Suami", "Istri"].includes(hubungan);
        const isRequired = ["Ayah", "Ibu"].includes(hubungan);
        return (
          <div key={hubungan} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">
                {hubungan} {isRequired && "*"}
              </p>
              {canAdd && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addKeluarga(hubungan)}
                >
                  <Plus size={13} className="mr-1" />
                  Tambah {hubungan}
                </Button>
              )}
            </div>
            {members.map((m: any, mi: number) => {
              const globalIdx = form.keluarga.findIndex(
                (k: any, idx: number) =>
                  k.hubungan === hubungan &&
                  form.keluarga
                    .slice(0, idx + 1)
                    .filter((kk: any) => kk.hubungan === hubungan)
                    .length === mi + 1,
              );
              return (
                <div key={mi} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground font-mono">
                      {hubungan} {mi > 0 ? mi + 1 : ""}
                    </span>
                    {canAdd && members.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:text-destructive"
                        onClick={() => removeKeluarga(globalIdx)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="col-span-2 sm:col-span-1 space-y-1.5">
                      <Label className={isRequired ? "required" : ""}>
                        {isRequired ? "Nama *" : "Nama"}
                      </Label>
                      <Input
                        value={m.nama || ""}
                        onChange={(e) =>
                          setKeluarga(globalIdx, "nama", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={isRequired ? "required" : ""}>
                        {isRequired ? "Usia *" : "Usia"}
                      </Label>
                      <Input
                        type="number"
                        value={m.usia || ""}
                        onChange={(e) =>
                          setKeluarga(globalIdx, "usia", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={isRequired ? "required" : ""}>
                        {isRequired ? "Pekerjaan *" : "Pekerjaan"}
                      </Label>
                      <Input
                        value={m.pekerjaan || ""}
                        onChange={(e) =>
                          setKeluarga(globalIdx, "pekerjaan", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Penghasilan/Bulan</Label>
                      <Input
                        type="number"
                        value={m.penghasilan || ""}
                        onChange={(e) =>
                          setKeluarga(globalIdx, "penghasilan", e.target.value)
                        }
                        placeholder="Rp"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {members.length === 0 && !canAdd && (
              <p className="text-sm text-red-500 italic">
                Data {hubungan} wajib diisi
              </p>
            )}
            {members.length === 0 && canAdd && (
              <p className="text-sm text-muted-foreground italic">
                Belum ada. Klik tombol untuk menambah.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}