import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/components";
import { Loader2, Save } from "lucide-react";

interface FormProgres {
  status_progres: string;
  nama_perusahaan: string;
  institusi: string;
  bidang_ssw: string;
  detail_pekerjaan: string;
  jadwal_interview: string;
  catatan_interview: string;
  tgl_setsumeikai: string;
  tgl_mensetsu_1: string;
  tgl_mensetsu_2: string;
  catatan_mensetsu: string;
  biaya_pemberkasan: string;
  adm_tahap_1: string;
  adm_tahap_2: string;
  dokumen_dikirim: string;
  terbit_kontrak: string;
  kontrak_dikirim_tsk: string;
  terbit_paspor: string;
  masuk_imigrasi: string;
  coe_terbit: string;
  ektkln_pembuatan: string;
  dokumen_dikirim_2: string;
  visa: string;
  jadwal_penerbangan: string;
}

interface ProgresModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formProgres: FormProgres;
  updateFormProgres: (key: string, value: string) => void;
  onSave: () => void;
  loading: boolean;
  sertifikatSsw?: string;
  perusahaanList?: { id: number; nama_perusahaan: string }[];
}

export default function ProgresModal({
  open,
  onOpenChange,
  formProgres,
  updateFormProgres,
  onSave,
  loading,
  sertifikatSsw,
  perusahaanList = [],
}: ProgresModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Progres Kandidat</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-1.5">
            <Label>Status Kandidat</Label>
            <Select
              value={formProgres.status_progres}
              onValueChange={(v) => updateFormProgres("status_progres", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Job Matching">Job Matching</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="lamar ke perusahaan">Lamar ke Perusahaan</SelectItem>
                <SelectItem value="Interview">Interview</SelectItem>
                <SelectItem value="Jadwalkan Interview Ulang">Jadwalkan Interview Ulang</SelectItem>
                <SelectItem value="Lulus interview">Lulus Interview</SelectItem>
                <SelectItem value="Gagal Interview">Gagal Interview</SelectItem>
                <SelectItem value="Pemberkasan">Pemberkasan</SelectItem>
                <SelectItem value="Berangkat">Berangkat</SelectItem>
                <SelectItem value="Ditolak">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">JOB / PERUSAHAAN</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">P.Penempatan</Label>
                {perusahaanList.length > 0 ? (
                  <Select
                    value={formProgres.nama_perusahaan}
                    onValueChange={(v) => updateFormProgres("nama_perusahaan", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih perusahaan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {perusahaanList.map((p: { id: number; nama_perusahaan: string }) => (
                        <SelectItem key={p.id} value={p.nama_perusahaan}>
                          {p.nama_perusahaan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={formProgres.nama_perusahaan}
                    onChange={(e) => updateFormProgres("nama_perusahaan", e.target.value)}
                    placeholder="Nama perusahaan..."
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Institusi/Perusahaan</Label>
                <Input
                  value={formProgres.institusi}
                  onChange={(e) => updateFormProgres("institusi", e.target.value)}
                  placeholder="Ketik nama institusi..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Bidang SSW</Label>
                {sertifikatSsw ? (
                  <Select
                    value={formProgres.bidang_ssw}
                    onValueChange={(v) => updateFormProgres("bidang_ssw", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bidang SSW..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sertifikatSsw.split(",").map((s: string, i: number) => (
                        <SelectItem key={i} value={s.trim()}>
                          {s.trim()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={formProgres.bidang_ssw}
                    onChange={(e) => updateFormProgres("bidang_ssw", e.target.value)}
                    placeholder="Bidang SSW..."
                  />
                )}
              </div>
            </div>
            <div className="space-y-1.5 mt-3">
              <Label className="text-xs">Detail Pekerjaan</Label>
              <Textarea
                value={formProgres.detail_pekerjaan}
                onChange={(e) => updateFormProgres("detail_pekerjaan", e.target.value)}
                placeholder="Detail pekerjaan..."
                rows={2}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">JADWAL INTERVIEW</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Jadwal Interview</Label>
                <Input
                  type="date"
                  value={formProgres.jadwal_interview}
                  onChange={(e) => updateFormProgres("jadwal_interview", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5 mt-3">
              <Label className="text-xs">Catatan Interview</Label>
              <Textarea
                value={formProgres.catatan_interview}
                onChange={(e) => updateFormProgres("catatan_interview", e.target.value)}
                placeholder="Catatan interview..."
                rows={2}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">DATA INTERVIEW & MENSETSU</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">TGL Setsumeikai</Label>
                <Input
                  type="date"
                  value={formProgres.tgl_setsumeikai}
                  onChange={(e) => updateFormProgres("tgl_setsumeikai", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">TGL Mensetsu 1</Label>
                <Input
                  type="date"
                  value={formProgres.tgl_mensetsu_1}
                  onChange={(e) => updateFormProgres("tgl_mensetsu_1", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">TGL Mensetsu 2</Label>
                <Input
                  type="date"
                  value={formProgres.tgl_mensetsu_2}
                  onChange={(e) => updateFormProgres("tgl_mensetsu_2", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5 mt-3">
              <Label className="text-xs">Catatan Mensetsu</Label>
              <Textarea
                value={formProgres.catatan_mensetsu}
                onChange={(e) => updateFormProgres("catatan_mensetsu", e.target.value)}
                placeholder="Catatan mensetsu..."
                rows={2}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">BIAYA & ADMINISTRASI</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Biaya Pemberkasan</Label>
                <Input
                  value={formProgres.biaya_pemberkasan}
                  onChange={(e) => updateFormProgres("biaya_pemberkasan", e.target.value)}
                  placeholder="Rp..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">ADM Tahap 1</Label>
                <Input
                  value={formProgres.adm_tahap_1}
                  onChange={(e) => updateFormProgres("adm_tahap_1", e.target.value)}
                  placeholder="Rp..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">ADM Tahap 2</Label>
                <Input
                  value={formProgres.adm_tahap_2}
                  onChange={(e) => updateFormProgres("adm_tahap_2", e.target.value)}
                  placeholder="Rp..."
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">TRACKING DOKUMEN & PROSES</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Dok. Dikirim</Label>
                <Input
                  type="date"
                  value={formProgres.dokumen_dikirim}
                  onChange={(e) => updateFormProgres("dokumen_dikirim", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Terbit Kontrak</Label>
                <Input
                  type="date"
                  value={formProgres.terbit_kontrak}
                  onChange={(e) => updateFormProgres("terbit_kontrak", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Kontrak ke TSK</Label>
                <Input
                  type="date"
                  value={formProgres.kontrak_dikirim_tsk}
                  onChange={(e) => updateFormProgres("kontrak_dikirim_tsk", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Terbit Paspor</Label>
                <Input
                  type="date"
                  value={formProgres.terbit_paspor}
                  onChange={(e) => updateFormProgres("terbit_paspor", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Masuk Imigrasi</Label>
                <Input
                  type="date"
                  value={formProgres.masuk_imigrasi}
                  onChange={(e) => updateFormProgres("masuk_imigrasi", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">COE Terbit</Label>
                <Input
                  type="date"
                  value={formProgres.coe_terbit}
                  onChange={(e) => updateFormProgres("coe_terbit", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">E-KTKLN</Label>
                <Input
                  type="date"
                  value={formProgres.ektkln_pembuatan}
                  onChange={(e) => updateFormProgres("ektkln_pembuatan", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Dok. Dikirim 2</Label>
                <Input
                  type="date"
                  value={formProgres.dokumen_dikirim_2}
                  onChange={(e) => updateFormProgres("dokumen_dikirim_2", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Visa</Label>
                <Input
                  type="date"
                  value={formProgres.visa}
                  onChange={(e) => updateFormProgres("visa", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Jadwal Penerbangan</Label>
                <Input
                  type="date"
                  value={formProgres.jadwal_penerbangan}
                  onChange={(e) => updateFormProgres("jadwal_penerbangan", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={onSave} disabled={loading}>
            {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
            <Save size={14} className="mr-2" />
            Simpan Progres
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
