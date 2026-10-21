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
        <SectionTitle
          icon={Briefcase}
          title="Pengalaman Kerja"
          description={
            pengalaman.length
              ? `${pengalaman.length} pengalaman tercatat`
              : "Belum ada pengalaman pekerjaan"
          }
        />

        {!pengalaman.length ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Briefcase size={28} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Belum ada pengalaman pekerjaan
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pengalaman.map((p: any, i: number) => (
              <div key={i} className="flex gap-3 p-3 border rounded-xl bg-muted/20">
                <span className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Briefcase size={15} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold leading-tight mb-0.5">
                    {p.nama_perusahaan || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {p.posisi || "-"}
                  </p>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
