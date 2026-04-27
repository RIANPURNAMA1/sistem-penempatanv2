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
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
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
          { key: "kandidat", label: "Kandidat" },
          { key: "sertifikasi", label: "Sertifikasi" },
          ...(user?.role === "admin_penempatan"
            ? [{ key: "job order", label: "Job Order" }]
            : []),
          { key: "interview", label: "Interview & Status" },
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

        {/* AI CHAT PANEL */}
        <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
          {/* Chat Container */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              showChat
                ? "opacity-100 translate-x-0 w-80 sm:w-96"
                : "opacity-0 translate-x-4 pointer-events-none w-0"
            }`}
          >
            <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col h-[500px]">
              {/* Chat Header */}
              <div className="bg-[#1e3a5f] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">AI Assistant</h3>
                    <p className="text-white/70 text-xs">Tanya apapun tentang data</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-white/70 hover:text-white"
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

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-400 text-sm mt-10">
                    <p>Halo! Saya bisa membantu:</p>
                    <ul className="mt-2 text-left text-xs space-y-1">
                      <li>• Info jumlah kandidat</li>
                      <li>• Status formulir</li>
                      <li>• Data sertifikasi</li>
                      <li>• Statistik cabang</li>
                    </ul>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-[#1e3a5f] text-white rounded-br-md"
                          : "bg-gray-100 text-gray-800 rounded-bl-md"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t bg-white">
                <form
                  onSubmit={handleSendChat}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Ketik pertanyaan..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="border rounded-full px-4"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full bg-[#1e3a5f] hover:bg-[#2d4a6f]"
                    disabled={chatLoading || !chatInput.trim()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Toggle Button */}
          <Button
            className={`rounded-full h-14 w-14 shadow-lg transition-all ${
              showChat
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-[#1e3a5f] hover:bg-[#2d4a6f]"
            }`}
            size="icon"
            onClick={() => setShowChat(!showChat)}
          >
            {showChat ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}