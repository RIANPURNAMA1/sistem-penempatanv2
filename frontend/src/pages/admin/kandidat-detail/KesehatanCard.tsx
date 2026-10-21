import { Card, CardContent } from "@/components/ui/components";
import { InfoRow, SectionTitle } from "@/components/kandidat";
import { HeartPulse } from "lucide-react";
import HealthChip from "./HealthChip";
import SubHeading from "./SubHeading";

interface KesehatanCardProps {
  data: any;
}

export default function KesehatanCard({ data }: KesehatanCardProps) {
  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle
          icon={HeartPulse}
          title="Kondisi Fisik & Kesehatan"
          description="Ringkasan kesehatan dalam sekali lihat"
        />

        <div className="flex flex-wrap gap-2 mb-5">
          <HealthChip label="Vaksin" value={!!data.sudah_vaksin} />
          <HealthChip label="Berkacamata" value={!!data.berkacamata} />
          <HealthChip label="Lensa Kontak" value={!!data.lensa_kontak} />
          <HealthChip label="Buta Warna" value={!!data.buta_warna} />
          <HealthChip label="Bertato" value={!!data.bertato} />
          <HealthChip label="Merokok" value={!!data.merokok} />
          <HealthChip label="Minum Alkohol" value={!!data.minum_alkohol} />
        </div>

        <SubHeading>Riwayat Medis</SubHeading>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-3">
          <InfoRow
            label="Penglihatan"
            value={
              data.penglihatan_kanan || data.penglihatan_kiri
                ? `Kanan: ${data.penglihatan_kanan || "-"}, Kiri: ${data.penglihatan_kiri || "-"}`
                : "-"
            }
          />
          <InfoRow
            label="Kondisi Kesehatan"
            value={data.kondisi_kesehatan || "-"}
          />
          <InfoRow
            label="Riwayat Penyakit"
            value={data.riwayat_penyakit || "-"}
            multiline
          />
        </div>
      </CardContent>
    </Card>
  );
}
