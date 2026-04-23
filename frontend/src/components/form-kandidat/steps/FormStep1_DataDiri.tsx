import { Input } from "@/components/ui/input";
import { Label, Textarea, Separator } from "@/components/ui/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "lucide-react";

interface FormStep1Props {
  form: any;
  set: (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setSel: (key: string) => (v: string) => void;
  errors: Record<string, string>;
  cabangList?: { id: number; nama_cabang: string }[];
}

export function FormStep1_DataDiri({ form, set, setSel, errors, cabangList = [] }: FormStep1Props) {
  return (
    <div className="space-y-4">
      <p className="form-section-title flex items-center gap-2">
        <User size={18} /> DATA DIRI（個人情報）
      </p>
      {cabangList.length > 0 && (
        <div className="space-y-1.5">
          <Label className="required">Cabang Mendunia *</Label>
          <Select value={form.cabang_id || ""} onValueChange={setSel("cabang_id")}>
            <SelectTrigger error={!!errors.cabang_id}>
              <SelectValue placeholder="Pilih cabang..." />
            </SelectTrigger>
            <SelectContent>
              {cabangList.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.nama_cabang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.cabang_id && <p className="text-xs text-red-500">{errors.cabang_id}</p>}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="required">Nama (Katakana) *</Label>
          <Input
            value={form.nama_katakana || ""}
            onChange={set("nama_katakana")}
            placeholder="カタカナ"
            error={!!errors.nama_katakana}
          />
          {errors.nama_katakana && (
            <p className="text-xs text-red-500">{errors.nama_katakana}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Nama (Romaji) *</Label>
          <Input
            value={form.nama_romaji || ""}
            onChange={set("nama_romaji")}
            placeholder="NAMA ROMAJI"
            error={!!errors.nama_romaji}
          />
          {errors.nama_romaji && (
            <p className="text-xs text-red-500">{errors.nama_romaji}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Tempat Lahir *</Label>
          <Input
            value={form.tempat_lahir || ""}
            onChange={set("tempat_lahir")}
            placeholder="Bandung"
            error={!!errors.tempat_lahir}
          />
          {errors.tempat_lahir && (
            <p className="text-xs text-red-500">{errors.tempat_lahir}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Tanggal Lahir *</Label>
          <Input
            type="date"
            value={form.tanggal_lahir?.split("T")[0] || ""}
            onChange={set("tanggal_lahir")}
            error={!!errors.tanggal_lahir}
          />
          {errors.tanggal_lahir && (
            <p className="text-xs text-red-500">{errors.tanggal_lahir}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Umur *</Label>
          <Input
            type="number"
            value={form.umur || ""}
            onChange={set("umur")}
            placeholder="25"
            error={!!errors.umur}
          />
          {errors.umur && <p className="text-xs text-red-500">{errors.umur}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Jenis Kelamin *</Label>
          <Select value={form.jenis_kelamin || ""} onValueChange={setSel("jenis_kelamin")}>
            <SelectTrigger error={!!errors.jenis_kelamin}>
              <SelectValue placeholder="Pilih..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Laki-laki">Laki-laki</SelectItem>
              <SelectItem value="Perempuan">Perempuan</SelectItem>
            </SelectContent>
          </Select>
          {errors.jenis_kelamin && (
            <p className="text-xs text-red-500">{errors.jenis_kelamin}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Status Pernikahan *</Label>
          <Select
            value={form.status_pernikahan || ""}
            onValueChange={setSel("status_pernikahan")}
          >
            <SelectTrigger error={!!errors.status_pernikahan}>
              <SelectValue placeholder="Pilih..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Menikah">Menikah</SelectItem>
              <SelectItem value="Belum Menikah">Belum Menikah</SelectItem>
            </SelectContent>
          </Select>
          {errors.status_pernikahan && (
            <p className="text-xs text-red-500">{errors.status_pernikahan}</p>
          )}
        </div>
        {form.status_pernikahan === "Menikah" && (
          <div className="space-y-1.5">
            <Label>Jumlah Anak</Label>
            <Input
              type="number"
              value={form.jumlah_anak || 0}
              onChange={set("jumlah_anak")}
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label className="required">Agama *</Label>
          <Select value={form.agama || ""} onValueChange={setSel("agama")}>
            <SelectTrigger error={!!errors.agama}>
              <SelectValue placeholder="Pilih..." />
            </SelectTrigger>
            <SelectContent>
              {["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu", "Lainnya"].map(
                (a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          {errors.agama && <p className="text-xs text-red-500">{errors.agama}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Tinggi Badan (cm) *</Label>
          <Input
            type="number"
            value={form.tinggi_badan || ""}
            onChange={set("tinggi_badan")}
            placeholder="165"
            error={!!errors.tinggi_badan}
          />
          {errors.tinggi_badan && (
            <p className="text-xs text-red-500">{errors.tinggi_badan}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Berat Badan (kg) *</Label>
          <Input
            type="number"
            value={form.berat_badan || ""}
            onChange={set("berat_badan")}
            placeholder="60"
            error={!!errors.berat_badan}
          />
          {errors.berat_badan && (
            <p className="text-xs text-red-500">{errors.berat_badan}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Golongan Darah *</Label>
          <Select
            value={form.golongan_darah || ""}
            onValueChange={setSel("golongan_darah")}
          >
            <SelectTrigger error={!!errors.golongan_darah}>
              <SelectValue placeholder="Pilih..." />
            </SelectTrigger>
            <SelectContent>
              {["A", "B", "AB", "O", "Tidak Tahu"].map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.golongan_darah && (
            <p className="text-xs text-red-500">{errors.golong_an_darah}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Tangan Dominan *</Label>
          <Select
            value={form.tangan_dominan || ""}
            onValueChange={setSel("tangan_dominan")}
          >
            <SelectTrigger error={!!errors.tangan_dominan}>
              <SelectValue placeholder="Pilih..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Kanan">Kanan</SelectItem>
              <SelectItem value="Kiri">Kiri</SelectItem>
            </SelectContent>
          </Select>
          {errors.tangan_dominan && (
            <p className="text-xs text-red-500">{errors.tangan_dominan}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Ukuran Baju *</Label>
          <Select value={form.ukuran_baju || ""} onValueChange={setSel("ukuran_baju")}>
            <SelectTrigger error={!!errors.ukuran_baju}>
              <SelectValue placeholder="Pilih..." />
            </SelectTrigger>
            <SelectContent>
              {["S", "M", "L", "XL", "XXL", "Lainnya"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.ukuran_baju && (
            <p className="text-xs text-red-500">{errors.ukuran_baju}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Lingkar Pinggang (cm)</Label>
          <Input
            type="number"
            value={form.lingkar_pinggang || ""}
            onChange={set("lingkar_pinggang")}
            placeholder="80"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Panjang Telapak Kaki (cm)</Label>
          <Input
            type="number"
            step="0.5"
            value={form.panjang_telapak_kaki || ""}
            onChange={set("panjang_telapak_kaki")}
            placeholder="25.5"
          />
        </div>
        <div className="space-y-1.5">
          <Label>SIM yang Dimiliki</Label>
          <Input
            value={form.sim_dimiliki || ""}
            onChange={set("sim_dimiliki")}
            placeholder="A, C"
          />
        </div>
      </div>
      <Separator className="my-2" />
      <p className="font-semibold text-sm">📍 KONTAK & ALAMAT</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="required">Nomor HP *</Label>
          <Input
            value={form.nomor_hp || ""}
            onChange={set("nomor_hp")}
            placeholder="08xx-xxxx-xxxx"
            error={!!errors.nomor_hp}
          />
          {errors.nomor_hp && (
            <p className="text-xs text-red-500">{errors.nomor_hp}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Email Kontak *</Label>
          <Input
            type="email"
            value={form.email_kontak || ""}
            onChange={set("email_kontak")}
            placeholder="email@..."
            error={!!errors.email_kontak}
          />
          {errors.email_kontak && (
            <p className="text-xs text-red-500">{errors.email_kontak}</p>
          )}
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label className="required">Alamat Lengkap *</Label>
          <Textarea
            value={form.alamat_lengkap || ""}
            onChange={set("alamat_lengkap")}
            placeholder="Jl. ..."
            rows={3}
            className={errors.alamat_lengkap ? "border-red-500" : ""}
          />
          {errors.alamat_lengkap && (
            <p className="text-xs text-red-500">{errors.alamat_lengkap}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">Nama Orang Tua / Wali *</Label>
          <Input
            value={form.kontak_ortu_nama || ""}
            onChange={set("kontak_ortu_nama")}
            placeholder="Nama"
            error={!!errors.kontak_ortu_nama}
          />
          {errors.kontak_ortu_nama && (
            <p className="text-xs text-red-500">{errors.kontak_ortu_nama}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="required">No. HP Orang Tua *</Label>
          <Input
            value={form.kontak_ortu_hp || ""}
            onChange={set("kontak_ortu_hp")}
            placeholder="08xx-xxxx-xxxx"
            error={!!errors.kontak_ortu_hp}
          />
          {errors.kontak_ortu_hp && (
            <p className="text-xs text-red-500">{errors.kontak_ortu_hp}</p>
          )}
        </div>
      </div>
    </div>
  );
}