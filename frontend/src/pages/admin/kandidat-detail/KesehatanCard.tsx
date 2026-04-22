import { Card, CardContent } from "@/components/ui/components";
import { InfoRow, SectionTitle } from "@/components/kandidat";
import { User } from "lucide-react";

interface KesehatanCardProps {
  data: any;
}

export default function KesehatanCard({ data }: KesehatanCardProps) {
  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle icon={User} title="Kondisi Fisik & Kesehatan" />

        <div className="space-y-2 mt-3">
          <InfoRow label="Vaksin" value={data.sudah_vaksin ? "Ya" : "Tidak"} />

          <InfoRow
            label="Penglihatan"
            value={
              data.penglihatan_kanan || data.penglihatan_kiri
                ? `Kanan: ${data.penglihatan_kanan || "-"}, Kiri: ${data.penglihatan_kiri || "-"}`
                : "-"
            }
          />

          <InfoRow
            label="Berkacamata"
            value={data.berkacamata ? "Ya" : "Tidak"}
          />

          <InfoRow
            label="Lensa Kontak"
            value={data.lensa_kontak ? "Ya" : "Tidak"}
          />

          <InfoRow
            label="Buta Warna"
            value={data.buta_warna ? "Ya" : "Tidak"}
          />

          <InfoRow
            label="Kondisi Kesehatan"
            value={data.kondisi_kesehatan || "-"}
          />

          <InfoRow
            label="Riwayat Penyakit"
            value={data.riwayat_penyakit || "-"}
          />

          <InfoRow label="Bertato" value={data.bertato ? "Ya" : "Tidak"} />
          <InfoRow label="Merokok" value={data.merokok ? "Ya" : "Tidak"} />
          <InfoRow
            label="Minum Alkohol"
            value={data.minum_alkohol ? "Ya" : "Tidak"}
          />
        </div>
      </CardContent>
    </Card>
  );
}