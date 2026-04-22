import { Card, CardContent } from "@/components/ui/components";
import { InfoRow, SectionTitle } from "@/components/kandidat";
import { GraduationCap } from "lucide-react";

interface PendidikanCardProps {
  data: any;
}

export default function PendidikanCard({ data }: PendidikanCardProps) {
  if (!data.pendidikan?.length) return null;

  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle icon={GraduationCap} title="Riwayat Pendidikan" />

        <div className="space-y-4 mt-3">
          {data.pendidikan.map((p: any, i: number) => (
            <div key={i} className="border rounded-lg p-3">
              <InfoRow label="Jenjang" value={p.jenjang || "-"} />
              <InfoRow label="Nama Sekolah" value={p.nama_sekolah || "-"} />
              <InfoRow label="Jurusan" value={p.jurusan || "-"} />
              <InfoRow
                label="Periode"
                value={
                  p.tahun_masuk
                    ? `${p.bulan_masuk || ""} ${p.tahun_masuk} - ${p.bulan_lulus || ""} ${p.tahun_lulus || ""}`
                    : "-"
                }
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}