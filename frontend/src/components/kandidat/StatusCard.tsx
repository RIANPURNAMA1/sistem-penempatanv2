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
  statusFormulirLabel,
  statusFormulirVariant,
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
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">Status Formulir</span>
          <Badge variant={statusFormulirVariant as any}>
            {statusFormulirLabel}
          </Badge>
        </div>
        {statusProgresLabel && (
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Status Progres</span>
            <Badge variant={statusProgresVariant as any}>
              {statusProgresLabel}
            </Badge>
          </div>
        )}
        {namaPerusahaan && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Perusahaan</p>
            <p className="text-sm font-semibold">{namaPerusahaan}</p>
            {bidangSsw && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {bidangSsw}
              </p>
            )}
          </div>
        )}
        {jadwalInterview && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">
              Jadwal Interview
            </p>
            <p className="text-sm font-semibold">{formatDate(jadwalInterview)}</p>
          </div>
        )}
        {catatanAdmin && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Catatan Admin</p>
            <p className="text-sm leading-relaxed bg-sky-50 border border-sky-100 rounded-lg px-3 py-2">
              {catatanAdmin}
            </p>
          </div>
        )}
        {catatanProgres && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">
              Catatan Progres
            </p>
            <p className="text-sm leading-relaxed bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              {catatanProgres}
            </p>
          </div>
        )}
        {updatedAt && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-0.5">Diperbarui</p>
            <p className="text-xs font-medium">{formatDate(updatedAt)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
