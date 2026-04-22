import { Card, CardContent } from "@/components/ui/components";
import { InfoRow, SectionTitle } from "@/components/kandidat";
import { Briefcase } from "lucide-react";

interface PengalamanCardProps {
  data: any;
}

export default function PengalamanCard({ data }: PengalamanCardProps) {
  const pengalaman = data.pengalaman || [];

  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle icon={Briefcase} title="Pengalaman Kerja" />

        {!pengalaman.length ? (
          <p className="text-sm text-muted-foreground mt-3">
            Belum ada pengalaman pekerjaan
          </p>
        ) : (
          <div className="space-y-4 mt-3">
            {pengalaman.map((p: any, i: number) => (
              <div key={i} className="border rounded-lg p-3">
                <InfoRow
                  label="Nama Perusahaan"
                  value={p.nama_perusahaan || "-"}
                />
                <InfoRow label="Posisi" value={p.posisi || "-"} />
                <InfoRow
                  label="Periode"
                  value={
                    p.tahun_masuk
                      ? `${p.bulan_masuk || ""} ${p.tahun_masuk} - ${
                          p.masih_bekerja
                            ? "Sekarang"
                            : `${p.bulan_keluar || ""} ${p.tahun_keluar || ""}`
                        }`
                      : "-"
                  }
                />
                <InfoRow
                  label="Deskripsi Pekerjaan"
                  value={p.deskripsi_pekerjaan || "-"}
                  multiline
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}