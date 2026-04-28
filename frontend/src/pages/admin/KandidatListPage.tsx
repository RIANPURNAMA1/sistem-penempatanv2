import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, Badge } from "@/components/ui/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/useToast";
import api from "@/lib/api";
import { generateCVPDF, generateCVExcel } from "@/lib/cvGenerator";
import {
  Search,
  Filter,
  X,
  Eye,
  Users,
  MapPin,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  History,
  Download,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import HistoryModal from "@/components/HistoryModal";

interface Kandidat {
  id: number;
  user_id: number;
  nama: string;
  email: string;
  nama_romaji: string;
  nama_katakana: string;
  jenis_kelamin: string;
  umur: number;
  nama_cabang: string;
  status_formulir: string;
  status_progres: string;
  updated_at: string;
  level_bahasa_jepang: string;
  sertifikat_ssw: string;
  pendidikan_terakhir: string;
  pas_foto: string;
  status_keberangkatan: string;
}

const statusFormulirConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  draft: { label: "Draft", bg: "bg-slate-100", text: "text-slate-700" },
  submitted: { label: "Terkirim", bg: "bg-blue-100", text: "text-blue-700" },
  reviewed: { label: "Direview", bg: "bg-amber-100", text: "text-amber-700" },
  approved: { label: "Disetujui", bg: "bg-green-100", text: "text-green-700" },
  rejected: { label: "Ditolak", bg: "bg-red-100", text: "text-red-700" },
};

const progresConfig: Record<string, { label: string; color: string }> = {
  "Job Matching": { label: "Job Matching", color: "#f59e0b" },
  Pending: { label: "Pending", color: "#94a3b8" },
  "lamar ke perusahaan": { label: "Melamar", color: "#3b82f6" },
  Interview: { label: "Interview", color: "#f59e0b" },
  "Jadwalkan Interview Ulang": { label: "Interview Ulang", color: "#8b5cf6" },
  "Lulus interview": { label: "Lulus", color: "#22c55e" },
  "Gagal Interview": { label: "Gagal", color: "#ef4444" },
  Pemberkasan: { label: "Pemberkasan", color: "#ec4899" },
  Berangkat: { label: "Berangkat", color: "#10b981" },
  Ditolak: { label: "Ditolak", color: "#dc2626" },
};

const keberangkatanConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  stay: { label: "Stay", bg: "bg-blue-100", text: "text-blue-700" },
  keluar: { label: "Keluar", bg: "bg-orange-100", text: "text-orange-700" },
  terbang: { label: "Terbang", bg: "bg-green-100", text: "text-green-700" },
};

const sswOptions = [
  "Pengolahan Makanan",
  "Pertanian",
  "Kaigo (perawat)",
  "Building Cleaning",
  "Restoran",
  "Driver",
];
const jenjangOptions = ["SD", "SMP", "SMA/SMK", "Perguruan Tinggi"];

export default function KandidatListPage() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<Kandidat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [cabangList, setCabangList] = useState<
    { id: number; nama_cabang: string }[]
  >([]);
  const [cabangFilter, setCabangFilter] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [umurMin, setUmurMin] = useState("");
  const [umurMax, setUmurMax] = useState("");
  const [bidangSSW, setBidangSSW] = useState("");
  const [progres, setProgres] = useState("");
  const [jenjang, setJenjang] = useState("");
  const [statusKeberangkatan, setStatusKeberangkatan] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [historyKandidat, setHistoryKandidat] = useState<{
    id: number;
    nama: string;
  } | null>(null);
  const [screeningLoading, setScreeningLoading] = useState(false);

  const statusParam = searchParams.get("status") || "";
  const progresParam = searchParams.get("progres") || "";

  const load = () => {
    setLoading(true);
    setIsSearching(true);
    const params: any = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusParam) params.status = statusParam;
    if (status) params.status = status;
    if (cabangFilter) params.cabang_id = cabangFilter;
    if (jenisKelamin) params.jenis_kelamin = jenisKelamin;
    if (umurMin) params.umur_min = umurMin;
    if (umurMax) params.umur_max = umurMax;
    if (bidangSSW) params.bidang_ssw = bidangSSW;
    if (progresParam) params.status_progres = progresParam;
    if (progres) params.status_progres = progres;
    if (jenjang) params.jenjang = jenjang;
    if (statusKeberangkatan) params.status_keberangkatan = statusKeberangkatan;
    api
      .get("/kandidat", { params })
      .then((r) => setData(r.data.data))
      .finally(() => {
        setLoading(false);
        setIsSearching(false);
      });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  };

  const clearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
  };

  const clearFilters = () => {
    setStatus("");
    setCabangFilter("");
    setJenisKelamin("");
    setUmurMin("");
    setUmurMax("");
    setBidangSSW("");
    setProgres("");
    setJenjang("");
    setStatusKeberangkatan("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    status ||
    cabangFilter ||
    jenisKelamin ||
    umurMin ||
    umurMax ||
    bidangSSW ||
    progres ||
    jenjang ||
    statusKeberangkatan;

  useEffect(() => {
    load();
  }, [
    statusParam,
    progresParam,
    status,
    cabangFilter,
    jenisKelamin,
    umurMin,
    umurMax,
    bidangSSW,
    progres,
    jenjang,
    statusKeberangkatan,
    debouncedSearch,
  ]);
  useEffect(() => {
    if (user?.role === "admin_penempatan") {
      api.get("/cabang").then((r) => setCabangList(r.data.data));
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearch,
    statusParam,
    progresParam,
    status,
    cabangFilter,
    jenisKelamin,
    umurMin,
    umurMax,
    bidangSSW,
    progres,
    jenjang,
    statusKeberangkatan,
    itemsPerPage,
  ]);

  const activeFilterCount = [
    status,
    cabangFilter,
    jenisKelamin,
    umurMin,
    umurMax,
    bidangSSW,
    progres,
    jenjang,
    statusKeberangkatan,
  ].filter(Boolean).length;

  const handleUpdateKeberangkatan = async (
    kandidatId: number,
    status: string,
  ) => {
    try {
      await api.patch(`/kandidat/${kandidatId}/keberangkatan`, {
        status_keberangkatan: status,
      });
      toast({ title: "Status berhasil diupdate" });
      setData((prev) =>
        prev.map((k) =>
          k.id === kandidatId ? { ...k, status_keberangkatan: status } : k,
        ),
      );
    } catch {
      toast({ title: "Gagal update status", variant: "destructive" });
    }
  };

  const handleBatchScreening = async () => {
    setScreeningLoading(true);
    try {
      const res = await api.post(`/kandidat/batch-screening`);
      const message = res.data.message;
      window.setTimeout(async () => {
        toast({ title: message, variant: "success" });
        load();
        setScreeningLoading(false);
      }, 10000);
    } catch {
      toast({ title: "Gagal batch screening", variant: "destructive" });
      setScreeningLoading(false);
    }
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="page-container">
      {/* ── HEADER ── */}
      <div className="mb-6 space-y-3">
        {/* Judul + deskripsi */}
        <div className="space-y-0.5">
          <h1 className="text-lg xs:text-xl sm:text-2xl font-bold text-foreground leading-tight">
            Data Kandidat
          </h1>
          <p className="text-[11px] xs:text-xs sm:text-sm text-muted-foreground leading-snug">
            {user?.role === "admin_cabang"
              ? `Kandidat cabang ${user.nama_cabang}`
              : "Kelola semua data kandidat"}
          </p>
        </div>

        {/* Tombol aksi — selalu row, wrap kalau perlu, tapi tidak pernah stacked full-width */}
        <div className="flex flex-row flex-wrap gap-2">
          {/* Tombol Filter */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5
              text-xs font-medium transition-colors
              bg-white hover:bg-gray-50 border-gray-200 text-gray-700
              focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300
              whitespace-nowrap
            `}
          >
            <Filter size={13} className="shrink-0" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="ml-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[10px] font-semibold shrink-0">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Tombol Screening */}
          <button
            onClick={handleBatchScreening}
            disabled={screeningLoading}
            className={`
              inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5
              text-xs font-medium transition-colors
              bg-green-600 hover:bg-green-700 text-white
              disabled:opacity-60 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-400
              whitespace-nowrap
            `}
          >
            {screeningLoading ? (
              <>
                <Loader2 size={13} className="animate-spin shrink-0" />
                <span>Proses...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={13} className="shrink-0" />
                <span>Screening Semua</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── SEARCH + STATUS FILTER ── */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Cari..."
            className="pl-9 pr-10 bg-white w-full h-9 text-sm"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {isSearching && (
            <Loader2
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin"
            />
          )}
          {search && !isSearching && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select
            value={status || "all"}
            onValueChange={(v) => setStatus(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-36 xs:w-40 bg-white h-9 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {Object.entries(statusFormulirConfig).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {user?.role === "admin_penempatan" && (
            <Select
              value={cabangFilter || "all"}
              onValueChange={(v) => setCabangFilter(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-36 xs:w-40 bg-white h-9 text-sm">
                <SelectValue placeholder="Cabang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Cabang</SelectItem>
                {cabangList.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nama_cabang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* ── FILTER LANJUTAN ── */}
      {showFilters && (
        <div className="mb-4 bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                Filter Lanjutan
              </span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100"
              >
                <X size={13} /> Reset
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[130px]">
                <label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Jenis Kelamin
                </label>
                <Select
                  value={jenisKelamin || "all"}
                  onValueChange={(v) => setJenisKelamin(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="h-9 bg-white border-border text-sm">
                    <SelectValue placeholder="Pilih..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[130px]">
                <label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Pendidikan
                </label>
                <Select
                  value={jenjang || "all"}
                  onValueChange={(v) => setJenjang(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="h-9 bg-white border-border text-sm">
                    <SelectValue placeholder="Pilih..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    {jenjangOptions.map((j) => (
                      <SelectItem key={j} value={j}>
                        {j}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Bidang SSW
                </label>
                <Select
                  value={bidangSSW || "all"}
                  onValueChange={(v) => setBidangSSW(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="h-9 bg-slate-50 border-slate-200 text-sm">
                    <SelectValue placeholder="Pilih..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    {sswOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Progress
                </label>
                <Select
                  value={progres || "all"}
                  onValueChange={(v) => setProgres(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="h-9 bg-slate-50 border-slate-200 text-sm">
                    <SelectValue placeholder="Pilih..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    {Object.entries(progresConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[130px]">
                <label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Keberangkatan
                </label>
                <Select
                  value={statusKeberangkatan || "all"}
                  onValueChange={(v) =>
                    setStatusKeberangkatan(v === "all" ? "" : v)
                  }
                >
                  <SelectTrigger className="h-9 bg-white border-border text-sm">
                    <SelectValue placeholder="Pilih..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="stay">Stay</SelectItem>
                    <SelectItem value="keluar">Keluar</SelectItem>
                    <SelectItem value="terbang">Terbang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[110px]">
                <label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Umur Min
                </label>
                <Input
                  type="number"
                  placeholder="18"
                  value={umurMin}
                  onChange={(e) => setUmurMin(e.target.value)}
                  className="h-9 bg-slate-50 border-slate-200 text-sm"
                />
              </div>
              <div className="flex-shrink-0 flex items-center h-9 self-end pb-0.5 text-slate-400">
                <span>—</span>
              </div>
              <div className="flex-1 min-w-[110px]">
                <label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Umur Max
                </label>
                <Input
                  type="number"
                  placeholder="35"
                  value={umurMax}
                  onChange={(e) => setUmurMax(e.target.value)}
                  className="h-9 bg-slate-50 border-slate-200 text-sm"
                />
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500">Filter aktif:</span>
              {jenisKelamin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                  {jenisKelamin}
                  <button onClick={() => setJenisKelamin("")} className="hover:text-blue-900">
                    <X size={11} />
                  </button>
                </span>
              )}
              {jenjang && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                  {jenjang}
                  <button onClick={() => setJenjang("")} className="hover:text-green-900">
                    <X size={11} />
                  </button>
                </span>
              )}
              {bidangSSW && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full">
                  {bidangSSW}
                  <button onClick={() => setBidangSSW("")} className="hover:text-purple-900">
                    <X size={11} />
                  </button>
                </span>
              )}
              {progres && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full">
                  {progresConfig[progres]?.label || progres}
                  <button onClick={() => setProgres("")} className="hover:text-amber-900">
                    <X size={11} />
                  </button>
                </span>
              )}
              {(umurMin || umurMax) && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full">
                  Umur: {umurMin || "0"} - {umurMax || "∞"}
                  <button onClick={() => { setUmurMin(""); setUmurMax(""); }} className="hover:text-slate-900">
                    <X size={11} />
                  </button>
                </span>
              )}
              {statusKeberangkatan && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                  {keberangkatanConfig[statusKeberangkatan]?.label || statusKeberangkatan}
                  <button onClick={() => setStatusKeberangkatan("")} className="hover:text-green-900">
                    <X size={11} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TABLE WRAPPER ── */}
      <div className="border-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-500 shrink-0" />
            <span className="font-medium text-gray-700 text-sm">Kandidat</span>
            {!loading && (
              <span className="text-xs text-gray-500">{data.length} item</span>
            )}
          </div>
          {loading && <span className="text-xs text-gray-500">Memuat...</span>}
        </div>

        {/* ── MOBILE CARD LAYOUT ── */}
        <div className="lg:hidden space-y-3 px-3 xs:px-4 pb-4">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 size={24} className="animate-spin text-gray-400 mx-auto" />
              <p className="text-gray-400 text-sm mt-2">Memuat data...</p>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="text-center py-12">
              <Users size={40} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Tidak ada data</p>
              <p className="text-gray-400 text-xs mt-1">
                {hasActiveFilters ? "Coba ubah filter" : "Data belum tersedia"}
              </p>
            </div>
          ) : (
            paginatedData.map((item, index) => {
              const stCfg = statusFormulirConfig[item.status_formulir] || {
                label: item.status_formulir,
                bg: "bg-gray-100",
                text: "text-gray-700",
              };
              const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border shadow-sm p-3 xs:p-4 space-y-3"
                >
                  {/* Header kartu */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 xs:gap-3 min-w-0">
                      {item.pas_foto ? (
                        <img
                          src={item.pas_foto}
                          alt="Foto"
                          className="w-9 h-9 xs:w-10 xs:h-10 rounded-full object-cover shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-9 h-9 xs:w-10 xs:h-10 rounded-full bg-slate-200 text-slate-600 font-semibold text-xs shrink-0">
                          {(item.nama_romaji || item.nama || "?")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm leading-tight truncate">
                          {item.nama_romaji || item.nama || "-"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {item.pendidikan_terakhir || "-"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] xs:text-xs text-gray-400 shrink-0">
                      #{globalIndex}
                    </span>
                  </div>

                  {/* Grid info */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                    <div>
                      <span className="text-gray-400 block">Cabang</span>
                      <p className="text-gray-600 truncate">{item.nama_cabang || "-"}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 block">JK / Umur</span>
                      <p className="text-gray-600">
                        {item.jenis_kelamin || "-"} / {item.umur || "-"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400 block mb-1">Bidang SSW</span>
                      <div className="flex flex-wrap gap-1">
                        {item.sertifikat_ssw ? (
                          item.sertifikat_ssw
                            .split(",")
                            .slice(0, 3)
                            .map((s: string, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] xs:text-xs rounded"
                              >
                                {s.trim()}
                              </span>
                            ))
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">Status</span>
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded text-[10px] xs:text-xs font-medium ${stCfg.bg} ${stCfg.text}`}
                      >
                        {stCfg.label}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">Keberangkatan</span>
                      <Select
                        value={item.status_keberangkatan || ""}
                        onValueChange={(v) => handleUpdateKeberangkatan(item.id, v)}
                      >
                        <SelectTrigger
                          className={`h-7 text-[10px] xs:text-xs ${
                            item.status_keberangkatan
                              ? keberangkatanConfig[item.status_keberangkatan]?.bg
                              : "bg-gray-100"
                          } border-0 px-2`}
                        >
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stay">Stay</SelectItem>
                          <SelectItem value="keluar">Keluar</SelectItem>
                          <SelectItem value="terbang">Terbang</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Aksi */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <button
                      onClick={() => {
                        setHistoryKandidat({
                          id: item.id,
                          nama: item.nama_romaji || item.nama || "-",
                        });
                        setShowHistory(true);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1 h-8 rounded-md border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <History size={13} /> History
                    </button>
                    <Link to={`/kandidat/${item.id}`} className="flex-1">
                      <button className="w-full inline-flex items-center justify-center gap-1 h-8 rounded-md border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Eye size={13} /> Detail
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">NO</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">KANDIDAT</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">CABANG</th>
                <th className="text-center px-4 py-3 font-medium text-xs text-gray-500">JK</th>
                <th className="text-center px-4 py-3 font-medium text-xs text-gray-500">UMUR</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500">BIDANG SSW</th>
                <th className="text-center px-4 py-3 font-medium text-xs text-gray-500">STATUS</th>
                <th className="text-center px-4 py-3 font-medium text-xs text-gray-500">STATUS DI MENDUNIA</th>
                <th className="text-center px-4 py-3 font-medium text-xs text-gray-500">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y-0">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center px-4 py-12">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Loader2 size={20} className="animate-spin" />
                      <span>Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center px-4 py-12">
                    <div className="flex flex-col items-center">
                      <Users size={40} className="text-gray-300 mb-2" />
                      <p className="text-gray-500">Tidak ada data</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {hasActiveFilters ? "Coba ubah filter" : "Data belum tersedia"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const stCfg = statusFormulirConfig[item.status_formulir] || {
                    label: item.status_formulir,
                    bg: "bg-gray-100",
                    text: "text-gray-700",
                  };
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors border-b border-gray-50"
                    >
                      <td className="px-4 py-3 text-gray-400 text-xs">{globalIndex}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.pas_foto ? (
                            <img
                              src={item.pas_foto}
                              alt="Foto"
                              className="w-8 h-8 rounded-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-semibold text-xs shrink-0">
                              {(item.nama_romaji || item.nama || "?")
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.nama_romaji || item.nama || "-"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {item.pendidikan_terakhir || "-"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{item.nama_cabang || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-medium text-gray-500">
                          {item.jenis_kelamin || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 text-sm">
                        {item.umur || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {item.sertifikat_ssw ? (
                            item.sertifikat_ssw
                              .split(",")
                              .slice(0, 2)
                              .map((s: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                                >
                                  {s.trim()}
                                </span>
                              ))
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                          {item.sertifikat_ssw &&
                            item.sertifikat_ssw.split(",").length > 2 && (
                              <span className="text-xs text-gray-400">
                                +{item.sertifikat_ssw.split(",").length - 2}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${stCfg.bg} ${stCfg.text}`}
                        >
                          {stCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Select
                          value={item.status_keberangkatan || ""}
                          onValueChange={(v) => handleUpdateKeberangkatan(item.id, v)}
                        >
                          <SelectTrigger
                            className={`h-7 w-[100px] text-xs ${
                              item.status_keberangkatan
                                ? keberangkatanConfig[item.status_keberangkatan]?.bg
                                : "bg-gray-100"
                            } border-0`}
                          >
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="stay">Stay</SelectItem>
                            <SelectItem value="keluar">Keluar</SelectItem>
                            <SelectItem value="terbang">Terbang</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-gray-900 h-8 px-2"
                            onClick={() => {
                              setHistoryKandidat({
                                id: item.id,
                                nama: item.nama_romaji || item.nama || "-",
                              });
                              setShowHistory(true);
                            }}
                            title="History"
                          >
                            <History size={16} />
                          </Button>
                          <Link to={`/kandidat/${item.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-gray-900 h-8 px-2"
                            >
                              <Eye size={16} />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        {!loading && data.length > 0 && (
          <div className="px-3 xs:px-4 py-3 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 bg-gray-50">
            <div className="flex items-center gap-2 xs:gap-3">
              <p className="text-[10px] xs:text-xs text-gray-500">
                {(currentPage - 1) * itemsPerPage + 1}–
                {Math.min(currentPage * itemsPerPage, data.length)} dari {data.length}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] xs:text-xs text-gray-400">Baris:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-6 xs:h-7 px-1.5 text-[10px] xs:text-xs border border-gray-200 rounded bg-white text-gray-600 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-0.5 xs:gap-1">
              <button
                className="h-7 w-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-7 w-7 flex items-center justify-center rounded text-[11px] xs:text-xs font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className="h-7 w-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── HISTORY MODAL ── */}
      {historyKandidat && (
        <HistoryModal
          open={showHistory}
          onOpenChange={setShowHistory}
          kandidatId={historyKandidat.id}
          kandidatName={historyKandidat.nama}
        />
      )}
    </div>
  );
}