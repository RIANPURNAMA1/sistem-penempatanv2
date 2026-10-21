import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui/components";
import { Award, TrendingUp, Filter, Users, Search, Loader2, Eye } from "lucide-react";
import ReactApexChart from "react-apexcharts";
import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

interface SSWGender {
  ssw: string;
  laki: number;
  perempuan: number;
  total: number;
}

interface SSWProgres {
  ssw: string;
  progres: { status: string; count: number; laki?: number; perempuan?: number }[];
}

interface ProfileRow {
  id: number;
  nama?: string;
  nama_romaji?: string;
  nama_katakana?: string;
  jenis_kelamin?: string;
  umur?: number;
  sertifikat_ssw?: string;
  status_progres?: string;
  status_formulir?: string;
  nama_cabang?: string;
  pas_foto?: string;
  nomor_hp?: string;
}

interface StatusKandidatProps {
  stats: SSWGender[] | undefined;
  bySSWProgres: SSWProgres[] | undefined;
  byCabangProgres:
    | { nama_cabang: string; status_progres: string; count: number }[]
    | undefined;
  loading: boolean;
}

const progresColors: Record<string, string> = {
  "Job Matching": "#1e3a5f",
  Pending: "#94a3b8",
  "lamar ke perusahaan": "#4a7ab5",
  Interview: "#8cbbff",
  "Jadwalkan Interview Ulang": "#a8c5f0",
  "Lulus interview": "#22c55e",
  "Gagal Interview": "#ef4444",
  Pemberkasan: "#f59e0b",
  Berangkat: "#10b981",
  Ditolak: "#dc2626",
};

const progresList = [
  "Job Matching",
  "Pending",
  "lamar ke perusahaan",
  "Interview",
  "Jadwalkan Interview Ulang",
  "Lulus interview",
  "Gagal Interview",
  "Pemberkasan",
  "Berangkat",
  "Ditolak",
];

export default function StatusKandidat({
  stats,
  bySSWProgres,
  byCabangProgres,
  loading,
}: StatusKandidatProps) {
  const [activeSSW, setActiveSSW] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "chart">("cards");
  const [showFilters, setShowFilters] = useState(false);
  const [tableSearch, setTableSearch] = useState("");
  const [tableStatus, setTableStatus] = useState<string>("all");
  const [kandidatRows, setKandidatRows] = useState<ProfileRow[]>([]);
  const [kandidatLoading, setKandidatLoading] = useState(false);
  const [fotoError, setFotoError] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const [selectedProgress, setSelectedProgress] = useState<Set<string>>(
    new Set(progresList),
  );
  const [selectedGender, setSelectedGender] = useState<Set<string>>(
    new Set(["Laki-laki", "Perempuan"]),
  );

  const toggleProgress = (progress: string) => {
    setSelectedProgress((prev) => {
      const next = new Set(prev);
      if (next.has(progress)) {
        if (next.size > 1) next.delete(progress);
      } else {
        next.add(progress);
      }
      return next;
    });
  };

  const toggleGender = (gender: string) => {
    setSelectedGender((prev) => {
      const next = new Set(prev);
      if (next.has(gender)) {
        if (next.size > 1) next.delete(gender);
      } else {
        next.add(gender);
      }
      return next;
    });
  };

  const filteredStats = useMemo(() => {
    if (!stats) return [];
    return stats.map((item) => ({
      ...item,
      laki: selectedGender.has("Laki-laki") ? item.laki : 0,
      perempuan: selectedGender.has("Perempuan") ? item.perempuan : 0,
      total:
        (selectedGender.has("Laki-laki") ? item.laki : 0) +
        (selectedGender.has("Perempuan") ? item.perempuan : 0),
    }));
  }, [stats, selectedGender]);

  const filteredBySSWProgres = useMemo(() => {
    if (!bySSWProgres) return [];
    return bySSWProgres.map((item) => ({
      ...item,
      progres: item.progres.filter((p) => selectedProgress.has(p.status)),
    }));
  }, [bySSWProgres, selectedProgress]);

  const filteredByCabangProgres = useMemo(() => {
    if (!byCabangProgres) return [];
    return byCabangProgres
      .filter((d) => d.nama_cabang && selectedProgress.has(d.status_progres))
      .map((d) => ({ ...d, nama_cabang: d.nama_cabang?.trim() || d.nama_cabang }));
  }, [byCabangProgres, selectedProgress]);

  const selectedSSWData = activeSSW
    ? filteredBySSWProgres.find((d) => d.ssw === activeSSW)
    : null;

  const tableRows = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    return kandidatRows
      .filter((p) => tableStatus === "all" || (p.status_progres || "Pending") === tableStatus)
      .filter(
        (p) =>
          !q ||
          (p.nama_romaji || "").toLowerCase().includes(q) ||
          (p.nama_katakana || "").toLowerCase().includes(q) ||
          (p.nama || "").toLowerCase().includes(q) ||
          (p.nama_cabang || "").toLowerCase().includes(q),
      )
      .sort((a, b) => (a.nama_romaji || a.nama || "").localeCompare(b.nama_romaji || b.nama || ""));
  }, [kandidatRows, tableSearch, tableStatus]);

  const openSSW = (ssw: string) => {
    setTableSearch("");
    setTableStatus("all");
    setFotoError(new Set());
    setActiveSSW(ssw);
    setKandidatLoading(true);
    api
      .get("/kandidat", { params: { bidang_ssw: ssw, status: "approved" } })
      .then((r) => {
        const rows: ProfileRow[] = r.data.data || [];
        // samakan persis dengan logika stats di backend:
        // kandidat approved yang sertifikat_ssw-nya memuat bidang ini
        setKandidatRows(
          rows.filter((p) =>
            (p.sertifikat_ssw || "")
              .split(",")
              .map((s) => s.trim())
              .includes(ssw),
          ),
        );
      })
      .catch(() => setKandidatRows([]))
      .finally(() => setKandidatLoading(false));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-[#1e3a5f]" />
          <span className="text-sm font-medium">
            Statistik Kandidat per Bidang SSW
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5 ${
              showFilters
                ? "bg-[#1e3a5f] text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Filter size={12} />
            Filter
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`px-3 py-1.5 text-xs rounded-md transition-all ${
              viewMode === "cards"
                ? "bg-[#1e3a5f] text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Kartu
          </button>
          <button
            onClick={() => setViewMode("chart")}
            className={`px-3 py-1.5 text-xs rounded-md transition-all ${
              viewMode === "chart"
                ? "bg-[#1e3a5f] text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Grafik
          </button>
        </div>
      </div>

      {showFilters && (
        <Card className="border-dashed">
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium mb-2 text-muted-foreground">
                  Filter Progress
                </p>
                <div className="flex flex-wrap gap-2">
                  {progresList.map((progres) => (
                    <label
                      key={progres}
                      className="flex items-center gap-1.5 text-xs cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProgress.has(progres)}
                        onChange={() => toggleProgress(progres)}
                        className="w-3.5 h-3.5 rounded accent-[#1e3a5f] cursor-pointer"
                      />
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{
                          backgroundColor: progresColors[progres] + "20",
                          color: progresColors[progres],
                        }}
                      >
                        {progres}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium mb-2 text-muted-foreground">
                  Filter Gender
                </p>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGender.has("Laki-laki")}
                      onChange={() => toggleGender("Laki-laki")}
                      className="w-3.5 h-3.5 rounded accent-[#1e3a5f] cursor-pointer"
                    />
                    <span>Laki-laki</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGender.has("Perempuan")}
                      onChange={() => toggleGender("Perempuan")}
                      className="w-3.5 h-3.5 rounded accent-[#1e3a5f] cursor-pointer"
                    />
                    <span>Perempuan</span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between"></div>
      {viewMode === "cards" ? (
        <>
      <div className=" flex justify-end">
      {stats && (
        <div className="text-sm font-medium text-muted-foreground">
          Total Kandidat :{" "}
          {stats.reduce((sum, item) => sum + item.total, 0)}
        </div>
      )}
      </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <p className="text-sm text-muted-foreground col-span-full">
                Memuat...
              </p>
            ) : (stats?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full">
                Belum ada data
              </p>
            ) : (
              filteredStats?.map((item) => (
                <Card
                  key={item.ssw}
                  className={`cursor-pointer transition-all hover:shadow-md ${activeSSW === item.ssw ? "ring-2 ring-[#1e3a5f]" : ""}`}
                  onClick={() => {
                    if (activeSSW === item.ssw) setActiveSSW(null);
                    else openSSW(item.ssw);
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award size={14} className="text-[#1e3a5f]" />
                        {item.ssw}
                      </div>
                      <Badge className="bg-[#1e3a5f]">{item.total}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Laki-laki
                      </span>
                      <Badge variant="secondary">{item.laki}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Perempuan
                      </span>
                      <Badge variant="secondary">{item.perempuan}</Badge>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        Klik untuk lihat detail progress
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {selectedSSWData &&
            createPortal(
              <div
                className="fixed inset-0 z-[70] flex bg-black/50 p-0"
                onClick={() => setActiveSSW(null)}
              >
                <div
                  className="bg-white shadow-2xl w-full h-full overflow-y-auto flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b sticky top-0 bg-white z-10">
                  <div className="flex items-center gap-2 min-w-0">
                    <Award size={18} className="text-[#1e3a5f] shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold truncate">
                        Detail Progress - {selectedSSWData.ssw}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Total{" "}
                        {selectedSSWData.progres.reduce(
                          (sum, p) => sum + p.count,
                          0,
                        )}{" "}
                        kandidat ·{" "}
                        <span className="text-sky-600 font-medium">
                          L{" "}
                          {selectedSSWData.progres.reduce(
                            (sum, p) => sum + (p.laki || 0),
                            0,
                          )}
                        </span>{" "}
                        ·{" "}
                        <span className="text-pink-600 font-medium">
                          P{" "}
                          {selectedSSWData.progres.reduce(
                            (sum, p) => sum + (p.perempuan || 0),
                            0,
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSSW(null)}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full w-8 h-8 flex items-center justify-center transition-colors shrink-0 ml-2"
                    aria-label="Tutup"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="px-4 sm:px-6 py-4 space-y-5">
                  <ReactApexChart
                    type="bar"
                    series={[
                      {
                        name: "Laki-laki",
                        data: progresList.map(
                          (progres) =>
                            selectedSSWData.progres.find(
                              (p) => p.status === progres,
                            )?.laki || 0,
                        ),
                      },
                      {
                        name: "Perempuan",
                        data: progresList.map(
                          (progres) =>
                            selectedSSWData.progres.find(
                              (p) => p.status === progres,
                            )?.perempuan || 0,
                        ),
                      },
                    ]}
                    options={{
                      chart: {
                        height: 380,
                        toolbar: { show: false },
                        stacked: true,
                        fontFamily: "Inter, sans-serif",
                      },
                      colors: ["#0ea5e9", "#ec4899"],
                      plotOptions: {
                        bar: {
                          horizontal: false,
                          columnWidth: "55%",
                          borderRadius: 4,
                        },
                      },
                      dataLabels: {
                        enabled: true,
                        style: {
                          fontSize: "10px",
                          fontWeight: 600,
                          colors: ["#fff"],
                        },
                        formatter: (val: number) =>
                          val > 0 ? val.toString() : "",
                      },
                      xaxis: {
                        categories: progresList,
                        labels: {
                          style: { fontSize: "10px" },
                          rotate: -40,
                          trim: false,
                        },
                      },
                      yaxis: {
                        labels: { formatter: (val: number) => val.toFixed(0) },
                      },
                      grid: {
                        borderColor: "#f1f1f1",
                        strokeDashArray: 4,
                      },
                      tooltip: {
                        theme: "light",
                        y: { formatter: (val: number) => `${val} Kandidat` },
                      },
                      legend: {
                        position: "top",
                        horizontalAlign: "right",
                        fontSize: "11px",
                        markers: { size: 8 },
                      },
                    }}
                    height={380}
                  />

                  <div className="space-y-2">
                    {progresList.map((progres) => {
                      const data = selectedSSWData.progres.find(
                        (p) => p.status === progres,
                      );
                      const count = data?.count || 0;
                      const laki = data?.laki || 0;
                      const perempuan = data?.perempuan || 0;
                      const pct = selectedSSWData.progres.reduce(
                        (sum, p) => sum + p.count,
                        0,
                      );
                      const percentage =
                        pct > 0 ? Math.round((count / pct) * 100) : 0;

                      return (
                        <div
                          key={progres}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                progresColors[progres] || "#1e3a5f",
                            }}
                          />
                          <span className="flex-1 truncate text-muted-foreground" title={progres}>
                            {progres}
                          </span>
                          <span className="font-medium tabular-nums">{count}</span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-100 text-sky-700 tabular-nums">
                            L {laki}
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-pink-100 text-pink-700 tabular-nums">
                            P {perempuan}
                          </span>
                          <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                            {percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── TABEL KANDIDAT ── */}
                  <div className="border-t pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Users size={15} className="text-[#1e3a5f]" />
                        Daftar Kandidat
                        <span className="text-[11px] font-normal text-muted-foreground">
                          ({tableRows.length} dari {kandidatRows.length})
                        </span>
                      </h4>
                      <div className="flex gap-2">
                        <div className="relative">
                          <Search
                            size={13}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                          />
                          <input
                            type="text"
                            placeholder="Cari nama / cabang..."
                            value={tableSearch}
                            onChange={(e) => setTableSearch(e.target.value)}
                            className="h-8 w-full sm:w-52 rounded-md border bg-white pl-7 pr-2 text-xs outline-none focus:ring-1 focus:ring-[#1e3a5f]"
                          />
                        </div>
                        <select
                          value={tableStatus}
                          onChange={(e) => setTableStatus(e.target.value)}
                          className="h-8 rounded-md border bg-white px-2 text-xs outline-none focus:ring-1 focus:ring-[#1e3a5f]"
                        >
                          <option value="all">Semua Status</option>
                          {progresList.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/50 text-muted-foreground text-left">
                            <th className="px-3 py-2 font-medium w-10">No</th>
                            <th className="px-3 py-2 font-medium">Nama</th>
                            <th className="px-3 py-2 font-medium w-16">L/P</th>
                            <th className="px-3 py-2 font-medium w-12 text-center">Umur</th>
                            <th className="px-3 py-2 font-medium">Cabang</th>
                            <th className="px-3 py-2 font-medium">Status Progres</th>
                            <th className="px-3 py-2 font-medium w-16 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kandidatLoading ? (
                            <tr>
                              <td
                                colSpan={7}
                                className="px-3 py-8 text-center text-muted-foreground"
                              >
                                <span className="inline-flex items-center gap-2">
                                  <Loader2 size={14} className="animate-spin" />
                                  Memuat data kandidat...
                                </span>
                              </td>
                            </tr>
                          ) : tableRows.length === 0 ? (
                            <tr>
                              <td
                                colSpan={7}
                                className="px-3 py-6 text-center text-muted-foreground"
                              >
                                Tidak ada kandidat yang cocok
                              </td>
                            </tr>
                          ) : (
                            tableRows.map((p, i) => {
                              const status = p.status_progres || "Pending";
                              const inisial = (p.nama_romaji || p.nama || "?")
                                .charAt(0)
                                .toUpperCase();
                              return (
                                <tr
                                  key={p.id}
                                  className="border-t hover:bg-muted/30 transition-colors"
                                >
                                  <td className="px-3 py-2 tabular-nums text-muted-foreground">
                                    {i + 1}
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="flex items-center gap-2">
                                      {p.pas_foto && !fotoError.has(p.id) ? (
                                        <img
                                          src={p.pas_foto}
                                          alt=""
                                          className="w-6 h-6 rounded-full object-cover shrink-0"
                                          loading="lazy"
                                          onError={() =>
                                            setFotoError((prev) => {
                                              const next = new Set(prev);
                                              next.add(p.id);
                                              return next;
                                            })
                                          }
                                        />
                                      ) : (
                                        <span
                                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${
                                            p.jenis_kelamin === "Perempuan"
                                              ? "bg-pink-100 text-pink-700"
                                              : "bg-sky-100 text-sky-700"
                                          }`}
                                        >
                                          {inisial}
                                        </span>
                                      )}
                                      <div className="min-w-0">
                                        <p className="font-medium truncate">
                                          {p.nama_romaji || p.nama_katakana || p.nama || "-"}
                                        </p>
                                        {p.nama_katakana &&
                                          p.nama_romaji &&
                                          p.nama_katakana !== p.nama_romaji && (
                                            <p className="text-[10px] text-muted-foreground truncate">
                                              {p.nama_katakana}
                                            </p>
                                          )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <span
                                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                        p.jenis_kelamin === "Perempuan"
                                          ? "bg-pink-100 text-pink-700"
                                          : "bg-sky-100 text-sky-700"
                                      }`}
                                    >
                                      {p.jenis_kelamin === "Perempuan" ? "P" : "L"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-center tabular-nums">
                                    {p.umur ?? "-"}
                                  </td>
                                  <td className="px-3 py-2 text-muted-foreground">
                                    {p.nama_cabang || "-"}
                                  </td>
                                  <td className="px-3 py-2">
                                    <span
                                      className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium text-white"
                                      style={{
                                        backgroundColor:
                                          progresColors[status] || "#1e3a5f",
                                      }}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                                      {status}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveSSW(null);
                                        navigate(`/kandidat/${p.id}`);
                                      }}
                                      className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                                      title="Lihat di data kandidat"
                                    >
                                      <Eye size={12} />
                                      Lihat
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
              document.body,
            )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Grafik Progress Kandidat per SSW
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBySSWProgres && filteredBySSWProgres.length > 0 ? (
              <ReactApexChart
                type="bar"
                series={progresList.map((progres) => ({
                  name: progres,
                  data: filteredBySSWProgres.map((item) => {
                    const data = item.progres.find((p) => p.status === progres);
                    return data?.count || 0;
                  }),
                }))}
                options={{
                  chart: {
                    height: 450,
                    toolbar: { show: false },
                    stacked: true,
                  },
                  colors: progresList.map((p) => progresColors[p] || "#1e3a5f"),
                  plotOptions: {
                    bar: {
                      horizontal: false,
                      columnWidth: "60%",
                      borderRadius: 4,
                    },
                  },
                  dataLabels: {
                    enabled: true,
                    style: {
                      fontSize: "9px",
                      fontWeight: 500,
                      colors: ["#fff"],
                    },
                    formatter: (val: number) => (val > 0 ? val.toString() : ""),
                  },
                  xaxis: {
                    categories: filteredBySSWProgres.map((item) => item.ssw),
                    labels: {
                      style: { fontSize: "11px" },
                      rotate: -30,
                    },
                  },
                  yaxis: {
                    labels: { formatter: (val: number) => val.toFixed(0) },
                  },
                  grid: {
                    borderColor: "#f1f1f1",
                    strokeDashArray: 4,
                  },
                  tooltip: {
                    theme: "light",
                    y: { formatter: (val: number) => `${val} Kandidat` },
                  },
                  legend: {
                    position: "bottom",
                    horizontalAlign: "center",
                    fontSize: "10px",
                    markers: { size: 8 },
                  },
                }}
                height={450}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm text-muted-foreground">Belum ada data</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {filteredByCabangProgres && filteredByCabangProgres.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">
              Progress Kandidat per Cabang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReactApexChart
              type="bar"
              series={progresList.map((progres) => ({
                name: progres,
                data: [
                  ...new Set(
                    filteredByCabangProgres.map(
                      (d) => d.nama_cabang,
                    ),
                  ),
                ].map((cabang) => {
                  const items = filteredByCabangProgres.filter(
                    (d) =>
                      d.nama_cabang === cabang &&
                      d.status_progres === progres,
                  );
                  return items.reduce((sum, item) => sum + item.count, 0);
                }),
              }))}
              options={{
                chart: {
                  height: 400,
                  toolbar: { show: false },
                  fontFamily: 'Inter, sans-serif',
                },
                colors: ['#475569', '#64748B', '#94A3B8', '#CBD5E1', '#1E293B', '#0F172A', '#334155', '#1C1917', '#292524', '#44403C'],
                plotOptions: {
                  bar: {
                    horizontal: true,
                    borderRadius: 6,
                    barHeight: "80%",
                    distributed: false,
                  },
                },
                dataLabels: {
                  enabled: true,
                  style: {
                    fontSize: "11px",
                    fontWeight: 600,
                    colors: ["#fff"],
                  },
                  formatter: (val: number) => (val > 0 ? val.toString() : ""),
                },
                xaxis: {
                  categories: [
                    ...new Set(
                      filteredByCabangProgres.map(
                        (d) => d.nama_cabang,
                      ),
                    ),
                  ],
                  labels: {
                    style: { fontSize: "11px", colors: ['#64748B'] },
                  },
                },
                yaxis: {
                  labels: { style: { fontSize: "11px", colors: ['#64748B'] } },
                },
                grid: {
                  borderColor: "#e2e8f0",
                  strokeDashArray: 3,
                },
                tooltip: {
                  theme: "light",
                  style: {
                    fontSize: '12px',
                  },
                  y: { formatter: (val: number) => `${val} Kandidat` },
                },
                legend: {
                  position: "bottom",
                  horizontalAlign: "center",
                  fontSize: "11px",
                  markers: { size: 10 },
                },
                fill: {
                  opacity: 1,
                },
              }}
              height={400}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
