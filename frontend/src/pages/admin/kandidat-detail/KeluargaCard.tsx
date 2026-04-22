import { Card, CardContent } from "@/components/ui/components";
import { InfoRow, SectionTitle } from "@/components/kandidat";
import { Users } from "lucide-react";

interface KeluargaCardProps {
  data: any;
}

export default function KeluargaCard({ data }: KeluargaCardProps) {
  const keluarga = data.keluarga || [];

  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle icon={Users} title="Data Keluarga" />

        <div className="mt-3">
          <InfoRow
            label="Penghasilan Keluarga / Bulan"
            value={
              data.penghasilan_keluarga
                ? `Rp ${Number(data.penghasilan_keluarga).toLocaleString("id-ID")}`
                : "-"
            }
          />
        </div>

        {!keluarga.length ? (
          <p className="text-sm text-muted-foreground mt-3">
            Belum ada data keluarga
          </p>
        ) : (
          <div className="space-y-4 mt-3">
            {keluarga.map((k: any, i: number) => (
              <div key={i} className="border rounded-lg p-3">
                <InfoRow label="Hubungan" value={k.hubungan || "-"} />
                <InfoRow label="Nama" value={k.nama || "-"} />
                <InfoRow label="Usia" value={k.usia ? `${k.usia} tahun` : "-"} />
                <InfoRow label="Pekerjaan" value={k.pekerjaan || "-"} />
                <InfoRow
                  label="Penghasilan"
                  value={
                    k.penghasilan
                      ? `Rp ${Number(k.penghasilan).toLocaleString("id-ID")} / bulan`
                      : "-"
                  }
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}