import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/components";
import { Badge } from "@/components/ui/components";
import { toast } from "@/hooks/useToast";
import api from "@/lib/api";
import {
  ArrowLeft,
  FileText,
  User,
  GraduationCap,
  Briefcase,
  Users,
  Globe,
  Target,
  Upload,
  Loader2,
  Save,
  CheckCircle,
  History,
} from "lucide-react";
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
  InfoRow,
  SectionTitle,
  VerifikasiModal,
  ProgresModal,
  StatusCard,
  ProgresTracker,
} from "@/components/kandidat";

const getFileUrl = (pathFile: string | null | undefined): string => {
  if (!pathFile) return "";
  const cleaned = pathFile
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^uploads\//, "");
  return `/uploads/${cleaned}`;
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

function Header({
  data,
  navigate,
  stCfg,
  progresCfgItem,
  onShowCVPreview,
  onShowEditModal,
  onShowVerifikasiModal,
  onShowProgresModal,
  onShowHistoryModal,
}: {
  data: any;
  navigate: any;
  stCfg: any;
  progresCfgItem: any;
  onShowCVPreview: () => void;
  onShowEditModal: () => void;
  onShowVerifikasiModal: () => void;
  onShowProgresModal: () => void;
  onShowHistoryModal: () => void;
}) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
      </Button>
      <div className="flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold">
            {data.nama_romaji || data.nama}
          </h1>
          {data.nama_katakana && (
            <span className="text-muted-foreground font-mono text-sm">
              {data.nama_katakana}
            </span>
          )}
          <Badge variant={stCfg.variant as any}>{stCfg.label}</Badge>
          {data.status_progres && (
            <Badge variant={progresCfgItem.variant as any}>
              {progresCfgItem.label}
            </Badge>
          )}
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          <Button variant="default" size="sm" onClick={onShowCVPreview}>
            <FileText size={14} className="mr-1" /> Lihat CV
          </Button>
          <Button variant="outline" size="sm" onClick={onShowEditModal}>
            <Save size={14} className="mr-1" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onShowVerifikasiModal}>
            <CheckCircle size={14} className="mr-1" /> Verifikasi
          </Button>
          <Button variant="outline" size="sm" onClick={onShowProgresModal}>
            <Save size={14} className="mr-1" /> Progres
          </Button>
          <Button variant="outline" size="sm" onClick={onShowHistoryModal}>
            <History size={14} className="mr-1" /> Riwayat
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          {data.email} • {data.nama_cabang}
        </p>
      </div>
    </div>
  );
}

function MainContent({
  data,
  bool,
  formatDate,
  getFileUrl,
}: {
  data: any;
  bool: (v: any) => string;
  formatDate: (d: string) => string;
  getFileUrl: (p: string) => string;
}) {
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
      <MotivasiCard data={data} bool={bool} />
      <DokumenCard data={data} getFileUrl={getFileUrl} />
    </div>
  );
}

function Sidebar({
  data,
  stCfg,
  progresCfgItem,
}: {
  data: any;
  stCfg: any;
  progresCfgItem: any;
}) {
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

function DataDiriCard({
  data,
  formatDate,
  getFileUrl,
}: {
  data: any;
  formatDate: (d: string) => string;
  getFileUrl: (p: string) => string;
}) {
  const isImage = (file: string) => /\.(jpg|jpeg|png|webp)$/i.test(file || "");

  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle icon={User} title="Data Diri" />

        {/* FOTO + NAMA */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mt-3 mb-4">
          {/* FOTO */}
          <img
            src={data.pas_foto || ""}
            alt="Foto"
            className="w-32 h-32 rounded-xl object-cover"
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.src.includes("ui-avatars.com")) {
                img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  data.nama_romaji || data.nama || "?",
                )}`;
              }
            }}
          />

          {/* NAMA */}
          <div className="text-center sm:text-left">
            <p className="text-lg font-semibold">
              {data.nama_romaji || data.nama || "-"}
            </p>
            <p className="text-sm text-muted-foreground">
              {data.nama_katakana || "-"}
            </p>
          </div>
        </div>

        {/* DATA */}
        <div className="space-y-2">
          <InfoRow label="Nama (Romaji)" value={data.nama_romaji || "-"} />
          <InfoRow label="Nama (Katakana)" value={data.nama_katakana || "-"} />

          <InfoRow
            label="Tempat, Tanggal Lahir"
            value={
              data.tempat_lahir && data.tanggal_lahir
                ? `${data.tempat_lahir}, ${formatDate(data.tanggal_lahir)}`
                : data.tempat_lahir || "-"
            }
          />

          <InfoRow
            label="Umur"
            value={data.umur ? `${data.umur} tahun` : "-"}
          />

          <InfoRow label="Jenis Kelamin" value={data.jenis_kelamin || "-"} />
          <InfoRow label="Pendidikan" value={data.pendidikan_terakhir || "-"} />
          <InfoRow
            label="Status Pernikahan"
            value={data.status_pernikahan || "-"}
          />

          {data.status_pernikahan === "Menikah" && (
            <InfoRow label="Jumlah Anak" value={data.jumlah_anak || "-"} />
          )}

          <InfoRow label="Agama" value={data.agama || "-"} />

          <InfoRow
            label="Tinggi / Berat"
            value={
              data.tinggi_badan
                ? `${data.tinggi_badan} cm / ${data.berat_badan} kg`
                : "-"
            }
          />

          <InfoRow label="Golongan Darah" value={data.golongan_darah || "-"} />
          <InfoRow label="Ukuran Baju" value={data.ukuran_baju || "-"} />

          <InfoRow
            label="Lingkar Pinggang"
            value={data.lingkar_pinggang ? `${data.lingkar_pinggang} cm` : "-"}
          />

          <InfoRow
            label="Panjang Telapak Kaki"
            value={
              data.panjang_telapak_kaki
                ? `${data.panjang_telapak_kaki} cm`
                : "-"
            }
          />

          <InfoRow label="SIM" value={data.sim_dimiliki || "-"} />
          <InfoRow label="No. HP" value={data.nomor_hp || "-"} />

          <InfoRow
            label="Kontak Orang Tua"
            value={
              data.kontak_ortu_nama
                ? `${data.kontak_ortu_nama} (${data.kontak_ortu_hp})`
                : "-"
            }
          />

          <InfoRow
            label="Alamat"
            value={data.alamat_lengkap || "-"}
            multiline
          />
        </div>
      </CardContent>
    </Card>
  );
}

function KesehatanCard({ data }: { data: any }) {
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
{/* 
          {data.minum_alkohol && (
            <InfoRow
              label="Intensitas Alkohol"
              value={data.intensitas_alkohol || "-"}
            />
          )} */}
        </div>
      </CardContent>
    </Card>
  );
}

function HealthChip({ label, value }: { label: string; value: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
        value ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {value ? "✓" : "✗"} {label}
    </span>
  );
}

function PendidikanCard({ data }: { data: any }) {
  if (!data.pendidikan?.length) return null;

  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle icon={GraduationCap} title="Riwayat Pendidikan" />

        <div className="space-y-4 mt-3">
          {data.pendidikan.map((p: any, i: number) => (
            <div key={i} className="border rounded-lg p-3">

              <InfoRow label="Jenjang" value={p.jenjang || "-"} />
              
              <InfoRow
                label="Nama Sekolah"
                value={p.nama_sekolah || "-"}
              />

              <InfoRow
                label="Jurusan"
                value={p.jurusan || "-"}
              />

              <InfoRow
                label="Periode"
                value={
                  p.tahun_masuk
                    ? `${p.bulan_masuk || ""} ${p.tahun_masuk} - ${p.bulan_lulus || ""} ${p.tahun_lulus || ""}`
                    : "-"
                }
              />

            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}

function PengalamanCard({ data }: { data: any }) {
  const pengalaman = data.pengalaman || [];

  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle icon={Briefcase} title="Pengalaman Kerja" />

        {/* JIKA KOSONG */}
        {!pengalaman.length ? (
          <p className="text-sm text-muted-foreground mt-3">
            Belum ada pengalaman pekerjaan
          </p>
        ) : (
          <div className="space-y-4 mt-3">
            {pengalaman.map((p: any, i: number) => (
              <div key={i} className="border rounded-lg p-3">

                <InfoRow
                  label="Nama Perusahaan"
                  value={p.nama_perusahaan || "-"}
                />

                <InfoRow
                  label="Posisi"
                  value={p.posisi || "-"}
                />

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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function KeluargaCard({ data }: { data: any }) {
  const keluarga = data.keluarga || [];

  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle icon={Users} title="Data Keluarga" />

        {/* PENGHASILAN KELUARGA */}
        <div className="mt-3">
          <InfoRow
            label="Penghasilan Keluarga / Bulan"
            value={
              data.penghasilan_keluarga
                ? `Rp ${Number(data.penghasilan_keluarga).toLocaleString("id-ID")}`
                : "-"
            }
          />
        </div>

        {/* DATA KELUARGA */}
        {!keluarga.length ? (
          <p className="text-sm text-muted-foreground mt-3">
            Belum ada data keluarga
          </p>
        ) : (
          <div className="space-y-4 mt-3">
            {keluarga.map((k: any, i: number) => (
              <div key={i} className="border rounded-lg p-3">

                <InfoRow
                  label="Hubungan"
                  value={k.hubungan || "-"}
                />

                <InfoRow
                  label="Nama"
                  value={k.nama || "-"}
                />

                <InfoRow
                  label="Usia"
                  value={k.usia ? `${k.usia} tahun` : "-"}
                />

                <InfoRow
                  label="Pekerjaan"
                  value={k.pekerjaan || "-"}
                />

                <InfoRow
                  label="Penghasilan"
                  value={
                    k.penghasilan
                      ? `Rp ${Number(k.penghasilan).toLocaleString("id-ID")} / bulan`
                      : "-"
                  }
                />

              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function JepangCard({ data, bool }: { data: any; bool: (v: any) => string }) {
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

function MotivasiCard({ data, bool }: { data: any; bool: (v: any) => string }) {
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
            label="Cita-cita Setelah Jepang"
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

function DokumenCard({
  data,
  getFileUrl,
}: {
  data: any;
  getFileUrl: (p: string) => string;
}) {
  if (!data.dokumen?.length) return null;

  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle icon={Upload} title="Dokumen Pendukung" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-3">
          {data.dokumen.map((d: any) => {
            const labelMap: Record<string, string> = {
              sertifikat_jft: "Sertifikat JFT",
              pas_foto: "Pas Foto",
              foto_full_body: "Foto Full Body",
              kk: "Kartu Keluarga",
              ktp: "KTP",
              ijazah: "Ijazah",
              akte: "Akte Kelahiran",
              lainnya: "Lainnya",
            };
            let label =
              labelMap[d.jenis_dokumen] || d.jenis_dokumen.replace(/_/g, " ");
            const isSSW = d.jenis_dokumen.startsWith("ssw_");
            if (isSSW) {
              const sswArray = data.sertifikat_ssw
                ? data.sertifikat_ssw.split(",").map((s: string) => s.trim())
                : [];
              const idx = parseInt(d.jenis_dokumen.split("_")[1]) - 1;
              label = `SSW - ${sswArray[idx] || `#${idx + 1}`}`;
            }
            const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(d.path_file);
            const fileUrl = getFileUrl(d.path_file);
            return (
              <a
                key={d.id}
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center gap-2 p-3 border rounded-xl hover:bg-muted/50 transition-colors text-center group ${
                  isSSW ? "border-purple-200 bg-purple-50/50" : "border-border"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSSW
                      ? "bg-purple-100"
                      : isImg
                        ? "bg-blue-50"
                        : "bg-gray-100"
                  }`}
                >
                  {isSSW ? (
                    <span className="text-purple-600 text-xs font-bold">
                      SSW
                    </span>
                  ) : isImg ? (
                    <span className="text-blue-500 text-base">🖼</span>
                  ) : (
                    <FileText size={16} className="text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 w-full">
                  <p
                    className={`text-xs font-medium truncate ${
                      isSSW ? "text-purple-700" : ""
                    }`}
                  >
                    {label}
                  </p>
                  <p className="text-muted-foreground text-[10px] truncate mt-0.5">
                    {d.nama_file}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function DokumenRingkasanCard({ data }: { data: any }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
          Ringkasan Dokumen
        </p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Total dokumen</span>
            <span className="text-sm font-medium">
              {data.dokumen.length} file
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Sertifikat SSW
            </span>
            <span className="text-sm font-medium">
              {
                data.dokumen.filter((d: any) =>
                  d.jenis_dokumen.startsWith("ssw_"),
                ).length
              }{" "}
              bidang
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Sertifikat JFT
            </span>
            {data.dokumen.find(
              (d: any) => d.jenis_dokumen === "sertifikat_jft",
            ) ? (
              <span className="inline-flex px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                Ada
              </span>
            ) : (
              <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                Belum
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
