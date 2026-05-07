import { useState, useEffect } from "react";
import { Trash2, RefreshCw, X, Loader2 } from "lucide-react";
import { toast } from "@/hooks/useToast";
import api from "@/lib/api";

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
  deleted_at?: string | null;
}

interface DeletedKandidatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

export default function DeletedKandidatModal({ open, onOpenChange, onRefresh }: DeletedKandidatModalProps) {
  const [deletedData, setDeletedData] = useState<Kandidat[]>([]);
  const [loading, setLoading] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState<{ id: number; nama: string } | null>(null);
  const [permanentDeleteConfirm, setPermanentDeleteConfirm] = useState<{ id: number; nama: string } | null>(null);
  const [restoreAllConfirm, setRestoreAllConfirm] = useState(false);
  const [permanentAllConfirm, setPermanentAllConfirm] = useState(false);

  const loadDeleted = () => {
    setLoading(true);
    api
      .get("/kandidat/deleted")
      .then((r) => setDeletedData(r.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (open) {
      loadDeleted();
    }
  }, [open]);

  const handleRestore = async (id: number) => {
    try {
      await api.patch(`/kandidat/${id}/restore`);
      toast({ title: "Kandidat berhasil dipulihkan", variant: "success" });
      setRestoreConfirm(null);
      loadDeleted();
      onRefresh();
    } catch {
      toast({ title: "Gagal memulihkan kandidat", variant: "destructive" });
    }
  };

  const handlePermanentDelete = async (id: number) => {
    try {
      await api.delete(`/kandidat/${id}/permanent`);
      toast({ title: "Kandidat berhasil dihapus permanen", variant: "success" });
      setPermanentDeleteConfirm(null);
      loadDeleted();
    } catch {
      toast({ title: "Gagal menghapus permanen", variant: "destructive" });
    }
  };

  const handleRestoreAll = async () => {
    setBulkActionLoading(true);
    try {
      const res = await api.post("/kandidat/restore-all-deleted");
      toast({ title: res.data.message, variant: "success" });
      setRestoreAllConfirm(false);
      loadDeleted();
      onRefresh();
    } catch {
      toast({ title: "Gagal memulihkan semua data", variant: "destructive" });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handlePermanentAll = async () => {
    setBulkActionLoading(true);
    try {
      const res = await api.delete("/kandidat/permanent-all-deleted");
      toast({ title: res.data.message, variant: "success" });
      setPermanentAllConfirm(false);
      loadDeleted();
    } catch {
      toast({ title: "Gagal menghapus semua data", variant: "destructive" });
    } finally {
      setBulkActionLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4 p-6 space-y-4 max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <RefreshCw size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Data Dihapus</h3>
                <p className="text-sm text-gray-500">Kandidat yang telah dihapus</p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>

          {deletedData.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => setRestoreAllConfirm(true)}
                disabled={bulkActionLoading}
                className="flex-1 h-9 rounded-lg bg-green-600 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={14} /> {bulkActionLoading ? "Proses..." : "Restore Semua"}
              </button>
              <button
                onClick={() => setPermanentAllConfirm(true)}
                disabled={bulkActionLoading}
                className="flex-1 h-9 rounded-lg bg-red-600 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} /> {bulkActionLoading ? "Proses..." : "Hapus Semua"}
              </button>
            </div>
          )}

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 size={24} className="animate-spin text-gray-400 mx-auto" />
                <p className="text-gray-400 text-sm mt-2">Memuat data...</p>
              </div>
            ) : deletedData.length === 0 ? (
              <div className="text-center py-8">
                <Trash2 size={40} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Tidak ada data dihapus</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-xs text-gray-500">KANDIDAT</th>
                    <th className="text-left px-3 py-2 font-medium text-xs text-gray-500">CABANG</th>
                    <th className="text-center px-3 py-2 font-medium text-xs text-gray-500">TGL DIHAPUS</th>
                    <th className="text-center px-3 py-2 font-medium text-xs text-gray-500">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {deletedData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {item.pas_foto ? (
                            <img src={item.pas_foto} alt="Foto" className="w-7 h-7 rounded-full object-cover" loading="lazy" />
                          ) : (
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-600 font-semibold text-xs shrink-0">
                              {(item.nama_romaji || item.nama || "?").split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 text-xs">{item.nama_romaji || item.nama || "-"}</p>
                            <p className="text-[10px] text-gray-400">{item.email || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-600 text-xs">{item.nama_cabang || "-"}</td>
                      <td className="px-3 py-2 text-center text-gray-500 text-xs">
                        {item.deleted_at ? new Date(item.deleted_at).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setRestoreConfirm({ id: item.id, nama: item.nama_romaji || item.nama || "-" })}
                            className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-green-200 bg-white text-xs font-medium text-green-600 hover:bg-green-50 transition-colors"
                            title="Restore"
                          >
                            <RefreshCw size={13} /> Pulihkan
                          </button>
                          <button
                            onClick={() => setPermanentDeleteConfirm({ id: item.id, nama: item.nama_romaji || item.nama || "-" })}
                            className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-red-200 bg-white text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus Permanen"
                          >
                            <Trash2 size={13} /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {restoreConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <RefreshCw size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pulihkan Kandidat</h3>
                <p className="text-sm text-gray-500">Konfirmasi pemulihan</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Apakah Anda yakin ingin memulihkan kandidat <strong>{restoreConfirm.nama}</strong>? Data akan kembali ke daftar aktif.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setRestoreConfirm(null)}
                className="flex-1 h-10 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleRestore(restoreConfirm.id)}
                className="flex-1 h-10 rounded-lg bg-green-600 text-sm font-medium text-white hover:bg-green-700"
              >
                Pulihkan
              </button>
            </div>
          </div>
        </div>
      )}

      {permanentDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Hapus Permanen</h3>
                <p className="text-sm text-gray-500">Konfirmasi penghapusan permanen</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Apakah Anda yakin ingin menghapus permanen kandidat <strong>{permanentDeleteConfirm.nama}</strong>? <span className="text-red-600 font-medium">Tindakan ini tidak dapat dibatalkan.</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPermanentDeleteConfirm(null)}
                className="flex-1 h-10 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => handlePermanentDelete(permanentDeleteConfirm.id)}
                className="flex-1 h-10 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {restoreAllConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <RefreshCw size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Restore Semua Data</h3>
                <p className="text-sm text-gray-500">Konfirmasi pemulihan massal</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Apakah Anda yakin ingin memulihkan <strong>semua {deletedData.length} kandidat</strong>? Data akan kembali ke daftar aktif.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setRestoreAllConfirm(false)}
                className="flex-1 h-10 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleRestoreAll}
                disabled={bulkActionLoading}
                className="flex-1 h-10 rounded-lg bg-green-600 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {bulkActionLoading ? "Memproses..." : "Restore Semua"}
              </button>
            </div>
          </div>
        </div>
      )}

      {permanentAllConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Hapus Semua Permanen</h3>
                <p className="text-sm text-gray-500">Konfirmasi penghapusan massal</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Apakah Anda yakin ingin menghapus permanen <strong>semua {deletedData.length} kandidat</strong>? <span className="text-red-600 font-medium">Tindakan ini tidak dapat dibatalkan.</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPermanentAllConfirm(false)}
                className="flex-1 h-10 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handlePermanentAll}
                disabled={bulkActionLoading}
                className="flex-1 h-10 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {bulkActionLoading ? "Memproses..." : "Hapus Semua"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
