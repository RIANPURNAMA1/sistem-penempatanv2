import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/components";
import {
  ArrowLeft,
  FileText,
  Save,
  CheckCircle,
  History,
} from "lucide-react";

interface HeaderProps {
  data: any;
  navigate: any;
  stCfg: any;
  progresCfgItem: any;
  onShowCVPreview: () => void;
  onShowEditModal: () => void;
  onShowVerifikasiModal: () => void;
  onShowProgresModal: () => void;
  onShowHistoryModal: () => void;
}

export default function Header({
  data,
  navigate,
  stCfg,
  progresCfgItem,
  onShowCVPreview,
  onShowEditModal,
  onShowVerifikasiModal,
  onShowProgresModal,
  onShowHistoryModal,
}: HeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
      </Button>
      <div className="flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold">
            {data.nama_romaji || data.nama}
          </h1>
          {data.nama_katakana && (
            <span className="text-muted-foreground font-mono text-sm">
              {data.nama_katakana}
            </span>
          )}
          <Badge variant={stCfg.variant as any}>{stCfg.label}</Badge>
          {data.status_progres && (
            <Badge variant={progresCfgItem.variant as any}>
              {progresCfgItem.label}
            </Badge>
          )}
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          <Button variant="default" size="sm" onClick={onShowCVPreview}>
            <FileText size={14} className="mr-1" /> Lihat CV
          </Button>
          <Button variant="outline" size="sm" onClick={onShowEditModal}>
            <Save size={14} className="mr-1" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onShowVerifikasiModal}>
            <CheckCircle size={14} className="mr-1" /> Verifikasi
          </Button>
          <Button variant="outline" size="sm" onClick={onShowProgresModal}>
            <Save size={14} className="mr-1" /> Progres
          </Button>
          <Button variant="outline" size="sm" onClick={onShowHistoryModal}>
            <History size={14} className="mr-1" /> Riwayat
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          {data.email} • {data.nama_cabang}
        </p>
      </div>
    </div>
  );
}
