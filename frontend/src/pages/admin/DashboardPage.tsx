import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    "verifikasi" | "kandidat" | "sertifikasi" | "job order" | "interview"
  >("verifikasi");

  const [jobOrderStats, setJobOrderStats] = useState<any[]>([]);
  const [loadingJobOrder, setLoadingJobOrder] = useState(false);

  const [filterTanggalAwal, setFilterTanggalAwal] = useState("");
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { role: string; content: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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
    if (params.length > 0) url += "?" + params.join("&");

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

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setChatLoading(true);

    try {
      const res = await api.post("/ai/chat", { message: userMessage });
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.message || res.data.reply },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Maaf, terjadi kesalahan. Coba lagi nanti." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const TABS = [
    { key: "verifikasi", label: "Verifikasi" },
    { key: "kandidat", label: "Kandidat" },
    { key: "sertifikasi", label: "Sertifikasi" },
    ...(user?.role === "admin_penempatan"
      ? [{ key: "job order", label: "Job Order" }]
      : []),
    { key: "interview", label: "Interview" },
  ];

  return (
    <div className="w-full max-w-full overflow-x-hidden px-3 sm:px-6 py-4 sm:py-6">

      {/* ── HEADER ─────────────────────────────────────── */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-base min-[400px]:text-lg sm:text-2xl font-semibold truncate leading-tight">
          Dashboard
        </h1>
        <p className="text-[10px] min-[400px]:text-[11px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 leading-relaxed">
          Selamat datang, <span className="font-medium">{user?.nama}</span> —{" "}
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* ── TAB MENU ───────────────────────────────────── */}
      <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-shrink-0 px-2.5 min-[400px]:px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg
              text-[9px] min-[400px]:text-[10px] sm:text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-[#1e3a5f] text-white shadow-sm"
                : "bg-white text-muted-foreground border hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ────────────────────────────────────── */}
      <div className="space-y-4 sm:space-y-6">
        {activeTab === "verifikasi" && (
          <VerifikasiPendaftaran stats={stats} loading={loading} />
        )}
        {activeTab === "kandidat" && (
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
        {activeTab === "interview" && <InterviewStats />}
      </div>

      {/* ── AI CHAT PANEL ──────────────────────────────── */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-end gap-2 sm:gap-3">

        {/* Chat Container */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            showChat
              ? "opacity-100 translate-x-0 translate-y-0"
              : "opacity-0 translate-x-4 pointer-events-none"
          }`}
        >
          {showChat && (
            <div className="
              bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col
              w-[calc(100vw-5rem)] max-w-[320px]
              min-[400px]:max-w-[340px]
              sm:w-96 sm:max-w-none
              h-[65vh] max-h-[460px]
              min-[400px]:max-h-[480px]
              sm:h-[500px] sm:max-h-none
            ">
              {/* Header */}
              <div className="bg-[#1e3a5f] px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 min-[400px]:w-7 min-[400px]:h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                      viewBox="0 0 24 24" fill="none" stroke="white"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-[11px] min-[400px]:text-xs sm:text-sm leading-tight truncate">
                      AI Assistant
                    </h3>
                    <p className="text-white/70 text-[9px] min-[400px]:text-[10px] sm:text-xs leading-tight truncate">
                      Tanya apapun tentang data
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors shrink-0 ml-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 sm:space-y-3 bg-gray-50 min-h-0">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-400 mt-4 sm:mt-8 px-1">
                    <p className="font-medium text-[11px] min-[400px]:text-xs sm:text-sm">
                      Halo! Saya bisa membantu:
                    </p>
                    <ul className="mt-2 text-left text-[10px] min-[400px]:text-[11px] sm:text-xs
                      space-y-1.5 bg-white rounded-xl p-2.5 sm:p-3 shadow-sm border">
                      {[
                        "Info jumlah kandidat",
                        "Status formulir",
                        "Data sertifikasi",
                        "Statistik cabang",
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-1.5">
                          <span className="text-blue-400 shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`
                        max-w-[90%] sm:max-w-[85%] px-2.5 sm:px-3 py-1.5 sm:py-2
                        rounded-2xl text-[10px] min-[400px]:text-[11px] sm:text-sm
                        whitespace-pre-wrap leading-relaxed
                        ${msg.role === "user"
                          ? "bg-[#1e3a5f] text-white rounded-br-md"
                          : "bg-white text-gray-800 rounded-bl-md shadow-sm border"
                        }
                      `}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl rounded-bl-md shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-2 sm:p-3 border-t bg-white shrink-0">
                <form onSubmit={handleSendChat} className="flex gap-1.5 sm:gap-2">
                  <Input
                    placeholder="Ketik pertanyaan..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="border rounded-full px-3 sm:px-4 text-[11px] min-[400px]:text-xs sm:text-sm h-7 min-[400px]:h-8 sm:h-10"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full bg-[#1e3a5f] hover:bg-[#2d4a6f] h-7 w-7 min-[400px]:h-8 min-[400px]:w-8 sm:h-10 sm:w-10 shrink-0"
                    disabled={chatLoading || !chatInput.trim()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <Button
          className={`rounded-full h-11 w-11 min-[400px]:h-12 min-[400px]:w-12 sm:h-14 sm:w-14
            shadow-lg transition-all shrink-0 ${
            showChat
              ? "bg-gray-600 hover:bg-gray-700"
              : "bg-[#1e3a5f] hover:bg-[#2d4a6f]"
          }`}
          size="icon"
          onClick={() => setShowChat(!showChat)}
        >
          {showChat ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </Button>
      </div>
    </div>
  );
}