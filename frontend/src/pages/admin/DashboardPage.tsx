import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import VerifikasiPendaftaran from "@/components/dashboard/VerifikasiPendaftaran";
import StatusKandidat from "@/components/dashboard/StatusKandidat";
import DataPerusahaan from "@/components/dashboard/DataPerusahaan";
import SertifikasiKandidat from "@/components/dashboard/SertifikasiKandidat";
import InterviewStats from "@/components/dashboard/InterviewStats";

interface Stats {
  total: number;
  byStatus: { status_formulir: string; count: number }[];
  byCabang: { nama_cabang: string; count: number }[];
  bySSWGender?: any[];
  bySSWProgres?: any[];
  byCabangProgres?: any[];
  jftByGender?: any[];
  jftByCabang?: any[];
  sswByGender?: any[];
  sswByCabang?: any[];
  interviewByCabang?: any[];
  interviewByGender?: any[];
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "verifikasi" | "status" | "sertifikasi" | "job order" | "interview"
  >("verifikasi");

  const [jobOrderStats, setJobOrderStats] = useState<any[]>([]);
  const [loadingJobOrder, setLoadingJobOrder] = useState(false);

  const [filterTanggalAwal, setFilterTanggalAwal] = useState("");
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState("");

  useEffect(() => {
    api
      .get("/kandidat/stats")
      .then((r) => setStats(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  const fetchJobOrderData = (tanggalAwal = "", tanggalAkhir = "") => {
    setLoadingJobOrder(true);

    let url = "/joborder";
    const params: string[] = [];

    if (tanggalAwal) params.push(`tanggal_awal=${tanggalAwal}`);
    if (tanggalAkhir) params.push(`tanggal_akhir=${tanggalAkhir}`);

    if (params.length > 0) {
      url += "?" + params.join("&");
    }

    api
      .get(url)
      .then((r) => {
        const data = r.data.data || [];
        const result = data
          .map((item: any) => ({
            id: item.id,
            nomor: item.nomor || "-",
            bidang_ssw: item.bidang_ssw || "Lainnya",
            nama_perusahaan: item.nama_perusahaan || "-",
            status_kelulusan: item.status_kelulusan || "-",
            count: item.kandidat_ids?.length || 0,
          }))
          .sort((a: any, b: any) => b.count - a.count);

        setJobOrderStats(result);
      })
      .finally(() => setLoadingJobOrder(false));
  };

  useEffect(() => {
    if (activeTab === "job order") {
      fetchJobOrderData(filterTanggalAwal, filterTanggalAkhir);
    }
  }, [activeTab]);

  const handleFilterChange = (awal: string, akhir: string) => {
    setFilterTanggalAwal(awal);
    setFilterTanggalAkhir(akhir);
    fetchJobOrderData(awal, akhir);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden px-3 sm:px-6 py-4 sm:py-6">

      {/* HEADER */}
      <div className="mb-5 sm:mb-8">
        <h1 className="text-lg sm:text-2xl font-semibold truncate">
          Dashboard
        </h1>

        <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 leading-relaxed">
          Selamat datang, {user?.nama} —{" "}
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* TAB MENU (SUPER RESPONSIVE) */}
      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">

        {[
          { key: "verifikasi", label: "Verifikasi" },
          { key: "status", label: "Status" },
          { key: "sertifikasi", label: "Sertifikasi" },
          ...(user?.role === "admin_penempatan"
            ? [{ key: "job order", label: "Job Order" }]
            : []),
          { key: "interview", label: "Interview" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-[#1e3a5f] text-white shadow-sm"
                : "bg-white text-muted-foreground border hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="space-y-4 sm:space-y-6">

        {activeTab === "verifikasi" && (
          <VerifikasiPendaftaran stats={stats} loading={loading} />
        )}

        {activeTab === "status" && (
          <StatusKandidat
            stats={stats?.bySSWGender}
            bySSWProgres={stats?.bySSWProgres}
            byCabangProgres={stats?.byCabangProgres}
            loading={loading}
          />
        )}

        {activeTab === "sertifikasi" && (
          <SertifikasiKandidat
            jftByGender={stats?.jftByGender}
            jftByCabang={stats?.jftByCabang}
            sswByGender={stats?.sswByGender}
            sswByCabang={stats?.sswByCabang}
            loading={loading}
          />
        )}

        {activeTab === "job order" && (
          <DataPerusahaan
            stats={jobOrderStats}
            loading={loadingJobOrder}
            filterTanggalAwal={filterTanggalAwal}
            filterTanggalAkhir={filterTanggalAkhir}
            onFilterChange={handleFilterChange}
          />
        )}

        {activeTab === "interview" && (
          <InterviewStats
            interviewByCabang={stats?.interviewByCabang}
            interviewByGender={stats?.interviewByGender}
          />
        )}
      </div>
    </div>
  );
}