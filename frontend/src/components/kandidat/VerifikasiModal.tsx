import { Button } from "@/components/ui/button";
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
import { Loader2 } from "lucide-react";

const statusFormulirConfig: Record<string, { label: string; variant: string }> = {
  draft: { label: "Draft", variant: "secondary" },
  submitted: { label: "Terkirim", variant: "info" },
  reviewed: { label: "Direview", variant: "warning" },
  approved: { label: "Disetujui", variant: "success" },
  rejected: { label: "Ditolak", variant: "destructive" },
};

interface VerifikasiModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newStatus: string;
  setNewStatus: (status: string) => void;
  catatanAdmin: string;
  setCatatanAdmin: (catatan: string) => void;
  onSave: () => void;
  loading: boolean;
}

export default function VerifikasiModal({
  open,
  onOpenChange,
  newStatus,
  setNewStatus,
  catatanAdmin,
  setCatatanAdmin,
  onSave,
  loading,
}: VerifikasiModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Verifikasi Kandidat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Status Formulir</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusFormulirConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Catatan Admin</Label>
            <Textarea
              value={catatanAdmin}
              onChange={(e) => setCatatanAdmin(e.target.value)}
              placeholder="Tambahkan catatan..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={onSave} disabled={loading}>
            {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
            Simpan Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
