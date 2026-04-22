import { Card, CardContent } from "@/components/ui/components";
import { InfoRow, SectionTitle } from "@/components/kandidat";
import { Globe } from "lucide-react";

interface JepangCardProps {
  data: any;
  bool: (v: any) => string;
}

export default function JepangCard({ data, bool }: JepangCardProps) {
  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle icon={Globe} title="Informasi Jepang & Kemampuan" />

        <div className="space-y-2 mt-3">
          <InfoRow label="Level JLPT" value={data.level_jlpt || "-"} />
          <InfoRow label="Level JFT" value={data.level_jft || "-"} />
          <InfoRow
            label="Lama Belajar Bahasa Jepang"
            value={data.lama_belajar_jepang || "-"}
          />
          <InfoRow
            label="Level Bahasa Jepang"
            value={data.level_bahasa_jepang || "-"}
          />
          <InfoRow
            label="Pernah ke Jepang"
            value={bool(data.pernah_ke_jepang)}
          />
          <InfoRow
            label="Keluarga di Jepang"
            value={bool(data.keluarga_di_jepang)}
          />
          <InfoRow
            label="Detail Keluarga di Jepang"
            value={
              data.keluarga_di_jepang
                ? `${data.hubungan_keluarga_jepang || "-"} (${data.status_kerabat_jepang || "-"})`
                : "-"
            }
          />
          <InfoRow
            label="Kontak Keluarga di Jepang"
            value={data.kontak_keluarga_jepang || "-"}
          />
          <InfoRow
            label="Kenalan di Jepang"
            value={bool(data.kenalan_di_jepang)}
          />
          <InfoRow
            label="Detail Kenalan Jepang"
            value={data.kenalan_jepang_detail || "-"}
          />
          <InfoRow label="Bidang SSW" value={data.sertifikat_ssw || "-"} />
        </div>
      </CardContent>
    </Card>
  );
}