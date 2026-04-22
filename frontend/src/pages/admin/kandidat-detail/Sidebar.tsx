import { StatusCard, ProgresTracker } from "@/components/kandidat";
import DokumenRingkasanCard from "./DokumenRingkasanCard";

interface SidebarProps {
  data: any;
  stCfg: any;
  progresCfgItem: any;
}

export default function Sidebar({ data, stCfg, progresCfgItem }: SidebarProps) {
  return (
    <div className="space-y-4">
      <StatusCard
        statusFormulir={data.status_formulir}
        statusFormulirLabel={stCfg.label}
        statusFormulirVariant={stCfg.variant}
        statusProgres={data.status_progres}
        statusProgresLabel={progresCfgItem.label}
        statusProgresVariant={progresCfgItem.variant}
        namaPerusahaan={data.nama_perusahaan}
        bidangSsw={data.bidang_ssw}
        jadwalInterview={data.jadwal_interview}
        catatanAdmin={data.catatan_admin}
        catatanProgres={data.catatan_progres}
        updatedAt={data.updated_at}
      />
      <ProgresTracker statusProgres={data.status_progres} />
      {data.dokumen?.length > 0 && <DokumenRingkasanCard data={data} />}
    </div>
  );
}