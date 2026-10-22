import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/components";
import {
  ArrowLeft,
  FileText,
  Save,
  CheckCircle,
  History,
  Mail,
  MapPin,
  FileSpreadsheet,
  Languages,
} from "lucide-react";

interface HeaderProps {
  data: any;
  navigate: any;
  stCfg: any;
  progresCfgItem: any;
  onShowCVPreview: () => void;
  onShowGenerateCV?: () => void;
  onShowEditModal: () => void;
  onShowVerifikasiModal: () => void;
  onShowProgresModal: () => void;
  onShowHistoryModal: () => void;
  onToggleBahasa?: () => void;
  bahasaTampil?: "id" | "ja";
}

export default function Header({
  data,
  navigate,
  stCfg,
  progresCfgItem,
  onShowCVPreview,
  onShowGenerateCV,
  onShowEditModal,
  onShowVerifikasiModal,
  onShowProgresModal,
  onShowHistoryModal,
  onToggleBahasa,
  bahasaTampil = "id",
}: HeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-start gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0 mt-0.5"
        >
          <ArrowLeft size={18} />
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight truncate">
              {data.nama_romaji || data.nama}
            </h1>
            {data.nama_katakana && (
              <span className="text-muted-foreground font-mono text-sm">
                {data.nama_katakana}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-1.5">
            <Badge variant={stCfg.variant as any}>{stCfg.label}</Badge>
            {data.status_progres && (
              <Badge variant={progresCfgItem.variant as any}>
                {progresCfgItem.label}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 flex-wrap mt-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <Mail size={13} className="shrink-0" />
              <span className="truncate">{data.email}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="shrink-0" />
              {data.nama_cabang}
            </span>
          </div>
        </div>
      </div>

      {/* Tombol aksi */}
      <div className="flex gap-2 flex-wrap mt-4">
        <Button variant="default" size="sm" onClick={onShowCVPreview}>
          <FileText size={14} className="mr-1" /> Lihat CV
        </Button>
        <Button variant="outline" size="sm" onClick={onShowGenerateCV}>
          <FileSpreadsheet size={14} className="mr-1" /> Generate CV
        </Button>
        {onToggleBahasa && (
          <Button variant="outline" size="sm" onClick={onToggleBahasa}>
            <Languages size={14} className="mr-1" />
            {bahasaTampil === "ja" ? "日本語" : "Indonesia"}
          </Button>
        )}
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
    </div>
  );
}
