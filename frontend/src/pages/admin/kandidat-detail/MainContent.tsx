import DataDiriCard from "./DataDiriCard";
import KesehatanCard from "./KesehatanCard";
import PendidikanCard from "./PendidikanCard";
import PengalamanCard from "./PengalamanCard";
import KeluargaCard from "./KeluargaCard";
import JepangCard from "./JepangCard";
import MotivasiCard from "./MotivasiCard";
import DokumenCard from "./DokumenCard";
import AksesAkunCard from "./AksesAkunCard";

interface MainContentProps {
  data: any;
  bool: (v: any) => string;
  formatDate: (d: string) => string;
  getFileUrl: (p: string) => string;
}

export default function MainContent({
  data,
  bool,
  formatDate,
  getFileUrl,
}: MainContentProps) {
  return (
    <div className="lg:col-span-2 space-y-4">
      <DataDiriCard
        data={data}
        formatDate={formatDate}
        getFileUrl={getFileUrl}
      />
      <KesehatanCard data={data} />
      <PendidikanCard data={data} />
      <PengalamanCard data={data} />
      <KeluargaCard data={data} />
      <JepangCard data={data} bool={bool} />
      <AksesAkunCard data={data} />
      <MotivasiCard data={data} bool={bool} />
      <DokumenCard data={data} getFileUrl={getFileUrl} />
    </div>
  );
}