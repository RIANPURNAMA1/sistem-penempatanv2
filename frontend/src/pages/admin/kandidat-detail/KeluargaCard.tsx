import { Card, CardContent } from "@/components/ui/components";
import { InfoRow, SectionTitle } from "@/components/kandidat";
import { Users } from "lucide-react";
import SubHeading from "./SubHeading";

interface KeluargaCardProps {
  data: any;
}

const formatRp = (v: any) => {
  const n = Number(v);
  return v !== null && v !== undefined && v !== "" && !isNaN(n)
    ? `Rp ${n.toLocaleString("id-ID")}`
    : "-";
};

export default function KeluargaCard({ data }: KeluargaCardProps) {
  const keluarga = data.keluarga || [];

  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle
          icon={Users}
          title="Data Keluarga"
          description="Anggota keluarga & penghasilan"
        />

        <div className="mb-4">
          <InfoRow
            label="Penghasilan Keluarga / Bulan"
            value={formatRp(data.penghasilan_keluarga)}
          />
        </div>

        {!keluarga.length ? (
          <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-xl">
            Belum ada data keluarga
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {keluarga.map((k: any, i: number) => (
              <div key={i} className="border rounded-xl p-3.5 bg-muted/20">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {(k.nama || "?").slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-tight truncate">
                      {k.nama || "-"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {k.hubungan || "-"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <InfoRow
                    label="Usia"
                    value={k.usia ? `${k.usia} tahun` : "-"}
                  />
                  <InfoRow label="Pekerjaan" value={k.pekerjaan || "-"} />
                  <InfoRow
                    label="Penghasilan"
                    value={
                      k.penghasilan ? `${formatRp(k.penghasilan)} / bln` : "-"
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
