import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/useToast";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  generateCVPDF,
  generateCVExcel,
  generateCVWord,
} from "@/lib/cvGenerator";
import KandidatCVPreview from "@/components/KandidatCVPreview";
import HistoryModal from "@/components/HistoryModal";
import EditKandidatModal from "@/components/admin/EditKandidatModal";
import {
  VerifikasiModal,
  ProgresModal,
} from "@/components/kandidat";
import {
  Header,
  MainContent,
  Sidebar,
} from "./kandidat-detail";
import ProgresDetailCard from "@/components/kandidat/ProgresDetailCard";

const getFileUrl = (pathFile: string | null | undefined): string => {
  if (!pathFile) return "";

  const normalized = pathFile.replace(/\\/g, "/").replace(/^\.\//, "");

  // Full URL already
  if (normalized.match(/^https?:\/\//)) return normalized;

  // Already absolute path
  if (normalized.startsWith("/")) return normalized;

  // Explicit uploads/ prefix
  if (normalized.startsWith("uploads/")) return `/${normalized}`;

  // Old data: first segment contains a dot (domain-like folder name)
  // e.g. "matchingjob.mendunia.id/dokumen/foto/file.jpg"
  const firstSegment = normalized.split("/")[0];
  if (firstSegment && firstSegment.includes(".")) return `/${normalized}`;

  // New data: stored in uploads/ directory
  return `/uploads/${normalized}`;
};

const statusFormulirConfig: Record<string, { label: string; variant: string }> =
  {
    draft: { label: "Draft", variant: "secondary" },
    submitted: { label: "Terkirim", variant: "info" },
    reviewed: { label: "Direview", variant: "warning" },
    approved: { label: "Disetujui", variant: "success" },
    rejected: { label: "Ditolak", variant: "destructive" },
  };

const progresConfig: Record<string, { label: string; variant: string }> = {
  "Job Matching": { label: "Job Matching", variant: "warning" },
  Pending: { label: "Pending", variant: "secondary" },
  "lamar ke perusahaan": { label: "Lamar ke Perusahaan", variant: "info" },
  Interview: { label: "Interview", variant: "warning" },
  "Jadwalkan Interview Ulang": {
    label: "Jadwalkan Interview Ulang",
    variant: "outline",
  },
  "Lulus interview": { label: "Lulus Interview", variant: "success" },
  "Gagal Interview": { label: "Gagal Interview", variant: "destructive" },
  Pemberkasan: { label: "Pemberkasan", variant: "info" },
  Berangkat: { label: "Berangkat", variant: "success" },
  Ditolak: { label: "Ditolak", variant: "destructive" },
};

interface FormProgres {
  status_progres: string;
  nama_perusahaan: string;
  institusi: string;
  bidang_ssw: string;
  detail_pekerjaan: string;
  jadwal_interview: string;
  catatan_interview: string;
  tgl_setsumeikai: string;
  tgl_mensetsu_1: string;
  tgl_mensetsu_2: string;
  catatan_mensetsu: string;
  biaya_pemberkasan: string;
  adm_tahap_1: string;
  adm_tahap_2: string;
  dokumen_dikirim: string;
  terbit_kontrak: string;
  kontrak_dikirim_tsk: string;
  terbit_paspor: string;
  masuk_imigrasi: string;
  coe_terbit: string;
  ektkln_pembuatan: string;
  dokumen_dikirim_2: string;
  visa: string;
  jadwal_penerbangan: string;
}

const initialFormProgres: FormProgres = {
  status_progres: "",
  nama_perusahaan: "",
  institusi: "",
  bidang_ssw: "",
  detail_pekerjaan: "",
  jadwal_interview: "",
  catatan_interview: "",
  tgl_setsumeikai: "",
  tgl_mensetsu_1: "",
  tgl_mensetsu_2: "",
  catatan_mensetsu: "",
  biaya_pemberkasan: "",
  adm_tahap_1: "",
  adm_tahap_2: "",
  dokumen_dikirim: "",
  terbit_kontrak: "",
  kontrak_dikirim_tsk: "",
  terbit_paspor: "",
  masuk_imigrasi: "",
  coe_terbit: "",
  ektkln_pembuatan: "",
  dokumen_dikirim_2: "",
  visa: "",
  jadwal_penerbangan: "",
};

export default function KandidatDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [newStatus, setNewStatus] = useState("");
  const [catatanAdmin, setCatatanAdmin] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showVerifikasiModal, setShowVerifikasiModal] = useState(false);

  const [updatingProgres, setUpdatingProgres] = useState(false);
  const [showProgresModal, setShowProgresModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showCVPreview, setShowCVPreview] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [perusahaanList, setPerusahaanList] = useState<{ id: number; nama_perusahaan: string }[]>([]);

  const [formProgres, setFormProgres] =
    useState<FormProgres>(initialFormProgres);

  const handleDownloadCV = async (format: "pdf" | "excel" | "word") => {
    setDownloading(true);
    try {
      if (format === "pdf") await generateCVPDF(data);
      else if (format === "excel") await generateCVExcel(data);
      else if (format === "word") await generateCVWord(data);
      toast({ title: "CV berhasil didownload", variant: "success" as any });
    } catch {
      toast({ title: "Gagal download CV", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    api
      .get(`/kandidat/${id}`)
      .then((r) => {
        const d = r.data.data;
        setData(d);
        setNewStatus(d.status_formulir);
        setCatatanAdmin(d.catatan_admin || "");
        setFormProgres({
          status_progres: d.status_progres || "",
          nama_perusahaan: d.nama_perusahaan || "",
          institusi: d.institusi || "",
          bidang_ssw: d.bidang_ssw || "",
          detail_pekerjaan: d.detail_pekerjaan || "",
          jadwal_interview: d.jadwal_interview || "",
          catatan_interview: d.catatan_interview || "",
          tgl_setsumeikai: d.tgl_setsumeikai || "",
          tgl_mensetsu_1: d.tgl_mensetsu_1 || "",
          tgl_mensetsu_2: d.tgl_mensetsu_2 || "",
          catatan_mensetsu: d.catatan_mensetsu || "",
          biaya_pemberkasan: d.biaya_pemberkasan || "",
          adm_tahap_1: d.adm_tahap_1 || "",
          adm_tahap_2: d.adm_tahap_2 || "",
          dokumen_dikirim: d.dokumen_dikirim || "",
          terbit_kontrak: d.terbit_kontrak || "",
          kontrak_dikirim_tsk: d.kontrak_dikirim_tsk || "",
          terbit_paspor: d.terbit_paspor || "",
          masuk_imigrasi: d.masuk_imigrasi || "",
          coe_terbit: d.coe_terbit || "",
          ektkln_pembuatan: d.ektkln_pembuatan || "",
          dokumen_dikirim_2: d.dokumen_dikirim_2 || "",
          visa: d.visa || "",
          jadwal_penerbangan: d.jadwal_penerbangan || "",
        });
      })
      .finally(() => setLoading(false));

    api
      .get("/perusahaan")
      .then((r) => setPerusahaanList(r.data.data || []))
      .catch(() => setPerusahaanList([]));
  }, [id]);

  const handleUpdateStatus = async () => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/kandidat/${id}/status`, {
        status_formulir: newStatus,
        catatan_admin: catatanAdmin,
      });
      toast({ title: "Status berhasil diupdate", variant: "success" as any });
      setData((p: any) => ({
        ...p,
        status_formulir: newStatus,
        catatan_admin: catatanAdmin,
      }));
      setShowVerifikasiModal(false);
    } catch {
      toast({ title: "Gagal update status", variant: "destructive" });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateProgres = async () => {
    setUpdatingProgres(true);
    try {
      await api.patch(`/kandidat/${id}/progres-lengkap`, formProgres);
      toast({
        title: "Data progres berhasil disimpan",
        variant: "success" as any,
      });
      setData((p: any) => ({ ...p, ...formProgres }));
      setShowProgresModal(false);
    } catch {
      toast({ title: "Gagal menyimpan progres", variant: "destructive" });
    } finally {
      setUpdatingProgres(false);
    }
  };

  const updateFormProgres = (key: string, value: string) => {
    setFormProgres((prev) => ({ ...prev, [key]: value }));
  };

  const bool = (v: any) => (v ? "Ya" : "Tidak");

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-muted-foreground" size={28} />
      </div>
    );
  if (!data)
    return (
      <div className="page-container">
        <p>Data tidak ditemukan</p>
      </div>
    );

  const stCfg = statusFormulirConfig[data.status_formulir] || {
    label: data.status_formulir,
    variant: "secondary",
  };
  const progresCfgItem = progresConfig[data.status_progres] || {
    label: data.status_progres || "Job Matching",
    variant: "secondary",
  };

  return (
    <div className="page-container max-w-5xl">
      <Header
        data={data}
        navigate={navigate}
        stCfg={stCfg}
        progresCfgItem={progresCfgItem}
        onShowCVPreview={() => setShowCVPreview(true)}
        onShowEditModal={() => setShowEditModal(true)}
        onShowVerifikasiModal={() => setShowVerifikasiModal(true)}
        onShowProgresModal={() => setShowProgresModal(true)}
        onShowHistoryModal={() => setShowHistoryModal(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MainContent
          data={data}
          bool={bool}
          formatDate={formatDate}
          getFileUrl={getFileUrl}
        />

        <Sidebar data={data} stCfg={stCfg} progresCfgItem={progresCfgItem} />
      </div>

      <div className="mt-6">
        <ProgresDetailCard data={data} />
      </div>

      <VerifikasiModal
        open={showVerifikasiModal}
        onOpenChange={setShowVerifikasiModal}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        catatanAdmin={catatanAdmin}
        setCatatanAdmin={setCatatanAdmin}
        onSave={handleUpdateStatus}
        loading={updatingStatus}
      />

      <ProgresModal
        open={showProgresModal}
        onOpenChange={setShowProgresModal}
        formProgres={formProgres}
        updateFormProgres={updateFormProgres}
        onSave={handleUpdateProgres}
        loading={updatingProgres}
        sertifikatSsw={data.sertifikat_ssw}
        perusahaanList={perusahaanList}
      />

      {showCVPreview && (
        <KandidatCVPreview
          data={data}
          onClose={() => setShowCVPreview(false)}
        />
      )}

      <HistoryModal
        open={showHistoryModal}
        onOpenChange={setShowHistoryModal}
        kandidatId={Number(id)}
        kandidatName={data?.nama || ""}
      />

      <EditKandidatModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        kandidatId={Number(id)}
        onSuccess={() => {
          api.get(`/kandidat/${id}`).then((r) => setData(r.data.data));
        }}
      />
    </div>
  );
}
