import { Card, CardContent } from "@/components/ui/components";
import { InfoRow, SectionTitle } from "@/components/kandidat";
import { Target } from "lucide-react";

interface MotivasiCardProps {
  data: any;
  bool: (v: any) => string;
}

export default function MotivasiCard({ data, bool }: MotivasiCardProps) {
  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle icon={Target} title="Motivasi & Tujuan" />

        <div className="space-y-2 mt-3">
          <InfoRow
            label="Tujuan ke Jepang"
            value={data.tujuan_ke_jepang || "-"}
            multiline
          />
          <InfoRow
            label="Alasan ke Jepang"
            value={data.alasan_ke_jepang || "-"}
            multiline
          />
          <InfoRow
            label="Cita-rata Setelah Jepang"
            value={data.cita_cita_setelah_jepang || "-"}
            multiline
          />
          <InfoRow
            label="Rencana Kirim Uang"
            value={
              data.rencana_pengiriman_uang
                ? `Rp ${Number(data.rencana_pengiriman_uang).toLocaleString("id-ID")}`
                : "-"
            }
          />
          <InfoRow
            label="Kelebihan Diri"
            value={data.kelebihan_diri || "-"}
            multiline
          />
          <InfoRow
            label="Kekurangan Diri"
            value={data.kekurangan_diri || "-"}
            multiline
          />
          <InfoRow label="Hobi" value={data.hobi || "-"} />
          <InfoRow label="Keahlian" value={data.keahlian || "-"} />
          <InfoRow
            label="Lama Tinggal di Jepang"
            value={data.lama_tinggal_jepang || "-"}
          />
          <InfoRow
            label="Lama Kerja Perusahaan"
            value={data.lama_kerja_perusahaan || "-"}
          />
          <InfoRow label="Rencana Pulang" value={data.rencana_pulang || "-"} />
          <InfoRow label="Sumber Biaya" value={data.sumber_biaya || "-"} />
          <InfoRow
            label="Biaya Disiapkan"
            value={data.biaya_disiapkan || "-"}
          />
          <InfoRow label="Bersedia Shift" value={bool(data.bersedia_shift)} />
          <InfoRow label="Bersedia Lembur" value={bool(data.bersedia_lembur)} />
          <InfoRow
            label="Bersedia Hari Libur"
            value={bool(data.bersedia_hari_libur)}
          />
        </div>
      </CardContent>
    </Card>
  );
}