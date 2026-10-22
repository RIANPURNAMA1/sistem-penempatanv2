import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/useToast"
import api from "@/lib/api"
import {
  FileSpreadsheet,
  Upload,
  Loader2,
  Trash2,
  Download,
  CheckCircle2,
  Eye,
  ListTree,
  FileDown,
  AlertTriangle,
  Copy,
} from "lucide-react"

interface CvTemplate {
  id: number
  nama_template: string
  file_name: string
  path_file: string
  ukuran_file: number | null
  jumlah_placeholder: number
  mapping: string | null
  is_active: number
  created_at: string
}

interface DetectedPlaceholder {
  name: string
  type: string
  known: boolean
  label: string
  cells: string[]
  sheets: string[]
  options: string[]
}

interface DetectedGroup {
  group: string
  label: string
  max: number
  rows: number[]
  subs: string[]
  placeholders?: GroupPlaceholder[]
}

interface GroupPlaceholder {
  name: string
  row: number
  sub: string
  canonical: string
  label: string
  cells: string[]
  options: string[]
}

interface CatalogItem {
  key: string
  label: string
  type: string
  source: string
  repeatable: boolean
  aliasOf: string | null
}

const formatSize = (bytes: number | null) => {
  if (!bytes) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const formatDate = (d: string | null) => {
  if (!d) return "—"
  return new Date(d).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** Unduh berkas melalui API (butuh header Authorization). */
const downloadWithAuth = async (url: string, fallbackName: string) => {
  const res = await api.get(url, { responseType: "blob" })
  const disposition = res.headers?.["content-disposition"] || ""
  const match = /filename="?([^";]+)"?/i.exec(disposition)
  const name = match ? match[1] : fallbackName
  const blobUrl = URL.createObjectURL(res.data as Blob)
  const a = document.createElement("a")
  a.href = blobUrl
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(blobUrl)
}

export default function CvTemplatePage() {
  const [data, setData] = useState<CvTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [namaTemplate, setNamaTemplate] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [detected, setDetected] = useState<{ placeholders: DetectedPlaceholder[]; groups: DetectedGroup[] } | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  const load = () => {
    setLoading(true)
    api
      .get("/cv-template")
      .then((r) => setData(r.data?.data || []))
      .catch(() => toast({ title: "Gagal memuat template CV", variant: "destructive" }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "Pilih file .xlsx template terlebih dahulu", variant: "destructive" })
      return
    }
    setUploading(true)
    setErrorMsg("")
    try {
      const fd = new FormData()
      fd.append("template", file)
      if (namaTemplate.trim()) fd.append("nama_template", namaTemplate.trim())
      const r = await api.post("/cv-template/upload", fd)
      const total = r.data?.detected?.total ?? 0
      toast({
        title: "Template berhasil diupload",
        description: `${total} placeholder terdeteksi di dalam template.`,
        variant: "success" as any,
      })
      setFile(null)
      setNamaTemplate("")
      if (fileRef.current) fileRef.current.value = ""
      load()
    } catch (err: any) {
      const msg = err.response?.data?.message || "Upload template gagal"
      setErrorMsg(msg)
      toast({ title: "Upload template gagal", description: msg, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const activate = async (id: number) => {
    try {
      await api.put(`/cv-template/${id}/aktifkan`)
      toast({ title: "Template aktif berhasil diubah" })
      load()
    } catch (err: any) {
      toast({ title: err.response?.data?.message || "Gagal", variant: "destructive" })
    }
  }

  const remove = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/cv-template/${deleteId}`)
      toast({ title: "Template berhasil dihapus" })
      setDeleteId(null)
      load()
    } catch (err: any) {
      toast({ title: err.response?.data?.message || "Gagal hapus", variant: "destructive" })
    }
  }

  const openDetail = async (id: number) => {
    setDetailId(id)
    setDetailLoading(true)
    setDetected(null)
    try {
      const r = await api.get(`/cv-template/${id}/placeholders`)
      setDetected({ placeholders: r.data?.data?.placeholders || [], groups: r.data?.data?.groups || [] })
    } catch (err: any) {
      toast({ title: err.response?.data?.message || "Gagal memuat placeholder", variant: "destructive" })
    } finally {
      setDetailLoading(false)
    }
  }

  const openCatalog = async () => {
    setCatalogOpen(true)
    if (catalog.length) return
    try {
      const r = await api.get("/cv-template/catalog")
      setCatalog(r.data?.data || [])
    } catch {
      toast({ title: "Gagal memuat katalog placeholder", variant: "destructive" })
    }
  }

  const downloadTemplate = async (t: CvTemplate) => {
    try {
      await downloadWithAuth(`/cv-template/${t.id}/download`, t.file_name)
    } catch {
      toast({ title: "Gagal mengunduh template", variant: "destructive" })
    }
  }

  const downloadSample = async () => {
    try {
      await downloadWithAuth("/cv-template/sample-template", "contoh-template-cv.xlsx")
    } catch {
      toast({ title: "Gagal mengunduh template contoh", variant: "destructive" })
    }
  }

  const copyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key)
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      toast({ title: "Gagal menyalin", variant: "destructive" })
    }
  }

  const unknownCount = detected?.placeholders.filter((p) => !p.known).length || 0

  return (
    <div className="w-full min-w-0 space-y-3 px-2.5 sm:px-4 md:px-6 py-3 sm:py-5 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <h1 className="text-base sm:text-2xl font-bold text-foreground leading-tight truncate">
            Template CV
          </h1>
          <p className="text-[11px] sm:text-sm text-muted-foreground mt-0.5">
            Upload template Excel ber-placeholder, lalu generate CV kandidat otomatis
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={openCatalog}
            className="h-8 sm:h-9 px-2 sm:px-3 text-xs"
          >
            <ListTree size={14} className="shrink-0" />
            <span className="hidden min-[400px]:inline ml-1 whitespace-nowrap">Daftar Placeholder</span>
          </Button>
          <Button
            variant="outline"
            onClick={downloadSample}
            className="h-8 sm:h-9 px-2 sm:px-3 text-xs"
          >
            <FileDown size={14} className="shrink-0" />
            <span className="hidden min-[400px]:inline ml-1 whitespace-nowrap">Template Contoh</span>
          </Button>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/15 rounded-xl px-3 py-2.5 flex items-start gap-2.5">
        <FileSpreadsheet size={16} className="text-[#1e3a5f] shrink-0 mt-0.5" />
        <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
          Template adalah file <strong>.xlsx</strong>. Tulis placeholder seperti{" "}
          <code className="bg-white border rounded px-1 py-0.5 text-[10px]">{"{nama_romaji}"}</code>,{" "}
          <code className="bg-white border rounded px-1 py-0.5 text-[10px]">{"{tanggal_lahir_jp}"}</code>,{" "}
          <code className="bg-white border rounded px-1 py-0.5 text-[10px]">{"{pendidikan_1_nama_sekolah}"}</code>{" "}
          di dalam sel. Sel foto diisi dengan <code className="bg-white border rounded px-1 py-0.5 text-[10px]">{"{foto}"}</code>.
          Nilai yang tidak ada dikosongkan (tidak pernah ditulis sebagai placeholder).
        </p>
      </div>

      {/* ── Upload ── */}
      <div className="bg-white rounded-xl border shadow-sm p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <div className="space-y-1 flex-1 min-w-0">
            <label className="text-xs font-medium text-gray-700">Nama Template</label>
            <Input
              value={namaTemplate}
              onChange={(e) => setNamaTemplate(e.target.value)}
              placeholder="Contoh: CV Lamaran SSW 2026"
              className="h-9 text-xs sm:text-sm"
            />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <label className="text-xs font-medium text-gray-700">File .xlsx</label>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-gray-600 file:mr-2 file:rounded-md file:border file:border-gray-200 file:bg-white file:px-2.5 file:py-1.5 file:text-[11px] file:font-medium file:text-gray-700 hover:file:bg-gray-50"
            />
          </div>
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="h-9 px-3 text-xs bg-[#1e3a5f] hover:bg-[#2d5a8a] shrink-0"
          >
            {uploading ? <Loader2 size={13} className="mr-1 animate-spin" /> : <Upload size={13} className="mr-1" />}
            Upload
          </Button>
        </div>
        {file && (
          <p className="mt-2 text-[11px] text-gray-500">
            Dipilih: <span className="font-medium text-gray-700">{file.name}</span> ({formatSize(file.size)})
          </p>
        )}
        {errorMsg && (
          <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 leading-relaxed">
            {errorMsg}
          </div>
        )}
      </div>

      {/* ── Daftar template ── */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-3 py-2 border-b flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-1.5">
            <FileSpreadsheet size={14} className="text-gray-500" />
            <span className="font-medium text-gray-700 text-xs sm:text-sm">Daftar Template</span>
            {!loading && (
              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {data.length}
              </span>
            )}
          </div>
          {loading && <Loader2 size={12} className="animate-spin text-gray-400" />}
        </div>

        {/* Mobile */}
        <div className="sm:hidden">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="animate-spin mx-auto text-gray-300" size={24} />
              <p className="text-gray-400 text-xs mt-2">Memuat data...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="py-12 text-center px-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <FileSpreadsheet size={18} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium text-xs">Belum ada template CV</p>
              <p className="text-gray-400 text-[10px] mt-1">Upload template .xlsx pada form di atas</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.map((t) => (
                <div key={t.id} className="px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] shrink-0 ${
                      t.is_active ? "bg-[#1e3a5f]/10 text-[#1e3a5f]" : "bg-gray-100 text-gray-400"
                    }`}>
                      <FileSpreadsheet size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-xs leading-tight truncate">{t.nama_template}</p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {t.jumlah_placeholder || 0} placeholder · {formatSize(t.ukuran_file)}
                      </p>
                    </div>
                    {!!t.is_active && (
                      <span className="shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border border-green-200 bg-green-50 text-green-700">
                        Aktif
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 pl-9 flex-wrap">
                    <button onClick={() => openDetail(t.id)}
                      className="flex items-center gap-1 h-6 px-2.5 rounded-md border border-gray-200 bg-white text-gray-600 text-[10px] font-medium active:bg-gray-100">
                      <Eye size={10} /> Placeholder
                    </button>
                    <button onClick={() => downloadTemplate(t)}
                      className="flex items-center gap-1 h-6 px-2.5 rounded-md border border-gray-200 bg-white text-gray-600 text-[10px] font-medium active:bg-gray-100">
                      <Download size={10} /> Unduh
                    </button>
                    {!t.is_active && (
                      <button onClick={() => activate(t.id)}
                        className="flex items-center gap-1 h-6 px-2.5 rounded-md border border-gray-200 bg-white text-gray-600 text-[10px] font-medium active:bg-gray-100">
                        <CheckCircle2 size={10} /> Aktifkan
                      </button>
                    )}
                    <button onClick={() => setDeleteId(t.id)}
                      className="flex items-center gap-1 h-6 px-2.5 rounded-md border border-red-100 bg-red-50 text-red-600 text-[10px] font-medium active:bg-red-100">
                      <Trash2 size={10} /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide">Template</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide">Placeholder</th>
                <th className="text-left px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide">Dibuat</th>
                <th className="text-center px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-center px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center px-4 py-16">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Loader2 size={20} className="animate-spin" />
                      <span className="text-sm">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center px-4 py-16">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <FileSpreadsheet size={24} className="text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">Belum ada template CV</p>
                      <p className="text-gray-400 text-xs mt-1">Upload template .xlsx pada form di atas</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          t.is_active ? "bg-[#1e3a5f]/10 text-[#1e3a5f]" : "bg-gray-100 text-gray-400"
                        }`}>
                          <FileSpreadsheet size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{t.nama_template}</p>
                          <p className="text-[10px] text-gray-400 truncate">{t.file_name} · {formatSize(t.ukuran_file)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{t.jumlah_placeholder || 0}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{formatDate(t.created_at)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                        t.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}>
                        {t.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                          onClick={() => openDetail(t.id)} title="Lihat placeholder">
                          <Eye size={14} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                          onClick={() => downloadTemplate(t)} title="Unduh template">
                          <Download size={14} />
                        </Button>
                        {!t.is_active && (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-lg"
                            onClick={() => activate(t.id)} title="Jadikan aktif">
                            <CheckCircle2 size={14} />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          onClick={() => setDeleteId(t.id)} title="Hapus">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── DIALOG HAPUS ── */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="w-[calc(100vw-16px)] sm:max-w-sm rounded-xl p-0">
          <div className="px-3 py-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={15} className="text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-xs sm:text-sm font-semibold text-gray-900">Hapus Template</DialogTitle>
                <p className="text-[10px] text-gray-400">Tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Yakin ingin menghapus template ini? Berkas .xlsx di server juga akan dihapus.
              Riwayat CV yang sudah digenerate tetap tersimpan.
            </p>
          </div>
          <div className="px-3 py-2.5 border-t bg-gray-50/80 rounded-b-xl flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="h-7 px-3 text-[11px]">
              Batal
            </Button>
            <Button variant="destructive" onClick={remove} className="h-7 px-3 text-[11px]">
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG PLACEHOLDER ── */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="w-[calc(100vw-16px)] sm:max-w-2xl max-h-[90dvh] overflow-y-auto rounded-xl p-0">
          <div className="px-3 py-3 border-b bg-gray-50/80 rounded-t-xl sticky top-0 z-10">
            <h2 className="font-semibold text-sm text-gray-900">Placeholder Terdeteksi</h2>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {detected
                ? `${detected.placeholders.length} placeholder · ${detected.groups.length} grup berulang`
                : "Memuat..."}
            </p>
          </div>

          <div className="px-3 py-3 space-y-3">
            {detailLoading ? (
              <div className="py-10 text-center">
                <Loader2 className="animate-spin mx-auto text-gray-300" size={24} />
                <p className="text-gray-400 text-xs mt-2">Menganalisis template...</p>
              </div>
            ) : detected ? (
              <>
                {unknownCount > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {unknownCount} placeholder tidak dikenal sistem (selnya akan dikosongkan). Periksa penamaannya.
                    </p>
                  </div>
                )}

                {detected.groups.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700">
                      Placeholder Berulang (sesuai penulisan di template)
                    </p>
                    {detected.groups.map((g) => (
                      <div key={g.group} className="border rounded-lg overflow-hidden">
                        <div className="px-3 py-1.5 bg-gray-50 border-b flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-[#1e3a5f]/10 text-[#1e3a5f] font-medium text-[11px]">
                            {g.group}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            baris {g.rows.join(", ")}
                          </span>
                        </div>
                        <div className="divide-y">
                          {(g.placeholders || []).length === 0 ? (
                            <div className="px-3 py-2 text-[11px] text-gray-400">
                              {g.subs.join(", ")}
                            </div>
                          ) : (
                            (g.placeholders || []).map((gp) => (
                              <div key={gp.name} className="px-3 py-2 flex items-start gap-2">
                                <code className="text-[11px] font-mono text-[#1e3a5f] bg-[#1e3a5f]/5 px-1.5 py-0.5 rounded shrink-0">
                                  {"{" + gp.name + "}"}
                                </code>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[11px] text-gray-600 truncate">{gp.label}</p>
                                  <p className="text-[10px] text-gray-400 truncate">
                                    {gp.cells.join(", ")}
                                  </p>
                                  {gp.options.length > 0 && (
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                      Pilihan: {gp.options.join(" | ")}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">Sel Placeholder</p>
                  <div className="border rounded-lg divide-y overflow-hidden">
                    {detected.placeholders.map((p) => (
                      <div key={p.name} className="px-3 py-2 flex items-start gap-2">
                        <code className="text-[11px] font-mono text-[#1e3a5f] bg-[#1e3a5f]/5 px-1.5 py-0.5 rounded shrink-0">
                          {"{" + p.name + "}"}
                        </code>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] text-gray-700 truncate">{p.label}</p>
                          <p className="text-[10px] text-gray-400 truncate">{p.cells.join(", ")}</p>
                          {p.options.length > 0 && (
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Pilihan: {p.options.join(" | ")}
                            </p>
                          )}
                        </div>
                        {!p.known && (
                          <span className="shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
                            tidak dikenal
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-500 text-center py-8">Placeholder tidak ditemukan.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG KATALOG ── */}
      <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DialogContent className="w-[calc(100vw-16px)] sm:max-w-2xl max-h-[90dvh] overflow-y-auto rounded-xl p-0">
          <div className="px-3 py-3 border-b bg-gray-50/80 rounded-t-xl sticky top-0 z-10">
            <h2 className="font-semibold text-sm text-gray-900">Daftar Placeholder</h2>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {catalog.length} placeholder yang bisa dipakai di template
            </p>
          </div>
          <div className="px-3 py-3">
            {catalog.length === 0 ? (
              <div className="py-10 text-center">
                <Loader2 className="animate-spin mx-auto text-gray-300" size={24} />
              </div>
            ) : (
              <div className="border rounded-lg divide-y overflow-hidden">
                {catalog.map((c) => (
                  <div key={c.key} className="px-3 py-2 flex items-center gap-2">
                    <code className="text-[11px] font-mono text-[#1e3a5f] bg-[#1e3a5f]/5 px-1.5 py-0.5 rounded shrink-0">
                      {"{" + c.key + "}"}
                    </code>
                    <span className="text-[11px] text-gray-600 truncate flex-1">{c.label}</span>
                    {c.repeatable && (
                      <span className="shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                        berulang
                      </span>
                    )}
                    <button
                      onClick={() => copyKey(c.key)}
                      className="shrink-0 text-gray-400 hover:text-gray-700"
                      title="Salin nama placeholder"
                    >
                      {copied === c.key ? <CheckCircle2 size={12} className="text-green-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
