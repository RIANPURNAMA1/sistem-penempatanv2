import { Card, CardContent, Badge } from "@/components/ui/components";
import { InfoRow, SectionTitle } from "@/components/kandidat";
import { GraduationCap } from "lucide-react";

interface PendidikanCardProps {
  data: any;
}

const jenjangShort = (j: string) => {
  if (!j) return "?";
  if (j.includes("Perguruan")) return "PT";
  if (j.includes("SMA") || j.includes("SMK")) return "SMA";
  if (j.includes("SMP")) return "SMP";
  if (j.includes("SD")) return "SD";
  return j.slice(0, 3).toUpperCase();
};

export default function PendidikanCard({ data }: PendidikanCardProps) {
  if (!data.pendidikan?.length) return null;

  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle
          icon={GraduationCap}
          title="Riwayat Pendidikan"
          description={`${data.pendidikan.length} jenjang tercatat`}
        />

        <div className="space-y-3">
          {data.pendidikan.map((p: any, i: number) => (
            <div key={i} className="flex gap-3 p-3 border rounded-xl bg-muted/20">
              <span className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                {jenjangShort(p.jenjang)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <p className="text-sm font-bold leading-tight">
                    {p.nama_sekolah || "-"}
                  </p>
                  {p.jenjang && <Badge variant="info">{p.jenjang}</Badge>}
                </div>
                <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
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
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
