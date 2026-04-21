import { Card, CardContent } from "@/components/ui/components";
import { Badge } from "@/components/ui/components";
import { formatDate } from "@/lib/utils";

interface StatusCardProps {
  statusFormulir: string;
  statusFormulirLabel: string;
  statusFormulirVariant: string;
  statusProgres?: string;
  statusProgresLabel?: string;
  statusProgresVariant?: string;
  namaPerusahaan?: string;
  bidangSsw?: string;
  jadwalInterview?: string;
  catatanAdmin?: string;
  catatanProgres?: string;
  updatedAt?: string;
}

export default function StatusCard({
  statusFormulir,
  statusFormulirLabel,
  statusFormulirVariant,
  statusProgres,
  statusProgresLabel,
  statusProgresVariant,
  namaPerusahaan,
  bidangSsw,
  jadwalInterview,
  catatanAdmin,
  catatanProgres,
  updatedAt,
}: StatusCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Status Formulir</p>
          <Badge variant={statusFormulirVariant as any}>{statusFormulirLabel}</Badge>
        </div>
        {statusProgres && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1.5">Status Progres</p>
            <Badge variant={statusProgresVariant as any}>{statusProgresLabel}</Badge>
          </div>
        )}
        {namaPerusahaan && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Perusahaan</p>
            <p className="text-sm font-medium">{namaPerusahaan}</p>
            {bidangSsw && <p className="text-xs text-muted-foreground">{bidangSsw}</p>}
          </div>
        )}
        {jadwalInterview && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Jadwal Interview</p>
            <p className="text-sm font-medium">{formatDate(jadwalInterview)}</p>
          </div>
        )}
        {catatanAdmin && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Catatan Admin</p>
            <p className="text-sm leading-relaxed">{catatanAdmin}</p>
          </div>
        )}
        {catatanProgres && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Catatan Progres</p>
            <p className="text-sm leading-relaxed">{catatanProgres}</p>
          </div>
        )}
        {updatedAt && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Diperbarui</p>
            <p className="text-xs font-medium">{formatDate(updatedAt)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
