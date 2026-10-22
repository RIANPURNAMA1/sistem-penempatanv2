import { Card, CardContent } from "@/components/ui/components";
import { InfoRow, SectionTitle } from "@/components/kandidat";
import { CONTOH_MOTIVASI } from "@/components/form-kandidat/constants";
import { Target } from "lucide-react";
import HealthChip from "./HealthChip";
import SubHeading from "./SubHeading";

interface MotivasiCardProps {
  data: any;
  bool: (v: any) => string;
}

const formatRp = (v: any) => {
  const n = Number(v);
  return v !== null && v !== undefined && v !== "" && !isNaN(n)
    ? `Rp ${n.toLocaleString("id-ID")}`
    : "-";
};

export default function MotivasiCard({ data, bool }: MotivasiCardProps) {
  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle
          icon={Target}
          title="Motivasi & Tujuan"
          description="Alasan, rencana, dan kesediaan kandidat"
        />

        <SubHeading>Tujuan & Motivasi</SubHeading>
        <p className="text-[11px] text-muted-foreground mb-2">
          Isian langkah Motivasi ditulis kandidat dalam <strong>bahasa Jepang
          (日本語)</strong>. Kolom kosong menampilkan contoh isi yang diharapkan.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-5">
          <InfoRow
            label="Tujuan ke Jepang"
            value={data.tujuan_ke_jepang || "-"}
            hint={CONTOH_MOTIVASI.tujuan_ke_jepang}
            multiline
          />
          <InfoRow
            label="Alasan ke Jepang"
            value={data.alasan_ke_jepang || "-"}
            hint={CONTOH_MOTIVASI.alasan_ke_jepang}
            multiline
          />
          <InfoRow
            label="Cita-cita Setelah dari Jepang"
            value={data.cita_cita_setelah_jepang || "-"}
            hint={CONTOH_MOTIVASI.cita_cita_setelah_jepang}
            multiline
          />
        </div>

        <SubHeading>Rencana Keuangan</SubHeading>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-5">
          <InfoRow
            label="Rencana Kirim Uang"
            value={formatRp(data.rencana_pengiriman_uang)}
          />
          <InfoRow label="Sumber Biaya" value={data.sumber_biaya || "-"} />
          <InfoRow
            label="Biaya Disiapkan"
            value={data.biaya_disiapkan || "-"}
          />
        </div>

        <SubHeading>Tentang Diri</SubHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-5">
          <InfoRow
            label="Kelebihan Diri"
            value={data.kelebihan_diri || "-"}
            hint={CONTOH_MOTIVASI.kelebihan_diri}
            multiline
          />
          <InfoRow
            label="Kekurangan Diri"
            value={data.kekurangan_diri || "-"}
            hint={CONTOH_MOTIVASI.kekurangan_diri}
            multiline
          />
          <InfoRow label="Hobi" value={data.hobi || "-"} />
          <InfoRow
            label="Keahlian"
            value={data.keahlian || "-"}
            hint={CONTOH_MOTIVASI.keahlian}
            multiline
          />
          <InfoRow
            label="Promosi Diri (自己PR)"
            value={data.promosi_diri || "-"}
            hint={CONTOH_MOTIVASI.promosi_diri}
            multiline
          />
          <InfoRow
            label="Catatan Tambahan (備考)"
            value={data.catatan_tambahan || "-"}
            hint={CONTOH_MOTIVASI.catatan_tambahan}
            multiline
          />
        </div>

        <SubHeading>Rencana & Kesediaan</SubHeading>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-4">
          <InfoRow
            label="Lama Tinggal di Jepang"
            value={data.lama_tinggal_jepang || "-"}
          />
          <InfoRow
            label="Lama Kerja Perusahaan"
            value={data.lama_kerja_perusahaan || "-"}
          />
          <InfoRow label="Rencana Pulang" value={data.rencana_pulang || "-"} />
        </div>
        <div className="flex flex-wrap gap-2">
          <HealthChip label="Bersedia Shift" value={!!data.bersedia_shift} />
          <HealthChip label="Bersedia Lembur" value={!!data.bersedia_lembur} />
          <HealthChip
            label="Bersedia Hari Libur"
            value={!!data.bersedia_hari_libur}
          />
        </div>
      </CardContent>
    </Card>
  );
}
