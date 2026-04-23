import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Textarea } from "@/components/ui/components";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { YearMonthPicker } from "../YearMonthPicker";

interface FormStep4Props {
  form: any;
  setPengalaman: (i: number, key: string, v: any) => void;
  addPengalaman: () => void;
  removePengalaman: (i: number) => void;
}

export function FormStep4_Pengalaman({
  form,
  setPengalaman,
  addPengalaman,
  removePengalaman,
}: FormStep4Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="form-section-title mb-0 border-0 pb-0">
          <Briefcase className="inline mr-2 h-4 w-4" />
          PENGALAMAN KERJA（職歴）
        </p>
        <Button variant="outline" size="sm" onClick={addPengalaman}>
          <Plus size={14} className="mr-1" />
          Tambah
        </Button>
      </div>
      {form.pengalaman.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
          <p className="text-sm">Belum ada pengalaman kerja</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={addPengalaman}>
            <Plus size={14} className="mr-1" />
            Tambah Pengalaman
          </Button>
        </div>
      )}
      {form.pengalaman.map((p: any, i: number) => (
        <div key={i} className="border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">Pengalaman #{i + 1}</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:text-destructive"
              onClick={() => removePengalaman(i)}
            >
              <Trash2 size={13} />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nama Perusahaan</Label>
              <Input
                value={p.nama_perusahaan || ""}
                onChange={(e) =>
                  setPengalaman(i, "nama_perusahaan", e.target.value)
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Posisi / Bidang</Label>
              <Input
                value={p.posisi || ""}
                onChange={(e) => setPengalaman(i, "posisi", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Alamat Perusahaan</Label>
              <Input
                value={p.alamat_perusahaan || ""}
                onChange={(e) =>
                  setPengalaman(i, "alamat_perusahaan", e.target.value)
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Bulan & Tahun Masuk</Label>
              <YearMonthPicker
                monthVal={p.bulan_masuk}
                yearVal={p.tahun_masuk}
                onMonthChange={(v: string) => setPengalaman(i, "bulan_masuk", v)}
                onYearChange={(v: string) => setPengalaman(i, "tahun_masuk", v)}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Bulan & Tahun Keluar</Label>
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!p.masih_bekerja}
                    onChange={(e) =>
                      setPengalaman(i, "masih_bekerja", e.target.checked)
                    }
                  />
                  Masih bekerja
                </label>
              </div>
              {!p.masih_bekerja && (
                <YearMonthPicker
                  monthVal={p.bulan_keluar}
                  yearVal={p.tahun_keluar}
                  onMonthChange={(v: string) => setPengalaman(i, "bulan_keluar", v)}
                  onYearChange={(v: string) => setPengalaman(i, "tahun_keluar", v)}
                  placeholder="Bulan Keluar"
                />
              )}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Deskripsi Pekerjaan</Label>
              <Textarea
                value={p.deskripsi_pekerjaan || ""}
                onChange={(e) =>
                  setPengalaman(i, "deskripsi_pekerjaan", e.target.value)
                }
                placeholder="Deskripsikan tugas dan tanggung jawab Anda..."
                rows={3}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}